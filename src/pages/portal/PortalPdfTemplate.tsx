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
  charts?: {
    volumeByDay: { date: string; positivo: number; neutral: number; negativo: number; crisis: number }[];
    topChannels: { name: string; value: number }[];
    topEntities: { name: string; size: number }[];
    reputation: { score: number; label: string; color: string };
  } | null;
};

const fmt = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

const SENT_COLORS: Record<string, string> = {
  positivo: "#10b981", neutral: "#94a3b8", negativo: "#ef4444", crisis: "#991b1b",
};
const PLATFORM_COLORS_PDF: Record<string, string> = {
  "medios digitales": "#3b82f6", "medios": "#3b82f6", "prensa": "#3b82f6",
  "x": "#0f172a", "twitter": "#1da1f2", "x (twitter)": "#0f172a",
  "linkedin": "#0a66c2", "facebook": "#1877f2", "instagram": "#e1306c",
  "youtube": "#ff0000", "tiktok": "#111111", "reddit": "#ff4500",
  "threads": "#0f172a", "whatsapp": "#25d366", "telegram": "#0088cc",
};
const PIE_FALLBACK = ["#ef6a4d", "#0ea5e9", "#a855f7", "#10b981", "#f59e0b", "#ec4899"];
const pdfPlatformColor = (name: string, i: number) =>
  PLATFORM_COLORS_PDF[name.toLowerCase().trim()] ?? PIE_FALLBACK[i % PIE_FALLBACK.length];

const PortalPdfTemplate = forwardRef<HTMLDivElement, Props>(({ portal, logoUrl, analysis, weekLabel, charts }, ref) => {
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

          {/* ===== Página 2: Gráficos ===== */}
          {charts && (
            <div style={{ pageBreakBefore: "always", paddingTop: 12 }}>
              <h2 style={{ fontSize: 16, margin: "0 0 14px", fontFamily: "'Space Grotesk', system-ui", color: "#0f172a", borderBottom: "2px solid #ef6a4d", paddingBottom: 6 }}>
                Panorama visual
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 18 }}>
                <ChartBox title="Volumen y sentimiento por día">
                  <VolumeBarsSvg data={charts.volumeByDay} />
                </ChartBox>
                <ChartBox title="Salud reputacional">
                  <GaugeSvg score={charts.reputation.score} color={charts.reputation.color} label={charts.reputation.label} />
                </ChartBox>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                <ChartBox title="Menciones por canal">
                  <DonutSvg data={charts.topChannels.map((c, i) => ({ name: c.name, value: c.value, color: pdfPlatformColor(c.name, i) }))} />
                </ChartBox>
                <ChartBox title="Sentimiento agregado">
                  <DonutSvg data={(["positivo", "neutral", "negativo", "crisis"] as const)
                    .map(k => ({ name: k, value: Number(sent[k] ?? 0), color: SENT_COLORS[k] }))
                    .filter(d => d.value > 0)} />
                </ChartBox>
              </div>

              {charts.topEntities.length > 0 && (
                <ChartBox title="Entidades más citadas">
                  <EntitiesBarSvg data={charts.topEntities} />
                </ChartBox>
              )}
            </div>
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

function ChartBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#fff", pageBreakInside: "avoid" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", marginBottom: 8, fontFamily: "'Space Grotesk', system-ui" }}>{title}</div>
      {children}
    </div>
  );
}

// ================= SVG CHARTS =================

