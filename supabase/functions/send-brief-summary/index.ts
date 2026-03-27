import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BriefRequest {
  profileId: string;
  kitType: "marca-personal" | "pyme";
  recipientEmail: string;
  recipientName: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileId, kitType, recipientEmail, recipientName } = await req.json() as BriefRequest;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch profile data
    const { data: profile, error } = await supabase
      .from("brand_kit_profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (error || !profile) {
      throw new Error("Profile not found");
    }

    const isPyme = kitType === "pyme";
    const kitLabel = isPyme ? "MiPyME" : "Marca Personal";

    // Build summary sections
    const diagnosticSection = profile.diagnostic_score != null ? `
      <tr><td style="padding:16px 24px;background:#f8f9fa;border-radius:12px;margin-bottom:12px">
        <p style="margin:0 0 4px;font-size:13px;color:#888">Diagnóstico digital</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#1a1a2e">${profile.diagnostic_score}/100 — ${profile.diagnostic_level || "Sin nivel"}</p>
        ${profile.goal_90_days ? `<p style="margin:8px 0 0;font-size:13px;color:#555">Meta a 90 días: ${profile.goal_90_days}</p>` : ""}
      </td></tr>
      <tr><td style="height:12px"></td></tr>
    ` : "";

    const competitiveSection = isPyme && profile.competitors ? `
      <tr><td style="padding:16px 24px;background:#f8f9fa;border-radius:12px;margin-bottom:12px">
        <p style="margin:0 0 4px;font-size:13px;color:#888">Análisis competitivo</p>
        <p style="margin:0;font-size:14px;color:#333">${profile.competitors}</p>
        ${profile.market_position ? `<p style="margin:8px 0 0;font-size:13px;color:#555">Posición: ${profile.market_position}</p>` : ""}
      </td></tr>
      <tr><td style="height:12px"></td></tr>
    ` : "";

    const identitySection = profile.value_proposition ? `
      <tr><td style="padding:16px 24px;background:#f8f9fa;border-radius:12px;margin-bottom:12px">
        <p style="margin:0 0 8px;font-size:13px;color:#888">Identidad de marca</p>
        <p style="margin:0 0 6px;font-size:14px;color:#333"><strong>Propuesta de valor:</strong> ${profile.value_proposition}</p>
        <p style="margin:0 0 6px;font-size:14px;color:#333"><strong>Audiencia objetivo:</strong> ${profile.target_audience || "—"}</p>
        <p style="margin:0 0 6px;font-size:14px;color:#333"><strong>Diferenciador:</strong> ${profile.differentiator || "—"}</p>
        <p style="margin:0;font-size:14px;color:#333"><strong>Tono de marca:</strong> ${profile.brand_tone || "—"}</p>
      </td></tr>
      <tr><td style="height:12px"></td></tr>
    ` : "";

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 20px">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
            <tr><td style="background:linear-gradient(135deg,#FF6B6B,#FF8E53);padding:32px 24px;text-align:center">
              <h1 style="margin:0;color:#fff;font-size:24px">Tu Brief de ${kitLabel}</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px">Resumen de tu diagnóstico estratégico</p>
            </td></tr>
            <tr><td style="padding:24px">
              <p style="margin:0 0 20px;font-size:16px;color:#333">Hola <strong>${recipientName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.6">
                Gracias por completar tu brief con KiMedia. Aquí tienes un resumen de la información que capturamos:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${diagnosticSection}
                ${competitiveSection}
                ${identitySection}
              </table>
              <p style="margin:24px 0 0;font-size:14px;color:#555;line-height:1.6">
                Nuestro equipo revisará tu brief y te contactará pronto con recomendaciones personalizadas.
              </p>
            </td></tr>
            <tr><td style="padding:0 24px 24px;text-align:center">
              <p style="margin:0;font-size:12px;color:#999">© ${new Date().getFullYear()} KiMedia · kimedia.mx</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;

    // Send to recipient
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "KiMedia <brief@kimedia.mx>",
        to: [recipientEmail],
        subject: `Tu Brief de ${kitLabel} - KiMedia`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const err = await resendResponse.text();
      console.error("Resend error:", err);
    }

    // Also notify KiMedia team
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "KiMedia Briefs <brief@kimedia.mx>",
        to: ["hola@kimedia.mx"],
        subject: `Nuevo Brief ${kitLabel}: ${recipientName}`,
        html: emailHtml.replace(
          `Hola <strong>${recipientName}</strong>,`,
          `Nuevo brief recibido de <strong>${recipientName}</strong> (${recipientEmail}):`
        ),
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
