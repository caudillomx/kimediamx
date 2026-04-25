import { forwardRef } from "react";
import logoUrl from "@/assets/kimedia-logo.png";

// Standalone, print-optimized layout for the PAN Yucatán proposal.
// Designed for html2pdf.js (A4, served as plain HTML — no Tailwind variables).

export interface PdfMoment {
  n: string;
  title: string;
  time: string;
  desc: string;
  tools: string[];
  deliverable: string;
}

interface Props {
  moments: PdfMoment[];
  includes: string[];
}

export const PropuestaPdfTemplate = forwardRef<HTMLDivElement, Props>(({ moments, includes }, ref) => {
  // A4 at 96dpi = 794 x 1123 px
  // Reserve 70px top header + 50px bottom footer = 880px usable content height
  const PAGE_W = 794;
  const PAGE_H = 1123;
  const HEADER_H = 70;
  const FOOTER_H = 50;
  const SIDE_PAD = 56;
  const CONTENT_H = PAGE_H - HEADER_H - FOOTER_H; // 1003px

  const styles = {
    root: {
      width: `${PAGE_W}px`,
      background: "#0B0F1A",
      color: "#F5F5F7",
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      lineHeight: 1.5,
      fontSize: "12px",
    } as const,
    page: {
      width: `${PAGE_W}px`,
      height: `${PAGE_H}px`,
      position: "relative" as const,
      pageBreakAfter: "always" as const,
      breakAfter: "page" as const,
      background: "#0B0F1A",
      overflow: "hidden" as const,
    },
    pageLast: {
      width: `${PAGE_W}px`,
      height: `${PAGE_H}px`,
      position: "relative" as const,
      background: "#0B0F1A",
      overflow: "hidden" as const,
    },
    header: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      height: `${HEADER_H}px`,
      padding: `0 ${SIDE_PAD}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    },
    footer: {
      position: "absolute" as const,
      bottom: 0,
      left: 0,
      right: 0,
      height: `${FOOTER_H}px`,
      padding: `0 ${SIDE_PAD}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      fontSize: "9px",
      color: "#7c8493",
      letterSpacing: "0.5px",
    },
    content: {
      position: "absolute" as const,
      top: `${HEADER_H}px`,
      left: 0,
      right: 0,
      height: `${CONTENT_H}px`,
      padding: `28px ${SIDE_PAD}px`,
      boxSizing: "border-box" as const,
      display: "flex",
      flexDirection: "column" as const,
    },
    eyebrow: {
      fontSize: "9px",
      fontWeight: 700,
      letterSpacing: "1.8px",
      textTransform: "uppercase" as const,
      color: "#FF6B5B",
      marginBottom: "8px",
    },
    h1: {
      fontSize: "32px",
      fontWeight: 800,
      lineHeight: 1.05,
      margin: "0 0 16px",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "22px",
      fontWeight: 700,
      letterSpacing: "-0.01em",
      margin: "0 0 12px",
    },
    h3: {
      fontSize: "14px",
      fontWeight: 700,
      margin: "0 0 6px",
    },
    muted: { color: "#9aa0aa" },
    accent: { color: "#FF6B5B" },
    electric: { color: "#4FD1FF" },
    divider: {
      borderTop: "1px solid rgba(255,255,255,0.12)",
      margin: "20px 0",
    },
    badge: {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "999px",
      border: "1px solid rgba(255,107,91,0.4)",
      background: "rgba(255,107,91,0.1)",
      color: "#FF6B5B",
      fontSize: "9px",
      fontWeight: 700,
      letterSpacing: "1.5px",
      textTransform: "uppercase" as const,
    },
    card: {
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      padding: "14px",
      background: "rgba(255,255,255,0.03)",
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
    },
    grid3: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "10px",
    },
  };

  const PageChrome = ({
    page,
    total,
    children,
    isLast,
  }: {
    page: number;
    total: number;
    children: React.ReactNode;
    isLast?: boolean;
  }) => (
    <section style={isLast ? styles.pageLast : styles.page}>
      <header style={styles.header}>
        <img
          src={logoUrl}
          alt="KiMedia"
          crossOrigin="anonymous"
          style={{ height: "26px", width: "auto", display: "block" }}
        />
        <div
          style={{
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#4FD1FF",
          }}
        >
          Propuesta Confidencial · PAN Yucatán
        </div>
      </header>
      <div style={styles.content}>{children}</div>
      <footer style={styles.footer}>
        <span>KiMedia · hola@kimedia.mx · kimedia.mx</span>
        <span>
          Página {page} de {total}
        </span>
      </footer>
    </section>
  );

  const TOTAL = 4;

  return (
    <div ref={ref} style={styles.root}>
      {/* PAGE 1 — COVER */}
      <PageChrome page={1} total={TOTAL}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ ...styles.eyebrow, color: "#4FD1FF", marginBottom: "12px" }}>
              Propuesta de Taller · Mayo 2026
            </div>
            <h1 style={{ ...styles.h1, fontSize: "44px" }}>
              Comunicación Política
              <br />
              <span style={styles.accent}>e Inteligencia Artificial</span>
              <br />
              <span style={{ color: "#cfd2d8", fontSize: "32px" }}>Vol. 1</span>
            </h1>
            <p style={{ fontSize: "14px", color: "#cfd2d8", maxWidth: "560px", margin: "16px 0 28px" }}>
              Curso intensivo de 2 horas para futuros candidatos, futuras candidatas y sus equipos de
              campaña. Herramientas de IA aplicadas a comunicación política, vocería y producción de
              contenido.
            </p>

            <div style={{ ...styles.card, marginBottom: "20px", padding: "18px" }}>
              <div style={{ ...styles.eyebrow, marginBottom: "6px" }}>Presentado a</div>
              <div style={{ fontSize: "22px", fontWeight: 700 }}>Pilar Santos</div>
              <div style={{ fontSize: "12px", color: "#9aa0aa", marginTop: "2px" }}>
                Secretaria de Mujeres · PAN Yucatán
              </div>
            </div>

            <div style={styles.grid3}>
              <Tile label="Fecha" value="Vie 29 may 2026" />
              <Tile label="Horario" value="18:00 hrs" />
              <Tile label="Sede" value="Motul, Yucatán" />
              <Tile label="Duración" value="2 horas" />
              <Tile label="Asistentes" value="≈ 150 personas" />
              <Tile label="Modalidad" value="Presencial · interactiva" />
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: "20px" }}>
            <div style={{ ...styles.divider, margin: "0 0 16px" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "11px",
                color: "#9aa0aa",
              }}
            >
              <span>Documento estratégico de uso exclusivo</span>
              <span style={styles.badge}>Confidencial</span>
            </div>
          </div>
        </div>
      </PageChrome>

      {/* PAGE 2 — PROGRAMA */}
      <PageChrome page={2} total={TOTAL}>
        <div style={styles.eyebrow}>Programa</div>
        <h2 style={styles.h2}>Estructura del taller</h2>
        <p style={{ ...styles.muted, marginBottom: "16px", fontSize: "12px" }}>
          Cuatro módulos prácticos · 100% aplicado · cada asistente se lleva una pieza real.
        </p>

        <div style={{ display: "grid", gap: "10px" }}>
          {moments.map((m) => (
            <div key={m.n} style={styles.card}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <span style={{ fontSize: "22px", fontWeight: 800, color: "#FF6B5B", lineHeight: 1 }}>
                    {m.n}
                  </span>
                  <h3 style={styles.h3}>{m.title}</h3>
                </div>
                <span style={styles.badge}>{m.time}</span>
              </div>
              <p style={{ fontSize: "11px", color: "#cfd2d8", margin: "4px 0 8px", lineHeight: 1.5 }}>
                {m.desc}
              </p>
              <div style={styles.grid2}>
                <MiniBlock label="Herramientas de IA" value={m.tools.join(" · ")} accent="#4FD1FF" />
                <MiniBlock label="Cada asistente se lleva" value={m.deliverable} accent="#FF6B5B" />
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...styles.card, marginTop: "12px", borderColor: "rgba(79,209,255,0.3)", padding: "10px 14px" }}>
          <strong style={{ color: "#fff" }}>Cierre · 10 min</strong>
          <span style={{ color: "#cfd2d8", marginLeft: "6px", fontSize: "11px" }}>
            Síntesis colectiva, plan de acción individual y entrega de credenciales al tablero digital.
          </span>
        </div>
      </PageChrome>

      {/* PAGE 3 — STACK + QUIÉNES SOMOS */}
      <PageChrome page={3} total={TOTAL}>
        <div style={styles.eyebrow}>Stack del taller</div>
        <h2 style={styles.h2}>Herramientas de IA que enseñamos</h2>
        <p style={{ ...styles.muted, marginBottom: "14px", fontSize: "12px" }}>
          Comerciales, accesibles y demostradas en vivo durante el taller.
        </p>

        <div style={{ ...styles.grid2, marginBottom: "20px" }}>
          {AI_TOOLS.map((t) => (
            <div key={t.name} style={{ ...styles.card, padding: "12px 14px" }}>
              <div style={{ ...styles.eyebrow, color: "#4FD1FF", marginBottom: "4px" }}>
                {t.category}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "3px" }}>{t.name}</div>
              <div style={{ fontSize: "10.5px", color: "#cfd2d8", lineHeight: 1.45 }}>{t.use}</div>
            </div>
          ))}
        </div>

        <div style={styles.divider} />

        <div style={styles.eyebrow}>Quiénes somos</div>
        <h2 style={styles.h2}>KiMedia</h2>
        <p style={{ fontSize: "12px", color: "#cfd2d8", marginBottom: "12px", lineHeight: 1.6 }}>
          Casa de comunicación estratégica que combina narrativa editorial, inteligencia artificial y
          producción de contenido para liderazgos políticos, marcas e instituciones.
        </p>

        <div style={{ ...styles.grid2, marginBottom: "12px" }}>
          {EXPERTISE.map((e) => (
            <div
              key={e}
              style={{
                fontSize: "11px",
                padding: "6px 12px",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "999px",
                color: "#cfd2d8",
                textAlign: "center",
              }}
            >
              {e}
            </div>
          ))}
        </div>

        <div style={{ ...styles.card, borderColor: "rgba(79,209,255,0.3)" }}>
          <div style={{ ...styles.eyebrow, color: "#4FD1FF", marginBottom: "4px" }}>Antecedentes</div>
          <p style={{ fontSize: "11px", color: "#cfd2d8", margin: 0, lineHeight: 1.55 }}>
            La edición más reciente se llevó a cabo en{" "}
            <strong style={{ color: "#fff" }}>Tequila, Jalisco el 18 de febrero de 2026</strong>, con
            resultados de alta satisfacción y aplicación inmediata por parte de las y los asistentes.
          </p>
        </div>
      </PageChrome>

      {/* PAGE 4 — INVERSIÓN + FIRMA */}
      <PageChrome page={4} total={TOTAL} isLast>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div>
            <div style={styles.eyebrow}>Propuesta económica</div>
            <h2 style={styles.h2}>Inversión</h2>

            <div
              style={{
                ...styles.card,
                background: "linear-gradient(135deg, rgba(255,107,91,0.14), rgba(79,209,255,0.06))",
                borderColor: "rgba(255,107,91,0.35)",
                padding: "22px 24px",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "14px" }}>
                <span style={{ fontSize: "44px", fontWeight: 800, color: "#FF6B5B", lineHeight: 1 }}>
                  $50,000
                </span>
                <span style={{ fontSize: "13px", color: "#9aa0aa", fontWeight: 600 }}>MXN + IVA</span>
              </div>
              <div style={{ ...styles.eyebrow, marginBottom: "8px" }}>Incluye</div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {includes.map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      padding: "7px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      fontSize: "11.5px",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: "#FF6B5B", fontWeight: 700 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ ...styles.grid2, marginBottom: "16px" }}>
              <div style={{ ...styles.card, padding: "12px 14px" }}>
                <div style={{ ...styles.eyebrow, marginBottom: "4px" }}>Forma de pago</div>
                <div style={{ fontSize: "11.5px", color: "#cfd2d8", lineHeight: 1.55 }}>
                  50% al confirmar · 50% al cierre del taller. Transferencia electrónica con factura.
                </div>
              </div>
              <div style={{ ...styles.card, padding: "12px 14px", borderColor: "rgba(79,209,255,0.3)" }}>
                <div style={{ ...styles.eyebrow, color: "#4FD1FF", marginBottom: "4px" }}>Vigencia</div>
                <div style={{ fontSize: "11.5px", color: "#cfd2d8", lineHeight: 1.55 }}>
                  10 días naturales a partir de su recepción.
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "auto" }}>
            <div
              style={{
                ...styles.card,
                background: "rgba(79,209,255,0.05)",
                borderColor: "rgba(79,209,255,0.25)",
                padding: "16px 20px",
                marginBottom: "16px",
              }}
            >
              <div style={{ ...styles.eyebrow, color: "#4FD1FF", marginBottom: "6px" }}>
                Próximo paso
              </div>
              <p style={{ fontSize: "12px", color: "#fff", margin: 0, lineHeight: 1.55 }}>
                Al confirmar esta propuesta agendamos una llamada de 30 minutos para precisar logística
                local en Motul y personalizar los ejercicios prácticos del taller.
              </p>
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.12)",
                paddingTop: "16px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>Jesús Caudillo</div>
                <div style={{ fontSize: "11px", color: "#9aa0aa", marginTop: "2px" }}>
                  Director Ejecutivo · KiMedia
                </div>
                <div style={{ fontSize: "11px", color: "#9aa0aa", marginTop: "3px" }}>
                  hola@kimedia.mx · kimedia.mx
                </div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase" as const,
                    color: "#9aa0aa",
                    marginBottom: "2px",
                  }}
                >
                  Fecha de propuesta
                </div>
                <div style={{ fontSize: "12px", color: "#fff", fontWeight: 600 }}>Abril 2026</div>
              </div>
            </div>
          </div>
        </div>
      </PageChrome>
    </div>
  );
});

