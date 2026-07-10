import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const MODEL = 'google/gemini-2.5-flash';

const SYSTEM = `Eres jefe de análisis de reputación de KiMedia. Escribes el REPORTE EJECUTIVO para cliente y equipo interno a partir de datos ya cuantificados de social listening.

Devuelve SIEMPRE JSON estricto:
{
  "executive_summary": string (4-6 oraciones, panorama sustantivo con NÚMEROS reales del período — volumen total, mix de sentimiento, canales/actores dominantes, hechos clave),
  "key_findings": [{ "title": string, "detail": string, "impact": "alto"|"medio"|"bajo" }] (4-6, cada uno anclado a un dato específico),
  "alerts": [{ "level": "critica"|"alta"|"media", "detail": string }] (solo si hay crisis o riesgo real; si no hay, deja el array vacío),
  "recommendations_team": string (markdown, 4-6 bullets accionables para KiMedia: monitoreo, respuesta, contenido, aliados),
  "recommendations_client": string (markdown, 4-6 bullets claros para el cliente, cada uno con QUÉ HACER + POR QUÉ, aterrizados en temas/canales/actores concretos del período),
  "top_topics": [{ "topic": string, "count": number }] (máx 8),
  "top_mentions": [{ "name": string, "type": string, "count": number }] (máx 8),
  "sentiment_breakdown": { "positivo": number, "neutral": number, "negativo": number, "crisis": number }
}

REGLAS DURAS:
- Basa TODO en AGREGADOS y ENTRADAS provistas. No inventes hechos, cifras ni actores.
- Los AGREGADOS son la fuente de verdad cuantitativa — úsalos literal.
- PROHIBIDO decir "no hubo conversación significativa" o "semana de calma" si total_mentions_semana > 20.
- Si hay volumen, describe QUÉ se dijo, DÓNDE, QUIÉN lo dijo y qué hacer.
- Las recomendaciones NUNCA son genéricas; cada bullet debe citar un tema, canal, actor o evento concreto.
- Si hay eventos con impact "alto" o kind "crisis", genera al menos una alerta o recomendación de respuesta.
- Si el mix es mayoritariamente positivo, recomienda cómo AMPLIFICAR; si es negativo, cómo CONTENER y REENCUADRAR.`;

type PeriodInput = {
  client_id: string;
  week_start?: string;
  from_date?: string;
  to_date?: string;
  persist?: boolean;
};

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizePeriod(input: PeriodInput) {
  const { week_start, from_date, to_date } = input;
  if (!week_start && !(from_date && to_date)) throw new Error('week_start o (from_date + to_date) requeridos');
  const isRange = Boolean(from_date && to_date);
  const periodStart = isRange ? from_date! : week_start!;
  const start = new Date(periodStart + 'T00:00:00');
  const end = isRange
    ? new Date(to_date! + 'T00:00:00')
    : (() => { const d = new Date(start); d.setDate(d.getDate() + 6); return d; })();
  const periodEnd = end.toISOString().slice(0, 10);
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  const label = days <= 7 ? 'Semana' : days <= 14 ? 'Quincena' : days <= 31 ? 'Mes' : 'Período';
  return { isRange, periodStart, periodEnd, start, end, days, label };
}

