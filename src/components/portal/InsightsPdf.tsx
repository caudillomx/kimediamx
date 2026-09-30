import { forwardRef } from "react";

// Plantilla PDF del portal (fondo blanco, marca KiMedia, tablas con ancho fijo para que no se desfasen).
export type PdfKpi = { label: string; value: string; note?: string; tone?: "up" | "down" | "flat" };
export type PdfTable = { title: string; subtitle?: string; columns: { h: string; w?: number; align?: "left" | "right" }[]; rows: (string | number)[][] };
export type PdfSpec = {
  title: string; client: string; period: string; compare?: string;
  kpis?: PdfKpi[]; bullets?: { title: string; items: string[] }[];
  recs?: { tag: string; title: string; body: string }[]; tables?: PdfTable[]; notes?: string[];
};

const C = { ink: "#0f172a", sub: "#475569", mute: "#94a3b8", line: "#e2e8f0", coral: "#ef6a4d", magenta: "#d63a8a", soft: "#fff6f2" };
const display = "'Space Grotesk', system-ui, sans-serif";

function Mark({ size = 14, muted = false }: { size?: number; muted?: boolean }) {
  return <span style={{ fontFamily: display, fontWeight: 700, fontSize: size, letterSpacing: "-0.02em", color: muted ? "#64748b" : C.ink, whiteSpace: "nowrap" }}>ki<span style={{ color: C.coral }}>media</span></span>;
}

const H2 = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 10px", pageBreakAfter: "avoid" }}>
    <span style={{ width: 4, height: 16, borderRadius: 2, background: `linear-gradient(${C.coral}, ${C.magenta})`, display: "inline-block" }} />
    <h2 style={{ fontFamily: display, fontSize: 14, fontWeight: 700, margin: 0, color: C.ink, letterSpacing: "-0.01em" }}>{children}</h2>
  </div>
);