PropuestaPdfTemplate.displayName = "PropuestaPdfTemplate";

const Tile = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "10px",
      padding: "12px",
      background: "rgba(255,255,255,0.03)",
    }}
  >
    <div
      style={{
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1.4px",
        textTransform: "uppercase",
        color: "#9aa0aa",
        marginBottom: "4px",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{value}</div>
  </div>
);

const MiniBlock = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div
    style={{
      border: `1px solid ${accent}40`,
      borderRadius: "8px",
      padding: "10px",
      background: `${accent}10`,
    }}
  >
    <div
      style={{
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "1.4px",
        textTransform: "uppercase",
        color: accent,
        marginBottom: "4px",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: "11px", color: "#fff", lineHeight: 1.45 }}>{value}</div>
  </div>
);

const AI_TOOLS = [
  { category: "Texto", name: "ChatGPT · Claude", use: "Discursos, posts y respuestas a entrevistas en segundos." },
  { category: "Imagen", name: "Midjourney · Nano Banana", use: "Imágenes de campaña y mockups visuales." },
  { category: "Video", name: "Runway · Kling", use: "Spots cortos y reels con identidad propia." },
  { category: "Voz", name: "ElevenLabs", use: "Voz clonada para audio-mensajes y locuciones." },
  { category: "Investigación", name: "Perplexity · Wizr", use: "Opinión pública y monitoreo del adversario." },
  { category: "Análisis", name: "Notebook LM", use: "Resúmenes accionables de minutas y plataformas." },
];

const EXPERTISE = [
  "Estrategia política",
  "IA aplicada",
  "Vocería digital",
  "Contenido editorial",
  "Producción visual",
  "Análisis de datos",
];