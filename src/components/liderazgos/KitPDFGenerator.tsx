import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import kimediaLogo from "@/assets/kimedia-logo.png";

interface KitPDFGeneratorProps {
  participantId: string;
}

export function KitPDFGenerator({ participantId }: KitPDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // Fetch participant data
      const { data: p } = await supabase
        .from("participants")
        .select("*")
        .eq("id", participantId)
        .single();

      if (!p) throw new Error("No se encontraron datos");

      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default;

      const spokeGuide = p.spokesperson_guide as any;

      // Build the PDF HTML
      const wrapper = document.createElement("div");
      wrapper.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1;";
      document.body.appendChild(wrapper);

      const container = document.createElement("div");
      container.style.cssText = "width:800px;font-family:'Inter','Space Grotesk',system-ui,sans-serif;color:#fff;";

      // --- PAGE 1: Cover + Diagnostic + Message ---
      container.innerHTML += buildPage(`
        <!-- Header with logo -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;padding-bottom:16px;border-bottom:2px solid rgba(255,107,74,0.3)">
          <img src="${kimediaLogo}" style="height:24px;opacity:0.8" crossorigin="anonymous" />
          <span style="font-size:11px;text-transform:uppercase;letter-spacing:3px;color:rgba(255,255,255,0.4);font-weight:700">Kit de Liderazgo Digital</span>
        </div>

        <!-- Name & Avatar -->
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px">
          <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#FF6B4A,#E91E84);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff;flex-shrink:0">
            ${p.full_name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <div style="font-size:28px;font-weight:800;margin-bottom:4px">${p.full_name}</div>
            <div style="font-size:14px;color:#aaa">📍 ${p.state} · ${p.role_title}</div>
            <div style="font-size:13px;color:#888;margin-top:2px">@${p.social_handle}</div>
          </div>
        </div>

        ${p.diagnostic_score !== null ? `
        <!-- Diagnostic -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;margin-bottom:20px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span style="font-size:16px">🛡️</span>
            <span style="font-size:16px;font-weight:700">Diagnóstico de Visibilidad Digital</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
            <span style="width:14px;height:14px;border-radius:50%;background:${p.diagnostic_level === 'rojo' ? '#ef4444' : p.diagnostic_level === 'amarillo' ? '#eab308' : '#22c55e'};display:inline-block"></span>
            <span style="font-size:18px;font-weight:600;text-transform:capitalize">${p.diagnostic_level}</span>
            <span style="font-size:13px;color:#888">· Score: ${p.diagnostic_score}/12</span>
          </div>
          <div style="font-size:13px;color:#aaa;line-height:1.6">
            ${p.diagnostic_level === 'rojo' ? 'Tu presencia digital requiere atención urgente. Las mujeres que te buscan no te encuentran.' : p.diagnostic_level === 'amarillo' ? 'Tienes presencia pero necesitas optimizarla para maximizar tu alcance de servicio.' : '¡Excelente! Tu presencia digital es sólida. Mantén la constancia.'}
          </div>
        </div>
        ` : ''}

        ${p.political_message ? `
        <!-- Political Message -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;margin-bottom:20px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span style="font-size:16px">❤️</span>
            <span style="font-size:16px;font-weight:700">Tu Mensaje Político Personal</span>
          </div>
          <p style="font-size:15px;line-height:1.7;color:#ddd;margin:0">${p.political_message}</p>
          ${p.cause ? `<div style="margin-top:12px;font-size:12px;color:#FF6B4A;font-weight:600">Causa: ${p.cause}${p.cause_custom ? ` — ${p.cause_custom}` : ''}</div>` : ''}
        </div>
        ` : ''}

        ${p.institutional_card ? `
        <!-- Institutional Card -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;margin-bottom:20px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span style="font-size:16px">🏛️</span>
            <span style="font-size:16px;font-weight:700">Ficha Institucional</span>
          </div>
          <p style="font-size:14px;line-height:1.7;color:#ddd;margin:0 0 8px">${p.institutional_card}</p>
          ${p.organization ? `<div style="font-size:12px;color:#888">${p.institutional_role || ''} · ${p.organization} · Nivel ${p.responsibility_level || ''}</div>` : ''}
        </div>
        ` : ''}
      `);

      // --- PAGE 2: Spokesperson Guide + Bios ---
      let page2Content = '';

      if (spokeGuide) {
        page2Content += `
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;margin-bottom:20px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
            <span style="font-size:16px">🎤</span>
            <span style="font-size:16px;font-weight:700">Guía de Vocería</span>
          </div>
          
          <div style="margin-bottom:16px">
            <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">Frase eje</div>
            <div style="font-size:16px;font-weight:600;font-style:italic;color:#FF6B4A;line-height:1.5">"${spokeGuide.phrase || p.spokesperson_phrase || ''}"</div>
          </div>

          ${spokeGuide.keywords?.length ? `
          <div style="margin-bottom:16px">
            <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Palabras clave</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              ${spokeGuide.keywords.map((k: string) => `<span style="font-size:12px;background:rgba(255,107,74,0.15);color:#FF6B4A;padding:4px 12px;border-radius:20px;font-weight:600">${k}</span>`).join('')}
            </div>
          </div>
          ` : ''}

          ${spokeGuide.narratives?.length ? `
          <div style="margin-bottom:16px">
            <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Enfoques narrativos</div>
            ${spokeGuide.narratives.map((n: string) => `<div style="font-size:13px;color:#ddd;line-height:1.6;margin-bottom:4px">• ${n}</div>`).join('')}
          </div>
          ` : ''}

          ${spokeGuide.consistency?.length ? `
          <div>
            <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Reglas de consistencia</div>
            ${spokeGuide.consistency.map((c: string) => `<div style="font-size:13px;color:#ddd;line-height:1.6;margin-bottom:4px">• ${c}</div>`).join('')}
          </div>
          ` : ''}
        </div>
        `;
      }

      // Bios
      const bios = [
        { label: "Bio Personal", text: p.bio_text },
        { label: "Bio Institucional", text: p.bio_institutional },
        { label: "Bio Híbrida", text: p.bio_hybrid },
      ].filter(b => b.text);

      if (bios.length > 0) {
        page2Content += `
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;margin-bottom:20px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
            <span style="font-size:16px">📝</span>
            <span style="font-size:16px;font-weight:700">Tus Bios Generadas</span>
          </div>
          ${bios.map(b => `
            <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06)">
              <div style="font-size:11px;color:#FF6B4A;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">${b.label}</div>
              <div style="font-size:14px;color:#ddd;line-height:1.7;white-space:pre-wrap">${b.text}</div>
            </div>
          `).join('')}
        </div>
        `;
      }

      if (page2Content) {
        container.innerHTML += buildPage(`
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid rgba(255,107,74,0.3)">
            <img src="${kimediaLogo}" style="height:20px;opacity:0.6" crossorigin="anonymous" />
            <span style="font-size:14px;font-weight:700;color:#ccc">${p.full_name}</span>
          </div>
          ${page2Content}
        `);
      }

      // --- PAGE 3: Posts ---
      const posts = [
        { label: "Post Personal", type: p.post_type, text: p.post_text },
        { label: "Post Institucional", type: p.institutional_post_type, text: p.institutional_post_text },
      ].filter(po => po.text);

      if (posts.length > 0) {
        let page3Content = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid rgba(255,107,74,0.3)">
            <img src="${kimediaLogo}" style="height:20px;opacity:0.6" crossorigin="anonymous" />
            <span style="font-size:14px;font-weight:700;color:#ccc">${p.full_name}</span>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;margin-bottom:20px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
              <span style="font-size:16px">📲</span>
              <span style="font-size:16px;font-weight:700">Tus Posts Listos para Publicar</span>
            </div>
            ${posts.map(po => `
              <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06)">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                  <span style="font-size:11px;color:#FF6B4A;font-weight:700;text-transform:uppercase;letter-spacing:2px">${po.label}</span>
                  ${po.type ? `<span style="font-size:11px;color:#888;border:1px solid rgba(255,255,255,0.1);padding:2px 8px;border-radius:10px">${po.type}</span>` : ''}
                </div>
                <div style="font-size:14px;color:#ddd;line-height:1.7;white-space:pre-wrap">${po.text}</div>
              </div>
            `).join('')}
          </div>
        `;

        // Footer/CTA
        page3Content += `
          <div style="background:linear-gradient(135deg,#FF6B4A,#E91E84);border-radius:16px;padding:28px;text-align:center;margin-top:auto">
            <div style="font-size:20px;font-weight:800;margin-bottom:8px">¡Tu liderazgo ya es visible!</div>
            <div style="font-size:14px;opacity:0.85;line-height:1.6">Usa este kit como tu guía de referencia. Publica con consistencia y propósito.</div>
          </div>

          <div style="margin-top:20px;text-align:center;font-size:11px;color:#555;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06)">
            Generado por KiMedia · Taller de Presencia Digital y Liderazgo Femenino · ${new Date().toLocaleDateString("es-MX")}
          </div>
        `;

        container.innerHTML += buildPage(page3Content);
      }

      wrapper.appendChild(container);

      // Wait for images
      const images = container.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) => new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
        )
      );
      await new Promise((r) => setTimeout(r, 500));

      const fileName = `Kit-Liderazgo-${p.full_name.replace(/\s+/g, "-")}.pdf`;

      await html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: {
            scale: 2,
            backgroundColor: "#0a0a0f",
            useCORS: true,
            logging: false,
            width: 800,
            windowWidth: 800,
          },
          jsPDF: {
            unit: "px",
            format: [800, 1130],
            orientation: "portrait" as const,
          },
        } as any)
        .from(container)
        .save();

      document.body.removeChild(wrapper);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      variant="outline"
      className="w-full border-border text-muted-foreground hover:text-foreground py-6"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Generando PDF...
        </>
      ) : (
        <>
          <Download className="w-5 h-5 mr-2" />
          Descargar mi kit en PDF
        </>
      )}
    </Button>
  );
}

function buildPage(content: string): string {
  return `<div style="width:800px;min-height:1130px;background:#0a0a0f;color:#fff;padding:48px;box-sizing:border-box;font-family:'Inter','Space Grotesk',system-ui,sans-serif;display:flex;flex-direction:column;page-break-after:always;page-break-inside:avoid">${content}</div>`;
}
