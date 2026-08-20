import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/notion/v1";

type NotionProps = Record<string, any>;

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

function plain(prop: any): string {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
    case "rich_text":
      return (prop[prop.type] ?? []).map((t: any) => t.plain_text ?? "").join("").trim();
    case "select":
      return prop.select?.name ?? "";
    case "status":
      return prop.status?.name ?? "";
    case "multi_select":
      return (prop.multi_select ?? []).map((o: any) => o.name).join(", ");
    case "people":
      return (prop.people ?? []).map((p: any) => p.name ?? "").filter(Boolean).join(", ");
    case "date":
      return prop.date?.start ?? "";
    case "url":
      return prop.url ?? "";
    case "number":
      return prop.number != null ? String(prop.number) : "";
    case "checkbox":
      return prop.checkbox ? "sí" : "";
    case "formula":
      return prop.formula?.string ?? (prop.formula?.number != null ? String(prop.formula.number) : "");
    default:
      return "";
  }
}

function pick(props: NotionProps, keys: string[]): string {
  const entries = Object.entries(props);
  for (const k of keys) {
    const hit = entries.find(([name]) => norm(name) === norm(k));
    if (hit) {
      const v = plain(hit[1]);
      if (v) return v;
    }
  }
  // fallback: partial match
  for (const k of keys) {
    const hit = entries.find(([name]) => norm(name).includes(norm(k)));
    if (hit) {
      const v = plain(hit[1]);
      if (v) return v;
    }
  }
  return "";
}

function firstDate(props: NotionProps): string | null {
  for (const [, v] of Object.entries(props)) {
    if ((v as any)?.type === "date" && (v as any).date?.start) {
      return String((v as any).date.start).slice(0, 10);
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!NOTION_API_KEY) throw new Error("NOTION_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    // auth: admin only
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", uid);
    if (!(roles ?? []).some((r: any) => r.role === "admin")) {
      return new Response(JSON.stringify({ error: "Solo administradores pueden sincronizar" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const sourceId: string | undefined = body?.sourceId;

    let q = admin.from("notion_parrilla_sources").select("*").eq("active", true);
    if (sourceId) q = q.eq("id", sourceId);
    const { data: sources, error: srcErr } = await q;
    if (srcErr) throw srcErr;

    const gwHeaders = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": NOTION_API_KEY,
      "Content-Type": "application/json",
    };

    const report: any[] = [];

    for (const src of sources ?? []) {
      const accountMap: Record<string, string> = {};
      for (const [k, v] of Object.entries((src.account_map ?? {}) as Record<string, string>)) {
        accountMap[norm(k)] = v;
      }

      let hasMore = true;
      let cursor: string | undefined;
      const rows: any[] = [];

      while (hasMore) {
        const res = await fetch(`${GATEWAY_URL}/databases/${src.notion_database_id}/query`, {
          method: "POST",
          headers: gwHeaders,
          body: JSON.stringify(cursor ? { page_size: 100, start_cursor: cursor } : { page_size: 100 }),
        });
        if (!res.ok) {
          const errorBody = await res.text();
          console.error(`Notion query failed [${res.status}] for ${src.label}: ${errorBody}`);
          report.push({ source: src.label, error: `${res.status}: ${errorBody}` });
          hasMore = false;
          break;
        }
        const data = await res.json();
        rows.push(...(data.results ?? []));
        hasMore = !!data.has_more;
        cursor = data.next_cursor ?? undefined;
      }

      if (!rows.length) {
        report.push({ source: src.label, imported: 0, skipped: 0 });
        continue;
      }

      const items: any[] = [];
      let skipped = 0;

      for (const page of rows) {
        const props: NotionProps = page.properties ?? {};
        const account = pick(props, ["Cuenta", "Account", "Cliente", "Marca"]);
        let clientId: string | null = src.multi_client ? null : (src.default_client_id ?? null);
        if (src.multi_client) {
          const key = norm(account);
          clientId = accountMap[key] ?? null;
          if (!clientId && key) {
            const alias = Object.keys(accountMap).find((k) => key.includes(k) || k.includes(key));
            if (alias) clientId = accountMap[alias];
          }
        }
        if (!clientId) { skipped++; continue; }

        const title = pick(props, ["Tema", "Título", "Titulo", "Name", "Nombre", "Copy"]);
        const dateStr = pick(props, ["Fecha", "Date", "Fecha de publicación"]) || firstDate(props) || "";

        items.push({
          source_id: src.id,
          notion_page_id: page.id,
          client_id: clientId,
          account: account || null,
          title: title || null,
          scheduled_date: dateStr ? dateStr.slice(0, 10) : null,
          theme: pick(props, ["Tema", "Concepto"]) || null,
          objective: pick(props, ["Objetivo", "Objective"]) || null,
          format: pick(props, ["Formato", "Format", "Tipo"]) || null,
          network: pick(props, ["Plataforma", "Red", "Red social", "Canal", "Platform"]) || null,
          status: pick(props, ["Status", "Estatus", "Estado"]) || null,
          responsible: pick(props, ["Responsable", "Owner", "Asignado"]) || null,
          notion_url: page.url ?? null,
          raw: {},
          synced_at: new Date().toISOString(),
        });
      }

      if (items.length) {
        for (let i = 0; i < items.length; i += 200) {
          const { error } = await admin
            .from("notion_parrilla_items")
            .upsert(items.slice(i, i + 200), { onConflict: "notion_page_id" });
          if (error) throw error;
        }
      }

      await admin
        .from("notion_parrilla_sources")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", src.id);

      report.push({ source: src.label, imported: items.length, skipped });
    }

    return new Response(JSON.stringify({ success: true, report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("notion-sync-parrilla error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