async function buildAnalysis(input: PeriodInput) {
  const { client_id, persist } = input;
  if (!client_id) throw new Error('client_id requerido');
  const period = normalizePeriod(input);
  const shouldPersist = persist ?? !period.isRange;

  const { data: entries, error } = await admin
    .from('client_portal_listening_entries')
    .select('entry_date, sentiment, sentiment_score, urgency, topics, mentions, actors, summary, total_mentions, sentiment_counts, channels, entities, events, key_quotes, competitors')
    .eq('client_id', client_id)
    .gte('entry_date', period.periodStart)
    .lte('entry_date', period.periodEnd)
    .order('entry_date', { ascending: true });
  if (error) throw error;
  if (!entries || entries.length === 0) throw new Error('No hay entradas en el período');

  const sentBreak: Record<string, number> = { positivo: 0, neutral: 0, negativo: 0, crisis: 0 };
  let totalMentions = 0;
  const topicCount = new Map<string, number>();
  const entityAgg = new Map<string, { name: string; type: string; count: number; sentiment: Record<string, number> }>();
  const channelAgg = new Map<string, number>();
  const eventList: any[] = [];
  const quoteList: any[] = [];
  const competitorAgg = new Map<string, { name: string; count: number; sentiment: Record<string, number> }>();

  for (const e of entries as any[]) {
    const sc = e.sentiment_counts ?? {};
    const hasCounts = sc && (sc.positivo || sc.neutral || sc.negativo || sc.crisis);
    if (hasCounts) {
      sentBreak.positivo += Number(sc.positivo ?? 0) || 0;
      sentBreak.neutral += Number(sc.neutral ?? 0) || 0;
      sentBreak.negativo += Number(sc.negativo ?? 0) || 0;
      sentBreak.crisis += Number(sc.crisis ?? 0) || 0;
    } else if (e.sentiment) {
      sentBreak[e.sentiment] = (sentBreak[e.sentiment] ?? 0) + (Number(e.total_mentions ?? 0) || 1);
    }
    totalMentions += Number(e.total_mentions ?? 0) || 0;

    for (const t of (e.topics ?? [])) topicCount.set(t, (topicCount.get(t) ?? 0) + 1);
    for (const ent of (e.entities ?? [])) {
      const name = typeof ent === 'string' ? ent : ent?.name; if (!name) continue;
      const type = (typeof ent === 'object' && ent?.type) || 'otro';
      const s = (typeof ent === 'object' && ent?.sentiment) || e.sentiment || 'neutral';
      const c = Number((typeof ent === 'object' && ent?.count) ?? 1) || 1;
      const row = entityAgg.get(name) ?? { name, type, count: 0, sentiment: { positivo: 0, neutral: 0, negativo: 0, crisis: 0 } };
      row.count += c;
      row.sentiment[s] = (row.sentiment[s] ?? 0) + c;
      entityAgg.set(name, row);
    }
    for (const ch of (e.channels ?? [])) {
      const name = typeof ch === 'string' ? ch : ch?.name; if (!name) continue;
      const c = Number((typeof ch === 'object' && ch?.count) ?? 1) || 1;
      channelAgg.set(name, (channelAgg.get(name) ?? 0) + c);
    }
    for (const ev of (e.events ?? [])) eventList.push({ fecha: e.entry_date, title: ev?.title, kind: ev?.kind, impact: ev?.impact, detail: ev?.detail });
    for (const q of (e.key_quotes ?? [])) quoteList.push({ fecha: e.entry_date, text: q?.text, author: q?.author, source: q?.source, sentiment: q?.sentiment });
    for (const cp of (e.competitors ?? [])) {
      const name = typeof cp === 'string' ? cp : cp?.name; if (!name) continue;
      const c = Number((typeof cp === 'object' && cp?.count) ?? 1) || 1;
      const s = (typeof cp === 'object' && cp?.sentiment) || 'neutral';
      const row = competitorAgg.get(name) ?? { name, count: 0, sentiment: { positivo: 0, neutral: 0, negativo: 0, crisis: 0 } };
      row.count += c; row.sentiment[s] = (row.sentiment[s] ?? 0) + c;
      competitorAgg.set(name, row);
    }
  }

  if (totalMentions === 0) totalMentions = sentBreak.positivo + sentBreak.neutral + sentBreak.negativo + sentBreak.crisis;

  const top = <T,>(arr: T[], n: number) => arr.slice(0, n);
  const aggregates = {
    total_mentions_semana: totalMentions,
    dias_con_bitacora: entries.length,
    sentiment_breakdown: sentBreak,
    top_topics: top(Array.from(topicCount.entries()).map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count), 10),
    top_entities: top(Array.from(entityAgg.values()).sort((a, b) => b.count - a.count), 10),
    top_channels: top(Array.from(channelAgg.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count), 10),
    top_events: top(eventList.sort((a, b) => (b.impact === 'alto' ? 1 : 0) - (a.impact === 'alto' ? 1 : 0)), 10),
    key_quotes: top(quoteList, 10),
    competitors: top(Array.from(competitorAgg.values()).sort((a, b) => b.count - a.count), 6),
  };

  const digest = (entries as any[]).map((e) => ({
    fecha: e.entry_date,
    sentimiento_dia: e.sentiment,
    urgencia: e.urgency,
    resumen: e.summary,
    total_menciones_dia: e.total_mentions,
    temas: e.topics,
    actores_equipo: e.actors,
  })).slice(-31);

  const userPrompt = [
    `${period.label} analizado: ${period.periodStart} → ${period.periodEnd} (${period.days} días).`,
    '',
    'AGREGADOS DEL PERÍODO (fuente de verdad — úsalos tal cual):',
    JSON.stringify(aggregates, null, 2),
    '',
    'BITÁCORA DIARIA (contexto cualitativo):',
    JSON.stringify(digest).slice(0, 28000),
  ].join('\n');

  const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': LOVABLE_API_KEY },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });
  if (!resp.ok) throw new Error(`Gateway ${resp.status}: ${await resp.text()}`);
  const j = await resp.json();
  const parsed = JSON.parse(j?.choices?.[0]?.message?.content ?? '{}');

  const payload = {
    client_id,
    week_start: period.periodStart,
    week_end: period.periodEnd,
    entries_count: entries.length,
    executive_summary: parsed.executive_summary ?? null,
    key_findings: parsed.key_findings ?? [],
    alerts: parsed.alerts ?? [],
    recommendations_team: parsed.recommendations_team ?? null,
    recommendations_client: parsed.recommendations_client ?? null,
    sentiment_breakdown: parsed.sentiment_breakdown ?? sentBreak,
    top_topics: parsed.top_topics ?? [],
    top_mentions: parsed.top_mentions ?? [],
  };

  let saved: any = { ...payload, id: `transient-${period.periodStart}-${period.periodEnd}` };
  if (shouldPersist) {
    const { data, error: upErr } = await admin
      .from('client_portal_listening_analyses')
      .upsert(payload, { onConflict: 'client_id,week_start' })
      .select().single();
    if (upErr) throw upErr;
    saved = data;
  }

  return { analysis: saved, period: { from: period.periodStart, to: period.periodEnd, days: period.days }, persisted: shouldPersist };
}

async function processJob(jobId: string, input: PeriodInput) {
  try {
    await admin.from('client_portal_listening_analysis_jobs').update({ status: 'processing', error_message: null }).eq('id', jobId);
    const result = await buildAnalysis({ ...input, persist: false });
    await admin.from('client_portal_listening_analysis_jobs').update({ status: 'completed', result }).eq('id', jobId);
  } catch (e: any) {
    await admin.from('client_portal_listening_analysis_jobs').update({ status: 'failed', error_message: e?.message ?? String(e) }).eq('id', jobId);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json();
    const { client_id, async: asyncMode } = body ?? {};
    if (!client_id) throw new Error('client_id requerido');
    const period = normalizePeriod(body);

    if (asyncMode) {
      const { data: job, error } = await admin
        .from('client_portal_listening_analysis_jobs')
        .insert({ client_id, period_start: period.periodStart, period_end: period.periodEnd, status: 'queued' })
        .select('id, status, period_start, period_end')
        .single();
      if (error) throw error;
      EdgeRuntime.waitUntil(processJob(job.id, body));
      return json({ job_id: job.id, status: job.status, period: { from: period.periodStart, to: period.periodEnd, days: period.days } }, 202);
    }

    return json(await buildAnalysis(body));
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
});