import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import { BarChart3, Download, TrendingUp, TrendingDown, PieChart as PieIcon, Table as TableIcon, Newspaper, Trophy, Target, AlertTriangle, Sparkles, Minus, ArrowUp, ArrowDown, CalendarIcon, Lightbulb } from "lucide-react";

type Competitor = { id: string; name: string; network: string; brand_color: string; active: boolean; is_client: boolean; image_url: string | null; external_url: string | null };
type Period = { id: string; period_label: string; period_start: string; period_end: string };
type Metric = { id: string; period_id: string; competitor_id: string; network: string; performance_index: number | null; followers: number | null; follower_growth_rate: number | null; engagement_rate: number | null; posts_per_day: number | null; reach_per_day: number | null; interaction_per_impression: number | null };
type Daily = { period_id: string; competitor_id: string; network: string; day: string; delta: number };
type Post = { id: string; period_id: string; competitor_id: string | null; network: string; profile_name: string; posted_at: string | null; message: string | null; likes: number | null; comments: number | null; interactions: number | null; engagement_rate: number | null; link: string | null; image_link: string | null };

const METRICS: { key: keyof Metric; label: string; fmt: (n: number) => string }[] = [
  { key: "followers", label: "Seguidores", fmt: (n) => n.toLocaleString("es-MX") },
  { key: "engagement_rate", label: "Tasa de interacción", fmt: (n) => (n * 100).toFixed(2) + "%" },
  { key: "follower_growth_rate", label: "Crecimiento de seguidores / día", fmt: (n) => (n * 100).toFixed(3) + "%" },
  { key: "posts_per_day", label: "Publicaciones por día", fmt: (n) => n.toFixed(2) },
  { key: "performance_index", label: "Índice de rendimiento", fmt: (n) => n.toFixed(2) },
  { key: "interaction_per_impression", label: "Interacción / impresión", fmt: (n) => (n * 100).toFixed(3) + "%" },
];

