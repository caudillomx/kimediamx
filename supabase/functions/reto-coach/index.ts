import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

function clean(v: unknown, max = 600): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

type Mode = 'posicionamiento' | 'pilares' | 'hooks' | 'estrategia';

function buildPrompt(mode: Mode, body: Record<string, unknown>) {
  const base = `Eres estratega de contenido senior de KiMedia. Hablas español de México, profesional y cercano, sin emojis decorativos, sin relleno. Nunca inventas datos, marcas, cifras ni estudios. Si falta info, generaliza honestamente.`;

  if (mode === 'posicionamiento') {
    const actividad = clean(body.actividad, 400);
    const audiencia = clean(body.audiencia, 300);
    const diferenciador = clean(body.diferenciador, 300);
    const system = `${base}\nDevuelve SOLO JSON con: { "variantes": [ { "frase": string, "porque": string } ] } con EXACTAMENTE 3 variantes. Cada frase debe seguir la fórmula "Ayudo a [audiencia específica] a [resultado claro] a través de [método o diferenciador]" pero puede flexibilizarse para no sonar idéntica. "porque" explica en 1 línea por qué esta variante funciona.`;
    const user = `Actividad o servicio: ${actividad || '(no especificado)'}\nAudiencia objetivo: ${audiencia || '(no especificada)'}\nQué la hace distinta: ${diferenciador || '(no especificado)'}`;
    return { system, user };
  }

  if (mode === 'pilares') {
    const tema = clean(body.tema, 400);
    const audiencia = clean(body.audiencia, 300);
    const objetivo = clean(body.objetivo, 300);
    const system = `${base}\nDevuelve SOLO JSON con: { "pilares": [ { "nombre": string, "descripcion": string, "ejemplo_post": string } ] } con EXACTAMENTE 3 pilares. Los 3 deben ser distintos entre sí: típicamente uno de Autoridad (qué sabe), uno de Cercanía (quién es) y uno de Conversión (por qué trabajar/seguir/contratar), adaptados al caso. "ejemplo_post" es 1 idea de post concreta para ese pilar, en 1-2 líneas.`;
    const user = `Tema o nicho: ${tema || '(no especificado)'}\nAudiencia: ${audiencia || '(no especificada)'}\nObjetivo: ${objetivo || '(no especificado)'}`;
    return { system, user };
  }

  if (mode === 'hooks') {
    const idea = clean(body.idea, 500);
    const audiencia = clean(body.audiencia, 300);
    const system = `${base}\nDevuelve SOLO JSON con: { "hooks": [ { "framework": string, "texto": string } ] } con EXACTAMENTE 5 hooks. Usa estos 5 frameworks en este orden: "Pregunta directa", "Dato o contraste", "PAS (problema)", "Promesa concreta", "Confesión / antes-después". Cada "texto" es 1 línea de máximo 18 palabras, lista para abrir un reel o un post.`;
    const user = `Idea o tema del post: ${idea || '(no especificado)'}\nAudiencia: ${audiencia || '(no especificada)'}`;
    return { system, user };
  }

  // estrategia (full)
  const tema = clean(body.tema, 500);
  const objetivo = clean(body.objetivo, 300);
  const audiencia = clean(body.audiencia, 300);
  const tono = clean(body.tono, 200);
  const redes = clean(body.redes, 200);
  const contexto = clean(body.contexto, 600);
  const nombre = clean(body.nombre, 120);
  const system = `${base}\nDevuelve SOLO JSON con esta forma exacta:\n{\n  "diagnostico": string,\n  "posicionamiento": string,\n  "pilares": [{ "nombre": string, "descripcion": string }],\n  "audiencia": string,\n  "tono": string,\n  "frameworks": [{ "nombre": string, "cuando_usarlo": string }],\n  "ideas": [{ "formato": string, "red": string, "pilar": string, "hook": string, "cta": string }],\n  "siguiente_paso": string\n}\nExactamente 3 pilares, 2-3 frameworks, 3 ideas.`;
  const user = `Nombre: ${nombre || '(no especificado)'}\nTema: ${tema}\nObjetivo: ${objetivo || '(no especificado)'}\nAudiencia: ${audiencia || '(no especificada)'}\nTono: ${tono || '(no especificado)'}\nRedes: ${redes || '(no especificadas)'}\nContexto: ${contexto || '(no especificado)'}`;
  return { system, user };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    const body = await req.json().catch(() => ({}));
    const mode = (body?.mode as Mode) || 'estrategia';
    if (!['posicionamiento', 'pilares', 'hooks', 'estrategia'].includes(mode)) {
      return new Response(JSON.stringify({ error: 'mode inválido' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { system, user } = buildPrompt(mode, body);

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: 'Demasiadas solicitudes. Intenta en un momento.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: 'Se agotaron los créditos de IA.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      throw new Error(`AI gateway [${aiResp.status}]: ${t}`);
    }

    const aiJson = await aiResp.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? '{}';
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { raw }; }

    return new Response(JSON.stringify({ mode, result: parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('reto-coach error', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});