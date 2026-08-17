import { forwardRef } from "react";
import kimediaLogo from "@/assets/kimedia-logo-full.png?inline";

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export type DepAccountRow = {
  perfil: string;
  red: string;
  tipo: string; // institucional | titular
  seguidores: number | null;
  crecimiento: number | null; // rate
  engagement: number | null;  // rate
  postsDia: number | null;
  publicaciones?: number | null;
  sinDatos?: boolean;
};

export type DepPostRow = {
  perfil: string;
  red: string;
  fecha: string | null;
  texto: string;
  interacciones: number;
};

export type DepPressRow = {
  fecha: string;
  medio: string;
  titular: string;
  tono: string;
  url: string;
  cita?: string;
  canal?: string;
};

export type ScopeKey = "institucional" | "titular";

export type ScopeBlock = {
  key: ScopeKey;
  label: string;      // "Cuentas de la dependencia" / "Cuentas del titular"
  sujeto: string;     // nombre de la dependencia o del titular
  cuentas: DepAccountRow[];
  seguidores: number;
  engagement: number | null;
  postsDia: number | null;
  publicaciones: number;
  variacionSeguidores: number | null;
  rank: number | null;
  rankTotal: number;
  promedioGabinete: number | null;
  topPosts: DepPostRow[];
  narrativas: { name: string; description?: string }[];
  narrativasFuentes: string[];
  prensa: DepPressRow[];
  prensaTotal: number;
  prensaTono: { positivo: number; neutral: number; negativo: number };
  prensaMedios: { medio: string; n: number }[];
};

export type DependenciaReportData = {
  dependencia: string;
  tipo: string | null;
  titular: string | null;
  titularCargo: string | null;
  periodoLabel: string;
  modo: "combinado" | "institucional" | "titular";
  enfoqueLabel: string;
  bloques: ScopeBlock[];
  conjunto?: {
    seguidores: number;
    engagement: number | null;
    postsDia: number | null;
    prensaTotal: number;
    variacionSeguidores: number | null;
    rank: number | null;
    rankTotal: number;
  } | null;
};

export type GabineteReportData = {
  periodoLabel: string;
  ranking: { nombre: string; engagement: number | null; seguidores: number | null }[];
  suben: { nombre: string; delta: number }[];
  bajan: { nombre: string; delta: number }[];
  promedioEngagement: number | null;
  dependencias: number;
};

/* ------------------------------------------------------------------ */
/* Paleta y helpers                                                    */
/* ------------------------------------------------------------------ */

const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";

const SCOPE = {
  institucional: { main: "#1d4ed8", soft: "#eff6ff", border: "#bfdbfe", tag: "Institución" },
  titular:       { main: "#be123c", soft: "#fff1f2", border: "#fecdd3", tag: "Titular" },
  conjunto:      { main: "#0f172a", soft: "#f1f5f9", border: "#cbd5e1", tag: "Conjunto" },
} as const;

const TONE_COLOR: Record<string, string> = {
  positivo: "#059669", neutral: "#64748b", negativo: "#dc2626", crisis: "#991b1b",
};

const nf = (n: number | null | undefined, d = 0) =>
  n == null || !Number.isFinite(Number(n)) ? "s/d" : Number(n).toLocaleString("es-MX", { maximumFractionDigits: d });
const pf = (n: number | null | undefined, d = 2) =>
  n == null || !Number.isFinite(Number(n)) ? "s/d" : `${(Number(n) * 100).toFixed(d)}%`;
const df = (n: number | null | undefined) =>
  n == null || !Number.isFinite(Number(n)) ? "s/d" : `${Number(n) >= 0 ? "+" : ""}${(Number(n) * 100).toFixed(1)}%`;
const deltaColor = (n: number | null | undefined) =>
  n == null || !Number.isFinite(Number(n)) ? MUTED : Number(n) >= 0 ? "#059669" : "#dc2626";

