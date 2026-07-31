import { Redis } from '@upstash/redis';
import { supabaseServer } from './supabaseServer';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis if credentials are present
const getRedisClient = () => {
  if (url && token) {
    try {
      return new Redis({ url, token });
    } catch (e) {
      console.error('Failed to initialize Upstash Redis / Vercel KV:', e);
    }
  }
  return null;
};

/**
 * Reads a boolean setting from KV/Redis, falling back to Supabase Site Config
 */
export async function getTweak(key: string, defaultValue: boolean = true): Promise<boolean> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const val = await redis.get(`tweaks:${key}`);
      if (val !== null && val !== undefined) {
        // Handle boolean parsing from string or direct boolean
        return val === true || val === 'true';
      }
    } catch (e) {
      console.error(`KV Error reading tweak ${key}:`, e);
    }
  }

  // Database fallback if KV is not yet provisioned
  try {
    const { data } = await supabaseServer
      .from('products')
      .select('description')
      .eq('name', '_SITE_CONFIG_')
      .maybeSingle();

    if (data?.description) {
      const parsed = JSON.parse(data.description);
      if (parsed[key] !== undefined) {
        return !!parsed[key];
      }
    }
  } catch (e) {
    console.error('Supabase fallback error reading config:', e);
  }

  return defaultValue;
}

/**
 * Saves a boolean setting to KV/Redis, and syncs it to Supabase Site Config
 */
export async function setTweak(key: string, value: boolean): Promise<boolean> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(`tweaks:${key}`, String(value));
    } catch (e) {
      console.error(`KV Error writing tweak ${key}:`, e);
    }
  }

  // Always sync to Supabase Site Config so they stay aligned
  try {
    const { data: existing } = await supabaseServer
      .from('products')
      .select('id, description')
      .eq('name', '_SITE_CONFIG_')
      .maybeSingle();

    let config: Record<string, any> = {};
    if (existing?.description) {
      try {
        config = JSON.parse(existing.description);
      } catch (e) {}
    }

    config[key] = value;

    const configPayload = {
      name: '_SITE_CONFIG_',
      description: JSON.stringify(config),
      price: 0,
      category: 'System',
      images: []
    };

    if (existing?.id) {
      await supabaseServer
        .from('products')
        .update(configPayload)
        .eq('id', existing.id);
    } else {
      await supabaseServer
        .from('products')
        .insert(configPayload);
    }
  } catch (e) {
    console.error('Supabase sync error writing config:', e);
  }

  return true;
}
