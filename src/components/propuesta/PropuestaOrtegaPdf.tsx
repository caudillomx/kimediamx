import { forwardRef } from "react";
import logoUrl from "@/assets/kimedia-logo.png";

export interface OrtegaEtapa {
  n: string;
  title: string;
  time: string;
  desc: string;
  deliverable: string;
}

interface Props {
  etapas: OrtegaEtapa[];
  includes: string[];
}

export const PropuestaOrtegaPdf = forwardRef<HTMLDivElement, Props>(({ etapas, includes }, ref) => {
  const PAGE_W = 794;
  const PAGE_H = 1123;
  const HEADER_H = 70;
  const FOOTER_H = 50;
  const SIDE_PAD = 56;
  const CONTENT_H = PAGE_H - HEADER_H - FOOTER_H;

  const s = {
    root: {
      width: `${PAGE_W}px`,
      background: "#0B0F1A",
      color: "#F5F5F7",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      lineHeight: 1.5,
      fontSize: "12px",
    } as const,
    page: {
      width: `${PAGE_W}px`,
      height: `${PAGE_H}px`,
      position: "relative" as const,
      background: "#0B0F1A",
      overflow: "hidden" as const,
    },
    header: {
      position: "absolute" as const,
      top: 0, left: 0, right: 0,
      height: `${HEADER_H}px`,
      padding: `0 ${SIDE_PAD}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    },
    footer: {
      position: "absolute" as const,
      bottom: 0, left: 0, right: 0,
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
      left: 0, right: 0,
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
    h1: { fontSize: "32px", fontWeight: 800, lineHeight: 1.05, margin: "0 0 16px", letterSpacing: "-0.02em" },
    h2: { fontSize: "22px", fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 12px" },
    h3: { fontSize: "14px", fontWeight: 700, margin: "0 0 6px" },
    muted: { color: "#9aa0aa" },
    accent: { color: "#FF6B5B" },
    electric: { color: "#4FD1FF" },
    divider: { borderTop: "1px solid rgba(255,255,255,0.12)", margin: "20px 0" },
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
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
    grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" },
  };

  const PageChrome = ({ page, total, children }: { page: number; total: number; children: React.ReactNode }) => (
    <section data-pdf-page style={s.page}>
      <header style={s.header}>
        <img
          src={logoUrl}
          alt="KiMedia"
          crossOrigin="anonymous"
          style={{ height: "32px", width: "auto", maxWidth: "120px", objectFit: "contain", display: "block" }}
        />
        <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#4FD1FF" }}>
          Propuesta Confidencial · Ortega y Asociados
        </div>
      </header>
      <div style={s.content}>{children}</div>
      <footer style={s.footer}>
        <span>KiMedia · hola@kimedia.mx · kimedia.mx</span>
        <span>Página {page} de {total}</span>
      </footer>
    </section>
  );

  const TOTAL = 3;

  return (
    <div ref={ref} style={s.root}>
      {/* PAGE 1 — COVER + ALCANCE */}
      <PageChrome page={1} total={TOTAL}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ flex: 1 }}>
            <div style={{ ...s.eyebrow, color: "#4FD1FF", marginBottom: "12px" }}>
              Propuesta de Análisis · 2026
            </div>
            <h1 style={{ ...s.h1, fontSize: "40px" }}>
              Análisis de impacto reputacional
              <br />
              <span style={s.accent}>por publicaciones en redes sociales</span>
            </h1>
            <p style={{ fontSize: "13.5px", color: "#cfd2d8", maxWidth: "600px", margin: "16px 0 24px", lineHeight: 1.6 }}>
              Análisis técnico y narrativo de un conjunto de publicaciones digitales y su efecto sobre la
              reputación y operación comercial de una empresa. Elaborado por KiMedia como insumo
              especializado para el equipo legal de Ortega y Asociados.
            </p>

            <div style={{ ...s.card, marginBottom: "18px", padding: "18px" }}>
              <div style={{ ...s.eyebrow, marginBottom: "6px" }}>Presentado a</div>
              <div style={{ fontSize: "20px", fontWeight: 700 }}>Ortega y Asociados</div>
              <div style={{ fontSize: "12px", color: "#9aa0aa", marginTop: "2px" }}>
                Despacho jurídico
              </div>
            </div>

            <div style={s.grid3}>
              <Tile label="Duración" value="15 días naturales" />
              <Tile label="Inversión" value="$30,000 MXN + IVA" />
              <Tile label="Modalidad" value="Confidencial" />
              <Tile label="Etapas" value="3 fases" />
              <Tile label="Entregable" value="Documento ejecutivo" />
              <Tile label="Formato" value="PDF + reunión" />
            </div>

            <div style={{ ...s.card, marginTop: "16px", borderColor: "rgba(79,209,255,0.3)", background: "rgba(79,209,255,0.05)" }}>
              <div style={{ ...s.eyebrow, color: "#4FD1FF", marginBottom: "6px" }}>Nota metodológica</div>
              <p style={{ fontSize: "11px", color: "#cfd2d8", margin: 0, lineHeight: 1.55 }}>
                Este trabajo constituye un <strong style={{ color: "#fff" }}>análisis técnico</strong> de
                comunicación digital, no un dictamen pericial. Su objetivo es documentar hallazgos,
                narrativas y evidencia observable en el ecosistema digital para apoyar la estrategia legal
                del despacho.
              </p>
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: "20px" }}>
            <div style={{ ...s.divider, margin: "0 0 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#9aa0aa" }}>
              <span>Documento estratégico de uso exclusivo</span>
              <span style={s.badge}>Confidencial</span>
            </div>
          </div>
        </div>
      </PageChrome>

      {/* PAGE 2 — ETAPAS */}
      <PageChrome page={2} total={TOTAL}>
        <div style={s.eyebrow}>Metodología</div>
        <h2 style={s.h2}>Etapas del trabajo</h2>
        <p style={{ ...s.muted, marginBottom: "16px", fontSize: "12px" }}>
          Tres fases secuenciales en 15 días naturales, con puntos de contacto claros con el despacho.
        </p>

        <div style={{ display: "grid", gap: "12px" }}>
          {etapas.map((e) => (
            <div key={e.n} style={s.card}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <span style={{ fontSize: "22px", fontWeight: 800, color: "#FF6B5B", lineHeight: 1 }}>{e.n}</span>
                  <h3 style={s.h3}>{e.title}</h3>
                </div>
                <span style={s.badge}>{e.time}</span>
              </div>
              <p style={{ fontSize: "11.5px", color: "#cfd2d8", margin: "4px 0 10px", lineHeight: 1.55 }}>
                {e.desc}
              </p>
              <div style={{ ...s.card, padding: "10px 12px", background: "rgba(79,209,255,0.05)", borderColor: "rgba(79,209,255,0.25)" }}>
                <div style={{ ...s.eyebrow, color: "#4FD1FF", marginBottom: "4px" }}>Entregable de la etapa</div>
                <div style={{ fontSize: "11.5px", color: "#fff", lineHeight: 1.5 }}>{e.deliverable}</div>
              </div>
            </div>
          ))}
        </div>
      </PageChrome>

      {/* PAGE 3 — INVERSIÓN + FIRMA */}
      <PageChrome page={3} total={TOTAL}>
        <div style={s.eyebrow}>Propuesta económica</div>
        <h2 style={s.h2}>Inversión y condiciones</h2>

        <div style={{
          ...s.card,
          background: "linear-gradient(135deg, rgba(255,107,91,0.14), rgba(79,209,255,0.06))",
          borderColor: "rgba(255,107,91,0.35)",
          padding: "22px 24px",
          marginBottom: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "14px" }}>
            <span style={{ fontSize: "44px", fontWeight: 800, color: "#FF6B5B", lineHeight: 1 }}>$30,000</span>
            <span style={{ fontSize: "13px", color: "#9aa0aa", fontWeight: 600 }}>MXN + IVA</span>
          </div>
          <div style={{ ...s.eyebrow, marginBottom: "8px" }}>El trabajo incluye</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {includes.map((item) => (
              <li key={item} style={{
                display: "flex", gap: "10px", alignItems: "flex-start",
                padding: "7px 0",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                fontSize: "11.5px", lineHeight: 1.5,
              }}>
                <span style={{ color: "#FF6B5B", fontWeight: 700 }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ ...s.grid2, marginBottom: "16px" }}>
          <div style={{ ...s.card, padding: "12px 14px" }}>
            <div style={{ ...s.eyebrow, marginBottom: "4px" }}>Forma de pago</div>
            <div style={{ fontSize: "11.5px", color: "#cfd2d8", lineHeight: 1.55 }}>
              50% al inicio del proyecto · 50% al finalizar a satisfacción del cliente. Transferencia
              electrónica con factura.
            </div>
          </div>
          <div style={{ ...s.card, padding: "12px 14px", borderColor: "rgba(79,209,255,0.3)" }}>
            <div style={{ ...s.eyebrow, color: "#4FD1FF", marginBottom: "4px" }}>Plazo</div>
            <div style={{ fontSize: "11.5px", color: "#cfd2d8", lineHeight: 1.55 }}>
              15 días naturales a partir de la reunión inicial de validación de evidencias.
            </div>
          </div>
          <div style={{ ...s.card, padding: "12px 14px" }}>
            <div style={{ ...s.eyebrow, marginBottom: "4px" }}>Confidencialidad</div>
            <div style={{ fontSize: "11.5px", color: "#cfd2d8", lineHeight: 1.55 }}>
              Toda la información compartida se maneja bajo estricta confidencialidad y uso exclusivo
              del despacho y su cliente.
            </div>
          </div>
          <div style={{ ...s.card, padding: "12px 14px", borderColor: "rgba(79,209,255,0.3)" }}>
            <div style={{ ...s.eyebrow, color: "#4FD1FF", marginBottom: "4px" }}>Vigencia</div>
            <div style={{ fontSize: "11.5px", color: "#cfd2d8", lineHeight: 1.55 }}>
              10 días naturales a partir de la recepción de esta propuesta.
            </div>
          </div>
        </div>

        <div style={{
          ...s.card,
          background: "rgba(79,209,255,0.05)",
          borderColor: "rgba(79,209,255,0.25)",
          padding: "16px 20px",
          marginBottom: "16px",
        }}>
          <div style={{ ...s.eyebrow, color: "#4FD1FF", marginBottom: "6px" }}>Próximo paso</div>
          <p style={{ fontSize: "12px", color: "#fff", margin: 0, lineHeight: 1.55 }}>
            Al confirmar esta propuesta agendamos una <strong>reunión interna de validación</strong> con
            el equipo del despacho para revisar el material disponible (publicaciones, capturas y
            registros) y definir el alcance final del análisis.
          </p>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.12)",
          paddingTop: "16px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}>
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
            <div style={{
              fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase" as const, color: "#9aa0aa", marginBottom: "2px",
            }}>
              Fecha de propuesta
            </div>
            <div style={{ fontSize: "12px", color: "#fff", fontWeight: 600 }}>Julio 2026</div>
          </div>
        </div>
      </PageChrome>
    </div>
  );
});

PropuestaOrtegaPdf.displayName = "PropuestaOrtegaPdf";

const Tile = ({ label, value }: { label: string; value: string }) => (
  <div style={{
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "12px",
    background: "rgba(255,255,255,0.03)",
  }}>
    <div style={{
      fontSize: "9px", fontWeight: 700, letterSpacing: "1.4px",
      textTransform: "uppercase", color: "#9aa0aa", marginBottom: "4px",
    }}>
      {label}
    </div>
    <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{value}</div>
  </div>
);