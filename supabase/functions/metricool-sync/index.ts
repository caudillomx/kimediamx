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
            interactions: p.interactions ?? 0, reach: p.reach ?? 0, impressions: p.impressionsTotal ?? p.views ?? 0,
          };
          if (n.key === "facebook") return {
            url: p.link, text: p.text, date: p.created?.dateTime, image: p.picture,
            interactions: (p.reactions ?? 0) + (p.comments ?? 0) + (p.shares ?? 0),
            reach: p.impressionsUnique ?? 0, impressions: p.impressions ?? 0,
          };
          return {
            url: p.shareUrl, text: p.videoDescription, date: p.createTime, image: p.coverImageUrl,
            interactions: (p.likeCount ?? 0) + (p.commentCount ?? 0) + (p.shareCount ?? 0),
            reach: p.viewCount ?? 0, impressions: p.viewCount ?? 0,
          };
        });
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
            top_posts: [...norm].sort((a, b) => b.interactions - a.interactions).slice(0, 5)
              .map((p) => ({ ...p, text: (p.text ?? "").slice(0, 220) })),
          },
          created_by: u.user.id,
        });
      }
      if (rows.length) {
        const { error } = await admin.from("client_portal_social_metrics")
          .upsert(rows, { onConflict: "client_id,network,account_key,period_start,period_end" });
        if (error) throw error;
      }
      return json({ saved: rows.length, brand: brand.label });
    }

    return json({ error: "Acción desconocida" }, 400);
  } catch (e) {
    console.error("metricool-sync", e);
    return json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});