const InsightsPdf = forwardRef<HTMLDivElement, { spec: PdfSpec }>(({ spec }, ref) => (
  <div ref={ref} style={{ width: 794, boxSizing: "border-box", padding: "34px 40px 28px", background: "#fff", color: C.ink, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10.5, lineHeight: 1.5 }}>
    {/* Encabezado */}
    <div style={{ borderRadius: 14, padding: "18px 20px", marginBottom: 18, background: `radial-gradient(circle at 0% 0%, #ffe3d8 0%, transparent 55%), radial-gradient(circle at 100% 100%, #fbdcea 0%, transparent 50%), ${C.soft}`, border: `1px solid #fde2d6` }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody><tr>
        <td style={{ verticalAlign: "top" }}>
          <div style={{ fontSize: 8.5, letterSpacing: 1.4, textTransform: "uppercase", color: C.coral, fontWeight: 700 }}>{spec.title}</div>
          <div style={{ fontFamily: display, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", margin: "2px 0" }}>{spec.client}</div>
          <div style={{ fontSize: 11, color: C.sub }}>{spec.period}{spec.compare ? ` · comparado con ${spec.compare}` : ""}</div>
        </td>
        <td style={{ verticalAlign: "top", textAlign: "right", width: 140 }}>
          <div style={{ fontSize: 7.5, color: C.mute, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 600, marginBottom: 3 }}>Elaborado por</div>
          <Mark size={18} />
          <div style={{ fontSize: 8, color: C.mute, marginTop: 2 }}>www.kimedia.mx</div>
        </td>
      </tr></tbody></table>
    </div>

    {spec.kpis?.length ? (
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 8, margin: "-8px -8px 10px", tableLayout: "fixed" }}><tbody><tr>
        {spec.kpis.map((k, i) => (
          <td key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", verticalAlign: "top" }}>
            <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: 0.6, color: C.sub, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontFamily: display, fontSize: 19, fontWeight: 700, color: C.ink, margin: "3px 0 1px" }}>{k.value}</div>
            {k.note && <div style={{ fontSize: 8.5, color: k.tone === "up" ? "#059669" : k.tone === "down" ? "#dc2626" : C.mute }}>{k.note}</div>}
          </td>
        ))}
      </tr></tbody></table>
    ) : null}

    {spec.bullets?.map((b, i) => (
      <div key={i} className="pdf-avoid" style={{ marginBottom: 16, pageBreakInside: "avoid" }}>
        <H2>{b.title}</H2>
        <div style={{ borderLeft: `3px solid ${C.coral}`, background: C.soft, borderRadius: "0 8px 8px 0", padding: "10px 14px" }}>
          {b.items.map((t, j) => (
            <table key={j} style={{ width: "100%", borderCollapse: "collapse", marginBottom: j < b.items.length - 1 ? 5 : 0 }}><tbody><tr>
              <td style={{ width: 12, verticalAlign: "top", color: C.coral, fontWeight: 700 }}>•</td>
              <td style={{ color: "#334155" }}>{t}</td>
            </tr></tbody></table>
          ))}
        </div>
      </div>
    ))}

    {spec.recs?.length ? (
      <div style={{ marginBottom: 16 }}>
        <H2>Qué hacer el próximo periodo</H2>
        {spec.recs.map((r, i) => (
          <table key={i} className="pdf-avoid" style={{ width: "100%", borderCollapse: "separate", border: `1px solid ${C.line}`, borderRadius: 8, marginBottom: 6, pageBreakInside: "avoid" }}><tbody><tr>
            <td style={{ width: 26, verticalAlign: "top", padding: "9px 0 9px 10px" }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: C.coral, color: "#fff", fontSize: 9, fontWeight: 700, lineHeight: "18px", textAlign: "center" }}>{i + 1}</div>
            </td>
            <td style={{ padding: "8px 12px 8px 6px" }}>
              <div style={{ fontSize: 7.5, textTransform: "uppercase", letterSpacing: 0.8, color: C.coral, fontWeight: 700 }}>{r.tag}</div>
              <div style={{ fontWeight: 600, fontSize: 11 }}>{r.title}</div>
              <div style={{ color: C.sub, fontSize: 9.5 }}>{r.body}</div>
            </td>
          </tr></tbody></table>
        ))}
      </div>
    ) : null}

    {spec.tables?.map((t, i) => (
      <div key={i} style={{ marginBottom: 16 }}>
        <H2>{t.title}</H2>
        {t.subtitle && <div style={{ fontSize: 9, color: C.mute, margin: "-6px 0 6px" }}>{t.subtitle}</div>}
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: 9.5 }}>
          <colgroup>{t.columns.map((c, j) => <col key={j} style={c.w ? { width: `${c.w}%` } : undefined} />)}</colgroup>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {t.columns.map((c, j) => (
                <th key={j} style={{ textAlign: c.align ?? (j === 0 ? "left" : "right"), padding: "6px 7px", fontSize: 8, textTransform: "uppercase", letterSpacing: 0.5, color: C.sub, fontWeight: 700, borderBottom: `1.5px solid ${C.coral}`, verticalAlign: "bottom" }}>{c.h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r, j) => (
              <tr key={j} className="pdf-avoid" style={{ pageBreakInside: "avoid", background: j % 2 ? "#fcfcfd" : "#fff" }}>
                {r.map((v, k) => (
                  <td key={k} style={{ textAlign: t.columns[k]?.align ?? (k === 0 ? "left" : "right"), padding: "6px 7px", borderBottom: `1px solid ${C.line}`, verticalAlign: "top", wordBreak: "break-word", fontVariantNumeric: "tabular-nums", color: k === 0 ? C.ink : "#334155" }}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ))}

    {spec.notes?.length ? (
      <div style={{ fontSize: 8.5, color: C.mute, marginTop: 6 }}>{spec.notes.map((n, i) => <div key={i}>{n}</div>)}</div>
    ) : null}

    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20, borderTop: `1px solid ${C.line}` }}><tbody><tr>
      <td style={{ paddingTop: 8, fontSize: 8.5, color: C.mute }}>{spec.client} · Datos de Metricool · Inteligencia digital por</td>
      <td style={{ paddingTop: 8, textAlign: "right" }}><Mark size={11} muted /> <span style={{ fontSize: 8.5, color: C.coral, marginLeft: 6 }}>www.kimedia.mx</span></td>
    </tr></tbody></table>
  </div>
));
InsightsPdf.displayName = "InsightsPdf";
export default InsightsPdf;

export async function downloadPdf(el: HTMLElement, filename: string) {
  const html2pdf = (await import("html2pdf.js")).default;
  await html2pdf().set({
    margin: [8, 0, 10, 0], filename,
    image: { type: "jpeg", quality: 0.96 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"], avoid: ".pdf-avoid" },
  } as any).from(el).save();
}