const page: React.CSSProperties = {
  width: 794,
  boxSizing: "border-box",
  padding: "16px 42px 8px",
  background: "#ffffff",
  color: INK,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 10.5,
  lineHeight: 1.45,
};

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: 9,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "#ffffff",
  padding: "5px 6px",
};
const td: React.CSSProperties = {
  padding: "4px 6px",
  borderBottom: `1px solid #f1f5f9`,
  verticalAlign: "top",
};

function Logo({ height = 26 }: { height?: number }) {
  return (
    <span style={{ display: "inline-block", borderRadius: 6, overflow: "hidden", lineHeight: 0 }}>
      <img src={kimediaLogo} alt="KiMedia" style={{ height, width: "auto", display: "block" }} />
    </span>
  );
}

/** html2canvas no rasteriza emojis: se eliminan para evitar cadenas de "?". */
export function stripEmoji(text: string): string {
  return (text ?? "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{20E3}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function SectionTitle({ text, color = INK, hint }: { text: string; color?: string; hint?: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 4, height: 13, background: color, borderRadius: 2, display: "inline-block" }} />
        <span style={{ fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase", color: INK, fontWeight: 700 }}>
          {text}
        </span>
      </div>
      {hint && <div style={{ fontSize: 8.8, color: "#94a3b8", marginTop: 3, marginLeft: 11 }}>{hint}</div>}
    </div>
  );
}

function Kpi({ label, value, foot, color, footColor }: {
  label: string; value: string; foot?: string; color: string; footColor?: string;
}) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderTop: `3px solid ${color}`, borderRadius: 8, padding: "7px 9px", background: "#ffffff" }}>
      <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.1em", color: MUTED }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, marginTop: 1, color: INK }}>{value}</div>
      {foot && <div style={{ fontSize: 8.8, color: footColor ?? MUTED, marginTop: 1 }}>{foot}</div>}
    </div>
  );
}

function ScopeChip({ scope }: { scope: ScopeKey | "conjunto" }) {
  const s = SCOPE[scope];
  return (
    <span style={{
      display: "inline-block", background: s.main, color: "#ffffff", borderRadius: 4,
      padding: "2px 7px", fontSize: 8.5, letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 700,
    }}>
      {s.tag}
    </span>
  );
}

