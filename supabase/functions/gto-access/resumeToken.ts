const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const encoder = new TextEncoder();
const DOMAIN = 'gto-course-resume:v1:';
const TTL = 30 * 24 * 60 * 60 * 1000;

function encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decode(value: string) {
  return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
}
async function key(secret: string) {
  if (!secret) throw new Error('Missing signing configuration');
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function issueResumeToken(secret: string, session: string, participant: string, now = Date.now()): Promise<string> {
  if (!UUID.test(session) || !UUID.test(participant)) throw new Error('Invalid session');
  const payload = encode(encoder.encode(JSON.stringify({ session, participant, expires: now + TTL })));
  const signature = await crypto.subtle.sign('HMAC', await key(secret), encoder.encode(DOMAIN + payload));
  return `${payload}.${encode(new Uint8Array(signature))}`;
}

export async function verifyResumeToken(secret: string, token: unknown, now = Date.now()): Promise<{ session: string; participant: string } | null> {
  try {
    if (typeof token !== 'string' || token.length > 1024) return null;
    const parts = token.split('.');
    if (parts.length !== 2 || parts.some(p => !/^[A-Za-z0-9_-]+$/.test(p))) return null;
    if (!await crypto.subtle.verify('HMAC', await key(secret), decode(parts[1]), encoder.encode(DOMAIN + parts[0]))) return null;
    const p = JSON.parse(new TextDecoder().decode(decode(parts[0])));
    if (typeof p.session !== 'string' || typeof p.participant !== 'string' || !UUID.test(p.session) || !UUID.test(p.participant) || !Number.isFinite(p.expires) || p.expires <= now || p.expires > now + TTL) return null;
    return { session: p.session, participant: p.participant };
  } catch {
    return null;
  }
}