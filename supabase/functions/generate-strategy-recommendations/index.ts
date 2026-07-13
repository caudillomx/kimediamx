import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const MODEL = 'google/gemini-3.5-flash';
const admin = createClient(SUPABASE_URL, SERVICE_KEY);

const SYSTEM = `Eres estratega senior de comunicación digital. Cruzas señales de LISTENING (qué dicen las audiencias sobre la marca) con BENCHMARK (qué está haciendo la marca y qué hacen sus competidores en redes) para emitir un diagnóstico de COHERENCIA y recomendaciones accionables.

Devuelve SIEMPRE JSON estricto:
{
  "coherence": { "level": "alta"|"media"|"baja", "reason": string },
  "what_audience_says": { "topics": [string], "sentiment_summary": string },
  "what_client_does": { "narratives": [string], "tone": string },
  "what_peers_do": { "dominant_narratives": [string], "gaps_client_misses": [string] },
  "gaps": [{ "type": "tema"|"territorio"|"crisis"|"formato", "description": string, "evidence": string }],
  "recommendations": [{ "title": string, "action": string, "evidence_listening": string, "evidence_benchmark": string, "priority": "alta"|"media" }]
}

REGLAS DURAS:
- Basa TODO en las señales provistas. No inventes marcas, temas ni cifras.
- La "coherencia" mide qué tanto lo que el cliente PUBLICA responde/coincide con lo que las audiencias DICEN y con lo que el sector cubre.
- 3 a 5 recomendaciones, cada una con evidencia explícita de ambos lados (listening + benchmark).
- Los "gaps" son ausencias: temas presentes en listening pero no en el contenido propio, territorios que dominan competidores, crisis sin respuesta, formatos que funcionan en el sector y que el cliente no usa.
- Español, tono ejecutivo, directo, aterrizado.

CRITERIO DE CRISIS Y REPUTACIÓN (crítico — no alarmar sin evidencia):
- Usa EXCLUSIVAMENTE el objeto "reputacion" que recibes en el prompt (nivel, score y umbrales). NO recalcules crisis a partir de menciones negativas sueltas.
- Nivel "estable" o "vigilancia": está PROHIBIDO usar palabras como "crisis", "urgente", "alarma", "riesgo reputacional", "daño", "escándalo". Habla de "oportunidad de refuerzo", "tema a monitorear" u "observación".
- Solo puedes incluir un gap con type="crisis" o una recomendación priority="alta" por motivo reputacional cuando reputacion.nivel sea "alerta" o "crisis" Y exista un evento concreto en la lista de eventos. Si no, esos hallazgos van como priority="media" y como gap de "tema" o "territorio".
- Menciones negativas normales o quejas dispersas NO son crisis: son señal de conversación a atender, no de emergencia.
- "coherence.level" no debe bajar a "baja" solo porque haya sentimiento negativo; bájalo únicamente cuando el contenido del cliente ignore temas dominantes de la audiencia o del sector.
- El "sentiment_summary" debe ser descriptivo y proporcional: reporta cifras y proporción, evita adjetivos catastrofistas.`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