function Header({ title, subtitle, periodo, scope }: {
  title: string; subtitle?: string | null; periodo: string; scope?: string;
}) {
  return (
    <div className="pdf-avoid" style={{ borderBottom: `2px solid ${INK}`, paddingBottom: 10, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>
            Reporte de comunicación digital
          </div>
          <h1 style={{ fontSize: 19, fontWeight: 700, margin: "4px 0 2px", lineHeight: 1.2 }}>{title}</h1>
          {subtitle && <div style={{ color: "#475569", fontSize: 11 }}>{subtitle}</div>}
          <div style={{ color: MUTED, fontSize: 10.5, marginTop: 3 }}>{periodo}</div>
          {scope && (
            <div style={{
              marginTop: 5, display: "inline-block", background: INK, color: "#ffffff", borderRadius: 4,
              padding: "3px 8px", fontSize: 8.5, letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 700,
            }}>
              {scope}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <Logo height={24} />
          <div style={{ fontSize: 8.5, color: "#94a3b8", marginTop: 3 }}>
            {new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="pdf-avoid" style={{ marginTop: 10, paddingTop: 6, borderTop: `1px solid ${LINE}`, display: "flex", justifyContent: "flex-end" }}>
      <Logo height={12} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bloque por ámbito (institución o titular)                           */
/* ------------------------------------------------------------------ */

function BlockSection({ b, compacto }: { b: ScopeBlock; compacto: boolean }) {
  const s = SCOPE[b.key];
  const maxCuentas = compacto ? 6 : 12;
  const maxNarr = compacto ? 2 : 4;
  const maxPosts = compacto ? 2 : 3;
  const maxPrensa = compacto ? 3 : 6;
  const cuentasActivas = b.cuentas.filter((c) => !c.sinDatos);
  const cuentasInactivas = b.cuentas.filter((c) => c.sinDatos);

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Encabezado del bloque */}
      <div className="pdf-avoid" style={{
        background: s.soft, border: `1px solid ${s.border}`, borderLeft: `4px solid ${s.main}`,
        borderRadius: 8, padding: "7px 10px", marginBottom: 8,
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <ScopeChip scope={b.key} />
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{b.label}</span>
          </div>
          <div style={{ fontSize: 9.5, color: "#475569", marginTop: 2 }}>{b.sujeto}</div>
        </div>
        <div style={{ fontSize: 9, color: MUTED, textAlign: "right" }}>
          {b.cuentas.length} cuenta{b.cuentas.length === 1 ? "" : "s"} · {b.publicaciones} publicaciones en el periodo
        </div>
      </div>

      {/* KPIs del bloque */}
      <div className="pdf-avoid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
        <Kpi label="Seguidores" value={nf(b.seguidores)} color={s.main}
             foot={`${df(b.variacionSeguidores)} vs periodo previo`} footColor={deltaColor(b.variacionSeguidores)} />
        <Kpi label="Interacción" value={pf(b.engagement)} color={s.main}
             foot={`Promedio gabinete: ${pf(b.promedioGabinete)}`} />
        <Kpi label="Posición en el gabinete" value={b.rank ? `#${b.rank}` : "s/d"} color={s.main}
             foot={`de ${b.rankTotal} ${b.key === "titular" ? "titulares" : "dependencias"}`} />
        <Kpi label="Menciones de prensa" value={String(b.prensaTotal)} color={s.main}
             foot={`${b.prensaTono.positivo} pos · ${b.prensaTono.neutral} neu · ${b.prensaTono.negativo} neg`} />
      </div>

      {/* Cuentas */}
      <div className="pdf-avoid" style={{ marginBottom: 10 }}>
        <SectionTitle
          text={b.key === "titular" ? "Cuentas del titular" : "Cuentas institucionales"}
          color={s.main}
          hint="Crec./día = crecimiento promedio diario de seguidores. Pub./día = publicaciones por día. “s/d” = la red no reportó el dato en el periodo."
        />
        {cuentasActivas.length === 0 ? (
          <div style={{ color: MUTED, fontSize: 10 }}>Sin cuentas con actividad en el periodo.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${LINE}`, borderRadius: 6, overflow: "hidden" }}>
            <thead>
              <tr style={{ background: s.main }}>
                <th style={th}>Perfil</th>
                <th style={th}>Red</th>
                <th style={{ ...th, textAlign: "right" }}>Seguidores</th>
                <th style={{ ...th, textAlign: "right" }}>Crec./día</th>
                <th style={{ ...th, textAlign: "right" }}>Interacción</th>
                <th style={{ ...th, textAlign: "right" }}>Pub.</th>
                <th style={{ ...th, textAlign: "right" }}>Pub./día</th>
              </tr>
            </thead>
            <tbody>
              {cuentasActivas.slice(0, maxCuentas).map((c, i) => (
                <tr key={i} style={{ background: i % 2 ? "#f8fafc" : "#ffffff" }}>
                  <td style={{ ...td, fontWeight: 600 }}>{c.perfil}</td>
                  <td style={{ ...td, textTransform: "capitalize" }}>{c.red}</td>
                  <td style={{ ...td, textAlign: "right" }}>{nf(c.seguidores)}</td>
                  <td style={{ ...td, textAlign: "right", color: deltaColor(c.crecimiento) }}>{pf(c.crecimiento, 3)}</td>
                  <td style={{ ...td, textAlign: "right" }}>{pf(c.engagement)}</td>
                  <td style={{ ...td, textAlign: "right" }}>{c.publicaciones == null ? "s/d" : nf(c.publicaciones)}</td>
                  <td style={{ ...td, textAlign: "right" }}>{nf(c.postsDia, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {cuentasInactivas.length > 0 && (
          <div style={{ fontSize: 8.8, color: "#94a3b8", marginTop: 4 }}>
            Sin actividad ni datos en el periodo: {cuentasInactivas.map((c) => `${c.perfil} (${c.red})`).join(", ")}.
          </div>
        )}
      </div>

      {/* Narrativas */}
      <div className="pdf-avoid" style={{ marginBottom: 10 }}>
        <SectionTitle
          text={b.key === "titular" ? "De qué habla el titular en sus redes" : "De qué habla la dependencia en sus redes"}
          color={s.main}
          hint={`Temas recurrentes de las publicaciones propias del periodo${b.narrativasFuentes.length ? ` (${b.narrativasFuentes.slice(0, 3).join(", ")})` : ""}. Describen el contenido publicado, no son recomendaciones.`}
        />
        {b.narrativas.length === 0 ? (
          <div style={{ color: MUTED, fontSize: 10 }}>
            Aún no hay análisis de narrativas para estas cuentas en el periodo.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {b.narrativas.slice(0, maxNarr).map((n, i) => (
              <div key={i} style={{ background: s.soft, border: `1px solid ${s.border}`, borderRadius: 8, padding: "7px 9px" }}>
                <div style={{ fontWeight: 700, fontSize: 10.5, color: s.main }}>{n.name}</div>
                {n.description && <div style={{ fontSize: 9.5, color: "#475569", marginTop: 1 }}>{n.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top posts */}
      <div style={{ marginBottom: 10 }}>
        <SectionTitle
          text={b.key === "titular" ? "Publicaciones del titular con mayor interacción" : "Publicaciones institucionales con mayor interacción"}
          color={s.main}
        />
        {b.topPosts.length === 0 ? (
          <div style={{ color: MUTED, fontSize: 10 }}>Sin publicaciones registradas en el periodo.</div>
        ) : (
          b.topPosts.slice(0, maxPosts).map((p, i) => (
            <div className="pdf-avoid" key={i} style={{
              border: `1px solid ${LINE}`, borderLeft: `3px solid ${s.main}`, borderRadius: 7,
              padding: "6px 9px", marginBottom: 5, background: "#ffffff",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 9.2, color: MUTED }}>
                <span style={{ fontWeight: 600, color: s.main }}>{p.perfil} · {p.red}</span>
                <span>
                  {p.fecha ? new Date(p.fecha).toLocaleDateString("es-MX") : ""} ·{" "}
                  <b style={{ color: INK }}>{nf(p.interacciones)}</b> interacciones
                </span>
              </div>
              <div style={{ marginTop: 2, fontSize: 9.8 }}>{p.texto.slice(0, 190)}{p.texto.length > 190 ? "…" : ""}</div>
            </div>
          ))
        )}
      </div>

      {/* Prensa */}
      <div>
        <SectionTitle
          text={b.key === "titular" ? "Menciones de prensa del titular" : "Menciones de prensa de la dependencia"}
          color={s.main}
          hint={
            b.prensaTotal > 0
              ? `${b.prensaTotal} menciones · ${b.prensaTono.positivo} positivas, ${b.prensaTono.neutral} neutrales, ${b.prensaTono.negativo} negativas.${
                  b.prensaMedios.length ? ` Medios más activos: ${b.prensaMedios.slice(0, 3).map((m) => `${m.medio} (${m.n})`).join(", ")}.` : ""
                }`
              : undefined
          }
        />
        {b.prensa.length === 0 ? (
          <div style={{ color: MUTED, fontSize: 10 }}>
            Sin menciones registradas en el periodo para {b.key === "titular" ? "el titular" : "la dependencia"}.
          </div>
        ) : (
          b.prensa.slice(0, maxPrensa).map((m, i) => (
            <div className="pdf-avoid" key={i} style={{
              border: `1px solid ${LINE}`, borderLeft: `3px solid ${TONE_COLOR[m.tono] ?? MUTED}`,
              borderRadius: 7, padding: "6px 9px", marginBottom: 5, background: "#ffffff",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 9, color: MUTED }}>
                <span>{m.fecha} · {m.medio}{m.canal && m.canal !== "medios" ? ` · ${m.canal}` : ""}</span>
                <span style={{
                  color: "#ffffff", background: TONE_COLOR[m.tono] ?? MUTED, borderRadius: 3,
                  padding: "1px 6px", textTransform: "capitalize", fontWeight: 700, fontSize: 8.5,
                }}>
                  {m.tono}
                </span>
              </div>
              <div style={{ marginTop: 2, fontSize: 10.2, fontWeight: 600 }}>{m.titular.slice(0, 130) || "(sin titular)"}</div>
              {m.cita && (
                <div style={{ marginTop: 2, fontSize: 9.4, color: "#475569" }}>
                  “{m.cita.slice(0, 180)}{m.cita.length > 180 ? "…" : ""}”
                </div>
              )}
            </div>
          ))
        )}
        {b.prensaTotal > Math.min(b.prensa.length, maxPrensa) && (
          <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 3 }}>
            Se muestran {Math.min(b.prensa.length, maxPrensa)} de {b.prensaTotal} menciones. La lista completa está en la descarga de Excel.
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reporte de dependencia                                              */
/* ------------------------------------------------------------------ */

export const DependenciaPdfTemplate = forwardRef<HTMLDivElement, { data: DependenciaReportData | null }>(({ data }, ref) => {
  if (!data) return <div ref={ref} style={page} />;
  const combinado = data.modo === "combinado";
  const c = data.conjunto;

  return (
    <div ref={ref} style={page}>
      <Header
        title={data.dependencia}
        subtitle={
          data.modo === "titular"
            ? (data.titular ? `${data.titular}${data.titularCargo ? ` · ${data.titularCargo}` : ""}` : data.tipo)
            : data.modo === "institucional"
              ? (data.tipo ?? "Cuentas institucionales")
              : (data.titular ? `${data.titular}${data.titularCargo ? ` · ${data.titularCargo}` : ""}` : data.tipo)
        }
        periodo={data.periodoLabel}
        scope={data.enfoqueLabel}
      />

      {/* Cómo leer el reporte */}
      <div className="pdf-avoid" style={{
        border: `1px solid ${LINE}`, borderRadius: 8, background: "#f8fafc",
        padding: "7px 10px", marginBottom: 12, fontSize: 9.3, color: "#475569",
      }}>
        {combinado ? (
          <>
            <b>Cómo leer este reporte.</b> Incluye dos bloques independientes: en <span style={{ color: SCOPE.institucional.main, fontWeight: 700 }}>azul</span> lo que corresponde a las cuentas
            institucionales de la dependencia y en <span style={{ color: SCOPE.titular.main, fontWeight: 700 }}>rojo</span> lo que corresponde a las cuentas personales del titular.
            Cada bloque tiene sus propios indicadores, cuentas, narrativas, publicaciones y menciones de prensa; el resumen conjunto de abajo suma ambos.
          </>
        ) : data.modo === "titular" ? (
          <>
            <b>Cómo leer este reporte.</b> Considera únicamente las cuentas personales del titular
            {data.titular ? ` (${data.titular})` : ""}. Los indicadores institucionales de la dependencia no se incluyen y la posición se compara contra el resto de titulares del gabinete.
          </>
        ) : (
          <>
            <b>Cómo leer este reporte.</b> Considera únicamente las cuentas institucionales de la dependencia. Las cuentas personales del titular quedan fuera y la
            posición se compara contra el resto de dependencias.
          </>
        )}
      </div>

      {/* Resumen conjunto solo en modo combinado */}
      {combinado && c && (
        <div className="pdf-avoid" style={{ marginBottom: 14 }}>
          <SectionTitle text="Resumen conjunto (institución + titular)" color={SCOPE.conjunto.main} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            <Kpi label="Seguidores totales" value={nf(c.seguidores)} color={INK}
                 foot={`${df(c.variacionSeguidores)} vs periodo previo`} footColor={deltaColor(c.variacionSeguidores)} />
            <Kpi label="Interacción promedio" value={pf(c.engagement)} color={INK} foot="Promedio de todas las cuentas" />
            <Kpi label="Posición combinada" value={c.rank ? `#${c.rank}` : "s/d"} color={INK} foot={`de ${c.rankTotal} dependencias`} />
            <Kpi label="Menciones de prensa" value={String(c.prensaTotal)} color={INK} foot="Dependencia y titular" />
          </div>
        </div>
      )}

      {data.bloques.map((b) => (
        <BlockSection key={b.key} b={b} compacto={combinado} />
      ))}

      <Footer />
    </div>
  );
});
DependenciaPdfTemplate.displayName = "DependenciaPdfTemplate";

/* ------------------------------------------------------------------ */
/* Reporte de gabinete                                                 */
/* ------------------------------------------------------------------ */

export const GabinetePdfTemplate = forwardRef<HTMLDivElement, { data: GabineteReportData | null; portalName: string }>(({ data, portalName }, ref) => {
  if (!data) return <div ref={ref} style={page} />;
  return (
    <div ref={ref} style={page}>
      <Header title={portalName} subtitle="Panorama de comunicación digital del gabinete" periodo={data.periodoLabel} />

      <div className="pdf-avoid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9, marginBottom: 18 }}>
        <Kpi label="Dependencias con datos" value={String(data.dependencias)} color={SCOPE.institucional.main} />
        <Kpi label="Interacción promedio" value={pf(data.promedioEngagement)} color={SCOPE.conjunto.main} />
        <Kpi label="Líder del periodo" value={data.ranking[0]?.nombre ?? "s/d"} color={SCOPE.titular.main}
             foot={pf(data.ranking[0]?.engagement ?? null)} />
      </div>

      <div className="pdf-avoid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <div>
          <SectionTitle text="Quién sube" color="#059669" />
          {data.suben.length === 0 ? <div style={{ color: MUTED }}>Sin comparativo disponible.</div> : data.suben.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span>{r.nombre}</span><span style={{ color: "#059669", fontWeight: 600 }}>{df(r.delta)}</span>
            </div>
          ))}
        </div>
        <div>
          <SectionTitle text="Quién baja" color="#dc2626" />
          {data.bajan.length === 0 ? <div style={{ color: MUTED }}>Sin comparativo disponible.</div> : data.bajan.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span>{r.nombre}</span><span style={{ color: "#dc2626", fontWeight: 600 }}>{df(r.delta)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle text="Ranking del gabinete" color={SCOPE.institucional.main} />
        <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${LINE}` }}>
          <thead>
            <tr style={{ background: SCOPE.institucional.main }}>
              <th style={{ ...th, width: 30 }}>#</th>
              <th style={th}>Dependencia</th>
              <th style={{ ...th, textAlign: "right" }}>Interacción</th>
              <th style={{ ...th, textAlign: "right" }}>Seguidores</th>
            </tr>
          </thead>
          <tbody>
            {data.ranking.map((r, i) => (
              <tr key={i} style={{ background: i % 2 ? "#f8fafc" : "#ffffff" }}>
                <td style={{ ...td, fontWeight: 700, color: MUTED }}>{i + 1}</td>
                <td style={td}>{r.nombre}</td>
                <td style={{ ...td, textAlign: "right" }}>{pf(r.engagement)}</td>
                <td style={{ ...td, textAlign: "right" }}>{nf(r.seguidores)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Footer />
    </div>
  );
});
GabinetePdfTemplate.displayName = "GabinetePdfTemplate";
