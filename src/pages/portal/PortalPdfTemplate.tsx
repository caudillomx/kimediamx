import { forwardRef } from "react";
import type { ClientPortalConfig } from "@/lib/clientPortal";

type Analysis = {
  week_start: string;
  week_end: string;
  entries_count: number;
  executive_summary: string | null;
  key_findings: any[];
  alerts: any[];
  recommendations_client: string | null;
  sentiment_breakdown: Record<string, number> | null;
  top_topics: { topic: string; count: number }[] | null;
  top_mentions: { name: string; type?: string; count: number }[] | null;
};

type Props = {
  portal: ClientPortalConfig;
  logoUrl?: string | null;
  analysis: Analysis | null;
  weekLabel: string;
};

const fmt = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

const PortalPdfTemplate = forwardRef<HTMLDivElement, Props>(({ portal, logoUrl, analysis, weekLabel }, ref) => {
  const sent = analysis?.sentiment_breakdown ?? {};
  const totalSent = Object.values(sent).reduce((a, b) => a + (Number(b) || 0), 0);
  const pct = (n: number) => (totalSent ? Math.round((n / totalSent) * 100) : 0);

  return (
    <div
      ref={ref}
      style={{
        width: 780,
        padding: 40,
        background: "#ffffff",
        color: "#0f172a",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 12,
        lineHeight: 1.55,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: "3px solid #ef6a4d", paddingBottom: 18, marginBottom: 24 }}>
        {logoUrl && (
          <img src={logoUrl} alt="" crossOrigin="anonymous" style={{ height: 44, width: 44, objectFit: "contain", borderRadius: 8, background: "#f8fafc", padding: 4 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase" }}>Reporte semanal · Inteligencia digital</div>
          <h1 style={{ fontSize: 26, margin: "4px 0 0", fontWeight: 700, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>{portal.displayName}</h1>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>{weekLabel}</div>
        </div>
      </div>

      {!analysis ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
          Aún no hay análisis publicado para esta semana.
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
            <KpiBox label="Menciones" value={analysis.entries_count?.toString() ?? "0"} />
            <KpiBox label="Positivas" value={`${pct(Number(sent.positivo ?? 0))}%`} accent="#10b981" />
            <KpiBox label="Negativas" value={`${pct(Number(sent.negativo ?? 0))}%`} accent="#f59e0b" />
            <KpiBox label="Crisis" value={`${pct(Number(sent.crisis ?? 0))}%`} accent="#ef4444" />
          </div>

          {/* Executive Summary */}
          {analysis.executive_summary && (
            <Section title="Resumen ejecutivo">
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{analysis.executive_summary}</p>
            </Section>
          )}

          {/* Alerts */}
          {analysis.alerts?.length > 0 && (
            <Section title="Alertas">
              {analysis.alerts.map((a: any, i: number) => (
                <div key={i} style={{ padding: 10, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 6, marginBottom: 6, pageBreakInside: "avoid" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#b91c1c", textTransform: "uppercase", marginBottom: 4 }}>{a.level ?? "alerta"}</div>
                  <div style={{ fontSize: 12 }}>{a.detail ?? a.summary ?? String(a)}</div>
                </div>
              ))}
            </Section>
          )}

          {/* Findings */}
          {analysis.key_findings?.length > 0 && (
            <Section title="Hallazgos clave">
              {analysis.key_findings.map((f: any, i: number) => (
                <div key={i} style={{ padding: 10, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, marginBottom: 6, pageBreakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{f.title ?? f.headline}</div>
                    {f.impact && (
                      <span style={{ fontSize: 10, background: "#0f172a", color: "#fff", padding: "2px 8px", borderRadius: 999 }}>
                        impacto {f.impact}
                      </span>
                    )}
                  </div>
                  {f.detail && <div style={{ fontSize: 11, color: "#475569" }}>{f.detail}</div>}
                </div>
              ))}
            </Section>
          )}

          {/* Topics + Mentions two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            {analysis.top_topics && analysis.top_topics.length > 0 && (
              <div style={{ pageBreakInside: "avoid" }}>
                <h3 style={{ fontSize: 13, margin: "0 0 8px", fontFamily: "'Space Grotesk', system-ui" }}>Temas más frecuentes</h3>
                {analysis.top_topics.slice(0, 8).map((t, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dashed #e2e8f0", fontSize: 11 }}>
                    <span>{t.topic}</span><span style={{ color: "#64748b" }}>×{t.count}</span>
                  </div>
                ))}
              </div>
            )}
            {analysis.top_mentions && analysis.top_mentions.length > 0 && (
              <div style={{ pageBreakInside: "avoid" }}>
                <h3 style={{ fontSize: 13, margin: "0 0 8px", fontFamily: "'Space Grotesk', system-ui" }}>Menciones destacadas</h3>
                {analysis.top_mentions.slice(0, 8).map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dashed #e2e8f0", fontSize: 11 }}>
                    <span>{m.name}</span><span style={{ color: "#64748b" }}>×{m.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          {analysis.recommendations_client && (
            <Section title="Recomendaciones">
              <div style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{analysis.recommendations_client}</div>
            </Section>
          )}
        </>
      )}

      <div style={{ marginTop: 28, paddingTop: 12, borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: 10, color: "#94a3b8" }}>
        {portal.displayName} · Inteligencia digital powered by KiMedia
      </div>
    </div>
  );
});

PortalPdfTemplate.displayName = "PortalPdfTemplate";
export default PortalPdfTemplate;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18, pageBreakInside: "avoid" }}>
      <h2 style={{ fontSize: 15, margin: "0 0 8px", fontFamily: "'Space Grotesk', system-ui", color: "#0f172a" }}>{title}</h2>
      {children}
    </div>
  );
}

function KpiBox({ label, value, accent = "#ef6a4d" }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff" }}>
      <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent, fontFamily: "'Space Grotesk', system-ui", marginTop: 4 }}>{value}</div>
    </div>
  );
}