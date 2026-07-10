import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, FileText, ShieldAlert, Download, Sparkles,
  BarChart3, Lightbulb, History, ChevronLeft, ChevronRight,
  AlertTriangle, TrendingUp, MessageCircle, Sun, Moon, CalendarRange, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientPortalConfig } from "@/lib/clientPortal";
import PortalAnalysis from "./PortalAnalysis";
import PortalPdfTemplate from "./PortalPdfTemplate";
import type { DateRange } from "react-day-picker";

type Analysis = {
  id: string;
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

type Report = {
  id: string;
  report_date: string;
  title: string;
  type: string;
  summary_md: string | null;
};

const COMPARE_OPTIONS = [
  { key: "week", label: "Solo esta semana", weeks: 1 },
  { key: "4w", label: "Últimas 4 semanas", weeks: 4 },
  { key: "12w", label: "Últimas 12 semanas", weeks: 12 },
];

const TYPE_LABEL: Record<string, string> = {
  daily: "Análisis diario",
  weekly: "Reporte semanal",
  benchmark: "Benchmark",
  other: "Otro",
};

function fmtDate(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}
function fmtWeekShort(start: string, end: string) {
  const a = new Date(start + "T00:00:00");
  const b = new Date(end + "T00:00:00");
  const sameMonth = a.getMonth() === b.getMonth();
  const sa = a.toLocaleDateString("es-MX", { day: "numeric", month: sameMonth ? undefined : "short" });
  const sb = b.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
  return `${sa} – ${sb}`;
}

export default function PortalHome({ portal }: { portal: ClientPortalConfig }) {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState<string | null>(portal.logoUrl ?? null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [compareKey, setCompareKey] = useState("week");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [rangeAgg, setRangeAgg] = useState<{
    totalMentions: number;
    entriesInRange: number;
    sent: { positivo: number; neutral: number; negativo: number; crisis: number };
  }>({ totalMentions: 0, entriesInRange: 0, sent: { positivo: 0, neutral: 0, negativo: 0, crisis: 0 } });
  const [prevRangeAgg, setPrevRangeAgg] = useState<{ totalMentions: number } | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("portal-theme") as "dark" | "light") || "dark";
  });
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("portal-theme", theme);
    const root = document.documentElement;
    if (theme === "light") root.classList.add("theme-light");
    else root.classList.remove("theme-light");
    return () => { root.classList.remove("theme-light"); };
  }, [theme]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [c, a, r] = await Promise.all([
        supabase.from("clients").select("logo_url").eq("id", portal.clientId).maybeSingle(),
        supabase
          .from("client_portal_listening_analyses")
          .select("id, week_start, week_end, entries_count, executive_summary, key_findings, alerts, recommendations_client, sentiment_breakdown, top_topics, top_mentions")
          .eq("client_id", portal.clientId)
          .order("week_start", { ascending: false })
          .limit(52),
        supabase
          .from("client_portal_reports")
          .select("id, report_date, title, type, summary_md")
          .eq("client_id", portal.clientId)
          .order("report_date", { ascending: false })
          .limit(50),
      ]);
      if (c.data?.logo_url) setLogoUrl(c.data.logo_url);
      const list = ((a.data ?? []) as unknown) as Analysis[];
      setAnalyses(list);
      setReports((r.data ?? []) as Report[]);
      if (list.length > 0) setSelectedWeek(list[0].week_start);

      if (list.length === 0 && (r.data ?? []).length === 0) {
        const { data: access } = await supabase
          .from("client_access").select("id").eq("client_id", portal.clientId).limit(1);
        if (!access || access.length === 0) setDenied(true);
      }
      setLoading(false);
    })();
  }, [portal.clientId]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  const currentIdx = useMemo(
    () => analyses.findIndex(a => a.week_start === selectedWeek),
    [analyses, selectedWeek]
  );
  const current = currentIdx >= 0 ? analyses[currentIdx] : null;
  const prevWeek = currentIdx >= 0 && currentIdx < analyses.length - 1 ? analyses[currentIdx + 1] : null;

  const { fromDate, toDate } = useMemo(() => {
    if (customRange?.from && customRange?.to) {
      return {
        fromDate: customRange.from.toISOString().slice(0, 10),
        toDate: customRange.to.toISOString().slice(0, 10),
      };
    }
    if (!current) return { fromDate: "1900-01-01", toDate: "2999-12-31" };
    const weeks = COMPARE_OPTIONS.find(o => o.key === compareKey)?.weeks ?? 1;
    if (weeks === 1) return { fromDate: current.week_start, toDate: current.week_end };
    const end = new Date(current.week_end + "T00:00:00");
    const start = new Date(end); start.setDate(start.getDate() - 7 * weeks + 1);
    return { fromDate: start.toISOString().slice(0, 10), toDate: current.week_end };
  }, [current, compareKey, customRange]);

  // Aggregate real numbers directly from analyzed entries in the selected range
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("client_portal_listening_entries")
        .select("entry_date, total_mentions, sentiment_counts, sentiment")
        .eq("client_id", portal.clientId)
        .gte("entry_date", fromDate).lte("entry_date", toDate)
        .not("analyzed_at", "is", null)
        .limit(500);
      const rows = (data ?? []) as any[];
      const sent = { positivo: 0, neutral: 0, negativo: 0, crisis: 0 };
      let totalMentions = 0;
      for (const r of rows) {
        const tm = Number(r.total_mentions ?? 0) || 0;
        totalMentions += tm;
        const sc = r.sentiment_counts ?? {};
        const hasCounts = sc && (sc.positivo || sc.neutral || sc.negativo || sc.crisis);
        if (hasCounts) {
          sent.positivo += Number(sc.positivo ?? 0) || 0;
          sent.neutral  += Number(sc.neutral ?? 0)  || 0;
          sent.negativo += Number(sc.negativo ?? 0) || 0;
          sent.crisis   += Number(sc.crisis ?? 0)   || 0;
        } else if (r.sentiment) {
          // fallback: use daily overall sentiment weighted by total_mentions (or 1)
          const w = tm || 1;
          (sent as any)[r.sentiment] = ((sent as any)[r.sentiment] ?? 0) + w;
        }
      }
      setRangeAgg({ totalMentions, entriesInRange: rows.length, sent });

      // previous equivalent range for delta
      const from = new Date(fromDate + "T00:00:00");
      const to = new Date(toDate + "T00:00:00");
      const days = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
      const prevTo = new Date(from); prevTo.setDate(prevTo.getDate() - 1);
      const prevFrom = new Date(prevTo); prevFrom.setDate(prevFrom.getDate() - days + 1);
      const { data: prev } = await supabase
        .from("client_portal_listening_entries")
        .select("total_mentions")
        .eq("client_id", portal.clientId)
        .gte("entry_date", prevFrom.toISOString().slice(0, 10))
        .lte("entry_date", prevTo.toISOString().slice(0, 10))
        .not("analyzed_at", "is", null);
      const prevTotal = ((prev ?? []) as any[]).reduce((s, r) => s + (Number(r.total_mentions ?? 0) || 0), 0);
      setPrevRangeAgg({ totalMentions: prevTotal });
    })();
  }, [portal.clientId, fromDate, toDate]);

  const sentTotals = useMemo(() => {
    const s = rangeAgg.sent;
    const total = s.positivo + s.neutral + s.negativo + s.crisis;
    return { total, ...s };
  }, [rangeAgg]);

  const deltaMentions = useMemo(() => {
    if (!prevRangeAgg) return null;
    const d = rangeAgg.totalMentions - prevRangeAgg.totalMentions;
    const pct = prevRangeAgg.totalMentions ? Math.round((d / prevRangeAgg.totalMentions) * 100) : null;
    return { d, pct };
  }, [rangeAgg, prevRangeAgg]);

  const goPrev = () => { if (currentIdx < analyses.length - 1) setSelectedWeek(analyses[currentIdx + 1].week_start); };
  const goNext = () => { if (currentIdx > 0) setSelectedWeek(analyses[currentIdx - 1].week_start); };

  const downloadPdf = async () => {
    if (!pdfRef.current) return;
    const { default: html2pdf } = await import("html2pdf.js");
    toast.loading("Generando PDF...", { id: "pdf" });
    try {
      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename: `${portal.slug}-${current?.week_start ?? "reporte"}.pdf`,
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      } as any).from(pdfRef.current).save();
      toast.success("PDF descargado", { id: "pdf" });
    } catch {
      toast.error("No se pudo generar el PDF", { id: "pdf" });
    }
  };

  const initials = portal.displayName.slice(0, 2).toUpperCase();

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

  const weekLabel = current ? fmtWeekShort(current.week_start, current.week_end) : "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-border/50 bg-background/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-coral/20 to-coral/5 border border-coral/20 flex items-center justify-center shrink-0 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={portal.displayName} className="w-full h-full object-contain p-1.5" />
              ) : (
                <span className="font-display font-bold text-coral text-sm">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Inteligencia digital</div>
              <h1 className="text-lg font-display font-bold truncate leading-tight">{portal.displayName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadPdf} disabled={!current}>
              <Download className="w-4 h-4 mr-2" /> PDF de la semana
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} title="Cambiar tema" className="h-9 w-9">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Week bar */}
        <div className="glass rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goPrev} disabled={currentIdx >= analyses.length - 1} className="h-9 w-9">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-[220px]">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Semana analizada</div>
              <div className="text-base font-semibold font-display leading-tight">{current ? weekLabel : "—"}</div>
            </div>
            <Button variant="outline" size="icon" onClick={goNext} disabled={currentIdx <= 0} className="h-9 w-9">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select value={selectedWeek ?? ""} onValueChange={(v) => setSelectedWeek(v)} disabled={analyses.length === 0}>
              <SelectTrigger className="w-[240px] h-9"><SelectValue placeholder="Elige semana" /></SelectTrigger>
              <SelectContent>
                {analyses.map(a => (
                  <SelectItem key={a.id} value={a.week_start}>
                    {fmtWeekShort(a.week_start, a.week_end)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={compareKey} onValueChange={(v) => { setCompareKey(v); setCustomRange(undefined); }} disabled={!!customRange?.from && !!customRange?.to}>
              <SelectTrigger className="w-[190px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COMPARE_OPTIONS.map(o => (
                  <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={customRange?.from && customRange?.to ? "default" : "outline"}
                  size="sm"
                  className="h-9"
                >
                  <CalendarRange className="w-4 h-4 mr-2" />
                  {customRange?.from && customRange?.to
                    ? `${customRange.from.toLocaleDateString("es-MX", { day: "numeric", month: "short" })} – ${customRange.to.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}`
                    : "Rango personalizado"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={customRange}
                  onSelect={setCustomRange}
                  numberOfMonths={2}
                  className={cn("p-3 pointer-events-auto")}
                />
                {customRange?.from && (
                  <div className="p-2 border-t border-border flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setCustomRange(undefined)}>
                      <X className="w-3 h-3 mr-1" /> Limpiar
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : analyses.length === 0 ? (
          <div className="glass rounded-2xl p-14 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-coral mx-auto" />
            <h3 className="font-semibold">Aún no hay análisis publicado</h3>
            <p className="text-sm text-muted-foreground">El equipo KiMedia procesará las próximas entradas y aparecerán aquí.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedWeek}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* KPI cards */}
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                <KpiCard
                  label="Menciones analizadas"
                  value={rangeAgg.totalMentions || rangeAgg.entriesInRange || 0}
                  delta={deltaMentions ? `${deltaMentions.d > 0 ? "+" : ""}${deltaMentions.d}${deltaMentions.pct !== null ? ` (${deltaMentions.pct > 0 ? "+" : ""}${deltaMentions.pct}%)` : ""}` : null}
                  positive={deltaMentions ? deltaMentions.d >= 0 : undefined}
                />
                <KpiCard
                  label="Sentimiento positivo"
                  value={sentTotals.total ? `${Math.round((sentTotals.positivo / sentTotals.total) * 100)}%` : "—"}
                  accent="emerald"
                />
                <KpiCard
                  label="Sentimiento negativo"
                  value={sentTotals.total ? `${Math.round((sentTotals.negativo / sentTotals.total) * 100)}%` : "—"}
                  accent="amber"
                />
                <KpiCard
                  label="Alertas de crisis"
                  value={sentTotals.crisis}
                  accent="rose"
                />
              </div>

              <Tabs defaultValue="panorama">
                <TabsList className="bg-background/50 backdrop-blur border border-border/60 rounded-xl p-1 h-auto">
                  <TabsTrigger value="panorama" className="rounded-lg data-[state=active]:bg-coral/10 data-[state=active]:text-coral"><BarChart3 className="w-4 h-4 mr-2" />Panorama</TabsTrigger>
                  <TabsTrigger value="recomendaciones" className="rounded-lg data-[state=active]:bg-coral/10 data-[state=active]:text-coral"><Lightbulb className="w-4 h-4 mr-2" />Recomendaciones</TabsTrigger>
                  <TabsTrigger value="historico" className="rounded-lg data-[state=active]:bg-coral/10 data-[state=active]:text-coral"><History className="w-4 h-4 mr-2" />Histórico</TabsTrigger>
                </TabsList>

                {/* Panorama: resumen ejecutivo + alertas + hallazgos + análisis en un solo tab */}
                <TabsContent value="panorama" className="mt-5 space-y-5">
                  {current?.executive_summary && (
                    <div className="glass rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-coral" />
                        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Resumen ejecutivo</span>
                      </div>
                      <p className="text-[15px] leading-relaxed">{current.executive_summary}</p>
                      <p className="text-[11px] text-muted-foreground mt-3 italic">
                        Nota: los conteos y gráficas de abajo son la fuente de verdad — reflejan cada mención individual detectada en la bitácora.
                      </p>
                    </div>
                  )}

                  {current?.alerts && current.alerts.length > 0 && (
                    <div className="grid gap-2">
                      {current.alerts.map((a: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/30">
                          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="destructive" className="text-[10px] uppercase">{a.level ?? "alerta"}</Badge>
                            </div>
                            <p className="text-sm">{a.detail ?? a.summary ?? String(a)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {current?.key_findings && current.key_findings.length > 0 && (
                    <div>
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Hallazgos clave</div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {current.key_findings.map((f: any, i: number) => (
                          <div key={i} className="glass rounded-xl p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <TrendingUp className="w-4 h-4 text-coral shrink-0" />
                                <span className="text-sm font-semibold truncate">{f.title ?? f.headline}</span>
                              </div>
                              {f.impact && <Badge variant="outline" className="text-[10px] shrink-0">{f.impact}</Badge>}
                            </div>
                            {f.detail && <p className="text-xs text-muted-foreground leading-relaxed">{f.detail}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Análisis detallado del período</div>
                    <PortalAnalysis clientId={portal.clientId} fromDate={fromDate} toDate={toDate} />
                  </div>
                </TabsContent>

                {/* Recomendaciones — solo semana seleccionada */}
                <TabsContent value="recomendaciones" className="mt-5">
                  {current?.recommendations_client ? (
                    <div className="glass rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-4 h-4 text-coral" />
                        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Recomendaciones · {weekLabel}</span>
                      </div>
                      <div className="prose prose-invert max-w-none prose-p:my-2 prose-li:my-1 prose-headings:font-display prose-a:text-coral">
                        <ReactMarkdown>{current.recommendations_client}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="glass rounded-2xl p-10 text-center text-muted-foreground text-sm">
                      Sin recomendaciones publicadas para esta semana.
                    </div>
                  )}
                </TabsContent>

                {/* Histórico */}
                <TabsContent value="historico" className="mt-5 space-y-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Semanas anteriores</div>
                    <div className="grid gap-2">
                      {analyses.map((a, i) => (
                        <button
                          key={a.id}
                          onClick={() => setSelectedWeek(a.week_start)}
                          className={`text-left glass hover:glass-strong rounded-xl p-4 transition-all group border ${a.week_start === selectedWeek ? "border-coral/50 bg-coral/5" : "border-transparent"}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold">{fmtWeekShort(a.week_start, a.week_end)}</span>
                                <Badge variant="secondary" className="text-[10px]"><MessageCircle className="w-3 h-3 mr-1" />{a.entries_count}</Badge>
                                {i === 0 && <Badge className="text-[10px] bg-coral/15 text-coral border-coral/30">Última</Badge>}
                              </div>
                              {a.executive_summary && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{a.executive_summary}</p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-coral shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {reports.length > 0 && (
                    <div>
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3 mt-6">Reportes publicados</div>
                      <div className="grid gap-2">
                        {reports.map(r => (
                          <Link key={r.id} to={`/reporte/${r.id}`} className="block glass hover:glass-strong rounded-xl p-4 transition-all group">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-muted-foreground group-hover:text-coral" />
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold truncate group-hover:text-coral transition-colors">{r.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {fmtDate(r.report_date)} · {TYPE_LABEL[r.type] ?? r.type}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Hidden PDF template */}
        <div className="fixed -left-[10000px] top-0" aria-hidden>
          <PortalPdfTemplate ref={pdfRef} portal={portal} logoUrl={logoUrl} analysis={current} weekLabel={weekLabel} />
        </div>
      </main>

      <footer className="relative py-8 text-center text-xs text-muted-foreground/60">
        powered by KiMedia
      </footer>
    </div>
  );
}

function KpiCard({
  label, value, delta, positive, accent = "coral",
}: {
  label: string; value: React.ReactNode; delta?: string | null; positive?: boolean;
  accent?: "coral" | "emerald" | "amber" | "rose";
}) {
  const accentClass = {
    coral: "text-coral",
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    rose: "text-rose-500",
  }[accent];
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-3xl font-display font-bold mt-1 ${accentClass}`}>{value}</div>
      {delta && (
        <div className={`text-[11px] mt-1 ${positive === undefined ? "text-muted-foreground" : positive ? "text-emerald-500" : "text-rose-500"}`}>
          {delta} vs semana previa
        </div>
      )}
    </div>
  );
}