export default function PortalBenchmark({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [daily, setDaily] = useState<Daily[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedMetric, setSelectedMetric] = useState<string>("followers");
  const [networkFilter, setNetworkFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [c, p] = await Promise.all([
        supabase.from("client_portal_benchmark_competitors").select("*").eq("client_id", clientId).eq("active", true).order("is_client", { ascending: false }).order("name"),
        supabase.from("client_portal_benchmark_periods").select("*").eq("client_id", clientId).order("period_start", { ascending: true }),
      ]);
      const ps = (p.data ?? []) as Period[];
      setCompetitors((c.data ?? []) as Competitor[]);
      setPeriods(ps);
      if (ps.length) {
        setSelectedPeriod(ps[ps.length - 1].id);
        const periodIds = ps.map((x) => x.id);
        const [m, d, po] = await Promise.all([
          supabase.from("client_portal_benchmark_metrics").select("*").in("period_id", periodIds),
          supabase.from("client_portal_benchmark_follower_daily").select("*").in("period_id", periodIds),
          supabase.from("client_portal_benchmark_posts").select("*").in("period_id", periodIds).order("interactions", { ascending: false }).limit(200),
        ]);
        setMetrics((m.data ?? []) as Metric[]);
        setDaily((d.data ?? []) as Daily[]);
        setPosts((po.data ?? []) as Post[]);
      }
      setLoading(false);
    })();
  }, [clientId]);

  const compMap = useMemo(() => new Map(competitors.map((c) => [c.id, c])), [competitors]);
  const currentPeriod = periods.find((p) => p.id === selectedPeriod) ?? null;
  const currentMetric = METRICS.find((m) => m.key === selectedMetric) ?? METRICS[0];

  const networks = useMemo(() => {
    const set = new Set<string>();
    metrics.forEach((m) => set.add(m.network));
    return ["all", ...Array.from(set).sort()];
  }, [metrics]);

  const periodMetrics = useMemo(() => {
    return metrics.filter((m) => m.period_id === selectedPeriod && (networkFilter === "all" || m.network === networkFilter));
  }, [metrics, selectedPeriod, networkFilter]);

  // Ranking
  const rankingData = useMemo(() => {
    return periodMetrics
      .map((m) => {
        const c = compMap.get(m.competitor_id);
        const v = Number(m[selectedMetric as keyof Metric] ?? 0);
        return { brand: c ? `${c.name}${networkFilter === "all" ? ` · ${m.network}` : ""}` : m.competitor_id, value: v, color: c?.brand_color ?? "#94a3b8", isClient: !!c?.is_client };
      })
      .filter((r) => Number.isFinite(r.value) && r.value !== 0)
      .sort((a, b) => b.value - a.value);
  }, [periodMetrics, selectedMetric, compMap, networkFilter]);

  const shareTotal = rankingData.reduce((a, b) => a + b.value, 0);

  // Evolution (usa periodos: métrica agregada por periodo/competidor)
  const evolutionData = useMemo(() => {
    if (!periods.length) return [];
    const byPeriod = new Map<string, Record<string, any>>();
    periods.forEach((p) => byPeriod.set(p.id, { period: p.period_label }));
    for (const m of metrics) {
      if (networkFilter !== "all" && m.network !== networkFilter) continue;
      const row = byPeriod.get(m.period_id);
      if (!row) continue;
      const c = compMap.get(m.competitor_id);
      if (!c) continue;
      const key = `${c.name}${networkFilter === "all" ? ` · ${m.network}` : ""}`;
      const v = Number(m[selectedMetric as keyof Metric] ?? 0);
      // If multiple networks under "all", sum for the same competitor
      row[key] = (row[key] ?? 0) + (Number.isFinite(v) ? v : 0);
    }
    return Array.from(byPeriod.values());
  }, [metrics, periods, selectedMetric, compMap, networkFilter]);

  const brandsList = useMemo(() => {
    const seen = new Map<string, { key: string; color: string; isClient: boolean }>();
    for (const m of metrics) {
      if (networkFilter !== "all" && m.network !== networkFilter) continue;
      const c = compMap.get(m.competitor_id);
      if (!c) continue;
      const key = `${c.name}${networkFilter === "all" ? ` · ${m.network}` : ""}`;
      if (!seen.has(key)) seen.set(key, { key, color: c.brand_color, isClient: c.is_client });
    }
    return Array.from(seen.values()).sort((a, b) => (a.isClient === b.isClient ? 0 : a.isClient ? -1 : 1));
  }, [metrics, compMap, networkFilter]);

  // Daily followers evolution (line chart) — para el periodo seleccionado
  const dailyEvolution = useMemo(() => {
    if (!selectedPeriod) return [];
    const days = new Set<string>();
    const byDay = new Map<string, Record<string, any>>();
    for (const d of daily) {
      if (d.period_id !== selectedPeriod) continue;
      if (networkFilter !== "all" && d.network !== networkFilter) continue;
      days.add(d.day);
      if (!byDay.has(d.day)) byDay.set(d.day, { day: d.day });
      const c = compMap.get(d.competitor_id);
      if (!c) continue;
      const key = `${c.name}${networkFilter === "all" ? ` · ${d.network}` : ""}`;
      byDay.get(d.day)![key] = (byDay.get(d.day)![key] ?? 0) + d.delta;
    }
    return Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day));
  }, [daily, selectedPeriod, networkFilter, compMap]);

  // Top posts
  const topPosts = useMemo(() => {
    return posts
      .filter((p) => p.period_id === selectedPeriod && (networkFilter === "all" || p.network === networkFilter))
      .sort((a, b) => (b.interactions ?? 0) - (a.interactions ?? 0))
      .slice(0, 20);
  }, [posts, selectedPeriod, networkFilter]);

  // Identify client competitor(s)
  const clientCompetitorIds = useMemo(
    () => new Set(competitors.filter((c) => c.is_client).map((c) => c.id)),
    [competitors],
  );

  // Previous period (chronological)
  const prevPeriod = useMemo(() => {
    const idx = periods.findIndex((p) => p.id === selectedPeriod);
    return idx > 0 ? periods[idx - 1] : null;
  }, [periods, selectedPeriod]);

  // Insights layer — deterministic templates, no LLM
  const insights = useMemo(() => {
    const netFilter = (m: { network: string }) => networkFilter === "all" || m.network === networkFilter;
    const currentAll = metrics.filter((m) => m.period_id === selectedPeriod && netFilter(m));
    const prevAll = prevPeriod ? metrics.filter((m) => m.period_id === prevPeriod.id && netFilter(m)) : [];

    // Aggregate helper: value by competitor for a metric key (sum across networks when "all")
    const aggByCompetitor = (rows: Metric[], key: keyof Metric) => {
      const map = new Map<string, number>();
      for (const r of rows) {
        const v = Number(r[key] ?? 0);
        if (!Number.isFinite(v)) continue;
        map.set(r.competitor_id, (map.get(r.competitor_id) ?? 0) + v);
      }
      return map;
    };

    // For rate-type metrics, averaging is more meaningful than summing; but since we filter by network or select "all",
    // and each competitor typically has one row per network, sum ≈ total presence. We keep sum for scale metrics
    // (followers, posts_per_day, reach_per_day) and average across networks for rates.
    const isRate = (k: string) => k === "engagement_rate" || k === "follower_growth_rate" || k === "interaction_per_impression" || k === "performance_index";
    const aggBy = (rows: Metric[], key: keyof Metric) => {
      if (!isRate(key as string)) return aggByCompetitor(rows, key);
      const sums = new Map<string, { s: number; n: number }>();
      for (const r of rows) {
        const v = Number(r[key] ?? NaN);
        if (!Number.isFinite(v)) continue;
        const e = sums.get(r.competitor_id) ?? { s: 0, n: 0 };
        e.s += v; e.n += 1;
        sums.set(r.competitor_id, e);
      }
      const out = new Map<string, number>();
      sums.forEach((v, k) => out.set(k, v.n ? v.s / v.n : 0));
      return out;
    };

    // Position of client for a metric (rank #N of M)
    const rankFor = (rows: Metric[], key: keyof Metric) => {
      const m = aggBy(rows, key);
      const arr = Array.from(m.entries()).filter(([, v]) => Number.isFinite(v) && v !== 0).sort((a, b) => b[1] - a[1]);
      const total = arr.length;
      let clientRank: number | null = null;
      let clientVal: number | null = null;
      for (let i = 0; i < arr.length; i++) {
        if (clientCompetitorIds.has(arr[i][0])) { clientRank = i + 1; clientVal = arr[i][1]; break; }
      }
      return { rank: clientRank, total, value: clientVal };
    };

    // Client value + previous value for a metric
    const clientValue = (rows: Metric[], key: keyof Metric) => {
      const m = aggBy(rows, key);
      let v = 0; let found = false;
      for (const id of clientCompetitorIds) {
        if (m.has(id)) { v += m.get(id)!; found = true; }
      }
      return found ? v : null;
    };

    // Sector average (excluding client)
    const sectorAvg = (rows: Metric[], key: keyof Metric) => {
      const m = aggBy(rows, key);
      const vals: number[] = [];
      m.forEach((v, id) => { if (!clientCompetitorIds.has(id) && Number.isFinite(v) && v !== 0) vals.push(v); });
      if (!vals.length) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    };

    const pct = (a: number | null, b: number | null) => {
      if (a == null || b == null || b === 0) return null;
      return (a - b) / Math.abs(b);
    };

    const engagementRank = rankFor(currentAll, "engagement_rate");
    const followersClient = clientValue(currentAll, "followers");
    const followersPrev = clientValue(prevAll, "followers");
    const followersDelta = pct(followersClient, followersPrev);

    const engClient = clientValue(currentAll, "engagement_rate");
    const engPrev = clientValue(prevAll, "engagement_rate");
    const engDelta = pct(engClient, engPrev);

    const engSector = sectorAvg(currentAll, "engagement_rate");
    const engVsSector = pct(engClient, engSector);

    const followersSector = sectorAvg(currentAll, "followers");
    const followersVsSector = pct(followersClient, followersSector);

    // Best post of the period (client) by interactions
    const clientPosts = posts.filter((p) => p.period_id === selectedPeriod && p.competitor_id && clientCompetitorIds.has(p.competitor_id) && (networkFilter === "all" || p.network === networkFilter));
    const bestPost = clientPosts.slice().sort((a, b) => (b.interactions ?? 0) - (a.interactions ?? 0))[0] ?? null;

    // Streak on followers growth (consecutive positive months)
    let streak = 0;
    if (periods.length > 1) {
      for (let i = periods.length - 1; i > 0; i--) {
        const curr = clientValue(metrics.filter((m) => m.period_id === periods[i].id && netFilter(m)), "followers");
        const prev = clientValue(metrics.filter((m) => m.period_id === periods[i - 1].id && netFilter(m)), "followers");
        const d = pct(curr, prev);
        if (d != null && d > 0) streak++;
        else break;
      }
    }

    // Metric where client gained/lost most vs previous period
    let bestMetric: { key: string; label: string; delta: number } | null = null;
    let worstMetric: { key: string; label: string; delta: number } | null = null;
    for (const m of METRICS) {
      const c = clientValue(currentAll, m.key);
      const p = clientValue(prevAll, m.key);
      const d = pct(c, p);
      if (d == null) continue;
      if (!bestMetric || d > bestMetric.delta) bestMetric = { key: m.key as string, label: m.label, delta: d };
      if (!worstMetric || d < worstMetric.delta) worstMetric = { key: m.key as string, label: m.label, delta: d };
    }

    // Headline
    let headline = `${clientName} tiene datos cargados para ${currentPeriod?.period_label ?? "este periodo"}.`;
    if (engDelta != null && engSector != null && engVsSector != null) {
      const sectorDelta = (() => {
        const sc = sectorAvg(currentAll, "engagement_rate");
        const sp = sectorAvg(prevAll, "engagement_rate");
        return pct(sc, sp);
      })();
      if (sectorDelta != null) {
        headline = `${clientName} ${engDelta >= 0 ? "subió" : "cayó"} ${Math.abs(engDelta * 100).toFixed(1)}% en engagement mientras el sector ${sectorDelta >= 0 ? "subió" : "cayó"} ${Math.abs(sectorDelta * 100).toFixed(1)}%.`;
      } else {
        headline = `${clientName} ${engDelta >= 0 ? "subió" : "cayó"} ${Math.abs(engDelta * 100).toFixed(1)}% en engagement vs el mes anterior.`;
      }
    } else if (followersDelta != null) {
      headline = `${clientName} ${followersDelta >= 0 ? "creció" : "perdió"} ${Math.abs(followersDelta * 100).toFixed(1)}% en seguidores vs el mes anterior.`;
    }

    // Alerts
    const alerts: string[] = [];
    for (const m of METRICS) {
      const c = clientValue(currentAll, m.key);
      const p = clientValue(prevAll, m.key);
      const d = pct(c, p);
      if (d != null && d < -0.15) alerts.push(`${m.label} cayó ${(d * 100).toFixed(1)}% vs mes anterior.`);
    }
    if (engagementRank.rank && engagementRank.rank > 3) {
      alerts.push(`Están fuera del top 3 en engagement (#${engagementRank.rank} de ${engagementRank.total}).`);
    }

    return {
      engagementRank,
      followersClient, followersDelta, followersVsSector,
      engClient, engDelta, engVsSector, engSector,
      bestPost,
      streak,
      bestMetric, worstMetric,
      headline,
      alerts,
    };
  }, [metrics, posts, selectedPeriod, prevPeriod, networkFilter, clientCompetitorIds, clientName, periods, currentPeriod]);

  // Client's own evolution across all periods (for Actinver tab)
  const clientEvolution = useMemo(() => {
    const netFilter = (m: { network: string }) => networkFilter === "all" || m.network === networkFilter;
    return periods.map((p) => {
      const rows = metrics.filter((m) => m.period_id === p.id && netFilter(m) && clientCompetitorIds.has(m.competitor_id));
      const row: Record<string, any> = { period: p.period_label };
      for (const M of METRICS) {
        let sum = 0, count = 0;
        for (const r of rows) {
          const v = Number(r[M.key] ?? NaN);
          if (Number.isFinite(v)) { sum += v; count++; }
        }
        const isRateKey = M.key === "engagement_rate" || M.key === "follower_growth_rate" || M.key === "interaction_per_impression" || M.key === "performance_index";
        row[M.key as string] = count ? (isRateKey ? sum / count : sum) : null;
      }
      return row;
    });
  }, [periods, metrics, networkFilter, clientCompetitorIds]);

  function exportCsv() {
    const header = ["periodo", "perfil", "red", "seguidores", "crecimiento_rate", "engagement_rate", "posts_dia", "alcance_dia", "indice_rendimiento", "interaccion_por_impresion"];
    const periodMap = new Map(periods.map((p) => [p.id, p]));
    const rows = metrics.map((m) => {
      const p = periodMap.get(m.period_id);
      const c = compMap.get(m.competitor_id);
      return [p?.period_label ?? "", c?.name ?? "", m.network, m.followers ?? "", m.follower_growth_rate ?? "", m.engagement_rate ?? "", m.posts_per_day ?? "", m.reach_per_day ?? "", m.performance_index ?? "", m.interaction_per_impression ?? ""];
    });
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [header.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `benchmark_${clientName}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  if (loading) return <Card className="p-8 text-center text-sm text-muted-foreground">Cargando benchmark…</Card>;
  if (periods.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-display font-bold text-lg">Sin datos de benchmark todavía</h3>
        <p className="text-sm text-muted-foreground mt-2">El equipo de KiMedia aún no ha cargado el primer export de FanpageKarma para este cliente.</p>
      </Card>
    );
  }

  const fmtPct = (v: number | null, digits = 1) => v == null ? "—" : `${v >= 0 ? "+" : ""}${(v * 100).toFixed(digits)}%`;
  const deltaColor = (v: number | null) => v == null ? "text-muted-foreground" : v > 0 ? "text-emerald-500" : v < 0 ? "text-rose-500" : "text-muted-foreground";
  const DeltaIcon = ({ v }: { v: number | null }) => v == null ? <Minus className="w-3.5 h-3.5" /> : v > 0 ? <ArrowUp className="w-3.5 h-3.5" /> : v < 0 ? <ArrowDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />;

  const clientPostsPeriod = posts.filter((p) => p.period_id === selectedPeriod && p.competitor_id && clientCompetitorIds.has(p.competitor_id) && (networkFilter === "all" || p.network === networkFilter))
    .sort((a, b) => (b.interactions ?? 0) - (a.interactions ?? 0));
  const sectorPostsPeriod = posts.filter((p) => p.period_id === selectedPeriod && p.competitor_id && !clientCompetitorIds.has(p.competitor_id) && (networkFilter === "all" || p.network === networkFilter))
    .sort((a, b) => (b.interactions ?? 0) - (a.interactions ?? 0));

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Periodo</span>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{periods.slice().reverse().map((p) => <SelectItem key={p.id} value={p.id}>{p.period_label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Red</span>
          <Select value={networkFilter} onValueChange={setNetworkFilter}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{networks.map((n) => <SelectItem key={n} value={n}>{n === "all" ? "Todas" : n}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-1" />Exportar CSV
          </Button>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY */}
      <Card className="p-5 bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Insight del periodo</p>
            <p className="text-base font-medium leading-snug mt-1">{insights.headline}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-background/60 border border-border/40">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Trophy className="w-3 h-3" />Posición engagement
            </div>
            <div className="mt-1 font-display font-bold text-2xl">
              {insights.engagementRank.rank ? `#${insights.engagementRank.rank}` : "—"}
              {insights.engagementRank.total > 0 && <span className="text-sm text-muted-foreground font-normal"> de {insights.engagementRank.total}</span>}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-background/60 border border-border/40">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <TrendingUp className="w-3 h-3" />Seguidores vs mes ant.
            </div>
            <div className={`mt-1 font-display font-bold text-2xl flex items-center gap-1 ${deltaColor(insights.followersDelta)}`}>
              <DeltaIcon v={insights.followersDelta} />{fmtPct(insights.followersDelta)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-background/60 border border-border/40">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Target className="w-3 h-3" />Engagement vs sector
            </div>
            <div className={`mt-1 font-display font-bold text-2xl flex items-center gap-1 ${deltaColor(insights.engVsSector)}`}>
              <DeltaIcon v={insights.engVsSector} />{fmtPct(insights.engVsSector)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-background/60 border border-border/40">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Newspaper className="w-3 h-3" />Mejor post
            </div>
            <div className="mt-1 font-display font-bold text-2xl tabular-nums">
              {insights.bestPost ? (insights.bestPost.interactions?.toLocaleString("es-MX") ?? "—") : "—"}
            </div>
            <p className="text-[10px] text-muted-foreground truncate">interacciones{insights.bestPost?.network ? ` · ${insights.bestPost.network}` : ""}</p>
          </div>
        </div>
        {insights.alerts.length > 0 && (
          <div className="mt-4 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-500 mb-1">
              <AlertTriangle className="w-3 h-3" />Alertas
            </div>
            <ul className="text-xs space-y-1">
              {insights.alerts.map((a, i) => <li key={i}>• {a}</li>)}
            </ul>
          </div>
        )}
      </Card>

      {/* SUB-TABS */}
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="cliente">{clientName}</TabsTrigger>
          <TabsTrigger value="competidores">Competidores</TabsTrigger>
          <TabsTrigger value="contenido">Contenido</TabsTrigger>
          <TabsTrigger value="datos">Datos</TabsTrigger>
        </TabsList>

        {/* TAB: RESUMEN */}
        <TabsContent value="resumen" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h4 className="font-semibold text-sm">Dónde estamos ganando</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Métrica con mayor crecimiento vs mes anterior.</p>
              {insights.bestMetric ? (
                <div>
                  <p className="text-lg font-display font-bold">{insights.bestMetric.label}</p>
                  <p className={`text-3xl font-display font-bold ${deltaColor(insights.bestMetric.delta)}`}>{fmtPct(insights.bestMetric.delta)}</p>
                </div>
              ) : <p className="text-sm text-muted-foreground italic">Necesitas 2+ periodos.</p>}
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <h4 className="font-semibold text-sm">Dónde estamos perdiendo</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Métrica con mayor caída vs mes anterior.</p>
              {insights.worstMetric ? (
                <div>
                  <p className="text-lg font-display font-bold">{insights.worstMetric.label}</p>
                  <p className={`text-3xl font-display font-bold ${deltaColor(insights.worstMetric.delta)}`}>{fmtPct(insights.worstMetric.delta)}</p>
                </div>
              ) : <p className="text-sm text-muted-foreground italic">Necesitas 2+ periodos.</p>}
            </Card>
          </div>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Racha positiva de seguidores</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Meses consecutivos con crecimiento neto.</p>
            <p className="text-4xl font-display font-bold">{insights.streak} <span className="text-base font-normal text-muted-foreground">meses</span></p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Snapshot competitivo — Engagement rate</h4>
            </div>
            {(() => {
              const key: keyof Metric = "engagement_rate";
              const data = periodMetrics
                .map((m) => {
                  const c = compMap.get(m.competitor_id);
                  const v = Number(m[key] ?? 0);
                  return { brand: c ? `${c.name}${networkFilter === "all" ? ` · ${m.network}` : ""}` : m.competitor_id, value: v, color: c?.brand_color ?? "#94a3b8", isClient: !!c?.is_client };
                })
                .filter((r) => Number.isFinite(r.value) && r.value !== 0)
                .sort((a, b) => b.value - a.value);
              if (!data.length) return <p className="text-sm text-muted-foreground italic">Sin datos.</p>;
              return (
                <ResponsiveContainer width="100%" height={Math.max(220, data.length * 26)}>
                  <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" fontSize={10} tickFormatter={(v) => (v * 100).toFixed(1) + "%"} />
                    <YAxis type="category" dataKey="brand" fontSize={11} width={170} />
                    <Tooltip formatter={(v: number) => (v * 100).toFixed(2) + "%"} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {data.map((r, i) => <Cell key={i} fill={r.color} fillOpacity={r.isClient ? 1 : 0.5} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </Card>
        </TabsContent>

        {/* TAB: CLIENT */}
        <TabsContent value="cliente" className="space-y-4 mt-4">
          <div className="grid gap-3 md:grid-cols-3">
            {METRICS.slice(0, 6).map((M) => {
              const curr = clientEvolution.length ? clientEvolution[clientEvolution.length - 1][M.key as string] as number | null : null;
              const prev = clientEvolution.length > 1 ? clientEvolution[clientEvolution.length - 2][M.key as string] as number | null : null;
              const delta = curr != null && prev != null && prev !== 0 ? (curr - prev) / Math.abs(prev) : null;
              return (
                <Card key={M.key as string} className="p-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{M.label}</p>
                  <div className="flex items-baseline justify-between mt-1">
                    <p className="text-xl font-display font-bold tabular-nums">{curr != null ? M.fmt(curr) : "—"}</p>
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${deltaColor(delta)}`}>
                      <DeltaIcon v={delta} />{fmtPct(delta)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Evolución de {clientName} — {currentMetric.label}</h4>
              <div className="ml-auto">
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-[220px] h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{METRICS.map((m) => <SelectItem key={m.key as string} value={m.key as string}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {clientEvolution.length < 2 ? (
              <p className="text-sm text-muted-foreground italic">Necesitas 2+ periodos cargados.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={clientEvolution}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="period" fontSize={10} />
                  <YAxis fontSize={10} tickFormatter={(v) => v > 999 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
                  <Tooltip formatter={(v: number) => currentMetric.fmt(v)} />
                  <Line type="monotone" dataKey={selectedMetric} stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Crecimiento diario de seguidores — {currentPeriod?.period_label}</h4>
            </div>
            {dailyEvolution.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No hay datos diarios para este periodo.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dailyEvolution}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {brandsList.filter((b) => b.isClient).map((b) => (
                    <Line key={b.key} type="monotone" dataKey={b.key} stroke={b.color} strokeWidth={3} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>

        {/* TAB: COMPETIDORES */}
        <TabsContent value="competidores" className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Métrica</span>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[240px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{METRICS.map((m) => <SelectItem key={m.key as string} value={m.key as string}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Ranking — {currentMetric.label}</h4>
              </div>
              {rankingData.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Sin datos.</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(220, rankingData.length * 28)}>
                  <BarChart data={rankingData} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" fontSize={10} tickFormatter={(v) => v > 999 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
                    <YAxis type="category" dataKey="brand" fontSize={11} width={170} />
                    <Tooltip formatter={(v: number) => currentMetric.fmt(v)} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {rankingData.map((r, i) => <Cell key={i} fill={r.color} fillOpacity={r.isClient ? 1 : 0.55} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <PieIcon className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Share del sector</h4>
              </div>
              {rankingData.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Sin datos.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={rankingData} dataKey="value" nameKey="brand" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                      {rankingData.map((r, i) => <Cell key={i} fill={r.color} fillOpacity={r.isClient ? 1 : 0.55} />)}
                    </Pie>
                    <Tooltip formatter={(v: number, _n, p: any) => [`${currentMetric.fmt(v)} (${((v / shareTotal) * 100).toFixed(1)}%)`, String(p.payload.brand)]} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Evolución por periodo — {currentMetric.label}</h4>
            </div>
            {evolutionData.length < 2 ? (
              <p className="text-sm text-muted-foreground italic">Necesitas 2+ periodos cargados.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="period" fontSize={10} />
                  <YAxis fontSize={10} tickFormatter={(v) => v > 999 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
                  <Tooltip formatter={(v: number) => currentMetric.fmt(v)} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {brandsList.map((b) => (
                    <Line key={b.key} type="monotone" dataKey={b.key} stroke={b.color}
                      strokeWidth={b.isClient ? 3 : 1.5} strokeOpacity={b.isClient ? 1 : 0.65}
                      dot={{ r: b.isClient ? 4 : 2 }} activeDot={{ r: b.isClient ? 6 : 4 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>

        {/* TAB: CONTENIDO */}
        <TabsContent value="contenido" className="space-y-4 mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-sm">Top propios — {clientName}</h4>
                <Badge variant="secondary" className="ml-auto">{clientPostsPeriod.length}</Badge>
              </div>
              {clientPostsPeriod.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Sin publicaciones cargadas.</p>
              ) : (
                <ul className="space-y-3 max-h-[500px] overflow-auto pr-1">
                  {clientPostsPeriod.slice(0, 10).map((p) => (
                    <li key={p.id} className="p-3 rounded-lg border border-border/40 bg-background/40">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{p.network} · {p.posted_at ? new Date(p.posted_at).toLocaleDateString("es-MX") : "—"}</span>
                        <span className="tabular-nums font-medium text-foreground">{p.interactions?.toLocaleString("es-MX") ?? 0} interacc.</span>
                      </div>
                      <p className="text-xs line-clamp-3">{p.message ?? "—"}</p>
                      {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline mt-1 inline-block">Ver publicación ↗</a>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Newspaper className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Top del sector</h4>
                <Badge variant="secondary" className="ml-auto">{sectorPostsPeriod.length}</Badge>
              </div>
              {sectorPostsPeriod.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Sin publicaciones cargadas.</p>
              ) : (
                <ul className="space-y-3 max-h-[500px] overflow-auto pr-1">
                  {sectorPostsPeriod.slice(0, 10).map((p) => {
                    const c = p.competitor_id ? compMap.get(p.competitor_id) : null;
                    return (
                      <li key={p.id} className="p-3 rounded-lg border border-border/40 bg-background/40">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: c?.brand_color ?? "#94a3b8" }} />
                            {p.profile_name} · {p.network}
                          </span>
                          <span className="tabular-nums font-medium text-foreground">{p.interactions?.toLocaleString("es-MX") ?? 0}</span>
                        </div>
                        <p className="text-xs line-clamp-3">{p.message ?? "—"}</p>
                        {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline mt-1 inline-block">Ver ↗</a>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* TAB: DATOS */}
        <TabsContent value="datos" className="space-y-4 mt-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TableIcon className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Tabla detallada — {currentPeriod?.period_label}</h4>
            </div>
            <div className="overflow-auto max-h-[500px] border border-border/40 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-background/60 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Perfil</th>
                    <th className="text-left p-2">Red</th>
                    <th className="text-right p-2">Seguidores</th>
                    <th className="text-right p-2">Crec.%/día</th>
                    <th className="text-right p-2">Engagement</th>
                    <th className="text-right p-2">Posts/día</th>
                    <th className="text-right p-2">Alcance/día</th>
                    <th className="text-right p-2">Índice</th>
                  </tr>
                </thead>
                <tbody>
                  {periodMetrics
                    .slice()
                    .sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0))
                    .map((m) => {
                      const c = compMap.get(m.competitor_id);
                      return (
                        <tr key={m.id} className={`border-t border-border/30 ${c?.is_client ? "bg-primary/5 font-medium" : ""}`}>
                          <td className="p-2">
                            <span className="inline-flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ background: c?.brand_color ?? "#94a3b8" }} />
                              {c?.name ?? "?"}
                            </span>
                          </td>
                          <td className="p-2">{m.network}</td>
                          <td className="p-2 text-right tabular-nums">{m.followers?.toLocaleString("es-MX") ?? "—"}</td>
                          <td className="p-2 text-right tabular-nums">{m.follower_growth_rate != null ? (m.follower_growth_rate * 100).toFixed(3) + "%" : "—"}</td>
                          <td className="p-2 text-right tabular-nums">{m.engagement_rate != null ? (m.engagement_rate * 100).toFixed(2) + "%" : "—"}</td>
                          <td className="p-2 text-right tabular-nums">{m.posts_per_day != null ? m.posts_per_day.toFixed(2) : "—"}</td>
                          <td className="p-2 text-right tabular-nums">{m.reach_per_day != null ? m.reach_per_day.toFixed(0) : "—"}</td>
                          <td className="p-2 text-right tabular-nums">{m.performance_index != null ? m.performance_index.toFixed(2) : "—"}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Top 20 publicaciones (todo el sector)</h4>
            </div>
            {topPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Sin publicaciones cargadas.</p>
            ) : (
              <div className="overflow-auto max-h-[500px] border border-border/40 rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-background/60 sticky top-0">
                    <tr>
                      <th className="text-left p-2">Perfil</th>
                      <th className="text-left p-2">Red</th>
                      <th className="text-left p-2">Fecha</th>
                      <th className="text-left p-2">Mensaje</th>
                      <th className="text-right p-2">Interacc.</th>
                      <th className="text-right p-2">Eng.%</th>
                      <th className="p-2">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPosts.map((p) => {
                      const c = p.competitor_id ? compMap.get(p.competitor_id) : null;
                      return (
                        <tr key={p.id} className={`border-t border-border/30 ${c?.is_client ? "bg-primary/5 font-medium" : ""}`}>
                          <td className="p-2">
                            <span className="inline-flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ background: c?.brand_color ?? "#94a3b8" }} />
                              {p.profile_name}
                            </span>
                          </td>
                          <td className="p-2">{p.network}</td>
                          <td className="p-2 text-muted-foreground">{p.posted_at ? new Date(p.posted_at).toLocaleDateString("es-MX") : "—"}</td>
                          <td className="p-2 max-w-xs truncate" title={p.message ?? ""}>{p.message ?? "—"}</td>
                          <td className="p-2 text-right tabular-nums">{p.interactions?.toLocaleString("es-MX") ?? "—"}</td>
                          <td className="p-2 text-right tabular-nums">{p.engagement_rate != null ? (p.engagement_rate * 100).toFixed(2) + "%" : "—"}</td>
                          <td className="p-2">{p.link ? <a href={p.link} target="_blank" rel="noreferrer" className="text-primary hover:underline">↗</a> : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
