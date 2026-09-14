import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SA_JSON = Deno.env.get('GA4_SERVICE_ACCOUNT_JSON') ?? '';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

function b64url(bytes: Uint8Array | string): string {
  const raw = typeof bytes === 'string' ? bytes : String.fromCharCode(...bytes);
  return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const bin = atob(body);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

/** Exchanges the service-account key for a read-only Analytics access token. */
async function getAccessToken(): Promise<string> {
  if (!SA_JSON) throw new Error('Falta la credencial de Analytics (GA4_SERVICE_ACCOUNT_JSON)');
  let sa: { client_email?: string; private_key?: string };
  try {
    sa = JSON.parse(SA_JSON);
  } catch {
    throw new Error('La credencial de Analytics no es un JSON válido');
  }
  if (!sa.client_email || !sa.private_key) throw new Error('La credencial de Analytics está incompleta');

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(sa.private_key.replace(/\\n/g, '\n')),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${claims}`)),
  );
  const assertion = `${header}.${claims}.${b64url(sig)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Google rechazó la credencial [${res.status}]: ${body}`);
  return JSON.parse(body).access_token as string;
}

async function runReport(token: string, propertyId: string, payload: unknown) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`Analytics respondió [${res.status}]: ${text}`);
  return JSON.parse(text);
}

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'No auth token' }, 401);
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: 'Invalid session' }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .in('role', ['admin', 'editor'])
      .maybeSingle();
    if (!roleRow) return json({ error: 'Se requiere rol de operaciones' }, 403);

    const body = await req.json().catch(() => ({}));
    const clientId = String(body.client_id ?? '');
    const start = String(body.period_start ?? '');
    const end = String(body.period_end ?? '');
    const label = body.period_label ? String(body.period_label) : null;
    if (!clientId) return json({ error: 'client_id requerido' }, 400);
    if (!ISO.test(start) || !ISO.test(end) || start > end) {
      return json({ error: 'Periodo inválido' }, 400);
    }

    const { data: props, error: propErr } = await admin
      .from('client_ga4_properties')
      .select('id, property_id, label')
      .eq('client_id', clientId)
      .eq('active', true);
    if (propErr) throw propErr;
    if (!props?.length) return json({ error: 'Este cliente no tiene propiedad de Analytics configurada' }, 400);

    const token = await getAccessToken();
    const dateRanges = [{ startDate: start, endDate: end }];
    const results: { property_id: string; sessions: number; users: number }[] = [];

    let users = 0, newUsers = 0, sessions = 0, pageviews = 0, conversions = 0;
    let durationWeighted = 0, bounceWeighted = 0, sessionWeight = 0;
    const channels: Record<string, { sessions: number; users: number; conversions: number }> = {};

    for (const p of props) {
      try {
        const totals = await runReport(token, p.property_id, {
          dateRanges,
          metrics: [
            { name: 'totalUsers' },
            { name: 'newUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
            { name: 'conversions' },
          ],
        });
        const row = totals.rows?.[0]?.metricValues ?? [];
        const s = num(row[2]?.value);
        users += num(row[0]?.value);
        newUsers += num(row[1]?.value);
        sessions += s;
        pageviews += num(row[3]?.value);
        conversions += num(row[6]?.value);
        durationWeighted += num(row[4]?.value) * s;
        bounceWeighted += num(row[5]?.value) * s;
        sessionWeight += s;

        const byChannel = await runReport(token, p.property_id, {
          dateRanges,
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'conversions' }],
          limit: 50,
        });
        for (const r of byChannel.rows ?? []) {
          const key = r.dimensionValues?.[0]?.value ?? 'Otros';
          const cur = channels[key] ?? { sessions: 0, users: 0, conversions: 0 };
          cur.sessions += num(r.metricValues?.[0]?.value);
          cur.users += num(r.metricValues?.[1]?.value);
          cur.conversions += num(r.metricValues?.[2]?.value);
          channels[key] = cur;
        }

        results.push({ property_id: p.property_id, sessions: s, users: num(row[0]?.value) });
        await admin
          .from('client_ga4_properties')
          .update({ last_synced_at: new Date().toISOString(), last_sync_error: null })
          .eq('id', p.id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`ga4-sync property ${p.property_id} failed:`, msg);
        await admin
          .from('client_ga4_properties')
          .update({ last_sync_error: msg.slice(0, 500) })
          .eq('id', p.id);
        return json({ error: msg }, 502);
      }
    }

    const { error: upErr } = await admin.from('client_portal_web_analytics').upsert(
      {
        client_id: clientId,
        period_start: start,
        period_end: end,
        period_label: label,
        users,
        new_users: newUsers,
        sessions,
        pageviews,
        conversions,
        avg_session_seconds: sessionWeight ? durationWeighted / sessionWeight : null,
        bounce_rate: sessionWeight ? bounceWeighted / sessionWeight : null,
        channels,
        notes: 'Lectura automática desde Google Analytics',
        created_by: userData.user.id,
      },
      { onConflict: 'client_id,period_start,period_end' },
    );
    if (upErr) throw upErr;

    return json({ ok: true, properties: results, sessions, users });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('ga4-sync failed:', msg);
    return json({ error: msg }, 500);
  }
});
