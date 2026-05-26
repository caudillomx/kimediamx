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
    const causa = clean(body?.causa_social);
    const estilo = clean(body?.estilo, 300);
    const audiencia = clean(body?.audiencia, 300);
    const mensaje = clean(body?.mensaje_clave, 400);
    const nombre = clean(body?.nombre, 120);
    const registration_id = typeof body?.registration_id === 'string' ? body.registration_id : null;

    if (!causa || causa.length < 3) {
      return new Response(JSON.stringify({ error: 'Cuéntanos cuál es tu causa social.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const system = `Eres un coach de contenido de KiMedia para creadores que participan en el Reto InfluenSER.
Tu única tarea es devolver un brief CONCRETO para un reel vertical de 30 a 60 segundos sobre una causa social, basándote SOLO en lo que el creador escribió. No inventes datos, cifras ni hechos sobre la causa. Si algo no se dice, hazlo genérico o pídelo como nota.

Estructura obligatoria (framework KiMedia: Hook → Problema → Solución → CTA).
Tono: profesional pero cercano, conversacional, en español de México.
Devuelve SOLO JSON válido con la siguiente forma exacta:
{
  "titulo": string,                         // título corto del reel
  "hook": string,                           // 1-2 frases para los primeros 3 segundos
  "estructura": [                           // 3 a 5 bloques
    { "tiempo": "0-3s", "que_dices": string, "que_se_ve": string }
  ],
  "cta": string,                            // llamado a la acción claro
  "caption": string,                        // texto para publicar (máx 280 caracteres)
  "hashtags": [string],                     // 5 a 8 hashtags relevantes en minúsculas con #
  "tips": [string]                          // 3 consejos accionables (luz, edición, ritmo, etc.)
}
No agregues markdown, ni texto fuera del JSON.`;

    const user = `Datos del creador:
- Nombre: ${nombre || '(no especificado)'}
- Causa social: ${causa}
- Estilo / personalidad: ${estilo || '(no especificado)'}
- Audiencia: ${audiencia || '(no especificada)'}
- Mensaje clave que quiere transmitir: ${mensaje || '(no especificado)'}`;

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
        causa_social: causa,
        estilo: estilo || null,
        audiencia: audiencia || null,
        mensaje_clave: mensaje || null,
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