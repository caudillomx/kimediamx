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
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return json({ error: "No autenticado" }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", u.user.id);
    if (!(roles ?? []).some((r: any) => r.role === "admin")) return json({ error: "Solo administradores" }, 403);

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

    return json({ error: "Acción desconocida" }, 400);
  } catch (e) {
    console.error("metricool-sync", e);
    return json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});
