import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const SYSTEM_PROMPT =
  "Eres un estratega senior de medios digitales en una agencia mexicana. Generas propuestas de campañas publicitarias estratégicas, concretas y ejecutables. Tu output siempre es JSON válido, sin markdown, sin texto adicional.";

function clamp(s: string, n: number) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function buildUserPrompt(ctx: any) {
  return `CLIENTE: ${ctx.client.name}
INDUSTRIA: ${ctx.client.industry || "No especificada"}

CORPUS DE CONOCIMIENTO:
${ctx.corpusText || "Sin corpus disponible."}

CONTENIDO ORGÁNICO ACTIVO:
${ctx.cyclesText || "Sin ciclos activos."}

PERFORMANCE HISTÓRICO:
${ctx.perfText || "Sin datos previos."}

BRIEF DE CAMPAÑA:
- Objetivo de negocio: ${ctx.brief.business_objective || "—"}
- Objetivos de campaña: ${(ctx.brief.campaign_objectives || []).join(", ") || "—"}
- Plataformas: ${(ctx.brief.platforms || []).join(", ") || "—"}
- Presupuesto total: ${ctx.brief.budget_total || 0} ${ctx.brief.budget_currency || "MXN"}
- Vigencia: ${ctx.brief.flight_start || "—"} al ${ctx.brief.flight_end || "—"}
- Audiencia adicional: ${ctx.brief.target_audience_brief || "—"}

Genera una propuesta completa con esta estructura JSON exacta:
{
  "executive_summary": string,
  "strategic_diagnosis": string,
  "campaign_objectives": [{ "objective": string, "kpi": string, "target": string }],
  "audience": { "primary": string, "secondary": string, "exclusions": string },
  "platforms": [{
    "platform": string, "role": string, "budget_percentage": number, "budget_amount": number,
    "formats": [string], "objective": string, "targeting_approach": string,
    "kpis": [{ "metric": string, "target": string }], "creative_guidelines": string
  }],
  "content_alignment": string,
  "budget_breakdown": {
    "total": number, "currency": string,
    "by_platform": [{ "platform": string, "amount": number, "percentage": number }],
    "production_reserve": number, "notes": string
  },
  "timeline": [{ "phase": string, "dates": string, "activities": string, "budget": number }],
  "success_metrics": [{ "metric": string, "baseline": string, "target": string, "measurement": string }],
  "internal_notes": string,
  "next_steps": [string]
}`;
}

