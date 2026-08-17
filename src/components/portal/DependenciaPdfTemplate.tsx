import { forwardRef } from "react";

/**
 * Wordmark de KiMedia dibujado con tipografía: html2canvas renderiza el PNG
 * original como una placa negra, así que aquí usamos texto vectorial.
 */
function KiMediaMark({ size = 18 }: { size?: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: size,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color: "#0f172a",
        lineHeight: 1,
      }}
    >
      Ki<span style={{ color: "#e11d48" }}>Media</span>
    </span>
  );
}

export type DepAccountRow = {
  perfil: string;
  red: string;
  tipo: string;           // institucional | titular
  seguidores: number | null;
  crecimiento: number | null;   // rate
  engagement: number | null;    // rate
  postsDia: number | null;
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

export type DependenciaReportData = {
  dependencia: string;
  tipo: string | null;
  titular: string | null;
  titularCargo: string | null;
  periodoLabel: string;
  enfoqueLabel: string;
  redes: string[];
  cuentas: DepAccountRow[];
  totales: { seguidores: number; engagement: number | null; postsDia: number | null };
  desglose: {
    institucional: { cuentas: number; seguidores: number; engagement: number | null; postsDia: number | null };
    titular: { cuentas: number; seguidores: number; engagement: number | null; postsDia: number | null };
  };
  promedioGabinete: { engagement: number | null; seguidores: number | null };
  posicion: { rank: number | null; total: number } | null;
  variacion: { seguidores: number | null; engagement: number | null } | null;
  topPosts: DepPostRow[];
  prensa: DepPressRow[];
  prensaTotal?: number;
  prensaTono: { positivo: number; neutral: number; negativo: number };
  prensaMedios?: { medio: string; n: number }[];
  narrativas: { name: string; description?: string }[];
  narrativasFuentes?: string[];
};

export type GabineteReportData = {
  periodoLabel: string;
  ranking: { nombre: string; engagement: number | null; seguidores: number | null }[];
  suben: { nombre: string; delta: number }[];
  bajan: { nombre: string; delta: number }[];
  promedioEngagement: number | null;
  dependencias: number;
};

const TONE_COLOR: Record<string, string> = {
  positivo: "#10b981", neutral: "#94a3b8", negativo: "#ef4444", crisis: "#991b1b",
};

const nf = (n: number | null | undefined, d = 0) =>
  n == null || !Number.isFinite(Number(n)) ? "—" : Number(n).toLocaleString("es-MX", { maximumFractionDigits: d });
const pf = (n: number | null | undefined, d = 2) =>
  n == null || !Number.isFinite(Number(n)) ? "—" : `${(Number(n) * 100).toFixed(d)}%`;
const df = (n: number | null | undefined) =>
  n == null || !Number.isFinite(Number(n)) ? "—" : `${Number(n) >= 0 ? "+" : ""}${(Number(n) * 100).toFixed(1)}%`;

const page: React.CSSProperties = {
  width: 794,
  boxSizing: "border-box",
  padding: "16px 44px 6px",
  background: "#ffffff",
  color: "#0f172a",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 10.5,
  lineHeight: 1.45,
};
const sectionTitle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#64748b",
  marginBottom: 8,
};
const cardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  padding: "9px 11px",
  background: "#f8fafc",
};
const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: 9.5,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#64748b",
  borderBottom: "1px solid #e2e8f0",
  padding: "6px 6px",
};
const td: React.CSSProperties = {
  padding: "4px 6px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "top",
};

