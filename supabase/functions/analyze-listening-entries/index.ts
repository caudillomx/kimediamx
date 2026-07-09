import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const MODEL = 'google/gemini-2.5-flash';

type Entry = { id: string; entry_date: string; content_md: string };

const SYSTEM = `Eres un analista senior de social listening y reputación. Analizas bitácoras diarias (WhatsApp del equipo o notas manuales) sobre lo que se dice del cliente en medios, redes y grupos.

Devuelve SIEMPRE JSON estricto con estas claves:
{
  "sentiment": "positivo" | "neutral" | "negativo" | "crisis",
  "sentiment_score": number entre -1 y 1,
  "urgency": "baja" | "media" | "alta" | "critica",
  "topics": string[] (3-6 temas cortos, en minúsculas, en español),
  "mentions": [{ "name": string, "type": "persona"|"marca"|"medio"|"institucion"|"otro" }],
  "actors": string[] (nombres del equipo que reportan/participan, si se detectan),
  "summary": string (2-3 oraciones ejecutivas, sin adornos)
}

Reglas: No inventes. Si algo no aparece, omite. "crisis" solo si hay riesgo reputacional o legal claro. Ignora saludos, stickers, "🙂🙏", "ok" y ruido.`;

async function analyzeOne(entry: Entry) {
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
        { role: 'user', content: `Fecha: ${entry.entry_date}\n\nBitácora:\n${entry.content_md.slice(0, 12000)}` },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Gateway ${resp.status}: ${t}`);
  }
  const j = await resp.json();
  const raw = j?.choices?.[0]?.message?.content ?? '{}';
  return JSON.parse(raw);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { client_id, entry_ids, only_unanalyzed = true, limit = 30 } = await req.json();
    if (!client_id) throw new Error('client_id requerido');

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    let query = admin.from('client_portal_listening_entries')
      .select('id, entry_date, content_md, analyzed_at')
      .eq('client_id', client_id)
      .order('entry_date', { ascending: false })
      .limit(limit);
    if (entry_ids && Array.isArray(entry_ids) && entry_ids.length > 0) {
      query = admin.from('client_portal_listening_entries')
        .select('id, entry_date, content_md, analyzed_at')
        .in('id', entry_ids);
    } else if (only_unanalyzed) {
      query = query.is('analyzed_at', null);
    }
    const { data: entries, error } = await query;
    if (error) throw error;
    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({ processed: 0, message: 'No hay entradas para analizar' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let ok = 0; const errors: any[] = [];
    for (const e of entries) {
      try {
        const a = await analyzeOne(e as Entry);
        const { error: upErr } = await admin.from('client_portal_listening_entries').update({
          sentiment: a.sentiment ?? null,
          sentiment_score: typeof a.sentiment_score === 'number' ? a.sentiment_score : null,
          urgency: a.urgency ?? null,
          topics: Array.isArray(a.topics) ? a.topics.slice(0, 8) : [],
          mentions: Array.isArray(a.mentions) ? a.mentions.slice(0, 20) : [],
          actors: Array.isArray(a.actors) ? a.actors.slice(0, 15) : [],
          summary: typeof a.summary === 'string' ? a.summary : null,
          analyzed_at: new Date().toISOString(),
        }).eq('id', e.id);
        if (upErr) throw upErr;
        ok++;
      } catch (err: any) {
        errors.push({ id: e.id, error: err.message });
      }
    }

    return new Response(JSON.stringify({ processed: ok, total: entries.length, errors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});