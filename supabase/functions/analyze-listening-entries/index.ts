import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const MODEL = 'google/gemini-2.5-flash';

type Entry = { id: string; entry_date: string; content_md: string };

const SYSTEM = `Eres un analista senior de social listening y reputación. Analizas bitácoras diarias (WhatsApp del equipo o notas manuales) sobre lo que se dice del cliente en medios, redes y grupos.

Tu trabajo es CONVERTIR texto libre en datos ESTRUCTURADOS para un dashboard ejecutivo. Sé literal, no inventes, no rellenes.

Devuelve SIEMPRE JSON estricto con estas claves:
{
  "sentiment": "positivo" | "neutral" | "negativo" | "crisis",
  "sentiment_score": number entre -1 y 1,
  "urgency": "baja" | "media" | "alta" | "critica",
  "topics": string[] (3-6 temas cortos, en minúsculas, en español),
  "mentions": [{ "name": string, "type": "persona"|"marca"|"medio"|"institucion"|"otro" }],
  "actors": string[] (nombres del equipo que reportan/participan, si se detectan),
  "summary": string (2-3 oraciones ejecutivas, sin adornos),

  "total_mentions": number (cantidad TOTAL de menciones individuales sobre el cliente encontradas en la bitácora del día — no cuentes el día como 1; cuenta cada tuit, nota, video, post, comentario, columna, mensaje que hable del cliente por separado),
  "sentiment_counts": { "positivo": number, "neutral": number, "negativo": number, "crisis": number } (cuenta cuántas de esas menciones individuales caen en cada sentimiento; la suma debe ser <= total_mentions),
  "channels": [{ "name": "twitter"|"x"|"facebook"|"instagram"|"tiktok"|"youtube"|"linkedin"|"whatsapp"|"telegram"|"prensa"|"radio"|"tv"|"blog"|"foro"|"otro", "count": number }],
  "entities": [{ "name": string, "type": "persona"|"marca"|"medio"|"institucion"|"politico"|"influencer"|"otro", "sentiment": "positivo"|"neutral"|"negativo"|"crisis", "count": number }],
  "events": [{ "title": string, "kind": "crisis"|"lanzamiento"|"comunicado"|"declaracion"|"nota"|"campaña"|"evento"|"otro", "impact": "bajo"|"medio"|"alto", "detail": string }],
  "key_quotes": [{ "text": string, "author": string, "source": string, "sentiment": "positivo"|"neutral"|"negativo"|"crisis" }],
  "competitors": [{ "name": string, "count": number, "sentiment": "positivo"|"neutral"|"negativo"|"crisis" }]
}

Reglas duras:
- Devuelve arrays vacíos si no hay datos, NUNCA inventes nombres, canales ni citas.
- "total_mentions" y "sentiment_counts" son OBLIGATORIOS y críticos: cuenta con rigor cada ítem individual (un tuit = 1, una nota de prensa = 1, un video = 1). Si el equipo dice "10 tuits negativos y 3 notas positivas", devuelve total_mentions=13 y sentiment_counts={positivo:3, negativo:10, neutral:0, crisis:0}. NO devuelvas 0 si el texto tiene contenido.
- "sentiment" (el campo global del día) refleja el TONO PREDOMINANTE del día, no lo confundas con el conteo.
- "channels": cuenta cuántas menciones vienen de cada canal identificable en el texto (por URL, hashtag, "@usuario", "en el noticiero X", "en el podcast", etc.). Si no se puede inferir, no lo agregues.
- "entities": personas/marcas/instituciones citadas junto al cliente. Deduplica normalizando mayúsculas.
- "events": hitos concretos con impacto reputacional (crisis, lanzamientos, comunicados, declaraciones). No listes conversaciones triviales.
- "key_quotes": frases textuales entrecomilladas o parafraseadas breves (máx 240 caracteres) que valga la pena citar en el reporte. Si no hay citas claras, devuelve [].
- "competitors": otras marcas/organizaciones del mismo sector citadas de forma comparativa. Solo si el texto lo evidencia.
- "crisis" solo si hay riesgo reputacional o legal claro. Ignora saludos, stickers, "🙂🙏", "ok" y ruido.`;

