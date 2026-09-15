import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY') ?? '';
const GOOGLE_ADS_API_KEY = Deno.env.get('GOOGLE_ADS_API_KEY') ?? '';
const GATEWAY = 'https://connector-gateway.lovable.dev/google_ads/v25';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Lee todas las filas de una consulta de Google Ads para una cuenta. */
async function runQuery(customerId: string, query: string) {
  const rows: any[] = [];
  let pageToken: string | undefined;
  do {
    const res = await fetch(`${GATEWAY}/customers/${customerId}/googleAds:search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': GOOGLE_ADS_API_KEY,
      },
      body: JSON.stringify({ query, pageSize: 1000, ...(pageToken ? { pageToken } : {}) }),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Google Ads respondió [${res.status}]: ${text.slice(0, 500)}`);
    const body = JSON.parse(text);
    rows.push(...(body.results ?? []));
    pageToken = body.nextPageToken;
  } while (pageToken);
  return rows;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY || !GOOGLE_ADS_API_KEY) {
      return json({ error: 'Falta la conexión de Google Ads en el proyecto' }, 400);
    }

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
    // En modo histórico se agrega por mes en una sola consulta por cuenta.
    const byMonth = body.mode === 'history';
    if (!clientId) return json({ error: 'client_id requerido' }, 400);
    if (!ISO.test(start) || !ISO.test(end) || start > end) return json({ error: 'Periodo inválido' }, 400);

    const { data: accounts, error: accErr } = await admin
      .from('client_google_ads_accounts')
      .select('id, customer_id, label')
      .eq('client_id', clientId)
      .eq('active', true);
    if (accErr) throw accErr;
    if (!accounts?.length) return json({ error: 'Este cliente no tiene cuenta de anuncios configurada' }, 400);

    const query = `
      SELECT campaign.id, campaign.name, campaign.advertising_channel_type,
        ${byMonth ? 'segments.month,' : ''}
        metrics.cost_micros, metrics.impressions, metrics.clicks,
        metrics.ctr, metrics.average_cpc, metrics.average_cpm,
        metrics.conversions
      FROM campaign
      WHERE segments.date BETWEEN '${start}' AND '${end}'`;

    const monthLabel = (ym: string) => {
      const l = new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('es-MX', {
        month: 'long', year: 'numeric', timeZone: 'UTC',
      });
      return l.charAt(0).toUpperCase() + l.slice(1);
    };
    const monthEnd = (ym: string) => {
      const [y, m] = ym.split('-').map(Number);
      return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
    };

    let campaigns = 0;
    let spend = 0;

    for (const acc of accounts) {
      try {
        const rows = await runQuery(acc.customer_id, query);

        // Google devuelve una fila por campaña dentro del rango; se agrega por campaña.
        const byCampaign = new Map<string, any>();
        for (const r of rows) {
          const id = String(r.campaign?.id ?? '');
          if (!id) continue;
          const cur = byCampaign.get(id) ?? {
            name: r.campaign?.name ?? `Campaña ${id}`,
            objective: r.campaign?.advertisingChannelType ?? null,
            cost: 0, impressions: 0, clicks: 0, conversions: 0,
          };
          cur.cost += num(r.metrics?.costMicros) / 1_000_000;
          cur.impressions += num(r.metrics?.impressions);
          cur.clicks += num(r.metrics?.clicks);
          cur.conversions += num(r.metrics?.conversions);
          byCampaign.set(id, cur);
        }

        const payload = [...byCampaign.entries()].map(([id, c]) => ({
          client_id: clientId,
          platform: 'google_ads',
          campaign_key: `${acc.customer_id}:${id}`,
          campaign_name: c.name,
          objective: c.objective,
          period_start: start,
          period_end: end,
          period_label: label,
          spend: c.cost,
          impressions: c.impressions,
          clicks: c.clicks,
          ctr: c.impressions ? (c.clicks / c.impressions) * 100 : null,
          cpc: c.clicks ? c.cost / c.clicks : null,
          cpm: c.impressions ? (c.cost / c.impressions) * 1000 : null,
          results: c.conversions,
          result_type: 'conversiones',
          cost_per_result: c.conversions ? c.cost / c.conversions : null,
          conversions: c.conversions,
          raw: { source: 'google_ads_api', customer_id: acc.customer_id, campaign_id: id },
          created_by: userData.user.id,
        }));

        if (payload.length) {
          const { error: upErr } = await admin
            .from('client_portal_ads_metrics')
            .upsert(payload, { onConflict: 'client_id,platform,campaign_key,period_start,period_end' });
          if (upErr) throw upErr;
        }

        campaigns += payload.length;
        spend += payload.reduce((s, p) => s + p.spend, 0);

        await admin
          .from('client_google_ads_accounts')
          .update({ last_synced_at: new Date().toISOString(), last_sync_error: null })
          .eq('id', acc.id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`google-ads-sync account ${acc.customer_id} failed:`, msg);
        await admin
          .from('client_google_ads_accounts')
          .update({ last_sync_error: msg.slice(0, 500) })
          .eq('id', acc.id);
        return json({ error: msg }, 502);
      }
    }

    return json({ ok: true, campaigns, spend });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('google-ads-sync failed:', msg);
    return json({ error: msg }, 500);
  }
});
