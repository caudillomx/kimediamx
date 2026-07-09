import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import {
  LogOut, FileText, Calendar, ShieldAlert, Download,
  Lightbulb, BarChart3, MessageSquare, Sparkles,
} from "lucide-react";
import type { ClientPortalConfig } from "@/lib/clientPortal";

type Report = {
  id: string;
  report_date: string;
  title: string;
  type: string;
  summary_md: string | null;
};

type WeeklyRec = {
  id: string;
  week_start: string;
  for_client_md: string | null;
  priority: string;
};

const TYPE_LABEL: Record<string, string> = {
  daily: "Análisis diario",
  weekly: "Reporte semanal",
  benchmark: "Benchmark",
  other: "Otro",
};

const PRIORITY_BADGE: Record<string, string> = {
  alta: "bg-coral/15 text-coral border-coral/30",
  media: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  baja: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
};

const RANGES = [
  { key: "4w", label: "Últimas 4 semanas", days: 28 },
  { key: "12w", label: "Últimas 12 semanas", days: 84 },
  { key: "ytd", label: "Este año", days: 0 },
  { key: "all", label: "Todo", days: -1 },
];

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }

export default function PortalHome({ portal }: { portal: ClientPortalConfig }) {
  const navigate = useNavigate();
  const [rangeKey, setRangeKey] = useState("4w");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [reports, setReports] = useState<Report[]>([]);
  const [recs, setRecs] = useState<WeeklyRec[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const { fromDate, toDate } = useMemo(() => {
    if (customFrom && customTo) return { fromDate: customFrom, toDate: customTo };
    const today = new Date();
    const to = isoDate(today);
    if (rangeKey === "all") return { fromDate: "1900-01-01", toDate: to };
    if (rangeKey === "ytd") return { fromDate: `${today.getFullYear()}-01-01`, toDate: to };
    const days = RANGES.find(r => r.key === rangeKey)?.days ?? 28;
    const from = new Date(today); from.setDate(from.getDate() - days);
    return { fromDate: isoDate(from), toDate: to };
  }, [rangeKey, customFrom, customTo]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [r, w] = await Promise.all([
        supabase
          .from("client_portal_reports")
          .select("id, report_date, title, type, summary_md")
          .eq("client_id", portal.clientId)
          .gte("report_date", fromDate)
          .lte("report_date", toDate)
          .order("report_date", { ascending: false }),
        supabase
          .from("client_portal_weekly_recommendations_public")
          .select("id, week_start, for_client_md, priority")
          .eq("client_id", portal.clientId)
          .gte("week_start", fromDate)
          .lte("week_start", toDate)
          .order("week_start", { ascending: false }),
      ]);
      if (r.error) toast.error(r.error.message);
      setReports((r.data ?? []) as Report[]);
      setRecs((w.data ?? []) as WeeklyRec[]);

      if ((r.data ?? []).length === 0 && (w.data ?? []).length === 0) {
        const { data: access } = await supabase
          .from("client_access").select("id").eq("client_id", portal.clientId).limit(1);
        if (!access || access.length === 0) setDenied(true);
      }
      setLoading(false);
    })();
  }, [portal.clientId, fromDate, toDate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  const downloadPdf = async () => {
    if (!pdfRef.current) return;
    const { default: html2pdf } = await import("html2pdf.js");
    toast.loading("Generando PDF...", { id: "pdf" });
    try {
      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `${portal.slug}-reporte-${fromDate}_a_${toDate}.pdf`,
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      } as any).from(pdfRef.current).save();
      toast.success("PDF descargado", { id: "pdf" });
    } catch (e: any) {
      toast.error("No se pudo generar el PDF", { id: "pdf" });
    }
  };

  const fmtDate = (s: string) =>
    new Date(s + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  const fmtWeek = (s: string) => {
    const start = new Date(s + "T00:00:00");
    const end = new Date(start); end.setDate(end.getDate() + 6);
    return `Semana del ${start.toLocaleDateString("es-MX", { day: "numeric", month: "short" })} al ${end.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}`;
  };

  if (denied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="glass rounded-xl p-10 text-center space-y-3 max-w-md">
          <ShieldAlert className="w-10 h-10 text-coral mx-auto" />
          <h2 className="text-lg font-semibold">Tu cuenta no tiene acceso a este portal</h2>
          <p className="text-sm text-muted-foreground">Solicita a KiMedia que habilite tu correo.</p>
          <Button size="sm" variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Salir
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />

      <header className="relative border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-display font-bold truncate">{portal.displayName}</h1>
            <p className="text-xs text-muted-foreground truncate">{portal.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadPdf}>
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Global date filter */}
        <div className="glass rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Rango
          </div>
          <div className="flex flex-wrap gap-2">
            {RANGES.map(r => (
              <Button
                key={r.key}
                size="sm"
                variant={rangeKey === r.key && !customFrom ? "default" : "outline"}
                onClick={() => { setRangeKey(r.key); setCustomFrom(""); setCustomTo(""); }}
              >{r.label}</Button>
            ))}
          </div>
          <div className="flex items-center gap-2 md:ml-auto">
            <Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="w-40" />
            <span className="text-muted-foreground text-sm">→</span>
            <Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="w-40" />
          </div>
        </div>

        <Tabs defaultValue="recomendaciones">
          <TabsList className="w-full flex flex-wrap justify-start">
            <TabsTrigger value="recomendaciones"><Lightbulb className="w-4 h-4 mr-2" />Recomendaciones</TabsTrigger>
            <TabsTrigger value="reportes"><FileText className="w-4 h-4 mr-2" />Reportes</TabsTrigger>
            <TabsTrigger value="performance"><BarChart3 className="w-4 h-4 mr-2" />Performance</TabsTrigger>
            <TabsTrigger value="listening"><MessageSquare className="w-4 h-4 mr-2" />Listening</TabsTrigger>
          </TabsList>

          {/* Recomendaciones */}
          <TabsContent value="recomendaciones" className="space-y-3 mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Cargando...</div>
            ) : recs.length === 0 ? (
              <div className="glass rounded-xl p-10 text-center text-muted-foreground">
                Sin recomendaciones para este rango.
              </div>
            ) : recs.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={PRIORITY_BADGE[w.priority] ?? "bg-muted"}>
                    Prioridad {w.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{fmtWeek(w.week_start)}</span>
                </div>
                {w.for_client_md ? (
                  <div className="prose prose-invert max-w-none prose-p:my-2 prose-li:my-0 prose-headings:font-display prose-a:text-coral">
                    <ReactMarkdown>{w.for_client_md}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sin nota esta semana.</p>
                )}
              </motion.div>
            ))}
          </TabsContent>

          {/* Reportes narrativos */}
          <TabsContent value="reportes" className="space-y-3 mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Cargando...</div>
            ) : reports.length === 0 ? (
              <div className="glass rounded-xl p-10 text-center text-muted-foreground">
                Sin reportes en este rango.
              </div>
            ) : reports.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Link to={`/reporte/${r.id}`} className="block glass hover:glass-strong rounded-xl p-5 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{TYPE_LABEL[r.type] ?? r.type}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {fmtDate(r.report_date)}
                        </span>
                      </div>
                      <h3 className="font-semibold group-hover:text-coral transition-colors truncate">{r.title}</h3>
                      {r.summary_md && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.summary_md.slice(0, 200)}</p>}
                    </div>
                    <FileText className="w-5 h-5 text-muted-foreground group-hover:text-coral flex-shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </TabsContent>

          {/* Performance placeholder */}
          <TabsContent value="performance" className="mt-6">
            <div className="glass rounded-xl p-10 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-coral mx-auto" />
              <h3 className="font-semibold">Panel de performance en camino</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Muy pronto verás aquí las gráficas de redes sociales (Fanpage Karma) y ads (Meta, X, otras)
                del rango seleccionado, con evidencia visual.
              </p>
            </div>
          </TabsContent>

          {/* Listening placeholder */}
          <TabsContent value="listening" className="mt-6">
            <div className="glass rounded-xl p-10 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-coral mx-auto" />
              <h3 className="font-semibold">Bitácora de escucha</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                El histórico diario de WhatsApp se integra aquí en la siguiente entrega.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Hidden PDF template */}
        <div className="fixed -left-[10000px] top-0" aria-hidden>
          <div ref={pdfRef} style={{ width: 780, padding: 32, background: "#ffffff", color: "#0f172a", fontFamily: "system-ui, sans-serif" }}>
            <div style={{ borderBottom: "3px solid #ef6a4d", paddingBottom: 16, marginBottom: 24 }}>
              <h1 style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>{portal.displayName}</h1>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
                Reporte {fmtDate(fromDate)} — {fmtDate(toDate)}
              </p>
            </div>

            <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 12 }}>Recomendaciones semanales</h2>
            {recs.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Sin recomendaciones en el rango.</p>
            ) : recs.map(w => (
              <div key={w.id} style={{ marginBottom: 16, padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, pageBreakInside: "avoid" }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>
                  {fmtWeek(w.week_start)} · Prioridad {w.priority}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {w.for_client_md ?? "—"}
                </div>
              </div>
            ))}

            <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 12, pageBreakBefore: "auto" }}>Reportes publicados</h2>
            {reports.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Sin reportes en el rango.</p>
            ) : reports.map(r => (
              <div key={r.id} style={{ marginBottom: 14, pageBreakInside: "avoid" }}>
                <div style={{ fontSize: 11, color: "#64748b" }}>{fmtDate(r.report_date)} · {TYPE_LABEL[r.type] ?? r.type}</div>
                <div style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 4px" }}>{r.title}</div>
                {r.summary_md && (
                  <div style={{ fontSize: 12, color: "#334155", whiteSpace: "pre-wrap" }}>
                    {r.summary_md.slice(0, 600)}{r.summary_md.length > 600 ? "..." : ""}
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: 32, paddingTop: 12, borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: 10, color: "#94a3b8" }}>
              powered by KiMedia
            </div>
          </div>
        </div>
      </main>

      <footer className="relative py-8 text-center text-xs text-muted-foreground/60">
        powered by KiMedia
      </footer>
    </div>
  );
}