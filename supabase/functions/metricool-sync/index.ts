import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const BASE = "https://app.metricool.com/api";
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function mc(path: string, params: Record<string, string>) {
  const token = Deno.env.get("METRICOOL_API_TOKEN")!;
  const userId = Deno.env.get("METRICOOL_USER_ID")!;
  const qs = new URLSearchParams({ userId, ...params });
  const res = await fetch(`${BASE}${path}?${qs}`, { headers: { "X-Mc-Auth": token, Accept: "application/json" } });
  const text = await res.text();
  if (!res.ok) throw new Error(`Metricool [${res.status}] ${path}: ${text.slice(0, 400)}`);
  try { return JSON.parse(text); } catch { return text; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!Deno.env.get("METRICOOL_API_TOKEN") || !Deno.env.get("METRICOOL_USER_ID"))
      return json({ error: "Metricool no está configurado" }, 500);

    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let actorId: string | null = null;
    const cronHeader = req.headers.get("x-cron-secret");
    if (cronHeader) {
      const { data: cs } = await admin.from("app_settings").select("value").eq("key", "cron_secret").maybeSingle();
      if (!cs?.value || cs.value !== cronHeader) return json({ error: "No autorizado" }, 401);
    } else {
      const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
      });
      const { data: u } = await userClient.auth.getUser();
      if (!u?.user) return json({ error: "No autenticado" }, 401);
      const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", u.user.id);
      if (!(roles ?? []).some((r: any) => r.role === "admin")) return json({ error: "Solo administradores" }, 403);
      actorId = u.user.id;
    }
    const u = { user: { id: actorId } };

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "brands");

    if (action === "brands") {
      const data = await mc("/admin/simpleProfiles", {});
      return json({ brands: data });
    }

    if (action === "probe") {
      const path = String(body?.path ?? "");
      if (!path.startsWith("/")) return json({ error: "path inválido" }, 400);
      const params: Record<string, string> = {};
      for (const [k, v] of Object.entries(body?.params ?? {})) params[k] = String(v);
      return json({ data: await mc(path, params) });
    }

    if (action === "sync") {
      const clientId = String(body?.clientId ?? "");
      const blogId = String(body?.blogId ?? "");
      const month = String(body?.month ?? "");
      if (!/^[0-9a-f-]{36}$/.test(clientId) || !/^\d+$/.test(blogId) || !/^\d{4}-\d{2}$/.test(month))
        return json({ error: "Parámetros inválidos" }, 400);

      const brands: any[] = await mc("/admin/simpleProfiles", {});
      const brand = brands.find((b) => String(b.id) === blogId);
      if (!brand) return json({ error: "Marca no encontrada en Metricool" }, 404);

      const [y, m] = month.split("-").map(Number);
      const start = `${month}-01`;
      const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const today = new Date().toISOString().slice(0, 10);
      const end = `${month}-${String(lastDay).padStart(2, "0")}`;
      const until = end > today ? today : end;
      if (start > today) return json({ saved: 0 });
      const base = { blogId, from: `${start}T00:00:00`, to: `${until}T23:59:59`, timezone: "America/Mexico_City" };
      const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
      const label = `${MESES[m - 1][0].toUpperCase()}${MESES[m - 1].slice(1)} ${y}`;

      const series = async (network: string, metric: string) => {
        try {
          const d = await mc("/v2/analytics/timelines", { ...base, network, subject: "account", metric });
          const vals = (d?.data?.[0]?.values ?? []) as { dateTime: string; value: number }[];
          return vals.filter((v) => v.value != null && v.value > 0).sort((a, b) => (a.dateTime < b.dateTime ? -1 : 1));
        } catch (e) { console.warn(network, metric, String(e)); return []; }
      };
      const posts = async (network: string) => {
        try { const d = await mc(`/v2/analytics/posts/${network}`, base); return (d?.data ?? []) as any[]; }
        catch (e) { console.warn("posts", network, String(e)); return []; }
      };

      const nets: { key: string; metric: string; handle?: string }[] = [];
      if (brand.instagram) nets.push({ key: "instagram", metric: "Followers", handle: brand.instagram });
      if (brand.facebook || brand.facebookPageId) nets.push({ key: "facebook", metric: "pageFollows", handle: brand.facebook });
      if (brand.tiktok) nets.push({ key: "tiktok", metric: "followers_count", handle: brand.tiktok });

      const rows: any[] = [];
      for (const n of nets) {
        const [fol, ps] = await Promise.all([series(n.key, n.metric), posts(n.key)]);
        const norm = ps.map((p) => {
          if (n.key === "instagram") return {
            url: p.url, text: p.content, date: p.publishedAt?.dateTime, image: p.imageUrl,
            format: String(p.type ?? "").replace("FEED_", "").replace("CAROUSEL_ALBUM", "CARRUSEL").toLowerCase(),
            likes: p.likes ?? 0, comments: p.comments ?? 0, shares: p.shares ?? 0, saves: p.saved ?? 0,
            interactions: p.interactions ?? 0, reach: p.reach ?? 0, impressions: p.impressionsTotal ?? p.views ?? 0,
            views: p.views ?? 0, engagement: p.engagement ?? null,
          };
          if (n.key === "facebook") return {
            url: p.link, text: p.text, date: p.created?.dateTime, image: p.picture,
            format: String(p.type ?? "post").toLowerCase(),
            likes: p.reactions ?? 0, comments: p.comments ?? 0, shares: p.shares ?? 0, saves: 0,
            interactions: (p.reactions ?? 0) + (p.comments ?? 0) + (p.shares ?? 0),
            reach: p.impressionsUnique ?? 0, impressions: p.impressions ?? 0,
            views: p.videoViews ?? 0, clicks: p.clicks ?? 0, engagement: p.engagement ?? null,
          };
          return {
            url: p.shareUrl, text: p.videoDescription ?? p.title, date: p.createTime, image: p.coverImageUrl,
            format: "video",
            likes: p.likeCount ?? 0, comments: p.commentCount ?? 0, shares: p.shareCount ?? 0, saves: 0,
            interactions: (p.likeCount ?? 0) + (p.commentCount ?? 0) + (p.shareCount ?? 0),
            reach: p.viewCount ?? 0, impressions: p.viewCount ?? 0, views: p.viewCount ?? 0,
            duration: p.duration ?? null, engagement: p.engagement ?? null,
          };
        }).map((p) => ({ ...p, text: Array.from(String(p.text ?? "")).slice(0, 400).join("") }));
        const followers = fol.length ? fol[fol.length - 1].value : null;
        const first = fol.length ? fol[0].value : null;
        const growth = followers != null && first != null ? followers - first : null;
        const inter = norm.reduce((a, p) => a + p.interactions, 0);
        const reach = norm.reduce((a, p) => a + p.reach, 0);
        const impr = norm.reduce((a, p) => a + p.impressions, 0);
        if (!norm.length && followers == null) continue;
        const er = followers && norm.length ? (inter / norm.length / followers) * 100 : null;
        rows.push({
          client_id: clientId, network: n.key, account_key: `metricool:${blogId}:${n.key}`,
          account_name: brand.label, account_handle: n.handle ?? null,
          period_start: start, period_end: end, period_label: label, source: "metricool",
          followers, follower_growth: growth,
          follower_growth_rate: growth != null && first ? (growth / first) * 100 : null,
          posts: norm.length, interactions: inter, reach, impressions: impr, engagement_rate: er,
          raw: {
            blog_id: blogId,
            top_posts: [...norm].sort((a, b) => b.interactions - a.interactions).slice(0, 5),
            posts: norm,
            followers_daily: fol.map((f) => ({ d: String(f.dateTime).slice(0, 10), v: f.value })),
            totals: {
              likes: norm.reduce((a, p) => a + (p.likes ?? 0), 0),
              comments: norm.reduce((a, p) => a + (p.comments ?? 0), 0),
              shares: norm.reduce((a, p) => a + (p.shares ?? 0), 0),
              saves: norm.reduce((a, p) => a + (p.saves ?? 0), 0),
              views: norm.reduce((a, p) => a + (p.views ?? 0), 0),
            },
          },
          created_by: u.user.id,
        });
      }
      if (rows.length) {
        const { error } = await admin.from("client_portal_social_metrics")
          .upsert(rows, { onConflict: "client_id,network,account_key,period_start,period_end" });
        if (error) throw error;
      }
      // Publicidad en Meta (si la marca tiene cuenta de anuncios conectada)
      let adsSaved = 0;
      try {
        const d = await mc("/v2/analytics/campaigns/facebookads", base);
        const camps = ((d?.data ?? []) as any[]).filter((c) => (c.spent ?? 0) > 0 || (c.impressions ?? 0) > 0);
        const labelOf = (l: string | null) => {
          const k = String(l ?? "").toLowerCase();
          if (!k) return "resultados";
          if (k.includes("messaging conversation")) return "conversaciones iniciadas";
          if (k.includes("link click")) return "clics al enlace";
          if (k.includes("engagement")) return "interacciones";
          if (k.includes("video")) return "reproducciones";
          if (k.includes("reach")) return "personas alcanzadas";
          if (k.includes("lead")) return "registros";
          if (k.includes("purchase")) return "compras";
          return k;
        };
        const adRows = camps.map((c) => ({
          client_id: clientId, platform: "meta", campaign_key: String(c.providerCampaignId ?? c.id),
          campaign_name: c.name ?? "Campaña", objective: c.objective ?? null,
          period_start: start, period_end: end, period_label: label,
          spend: c.spent ?? null, impressions: c.impressions ?? null, reach: c.reach ?? null, clicks: c.clicks ?? null,
          ctr: c.ctr ?? null, cpc: c.cpc ?? null, cpm: c.cpm ?? null, results: c.results ?? null,
          result_type: labelOf(c.resultsLabel ?? null),
          cost_per_result: c.results ? (c.spent ?? 0) / c.results : null, conversions: c.conversions ?? null,
          raw: { source: "metricool", blog_id: blogId, status: c.status, actions: c.actions ?? {},
            start: c.start?.dateTime ?? null, stop: c.stop?.dateTime ?? null },
          created_by: u.user.id,
        }));
        if (adRows.length) {
          const { error } = await admin.from("client_portal_ads_metrics")
            .upsert(adRows, { onConflict: "client_id,platform,campaign_key,period_start,period_end" });
          if (error) throw error;
          adsSaved = adRows.length;
        }

        // Cortes semanales (lunes a domingo) que tocan este mes
        if (camps.length) {
          const iso = (d: Date) => d.toISOString().slice(0, 10);
          const d0 = new Date(`${start}T00:00:00Z`);
          d0.setUTCDate(d0.getUTCDate() - ((d0.getUTCDay() + 6) % 7));
          const weekRows: any[] = [];
          for (let w = new Date(d0); iso(w) <= until; w.setUTCDate(w.getUTCDate() + 7)) {
            const ws = iso(w);
            const we = new Date(w); we.setUTCDate(we.getUTCDate() + 6);
            const weS = iso(we);
            const wUntil = weS > today ? today : weS;
            try {
              const wd = await mc("/v2/analytics/campaigns/facebookads", { ...base, from: `${ws}T00:00:00`, to: `${wUntil}T23:59:59` });
              const wc = ((wd?.data ?? []) as any[]).filter((c) => (c.spent ?? 0) > 0 || (c.impressions ?? 0) > 0);
              for (const c of wc) weekRows.push({
                client_id: clientId, platform: "meta", campaign_key: String(c.providerCampaignId ?? c.id),
                campaign_name: c.name ?? "Campaña", objective: c.objective ?? null,
                period_start: ws, period_end: weS, period_label: `Semana ${ws}`,
                spend: c.spent ?? null, impressions: c.impressions ?? null, reach: c.reach ?? null, clicks: c.clicks ?? null,
                ctr: c.ctr ?? null, cpc: c.cpc ?? null, cpm: c.cpm ?? null, results: c.results ?? null,
                result_type: labelOf(c.resultsLabel ?? null),
                cost_per_result: c.results ? (c.spent ?? 0) / c.results : null, conversions: c.conversions ?? null,
                raw: { source: "metricool", granularity: "week", blog_id: blogId, status: c.status, actions: c.actions ?? {},
                  start: c.start?.dateTime ?? null, stop: c.stop?.dateTime ?? null },
                created_by: u.user.id,
              });
            } catch (e) { console.warn("ads week", ws, String(e)); }
          }
          if (weekRows.length) {
            const { error } = await admin.from("client_portal_ads_metrics")
              .upsert(weekRows, { onConflict: "client_id,platform,campaign_key,period_start,period_end" });
            if (error) throw error;
            adsSaved += weekRows.length;
          }
        }
      } catch (e) { console.warn("ads", String(e)); }

      return json({ saved: rows.length, ads: adsSaved, brand: brand.label });
    }

    return json({ error: "Acción desconocida" }, 400);
  } catch (e) {
    console.error("metricool-sync", e);
    return json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});