// Reputation scoring — conservative, avoids alarmist reads.
// score: 0..100 (100 = excelente). Umbrales calibrados para NO gritar "crisis"
// salvo evidencia clara (proporción alta de crisis o eventos etiquetados).
function computeReputation(
  sent: Record<string, number>,
  totalMentions: number,
  events: any[],
) {
  const pos = sent.positivo || 0;
  const neu = sent.neutral || 0;
  const neg = sent.negativo || 0;
  const cri = sent.crisis || 0;
  const total = Math.max(1, pos + neu + neg + cri);
  const pctNeg = neg / total;
  const pctCri = cri / total;
  const pctPos = pos / total;
  // score base: positivos suman, neutrales cero, negativos restan, crisis pesa 3x
  const raw = 50 + (pctPos * 50) - (pctNeg * 40) - (pctCri * 90);
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  const crisisEvents = (events ?? []).filter((e) =>
    String(e?.tipo ?? e?.type ?? '').toLowerCase().includes('crisis') ||
    e?.severidad === 'alta' || e?.severity === 'high',
  );

  // Reglas conservadoras — se requiere evidencia concreta para escalar.
  let nivel: 'estable' | 'vigilancia' | 'alerta' | 'crisis' = 'estable';
  if (score < 35 && (pctCri >= 0.15 || crisisEvents.length >= 2)) nivel = 'crisis';
  else if (score < 50 && (pctCri >= 0.08 || crisisEvents.length >= 1)) nivel = 'alerta';
  else if (score < 65 || pctNeg >= 0.25) nivel = 'vigilancia';
  else nivel = 'estable';

  // Volumen insuficiente => nunca escalar más allá de "vigilancia"
  if (totalMentions < 20 && (nivel === 'alerta' || nivel === 'crisis')) {
    nivel = 'vigilancia';
  }

  return {
    score,
    nivel,
    total_menciones: totalMentions,
    proporcion: { positivo: +pctPos.toFixed(2), negativo: +pctNeg.toFixed(2), crisis: +pctCri.toFixed(2) },
    eventos_crisis_documentados: crisisEvents.length,
    umbrales: {
      estable: 'score >= 65 y sin eventos de crisis',
      vigilancia: 'score 50–64 o >=25% negativo; NO es crisis',
      alerta: 'score 35–49 y (>=8% crisis o 1 evento documentado)',
      crisis: 'score < 35 y (>=15% crisis o >=2 eventos documentados)',
    },
    nota: 'Muestras <20 menciones nunca escalan a alerta/crisis por baja significancia estadística.',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { client_id, range_start, range_end, force } = await req.json();
    if (!client_id || !range_start || !range_end) return json({ error: 'client_id, range_start y range_end requeridos' }, 400);

    if (!force) {
      const { data: cached } = await admin
        .from('client_portal_strategy_reports')
        .select('*')
        .eq('client_id', client_id)
        .eq('range_start', range_start)
        .eq('range_end', range_end)
        .maybeSingle();
      if (cached) return json({ report: cached, cached: true });
    }

    // Listening entries
    const { data: entries } = await admin
      .from('client_portal_listening_entries')
      .select('entry_date, sentiment, urgency, topics, mentions, actors, summary, total_mentions, sentiment_counts, channels, entities, events, key_quotes, competitors')
      .eq('client_id', client_id)
      .gte('entry_date', range_start)
      .lte('entry_date', range_end);

    // Aggregate listening
    const topics = new Map<string, number>();
    const sentBreak: Record<string, number> = { positivo: 0, neutral: 0, negativo: 0, crisis: 0 };
    let totalMentions = 0;
    const events: any[] = [];
    for (const e of (entries ?? []) as any[]) {
      for (const t of (e.topics ?? [])) topics.set(t, (topics.get(t) ?? 0) + 1);
      const sc = e.sentiment_counts ?? {};
      for (const k of ['positivo', 'neutral', 'negativo', 'crisis']) sentBreak[k] += Number(sc?.[k] ?? 0) || 0;
      totalMentions += Number(e.total_mentions ?? 0) || 0;
      for (const ev of (e.events ?? [])) events.push({ fecha: e.entry_date, ...ev });
    }

    // Benchmark narratives (all rows for the range)
    const { data: narratives } = await admin
      .from('client_portal_benchmark_narratives')
      .select('*')
      .eq('client_id', client_id)
      .eq('range_start', range_start)
      .eq('range_end', range_end);

    // Competitors and metrics for context
    const [{ data: competitors }, { data: periods }] = await Promise.all([
      admin.from('client_portal_benchmark_competitors').select('id,name,is_client').eq('client_id', client_id).eq('active', true),
      admin.from('client_portal_benchmark_periods').select('id,period_start,period_end,period_label').eq('client_id', client_id).gte('period_end', range_start).lte('period_start', range_end),
    ]);
    const clientRow = (competitors ?? []).find((c: any) => c.is_client);
    const clientName = clientRow?.name ?? 'Cliente';
    const periodIds = (periods ?? []).map((p: any) => p.id);
    const { data: metrics } = periodIds.length
      ? await admin.from('client_portal_benchmark_metrics').select('*').in('period_id', periodIds)
      : { data: [] as any[] };

    // Build compact payload
    const clientNarratives = (narratives ?? []).filter((n: any) => n.competitor_id === clientRow?.id).map((n: any) => ({ network: n.network, ...n.narratives }));
    const peerNarratives = (narratives ?? []).filter((n: any) => n.competitor_id !== clientRow?.id).map((n: any) => ({ profile: n.profile_name, network: n.network, ...n.narratives }));

    const userPrompt = [
      `CLIENTE: ${clientName}`,
      `Rango analizado: ${range_start} → ${range_end}`,
      '',
      'REPUTACIÓN (usar tal cual, no recalcular):',
      JSON.stringify(computeReputation(sentBreak, totalMentions, events), null, 2),
      '',
      'LISTENING — señales de audiencia:',
      JSON.stringify({
        total_menciones: totalMentions,
        sentimiento: sentBreak,
        temas_top: Array.from(topics.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([t, c]) => ({ tema: t, dias: c })),
        eventos: events.slice(0, 15),
      }, null, 2),
      '',
      'BENCHMARK — narrativas propias del cliente:',
      JSON.stringify(clientNarratives, null, 2),
      '',
      'BENCHMARK — narrativas de competidores:',
      JSON.stringify(peerNarratives, null, 2),
      '',
      'BENCHMARK — métricas agregadas (rango):',
      JSON.stringify({ periods: periods, metrics_count: (metrics ?? []).length }, null, 2),
    ].join('\n');

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': LOVABLE_API_KEY },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.25,
      }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      return json({ error: `Gateway ${resp.status}: ${text}` }, resp.status);
    }
    const j = await resp.json();
    const parsed = JSON.parse(j?.choices?.[0]?.message?.content ?? '{}');

    const payload = {
      client_id,
      range_start,
      range_end,
      payload: parsed,
      model: MODEL,
      generated_at: new Date().toISOString(),
    };
    const { data: saved, error: upErr } = await admin
      .from('client_portal_strategy_reports')
      .upsert(payload, { onConflict: 'client_id,range_start,range_end' })
      .select().single();
    if (upErr) throw upErr;

    return json({ report: saved, cached: false });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});