const SESSION_SECRET = (
  process.env.SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'aasifa_fallback_secure_secret_key_2026_x89f'
);

export interface SessionPayload {
  userId: string;
  role: 'admin' | 'store_user';
  exp: number;
  nonce: string;
}

/**
 * Web Crypto HMAC-SHA256 signature calculation (Edge Runtime & Node compatible)
 */
async function hmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates an Edge-compatible HMAC-SHA256 signed session token
 */
export async function createSignedToken(
  payload: Omit<SessionPayload, 'exp' | 'nonce'>,
  maxAgeSeconds: number = 3600
): Promise<string> {
  const exp = Date.now() + maxAgeSeconds * 1000;
  const nonce = crypto.randomUUID();
  const fullPayload: SessionPayload = {
    ...payload,
    exp,
    nonce,
  };

  const payloadJson = JSON.stringify(fullPayload);
  const payloadEncoded = typeof btoa === 'function'
    ? btoa(payloadJson).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    : Buffer.from(payloadJson).toString('base64url');

  const signature = await hmacSha256(payloadEncoded, SESSION_SECRET);
  return `${payloadEncoded}.${signature}`;
}

/**
 * Cryptographically verifies an Edge-compatible HMAC-SHA256 signed session token
 */
export async function verifySignedToken(token?: string): Promise<SessionPayload | null> {
  if (!token || !token.includes('.')) return null;

  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) return null;

  try {
    const expectedSignature = await hmacSha256(payloadEncoded, SESSION_SECRET);

    if (signature !== expectedSignature) {
      return null;
    }

    const payloadJson = typeof atob === 'function'
      ? atob(payloadEncoded.replace(/-/g, '+').replace(/_/g, '/'))
      : Buffer.from(payloadEncoded, 'base64url').toString('utf-8');

    const payload: SessionPayload = JSON.parse(payloadJson);

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
