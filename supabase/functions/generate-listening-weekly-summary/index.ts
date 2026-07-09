import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const MODEL = 'google/gemini-2.5-pro';

const SYSTEM = `Eres jefe de análisis de reputación de KiMedia. A partir de entradas de listening ya enriquecidas por IA, produces el reporte SEMANAL EJECUTIVO para dos audiencias: el equipo interno KiMedia (accionable, sin adornos, con alertas) y el cliente (claro, sin jerga).

Devuelve SIEMPRE JSON estricto:
{
  "executive_summary": string (3-5 oraciones, panorama general),
  "key_findings": [{ "title": string, "detail": string, "impact": "alto"|"medio"|"bajo" }] (máx 6),
  "alerts": [{ "level": "critica"|"alta"|"media", "detail": string }] (solo si aplica),
  "recommendations_team": string (bullets en markdown, acciones concretas para el equipo KiMedia),
  "recommendations_client": string (bullets en markdown, lenguaje claro para el cliente),
  "top_topics": [{ "topic": string, "count": number }] (máx 8),
  "top_mentions": [{ "name": string, "type": string, "count": number }] (máx 8),
  "sentiment_breakdown": { "positivo": number, "neutral": number, "negativo": number, "crisis": number }
}

Basa TODO en las entradas provistas. No inventes hechos.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { client_id, week_start } = await req.json();
    if (!client_id || !week_start) throw new Error('client_id y week_start requeridos');

    const start = new Date(week_start + 'T00:00:00');
    const end = new Date(start); end.setDate(end.getDate() + 6);
    const weekEnd = end.toISOString().slice(0, 10);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: entries, error } = await admin
      .from('client_portal_listening_entries')
      .select('entry_date, content_md, sentiment, sentiment_score, urgency, topics, mentions, actors, summary')
      .eq('client_id', client_id)
      .gte('entry_date', week_start)
      .lte('entry_date', weekEnd)
      .order('entry_date', { ascending: true });
    if (error) throw error;
    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({ error: 'No hay entradas esa semana' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const digest = entries.map((e: any) => ({
      fecha: e.entry_date,
      sentimiento: e.sentiment, urgencia: e.urgency,
      resumen: e.summary,
      temas: e.topics, menciones: e.mentions, actores: e.actors,
    }));

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `Semana ${week_start} → ${weekEnd}. Entradas enriquecidas:\n\n${JSON.stringify(digest).slice(0, 60000)}` },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`Gateway ${resp.status}: ${t}`);
    }
    const j = await resp.json();
    const parsed = JSON.parse(j?.choices?.[0]?.message?.content ?? '{}');

    const { data: saved, error: upErr } = await admin
      .from('client_portal_listening_analyses')
      .upsert({
        client_id, week_start, week_end: weekEnd,
        entries_count: entries.length,
        executive_summary: parsed.executive_summary ?? null,
        key_findings: parsed.key_findings ?? [],
        alerts: parsed.alerts ?? [],
        recommendations_team: parsed.recommendations_team ?? null,
        recommendations_client: parsed.recommendations_client ?? null,
        sentiment_breakdown: parsed.sentiment_breakdown ?? {},
        top_topics: parsed.top_topics ?? [],
        top_mentions: parsed.top_mentions ?? [],
      }, { onConflict: 'client_id,week_start' })
      .select().single();
    if (upErr) throw upErr;

    return new Response(JSON.stringify({ analysis: saved }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});