async function callClaude(userPrompt: string, fixHint?: string): Promise<string> {
  // Prefer Anthropic direct; fall back to Lovable AI Gateway with Gemini.
  const messages: any[] = [{ role: "user", content: userPrompt + (fixHint ? `\n\n${fixHint}` : "") }];

  if (ANTHROPIC_API_KEY) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });
    if (!r.ok) throw new Error(`Anthropic error ${r.status}: ${await r.text()}`);
    const j = await r.json();
    return j.content?.[0]?.text || "";
  }

  if (!LOVABLE_API_KEY) throw new Error("No AI key configured");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      response_format: { type: "json_object" },
    }),
  });
  if (!r.ok) throw new Error(`Gateway error ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content || "";
}

function tryParse(s: string): any | null {
  if (!s) return null;
  try { return JSON.parse(s); } catch { /* try to extract */ }
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  let proposalId: string | null = null;

  try {
    const body = await req.json();
    proposalId = body.proposal_id;
    const clientId = body.client_id;
    if (!proposalId || !clientId) {
      return new Response(JSON.stringify({ error: "proposal_id and client_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 1. Client
    const { data: client } = await sb.from("clients").select("*").eq("id", clientId).maybeSingle();
    if (!client) throw new Error("Client not found");

    // 2. Corpus (ordered by type priority)
    const { data: corpus } = await sb.from("client_corpus")
      .select("entry_type,title,content").eq("client_id", clientId);
    const order: Record<string, number> = { brandbook: 0, minuta: 1, nota: 2, url: 3, documento: 4 };
    const sorted = (corpus || []).sort(
      (a: any, b: any) => (order[a.entry_type] ?? 9) - (order[b.entry_type] ?? 9)
    );
    const corpusText = clamp(
      sorted.map((c: any) => `[${c.entry_type}] ${c.title}\n${c.content || ""}`).join("\n\n"),
      3000
    );
    const corpusCount = sorted.length;

    // 3. Active content cycles for this client's profiles
    const { data: profiles } = await sb.from("content_profiles").select("id").eq("client_id", clientId);
    const profileIds = (profiles || []).map((p: any) => p.id);
    let cyclesText = "";
    let cyclesCount = 0;
    if (profileIds.length) {
      const { data: cycles } = await sb.from("content_cycles")
        .select("id,title,status,briefing_data")
        .in("profile_id", profileIds)
        .in("status", ["briefing", "corpus", "parrilla"]);
      cyclesCount = (cycles || []).length;
      const cycleIds = (cycles || []).map((c: any) => c.id);
      let pieces: any[] = [];
      if (cycleIds.length) {
        const { data: pcs } = await sb.from("content_pieces")
          .select("cycle_id,format,pillar,draft_copy")
          .in("cycle_id", cycleIds).limit(5);
        pieces = pcs || [];
      }
      cyclesText = clamp(
        (cycles || []).map((c: any) =>
          `Ciclo: ${c.title} (${c.status})\n${pieces
            .filter(p => p.cycle_id === c.id)
            .map(p => `- ${p.format} | ${p.pillar || "—"} | ${(p.draft_copy || "").slice(0, 80)}`)
            .join("\n")}`).join("\n\n"),
        800
      );
    }

    // 4. Performance history
    const { data: perf } = await sb.from("ads_proposal_performance")
      .select("platform,period_start,period_end,spend,ctr,roas,cpm")
      .eq("client_id", clientId)
      .order("period_start", { ascending: false })
      .limit(3);
    const perfText = (perf && perf.length)
      ? perf.map((p: any) => `${p.platform} (${p.period_start}→${p.period_end}): spend=${p.spend} CTR=${p.ctr} ROAS=${p.roas} CPM=${p.cpm}`).join("\n")
      : "Sin datos previos";
    const perfCount = perf?.length || 0;

    // 5. Build prompt and call AI
    const userPrompt = buildUserPrompt({
      client, corpusText, cyclesText, perfText,
      brief: {
        business_objective: body.business_objective,
        campaign_objectives: body.campaign_objectives,
        platforms: body.platforms,
        budget_total: body.budget_total,
        budget_currency: body.budget_currency,
        flight_start: body.flight_start,
        flight_end: body.flight_end,
        target_audience_brief: body.target_audience_brief,
      },
    });

    let raw = await callClaude(userPrompt);
    let parsed = tryParse(raw);
    if (!parsed) {
      raw = await callClaude(userPrompt, "El JSON anterior fue inválido. Devuelve SOLO JSON válido, sin markdown, sin explicaciones, comenzando con { y terminando con }.");
      parsed = tryParse(raw);
    }

    if (!parsed) {
      await sb.from("ads_proposals").update({
        status: "borrador",
        internal_brief: { error: "AI returned invalid JSON", raw },
      }).eq("id", proposalId);
      return new Response(JSON.stringify({ error: "AI returned invalid JSON", raw }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const internal_brief = {
      executive_summary: parsed.executive_summary,
      internal_notes: parsed.internal_notes,
      next_steps: parsed.next_steps,
      budget_breakdown: parsed.budget_breakdown,
    };

    await sb.from("ads_proposals").update({
      proposal_data: parsed,
      internal_brief,
      generated_at: new Date().toISOString(),
      status: "revision",
    }).eq("id", proposalId);

    return new Response(JSON.stringify({
      proposal_data: parsed,
      context_used: { corpus_entries: corpusCount, active_cycles: cyclesCount, performance_records: perfCount },
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("generate-ads-proposal error", e);
    if (proposalId) {
      await sb.from("ads_proposals").update({
        status: "borrador",
        internal_brief: { error: e?.message || String(e) },
      }).eq("id", proposalId);
    }
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});