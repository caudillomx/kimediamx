import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface QuizResultRequest {
  email: string;
  name: string;
  quizType: "personal_brand" | "pyme";
  resultLevel: "beginner" | "intermediate" | "advanced";
  score: number;
  maxScore: number;
  percentage: number;
  companyName?: string;
}

const resultTitles = {
  personal_brand: {
    beginner: "🌱 Etapa de Siembra",
    intermediate: "🌿 Etapa de Crecimiento",
    advanced: "🌳 Etapa de Cosecha",
  },
  pyme: {
    beginner: "🚀 Fase de Despegue",
    intermediate: "📈 Fase de Escalamiento",
    advanced: "🏆 Fase de Liderazgo",
  },
};

const resultDescriptions = {
  personal_brand: {
    beginner: "Tu marca personal está en sus primeros pasos. Tienes un gran potencial por desarrollar y es el momento perfecto para construir bases sólidas.",
    intermediate: "Ya tienes presencia digital y algunos elementos de marca. Es momento de profesionalizar y escalar tu alcance e impacto.",
    advanced: "¡Excelente! Tu marca personal está bien posicionada. El siguiente nivel es optimizar, automatizar y multiplicar tu impacto.",
  },
  pyme: {
    beginner: "Tu empresa está comenzando su transformación digital. Hay oportunidades enormes para crecer y captar más clientes a través de canales digitales.",
    intermediate: "Ya tienes bases digitales establecidas. Es momento de profesionalizar, medir resultados y escalar lo que funciona.",
    advanced: "¡Felicidades! Tu empresa tiene una presencia digital sólida. El siguiente paso es optimizar, automatizar y dominar tu mercado.",
  },
};

const recommendations = {
  personal_brand: {
    beginner: [
      "Define tu propuesta de valor única: ¿Qué problema resuelves y para quién?",
      "Crea o actualiza tus perfiles profesionales con foto y descripción clara",
      "Establece una identidad visual básica (colores y estilo de comunicación)",
      "Comienza a publicar contenido de valor 2-3 veces por semana",
      "Construye tu red conectando con profesionales de tu industria",
    ],
    intermediate: [
      "Documenta y refina tu estrategia de contenido con pilares claros",
      "Implementa un sistema de captura de testimonios y casos de éxito",
      "Optimiza tus perfiles para aparecer en búsquedas relevantes",
      "Establece métricas clave y revísalas semanalmente",
      "Expande tu presencia a una red adicional relevante para tu audiencia",
    ],
    advanced: [
      "Implementa embudos de conversión automatizados",
      "Considera crear productos digitales (cursos, ebooks, membresías)",
      "Desarrolla alianzas estratégicas con otras marcas personales",
      "Invierte en contenido de alto valor (video, podcast, webinars)",
      "Explora speaking y participación en eventos de tu industria",
    ],
  },
  pyme: {
    beginner: [
      "Crea o actualiza tu sitio web con información clara y llamados a la acción",
      "Configura y optimiza tu ficha de Google My Business",
      "Establece presencia activa en las 2 redes sociales más relevantes",
      "Implementa un sistema básico de captura de leads",
      "Comienza a documentar testimonios y casos de éxito",
    ],
    intermediate: [
      "Implementa un CRM para gestionar leads y clientes eficientemente",
      "Desarrolla campañas de publicidad digital con objetivos claros",
      "Crea estrategia de email marketing con automatizaciones básicas",
      "Establece KPIs claros: CAC, conversiones, ROI por canal",
      "Desarrolla contenido estratégico que atraiga a tu cliente ideal",
    ],
    advanced: [
      "Implementa inteligencia artificial en tu estrategia de marketing",
      "Desarrolla estrategias de retención y upselling automatizadas",
      "Expande a nuevos canales o mercados de forma estratégica",
      "Optimiza continuamente basado en datos y A/B testing",
      "Considera desarrollar comunidad o programa de lealtad digital",
    ],
  },
};