// Extrae totales declarados EXPLÍCITAMENTE en la bitácora.
// Ej: "Total: 119 menciones", "119 menciones únicas", "se identificaron 119 menciones"
function extractDeclaredTotals(md: string): { total?: number; counts?: Record<string, number> } {
  const text = md.replace(/[\*_`~]/g, ' ').replace(/\s+/g, ' ');
  const out: { total?: number; counts?: Record<string, number> } = {};

  const totalPatterns = [
    /total\s*(?:general|de\s+menciones)?\s*[:\-–]?\s*(\d{1,5})\s*menciones/i,
    /(\d{1,5})\s*menciones\s*(?:únicas|unicas|totales|en\s+total)/i,
    /se\s+identificaron\s+(\d{1,5})\s*menciones/i,
    /volumen\s+total\s+de\s+menciones[^0-9]{0,60}(\d{1,5})/i,
  ];
  let best = 0;
  for (const re of totalPatterns) {
    const m = text.match(re);
    if (m) { const n = parseInt(m[1], 10); if (Number.isFinite(n) && n > best) best = n; }
  }
  if (best > 0) out.total = best;

  const grab = (labels: string[]): number | undefined => {
    for (const label of labels) {
      const re = new RegExp(`${label}[^0-9\\-]{0,40}(?:~|aprox\\.?|cerca\\s+de\\s+)?\\(?\\s*~?\\s*(\\d{1,5})\\s*menciones?\\)?`, 'i');
      const m = text.match(re);
      if (m) { const n = parseInt(m[1], 10); if (Number.isFinite(n)) return n; }
    }
    return undefined;
  };
  const positivo = grab(['positivo', 'positivas']);
  const neutral  = grab(['neutral', 'neutrales', 'neutro']);
  const negativo = grab(['negativo', 'negativas', 'negativo\\s*/\\s*riesgo', 'riesgo\\s*con\\s*contexto']);
  const crisis   = grab(['crisis']);
  if (positivo || neutral || negativo || crisis) {
    out.counts = {
      positivo: positivo ?? 0,
      neutral: neutral ?? 0,
      negativo: negativo ?? 0,
      crisis: crisis ?? 0,
    };
  }
  return out;
}

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
        { role: 'user', content: `Fecha: ${entry.entry_date}\n\nBitácora:\n${entry.content_md.slice(0, 28000)}` },
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
  const parsed = JSON.parse(raw);

  // Override con totales declarados explícitamente en el texto (fuente de verdad)
  const declared = extractDeclaredTotals(entry.content_md);
  if (declared.total && declared.total > (Number(parsed.total_mentions) || 0)) {
    parsed.total_mentions = declared.total;
  }
  if (declared.counts) {
    const sum = declared.counts.positivo + declared.counts.neutral + declared.counts.negativo + declared.counts.crisis;
    const currentSum = ['positivo','neutral','negativo','crisis'].reduce((a,k)=>a+(Number(parsed?.sentiment_counts?.[k])||0),0);
    if (sum > currentSum) parsed.sentiment_counts = declared.counts;
  }
  // Si tenemos total declarado pero los sentiment_counts no lo alcanzan, escálalos proporcionalmente
  if (parsed.total_mentions && parsed.sentiment_counts) {
    const sc = parsed.sentiment_counts;
    const sum = (Number(sc.positivo)||0)+(Number(sc.neutral)||0)+(Number(sc.negativo)||0)+(Number(sc.crisis)||0);
    if (sum > 0 && sum < parsed.total_mentions) {
      const k = parsed.total_mentions / sum;
      parsed.sentiment_counts = {
        positivo: Math.round((Number(sc.positivo)||0) * k),
        neutral:  Math.round((Number(sc.neutral)||0) * k),
        negativo: Math.round((Number(sc.negativo)||0) * k),
        crisis:   Math.round((Number(sc.crisis)||0) * k),
      };
    }
  }
  return parsed;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { client_id, entry_ids, only_unanalyzed = true, limit = 10, background = false, from_date, to_date } = await req.json();
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
    } else {
      if (only_unanalyzed) query = query.is('analyzed_at', null);
      if (from_date) query = query.gte('entry_date', from_date);
      if (to_date) query = query.lte('entry_date', to_date);
    }
    const { data: entries, error } = await query;
    if (error) throw error;
    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({ processed: 0, message: 'No hay entradas para analizar' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const buildUpdate = (a: any) => ({
      sentiment: a.sentiment ?? null,
      sentiment_score: typeof a.sentiment_score === 'number' ? a.sentiment_score : null,
      urgency: a.urgency ?? null,
      topics: Array.isArray(a.topics) ? a.topics.slice(0, 8) : [],
      mentions: Array.isArray(a.mentions) ? a.mentions.slice(0, 20) : [],
      actors: Array.isArray(a.actors) ? a.actors.slice(0, 15) : [],
      summary: typeof a.summary === 'string' ? a.summary : null,
      channels: Array.isArray(a.channels) ? a.channels.slice(0, 15) : [],
      entities: Array.isArray(a.entities) ? a.entities.slice(0, 30) : [],
      events: Array.isArray(a.events) ? a.events.slice(0, 10) : [],
      key_quotes: Array.isArray(a.key_quotes) ? a.key_quotes.slice(0, 10) : [],
      competitors: Array.isArray(a.competitors) ? a.competitors.slice(0, 15) : [],
      total_mentions: typeof a.total_mentions === 'number' ? a.total_mentions : 0,
      sentiment_counts: (a.sentiment_counts && typeof a.sentiment_counts === 'object') ? a.sentiment_counts : {},
      analyzed_at: new Date().toISOString(),
    });

    const processAll = async () => {
      let ok = 0;
      for (const e of entries) {
        try {
          const a = await analyzeOne(e as Entry);
          await admin.from('client_portal_listening_entries').update(buildUpdate(a)).eq('id', e.id);
          ok++;
        } catch (err: any) {
          console.error('analyze error', e.id, err.message);
        }
      }
      console.log(`analyzed ${ok}/${entries.length}`);
    };

    if (background) {
      // @ts-ignore EdgeRuntime is available in Supabase functions
      EdgeRuntime.waitUntil(processAll());
      return new Response(JSON.stringify({ started: true, total: entries.length, background: true }),
        { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Foreground: process sequentially but with small limit to stay under 150s
    let ok = 0; const errors: any[] = [];
    for (const e of entries) {
      try {
        const a = await analyzeOne(e as Entry);
        const { error: upErr } = await admin.from('client_portal_listening_entries').update(buildUpdate(a)).eq('id', e.id);
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