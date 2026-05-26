import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function clean(v: unknown, max = 600): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const body = await req.json().catch(() => ({}));
    const tema = clean(body?.tema, 500);          // de qué quiere hablar / causa o nicho
    const objetivo = clean(body?.objetivo, 300);  // qué quiere lograr
    const audiencia = clean(body?.audiencia, 300);
    const tono = clean(body?.tono, 200);
    const redes = clean(body?.redes, 200);        // canales donde está / quiere estar
    const contexto = clean(body?.contexto, 600);  // momento actual / qué ya hace
    const nombre = clean(body?.nombre, 120);
    const registration_id = typeof body?.registration_id === 'string' ? body.registration_id : null;

    if (!tema || tema.length < 3) {
      return new Response(JSON.stringify({ error: 'Cuéntanos sobre qué quieres crear contenido.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const system = `Eres estratega de contenido senior de KiMedia. Acompañas creadores y marcas a pasar de "publicar por publicar" a una estrategia de contenido con foco, narrativa y resultados.

Tu única tarea es devolver una MINI-ESTRATEGIA DE CONTENIDO concreta, basada SOLO en lo que la persona escribió. No inventes cifras, datos, estudios ni hechos. Si algo no se dijo, hazlo genérico o márcalo como pendiente.

Marco KiMedia que debes seguir:
1. Diagnóstico breve: qué oportunidad ves en lo que comparte.
2. Posicionamiento: una frase clara de "para quién" y "para qué".
3. Pilares de contenido (3): categorías temáticas estables que va a sostener.
4. Audiencia: 1-2 líneas describiéndola en humano, no demográficos vacíos.
5. Tono y voz recomendados.
6. Frameworks útiles según el caso (ej. Hook→Problema→Solución→CTA, AIDA, PAS, "antes/después", educativo/inspirador/conversión).
7. 3 ideas de contenido concretas, cada una con: formato (reel, carrusel, post, live, blog), red sugerida, pilar al que pertenece, hook de apertura y CTA.
8. Siguiente paso accionable que pueda hacer en las próximas 48h.

Tono: profesional pero cercano, español de México, sin relleno, sin emojis decorativos.

Devuelve SOLO JSON válido con esta forma exacta:
{
  "diagnostico": string,
  "posicionamiento": string,
  "pilares": [{ "nombre": string, "descripcion": string }],   // exactamente 3
  "audiencia": string,
  "tono": string,
  "frameworks": [{ "nombre": string, "cuando_usarlo": string }],  // 2 a 3
  "ideas": [                                                   // exactamente 3
    { "formato": string, "red": string, "pilar": string, "hook": string, "cta": string }
  ],
  "siguiente_paso": string
}
No agregues markdown ni texto fuera del JSON.`;

    const user = `Datos de la persona:
- Nombre: ${nombre || '(no especificado)'}
- Tema / nicho sobre el que quiere crear contenido: ${tema}
- Objetivo con su contenido: ${objetivo || '(no especificado)'}
- Audiencia a la que quiere hablar: ${audiencia || '(no especificada)'}
- Tono / personalidad: ${tono || '(no especificado)'}
- Redes donde publica o quiere publicar: ${redes || '(no especificadas)'}
- Contexto actual (qué ya hace o de dónde parte): ${contexto || '(no especificado)'}`;

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
      return new Response(JSON.stringify({ error: 'Se agotaron los créditos de IA. Avisa a KiMedia.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      throw new Error(`AI gateway error [${aiResp.status}]: ${t}`);
    }

    const aiJson = await aiResp.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? '{}';
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { raw }; }

    // Persist (best-effort)
    try {
      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await admin.from('webinar_coach_outputs').insert({
        registration_id,
        causa_social: tema,
        estilo: tono || null,
        audiencia: audiencia || null,
        mensaje_clave: objetivo || null,
        output: parsed,
      });
    } catch (e) {
      console.error('persist error', e);
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('reto-reel-coach error', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});