// HTML escape utility to prevent XSS/injection in email content
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function generateEmailHtml(data: QuizResultRequest): string {
  const quizName = data.quizType === "personal_brand" ? "Marca Personal" : "PyME";
  const title = resultTitles[data.quizType][data.resultLevel];
  const description = resultDescriptions[data.quizType][data.resultLevel];
  const recs = recommendations[data.quizType][data.resultLevel];
  
  // Sanitize user-provided data
  const safeName = escapeHtml(data.name.split(" ")[0]);
  const safeCompanyName = data.companyName ? escapeHtml(data.companyName) : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Diagnóstico de ${quizName} - KiMedia</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0c; color: #fafafa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0c; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #141418; border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f45b32, #e91e8c); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">KiMedia</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Diagnóstico de ${quizName}</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 40px 30px 20px;">
              <h2 style="margin: 0; color: #fafafa; font-size: 24px;">¡Hola, ${safeName}!</h2>
              <p style="margin: 15px 0 0; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                Gracias por completar tu diagnóstico. Aquí están tus resultados personalizados.
              </p>
            </td>
          </tr>

          <!-- Score Card -->
          <tr>
            <td style="padding: 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1c1c21; border-radius: 12px; border: 1px solid #27272a;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <div style="display: inline-block; width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #f45b32, #e91e8c); line-height: 100px; font-size: 32px; font-weight: bold; color: #ffffff;">
                      ${data.percentage}%
                    </div>
                    <h3 style="margin: 20px 0 10px; color: #fafafa; font-size: 22px;">${title}</h3>
                    <p style="margin: 0; color: #a1a1aa; font-size: 14px;">
                      Puntuación: ${data.score} de ${data.maxScore} puntos
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Description -->
          <tr>
            <td style="padding: 20px 30px;">
              <p style="margin: 0; color: #d4d4d8; font-size: 16px; line-height: 1.6;">
                ${description}
              </p>
            </td>
          </tr>

          <!-- Recommendations -->
          <tr>
            <td style="padding: 20px 30px;">
              <h3 style="margin: 0 0 20px; color: #fafafa; font-size: 18px;">📋 Recomendaciones para ti</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${recs.map(rec => `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #27272a;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 24px; vertical-align: top; padding-top: 2px;">
                          <span style="color: #f45b32;">✓</span>
                        </td>
                        <td style="color: #d4d4d8; font-size: 14px; line-height: 1.5;">
                          ${rec}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `).join("")}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(244, 91, 50, 0.1), rgba(233, 30, 140, 0.1)); border: 1px solid rgba(244, 91, 50, 0.3); border-radius: 12px;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <h3 style="margin: 0 0 15px; color: #fafafa; font-size: 18px;">¿Listo para dar el siguiente paso?</h3>
                    <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 14px;">
                      Platiquemos sobre cómo podemos ayudarte a alcanzar tus objetivos.
                    </p>
                    <a href="https://wa.me/525512345678?text=${encodeURIComponent(`Hola, acabo de hacer el diagnóstico de ${quizName} y me gustaría saber más sobre cómo pueden ayudarme.`)}" 
                       style="display: inline-block; background: linear-gradient(135deg, #f45b32, #e91e8c); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      💬 Contactar por WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                © 2024 KiMedia. Todos los derechos reservados.
              </p>
              <p style="margin: 10px 0 0; color: #71717a; font-size: 12px;">
                <a href="https://kimedia.mx" style="color: #f45b32; text-decoration: none;">kimedia.mx</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: QuizResultRequest = await req.json();

    // Validate required fields
    if (!data.email || !data.name || !data.quizType || !data.resultLevel) {
      throw new Error("Missing required fields");
    }

    const quizName = data.quizType === "personal_brand" ? "Marca Personal" : "PyME";

    const emailResponse = await resend.emails.send({
      from: "KiMedia <diagnostico@kimedia.mx>",
      to: [data.email],
      subject: `Tu Diagnóstico de ${quizName} - KiMedia`,
      html: generateEmailHtml(data),
    });

    console.log("Quiz results email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-quiz-results function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
