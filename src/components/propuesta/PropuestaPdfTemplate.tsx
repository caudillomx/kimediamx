import { forwardRef } from "react";

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
  const styles = {
    root: {
      width: "794px", // ~A4 at 96dpi
      padding: "56px 56px",
      background: "#0B0F1A",
      color: "#F5F5F7",
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      lineHeight: 1.5,
      fontSize: "12px",
    } as const,
    page: {
      pageBreakAfter: "always" as const,
      breakAfter: "page" as const,
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
      fontSize: "34px",
      fontWeight: 800,
      lineHeight: 1.05,
      margin: "0 0 16px",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "20px",
      fontWeight: 700,
      letterSpacing: "-0.01em",
      margin: "0 0 14px",
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
      margin: "28px 0",
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
      padding: "16px",
      background: "rgba(255,255,255,0.03)",
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
    },
    grid3: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "12px",
    },
  };

  return (
    <div ref={ref} style={styles.root}>
      {/* PAGE 1 — COVER */}
      <section style={styles.page}>
        <div style={{ ...styles.eyebrow, color: "#4FD1FF" }}>
          KiMedia · Propuesta Confidencial
        </div>
        <h1 style={styles.h1}>
          Comunicación Política
          <br />
          <span style={styles.accent}>e Inteligencia Artificial</span> Vol. 1
        </h1>
        <p style={{ fontSize: "14px", color: "#cfd2d8", maxWidth: "560px", margin: "16px 0 32px" }}>
          Curso intensivo de 2 horas para futuros candidatos, futuras candidatas y sus equipos de campaña.
          Herramientas de IA aplicadas a comunicación política, vocería y producción de contenido.
        </p>

        <div style={{ ...styles.card, marginBottom: "24px" }}>
          <div style={{ ...styles.eyebrow, marginBottom: "6px" }}>Presentado a</div>
          <div style={{ fontSize: "22px", fontWeight: 700 }}>Pilar Santos</div>
          <div style={{ fontSize: "12px", color: "#9aa0aa", marginTop: "2px" }}>
            Secretaria de Mujeres · PAN Yucatán
          </div>
        </div>

        <div style={{ ...styles.grid3, marginBottom: "20px" }}>
          <Tile label="Fecha" value="Vie 29 may 2026" />
          <Tile label="Horario" value="18:00 hrs" />
          <Tile label="Sede" value="Motul, Yucatán" />
          <Tile label="Duración" value="2 horas" />
          <Tile label="Asistentes" value="≈ 150 personas" />
          <Tile label="Modalidad" value="Presencial · interactiva" />
        </div>

        <div style={{ ...styles.divider }} />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9aa0aa" }}>
          <span>kimedia.mx · hola@kimedia.mx</span>
          <span style={styles.badge}>Confidencial</span>
        </div>
      </section>

      {/* PAGE 2 — PROGRAMA */}
      <section style={styles.page}>
        <div style={styles.eyebrow}>Programa</div>
        <h2 style={styles.h2}>Estructura del taller</h2>
        <p style={{ ...styles.muted, marginBottom: "20px", fontSize: "12px" }}>
          Cuatro módulos prácticos · 100% aplicado · cada asistente se lleva una pieza real.
        </p>

        <div style={{ display: "grid", gap: "12px" }}>
          {moments.map((m) => (
            <div key={m.n} style={styles.card}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <span style={{ fontSize: "26px", fontWeight: 800, color: "#FF6B5B", lineHeight: 1 }}>
                    {m.n}
                  </span>
                  <h3 style={styles.h3}>{m.title}</h3>
                </div>
                <span style={styles.badge}>{m.time}</span>
              </div>
              <p style={{ fontSize: "11.5px", color: "#cfd2d8", margin: "6px 0 10px", lineHeight: 1.55 }}>
                {m.desc}
              </p>
              <div style={styles.grid2}>
                <MiniBlock label="Herramientas de IA" value={m.tools.join(" · ")} accent="#4FD1FF" />
                <MiniBlock label="Cada asistente se lleva" value={m.deliverable} accent="#FF6B5B" />
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...styles.card, marginTop: "16px", borderColor: "rgba(79,209,255,0.3)" }}>
          <strong style={{ color: "#fff" }}>Cierre · 10 min</strong>
          <span style={{ color: "#cfd2d8", marginLeft: "6px" }}>
            Síntesis colectiva, plan de acción individual y entrega de credenciales al tablero digital.
          </span>
        </div>
      </section>

      {/* PAGE 3 — STACK + KIMEDIA */}
      <section style={styles.page}>
        <div style={styles.eyebrow}>Stack del taller</div>
        <h2 style={styles.h2}>Herramientas de IA que enseñamos</h2>
        <p style={{ ...styles.muted, marginBottom: "16px", fontSize: "12px" }}>
          Comerciales, accesibles y demostradas en vivo durante el taller.
        </p>

        <div style={{ ...styles.grid2, marginBottom: "28px" }}>
          {AI_TOOLS.map((t) => (
            <div key={t.name} style={styles.card}>
              <div style={{ ...styles.eyebrow, color: "#4FD1FF", marginBottom: "4px" }}>
                {t.category}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>{t.name}</div>
              <div style={{ fontSize: "11px", color: "#cfd2d8", lineHeight: 1.5 }}>{t.use}</div>
            </div>
          ))}
        </div>

        <div style={styles.eyebrow}>Quiénes somos</div>
        <h2 style={styles.h2}>KiMedia</h2>
        <p style={{ fontSize: "12px", color: "#cfd2d8", marginBottom: "12px", lineHeight: 1.6 }}>
          Casa de comunicación estratégica que combina narrativa editorial, inteligencia artificial y
          producción de contenido para liderazgos políticos, marcas e instituciones.
        </p>
        <div style={{ ...styles.card, borderColor: "rgba(79,209,255,0.3)" }}>
          <div style={{ ...styles.eyebrow, color: "#4FD1FF", marginBottom: "4px" }}>Antecedentes</div>
          <p style={{ fontSize: "11.5px", color: "#cfd2d8", margin: 0, lineHeight: 1.55 }}>
            La edición más reciente se llevó a cabo en{" "}
            <strong style={{ color: "#fff" }}>Tequila, Jalisco el 18 de febrero de 2026</strong>, con
            resultados de alta satisfacción y aplicación inmediata por parte de las y los asistentes.
          </p>
        </div>
      </section>

      {/* PAGE 4 — INVERSIÓN */}
      <section>
        <div style={styles.eyebrow}>Propuesta económica</div>
        <h2 style={styles.h2}>Inversión</h2>

        <div
          style={{
            ...styles.card,
            background: "linear-gradient(135deg, rgba(255,107,91,0.12), rgba(79,209,255,0.06))",
            borderColor: "rgba(255,107,91,0.35)",
            padding: "24px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "44px", fontWeight: 800, color: "#FF6B5B", lineHeight: 1 }}>
              $50,000
            </span>
            <span style={{ fontSize: "13px", color: "#9aa0aa", fontWeight: 600 }}>MXN + IVA</span>
          </div>
          <div style={{ ...styles.eyebrow, marginBottom: "10px" }}>Incluye</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {includes.map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  padding: "8px 0",
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

        <div style={{ ...styles.card, marginBottom: "32px" }}>
          <strong style={{ color: "#fff" }}>Vigencia:</strong>
          <span style={{ color: "#cfd2d8", marginLeft: "6px" }}>
            10 días naturales a partir de su recepción.
          </span>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "20px" }}>
          <div style={{ fontSize: "16px", fontWeight: 700 }}>Jesús Caudillo</div>
          <div style={{ fontSize: "11px", color: "#9aa0aa", marginTop: "2px" }}>
            Director Ejecutivo · KiMedia
          </div>
          <div style={{ fontSize: "11px", color: "#9aa0aa", marginTop: "4px" }}>
            hola@kimedia.mx · kimedia.mx
          </div>
        </div>
      </section>
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