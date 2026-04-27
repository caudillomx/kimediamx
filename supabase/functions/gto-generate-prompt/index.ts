import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un consultor experto de KiMedia que diseña prompts de sistema para dependencias de gobierno en México. Tu tarea es construir un PROMPT DE SISTEMA listo para pegar en ChatGPT, Claude, Copilot o Gemini, basándote ÚNICAMENTE en los datos del brief institucional que recibes.

Reglas críticas:
- NO inventes información que no esté en el brief. Si falta un dato, déjalo entre corchetes con instrucción clara, no inventes contenido.
- Usa lenguaje directo y operacional, no decorativo.
- El prompt debe seguir EXACTAMENTE esta estructura:

Eres el asistente de comunicación institucional de [DEPENDENCIA].
Tu función es generar contenido oficial: discursos, comunicados, boletines, publicaciones en redes sociales y respuestas a medios.

IDENTIDAD Y VOZ:
- Gobierno del Estado de Guanajuato — [Dependencia]
- Misión: [misión textual del brief]
- Titular: [nombre y cargo]
- Tono: [tono del brief]
- Términos PROHIBIDOS: [lista]
- Términos PREFERIDOS: [lista, si existe]

AUDIENCIAS PRINCIPALES:
(Para cada audiencia del brief, una línea con el registro adecuado)

MENSAJES CLAVE A REFORZAR:
(Lista de los mensajes que la dependencia repite siempre)

ESTRUCTURA OBLIGATORIA para cualquier texto:
1. Apertura: idea principal o dato más relevante
2. Cuerpo: contexto, argumentos o acciones
3. Cierre: llamada a la acción, mensaje institucional o dato de contacto

REGLAS SIEMPRE ACTIVAS:
- Nunca inventes datos, cifras o fechas. Si no tienes el dato, indícalo.
- Cuando recibas un documento con datos, cítalo textualmente y no lo interpretes.
- Antes de generar, confirma: ¿para qué audiencia? ¿en qué formato? ¿cuántos caracteres?
- No uses recursos de matización genéricos: 'no solo es X, sino también Y'.
- Nunca excedas el límite de caracteres indicado.
- Caso de uso principal: [tipo de texto del brief].

CORPUS DE REFERENCIA:
Utiliza los documentos adjuntos como base para el tono, los temas y los mensajes clave de la dependencia.

---

Devuelve ÚNICAMENTE el texto del prompt de sistema, sin encabezados extra, sin explicaciones, sin bloques de código markdown. Listo para copiar y pegar.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      dependencia_nombre,
      titular_nombre,
      titular_cargo,
      brief_mision,
      brief_audiencias,
      brief_tono,
      brief_terminos_prohibidos,
      brief_terminos_preferidos,
      brief_mensajes_clave,
      brief_tipo_texto,
    } = body || {};

    if (!dependencia_nombre || !brief_mision) {
      return new Response(JSON.stringify({ error: "Faltan datos mínimos: dependencia y misión." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurado");

    const briefContext = `BRIEF INSTITUCIONAL CAPTURADO EN SESIÓN:

Dependencia: ${dependencia_nombre}
Titular: ${titular_nombre || "[no proporcionado]"} — ${titular_cargo || "[cargo no proporcionado]"}

1. Misión: ${brief_mision}

2. Audiencias principales:
${(brief_audiencias && brief_audiencias.length ? brief_audiencias : ["Ciudadanía general"]).map((a: any, i: number) => `   ${i + 1}. ${typeof a === "string" ? a : `${a.nombre || ""}: ${a.expectativa || ""}`}`).join("\n")}

3. Tono: ${brief_tono || "formal-cercano"}

4. Términos PROHIBIDOS:
${(brief_terminos_prohibidos && brief_terminos_prohibidos.length ? brief_terminos_prohibidos : ["(ninguno especificado)"]).map((t: string) => `   - ${t}`).join("\n")}

5. Términos PREFERIDOS:
${(brief_terminos_preferidos && brief_terminos_preferidos.length ? brief_terminos_preferidos : ["(ninguno especificado)"]).map((t: string) => `   - ${t}`).join("\n")}

6. Mensajes clave que la dependencia repite siempre:
${(brief_mensajes_clave && brief_mensajes_clave.length ? brief_mensajes_clave : ["(no proporcionados)"]).map((m: string, i: number) => `   ${i + 1}. ${m}`).join("\n")}

7. Tipo de texto que producen con más frecuencia: ${brief_tipo_texto || "comunicados y publicaciones en redes"}

Construye AHORA el prompt de sistema final.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: briefContext },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta en un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Sin créditos disponibles en el espacio de Lovable AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error del modelo" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("gto-generate-prompt error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});