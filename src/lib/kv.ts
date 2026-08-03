import { supabaseAdmin } from './supabaseServer';

/**
 * Reads a boolean setting, falling back to Supabase Site Config directly
 */
export async function getTweak(key: string, defaultValue: boolean = true): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from('products')
      .select('description')
      .eq('name', '_SITE_CONFIG_')
      .maybeSingle();

    if (data?.description) {
      const parsed = JSON.parse(data.description);
      if (parsed[key] !== undefined) {
        return parsed[key] === true || parsed[key] === 'true';
      }
    }
  } catch (e) {
    console.error('Supabase error reading config:', e);
  }

  return defaultValue;
}

/**
 * Saves a boolean setting, and syncs it to Supabase Site Config
 */
export async function setTweak(key: string, value: boolean): Promise<boolean> {
  try {
    const { data: existing } = await supabaseAdmin
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
      category: 'Config',
      images: []
    };

    if (existing?.id) {
      await supabaseAdmin
        .from('products')
        .update(configPayload)
        .eq('id', existing.id);
    } else {
      await supabaseAdmin
        .from('products')
        .insert(configPayload);
    }
  } catch (e) {
    console.error('Supabase sync error writing config:', e);
  }

  return true;
}