function Header({ title, subtitle, periodo, scope }: { title: string; subtitle?: string | null; periodo: string; scope?: string }) {
  return (
    <div className="pdf-avoid" style={{ borderBottom: "2px solid #0f172a", paddingBottom: 10, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#64748b" }}>
            Reporte de comunicación digital
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: "5px 0 2px", lineHeight: 1.2 }}>{title}</h1>
          {subtitle && <div style={{ color: "#475569", fontSize: 11.5 }}>{subtitle}</div>}
          <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>{periodo}</div>
          {scope && (
            <div style={{ marginTop: 5, display: "inline-block", background: "#0f172a", color: "#ffffff", borderRadius: 4, padding: "3px 8px", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {scope}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <KiMediaMark size={20} />
          <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>
            {new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="pdf-avoid" style={{ marginTop: 10, paddingTop: 6, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 9, color: "#94a3b8" }}>Documento generado automáticamente desde el portal de análisis de KiMedia.</span>
      <KiMediaMark size={12} />
    </div>
  );
}

export const DependenciaPdfTemplate = forwardRef<HTMLDivElement, { data: DependenciaReportData | null }>(({ data }, ref) => {
  if (!data) return <div ref={ref} style={page} />;
  const prensaTotal = data.prensaTotal ?? data.prensa.length;
  return (
    <div ref={ref} style={page}>
      <Header
        title={data.dependencia}
        subtitle={data.titular ? `${data.titular}${data.titularCargo ? ` · ${data.titularCargo}` : ""}` : data.tipo}
        periodo={data.periodoLabel}
      />

      {/* KPIs */}
      <div className="pdf-avoid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 9, marginBottom: 14 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b" }}>Seguidores</div>
          <div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>{nf(data.totales.seguidores)}</div>
          <div style={{ fontSize: 9.5, color: "#64748b" }}>{df(data.variacion?.seguidores ?? null)} vs periodo previo</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b" }}>Interacción</div>
          <div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>{pf(data.totales.engagement)}</div>
          <div style={{ fontSize: 9.5, color: "#64748b" }}>Gabinete: {pf(data.promedioGabinete.engagement)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b" }}>Posición</div>
          <div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>
            {data.posicion?.rank ? `#${data.posicion.rank}` : "—"}
          </div>
          <div style={{ fontSize: 9.5, color: "#64748b" }}>de {data.posicion?.total ?? 0} dependencias</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b" }}>Menciones de prensa</div>
          <div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>{prensaTotal}</div>
          <div style={{ fontSize: 9.5, color: "#64748b" }}>
            {data.prensaTono.positivo} pos · {data.prensaTono.neutral} neu · {data.prensaTono.negativo} neg
          </div>
        </div>
      </div>

      {/* Cuentas */}
      <div className="pdf-avoid" style={{ marginBottom: 14 }}>
        <div style={sectionTitle}>Cuentas de la dependencia</div>
        {data.cuentas.length === 0 ? (
          <div style={{ color: "#64748b" }}>Sin cuentas con datos en el periodo.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Perfil</th>
                <th style={th}>Red</th>
                <th style={th}>Tipo</th>
                <th style={{ ...th, textAlign: "right" }}>Seguidores</th>
                <th style={{ ...th, textAlign: "right" }}>Crec./día</th>
                <th style={{ ...th, textAlign: "right" }}>Interacción</th>
                <th style={{ ...th, textAlign: "right" }}>Pub./día</th>
              </tr>
            </thead>
            <tbody>
              {data.cuentas.slice(0, 12).map((c, i) => (
                <tr key={i}>
                  <td style={td}>{c.perfil}</td>
                  <td style={td}>{c.red}</td>
                  <td style={{ ...td, textTransform: "capitalize" }}>{c.tipo}</td>
                  <td style={{ ...td, textAlign: "right" }}>{nf(c.seguidores)}</td>
                  <td style={{ ...td, textAlign: "right" }}>{pf(c.crecimiento, 3)}</td>
                  <td style={{ ...td, textAlign: "right" }}>{pf(c.engagement)}</td>
                  <td style={{ ...td, textAlign: "right" }}>{nf(c.postsDia, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Narrativas */}
      {data.narrativas.length > 0 && (
        <div className="pdf-avoid" style={{ marginBottom: 14 }}>
          <div style={sectionTitle}>Territorios narrativos detectados</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 9 }}>
            {data.narrativas.slice(0, 4).map((n, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ fontWeight: 600 }}>{n.name}</div>
                {n.description && <div style={{ fontSize: 9.8, color: "#475569" }}>{n.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top posts */}
      <div style={{ marginBottom: 14 }}>
        <div style={sectionTitle}>Publicaciones con mayor interacción</div>
        {data.topPosts.length === 0 ? (
          <div style={{ color: "#64748b" }}>Sin publicaciones registradas en el periodo.</div>
        ) : (
          data.topPosts.slice(0, 3).map((p, i) => (
            <div className="pdf-avoid" key={i} style={{ ...cardStyle, marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 10, color: "#64748b" }}>
                <span>{p.perfil} · {p.red}</span>
                <span>{p.fecha ? new Date(p.fecha).toLocaleDateString("es-MX") : ""} · {nf(p.interacciones)} interacciones</span>
              </div>
              <div style={{ marginTop: 3, fontSize: 10.2 }}>{p.texto.slice(0, 220)}{p.texto.length > 220 ? "…" : ""}</div>
            </div>
          ))
        )}
      </div>

      {/* Prensa */}
      <div>
        <div style={sectionTitle}>Menciones de prensa en el periodo</div>
        {data.prensa.length === 0 ? (
          <div style={{ color: "#64748b" }}>Sin menciones registradas para la dependencia o su titular.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Fecha</th>
                <th style={th}>Medio</th>
                <th style={th}>Titular</th>
                <th style={th}>Tono</th>
              </tr>
            </thead>
            <tbody>
              {data.prensa.slice(0, 12).map((m, i) => (
                <tr key={i}>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{m.fecha}</td>
                  <td style={td}>{m.medio}</td>
                  <td style={td}>{m.titular.slice(0, 110)}</td>
                  <td style={{ ...td, color: TONE_COLOR[m.tono] ?? "#64748b", textTransform: "capitalize" }}>{m.tono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {prensaTotal > data.prensa.length && (
          <div style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 6 }}>
            Se muestran las primeras {data.prensa.length} de {prensaTotal} menciones. La lista completa está en la descarga de Excel.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
});
DependenciaPdfTemplate.displayName = "DependenciaPdfTemplate";

export const GabinetePdfTemplate = forwardRef<HTMLDivElement, { data: GabineteReportData | null; portalName: string }>(({ data, portalName }, ref) => {
  if (!data) return <div ref={ref} style={page} />;
  return (
    <div ref={ref} style={page}>
      <Header title={portalName} subtitle="Panorama de comunicación digital del gabinete" periodo={data.periodoLabel} />

      <div className="pdf-avoid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b" }}>Dependencias con datos</div>
          <div style={{ fontSize: 19, fontWeight: 700 }}>{data.dependencias}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b" }}>Interacción promedio</div>
          <div style={{ fontSize: 19, fontWeight: 700 }}>{pf(data.promedioEngagement)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b" }}>Líder del periodo</div>
          <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{data.ranking[0]?.nombre ?? "—"}</div>
          <div style={{ fontSize: 9.5, color: "#64748b" }}>{pf(data.ranking[0]?.engagement ?? null)}</div>
        </div>
      </div>

      <div className="pdf-avoid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
        <div>
          <div style={sectionTitle}>Quién sube</div>
          {data.suben.length === 0 ? <div style={{ color: "#64748b" }}>Sin comparativo disponible.</div> : data.suben.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span>{r.nombre}</span><span style={{ color: "#10b981" }}>{df(r.delta)}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={sectionTitle}>Quién baja</div>
          {data.bajan.length === 0 ? <div style={{ color: "#64748b" }}>Sin comparativo disponible.</div> : data.bajan.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span>{r.nombre}</span><span style={{ color: "#ef4444" }}>{df(r.delta)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={sectionTitle}>Ranking del gabinete</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: 30 }}>#</th>
              <th style={th}>Dependencia</th>
              <th style={{ ...th, textAlign: "right" }}>Interacción</th>
              <th style={{ ...th, textAlign: "right" }}>Seguidores</th>
            </tr>
          </thead>
          <tbody>
            {data.ranking.map((r, i) => (
              <tr key={i}>
                <td style={td}>{i + 1}</td>
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