function VolumeBarsSvg({ data }: { data: { date: string; positivo: number; neutral: number; negativo: number; crisis: number }[] }) {
  const W = 440, H = 190, P = { l: 30, r: 10, t: 10, b: 30 };
  if (!data.length) return <EmptyMsg w={W} h={H} />;
  const totals = data.map(d => d.positivo + d.neutral + d.negativo + d.crisis);
  const max = Math.max(1, ...totals);
  const bw = (W - P.l - P.r) / data.length;
  const scaleY = (v: number) => ((H - P.t - P.b) * v) / max;
  const keys = ["positivo", "neutral", "negativo", "crisis"] as const;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      {[0, 0.5, 1].map((r, i) => {
        const y = P.t + (H - P.t - P.b) * (1 - r);
        return <g key={i}><line x1={P.l} x2={W - P.r} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="2 3" />
          <text x={P.l - 4} y={y + 3} fontSize={8} fill="#94a3b8" textAnchor="end">{Math.round(max * r)}</text></g>;
      })}
      {data.map((d, i) => {
        let cursor = H - P.b;
        const gap = bw >= 5 ? 2 : 0;
        const barW = Math.max(0.5, bw - gap * 2);
        return (
          <g key={i} transform={`translate(${P.l + i * bw}, 0)`}>
            {keys.map(k => {
              const h = scaleY(d[k] as number);
              const y = cursor - h; cursor -= h;
              if (h <= 0) return null;
              return <rect key={k} x={gap} y={y} width={barW} height={h} fill={SENT_COLORS[k]} />;
            })}
            <text x={bw / 2} y={H - P.b + 12} fontSize={7} fill="#64748b" textAnchor="middle">{d.date.slice(5)}</text>
          </g>
        );
      })}
      <g transform={`translate(${P.l}, ${H - 6})`}>
        {keys.map((k, i) => (
          <g key={k} transform={`translate(${i * 70}, 0)`}>
            <rect width={8} height={8} fill={SENT_COLORS[k]} />
            <text x={12} y={7} fontSize={8} fill="#334155">{k}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function DonutSvg({ data }: { data: { name: string; value: number; color: string }[] }) {
  const W = 300, H = 190, cx = 90, cy = 95, r = 65, ri = 38;
  const total = data.reduce((a, b) => a + b.value, 0);
  if (!total) return <EmptyMsg w={W} h={H} />;
  let angle = -Math.PI / 2;
  const arcs = data.map(d => {
    const slice = (d.value / total) * Math.PI * 2;
    const a0 = angle, a1 = angle + slice;
    angle = a1;
    const large = slice > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const xi0 = cx + ri * Math.cos(a1), yi0 = cy + ri * Math.sin(a1);
    const xi1 = cx + ri * Math.cos(a0), yi1 = cy + ri * Math.sin(a0);
    const path = `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} L${xi0},${yi0} A${ri},${ri} 0 ${large} 0 ${xi1},${yi1} Z`;
    return { d, path, pct: Math.round((d.value / total) * 100) };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      {arcs.map((a, i) => <path key={i} d={a.path} fill={a.d.color} stroke="#fff" strokeWidth={1.5} />)}
      <text x={cx} y={cy + 4} fontSize={14} fontWeight={700} textAnchor="middle" fill="#0f172a">{total}</text>
      <g transform={`translate(175, 20)`}>
        {arcs.map((a, i) => (
          <g key={i} transform={`translate(0, ${i * 18})`}>
            <rect width={10} height={10} fill={a.d.color} />
            <text x={14} y={9} fontSize={9} fill="#334155">{a.d.name}</text>
            <text x={115} y={9} fontSize={9} fill="#64748b" textAnchor="end">{a.pct}%</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function GaugeSvg({ score, color, label }: { score: number; color: string; label: string }) {
  const W = 220, H = 190, cx = 110, cy = 130, r = 78;
  const start = Math.PI, end = 2 * Math.PI;
  const t = score / 100;
  const angle = start + (end - start) * t;
  const arc = (a0: number, a1: number) => {
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    return `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1}`;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      <path d={arc(start, end)} stroke="#e2e8f0" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={arc(start, angle)} stroke={color} strokeWidth={14} fill="none" strokeLinecap="round" />
      <text x={cx} y={cy - 4} fontSize={34} fontWeight={700} textAnchor="middle" fill={color} fontFamily="'Space Grotesk', system-ui">{score}</text>
      <text x={cx} y={cy + 16} fontSize={11} fontWeight={600} textAnchor="middle" fill={color}>{label}</text>
      <text x={cx - r} y={cy + 22} fontSize={8} fill="#94a3b8" textAnchor="middle">0</text>
      <text x={cx + r} y={cy + 22} fontSize={8} fill="#94a3b8" textAnchor="middle">100</text>
    </svg>
  );
}

function EntitiesBarSvg({ data }: { data: { name: string; size: number }[] }) {
  const W = 700, rowH = 18, P = { l: 130, r: 40, t: 6, b: 6 };
  const H = P.t + P.b + data.length * rowH;
  const max = Math.max(1, ...data.map(d => d.size));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      {data.map((d, i) => {
        const y = P.t + i * rowH;
        const bw = ((W - P.l - P.r) * d.size) / max;
        return (
          <g key={i}>
            <text x={P.l - 6} y={y + 12} fontSize={9} fill="#334155" textAnchor="end">
              {d.name.length > 22 ? d.name.slice(0, 21) + "…" : d.name}
            </text>
            <rect x={P.l} y={y + 4} width={bw} height={rowH - 8} fill="#ef6a4d" rx={2} />
            <text x={P.l + bw + 4} y={y + 12} fontSize={9} fill="#64748b">×{d.size}</text>
          </g>
        );
      })}
    </svg>
  );
}

function EmptyMsg({ w, h }: { w: number; h: number }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      <text x={w / 2} y={h / 2} fontSize={11} fill="#94a3b8" textAnchor="middle">Sin datos suficientes</text>
    </svg>
  );
}