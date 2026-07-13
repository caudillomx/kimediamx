import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import { BarChart3, Download, TrendingUp, TrendingDown, PieChart as PieIcon, Table as TableIcon, Newspaper, Trophy, Target, AlertTriangle, Sparkles, Minus, ArrowUp, ArrowDown } from "lucide-react";

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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Periodo</span>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{periods.slice().reverse().map((p) => <SelectItem key={p.id} value={p.id}>{p.period_label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Métrica</span>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[240px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{METRICS.map((m) => <SelectItem key={m.key as string} value={m.key as string}>{m.label}</SelectItem>)}</SelectContent>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">Ranking — {currentMetric.label}</h4>
          </div>
          {rankingData.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Sin datos para esta selección.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(220, rankingData.length * 28)}>
              <BarChart data={rankingData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" fontSize={10} tickFormatter={(v) => v > 999 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
                <YAxis type="category" dataKey="brand" fontSize={11} width={170} />
                <Tooltip formatter={(v: number) => currentMetric.fmt(v)} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {rankingData.map((r, i) => <Cell key={i} fill={r.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {currentPeriod && <p className="text-[11px] text-muted-foreground mt-2 italic">Periodo: {currentPeriod.period_label}</p>}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <PieIcon className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">Share del sector — {currentMetric.label}</h4>
          </div>
          {rankingData.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Sin datos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={rankingData} dataKey="value" nameKey="brand" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {rankingData.map((r, i) => <Cell key={i} fill={r.color} />)}
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
        {evolutionData.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Necesitas al menos 2 periodos cargados para ver evolución.</p>
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
                  strokeWidth={b.isClient ? 3 : 1.5} dot={{ r: b.isClient ? 4 : 2 }} activeDot={{ r: b.isClient ? 6 : 4 }} />
              ))}
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
          <p className="text-sm text-muted-foreground italic">No hay datos diarios de seguidores para este periodo (sube el archivo "Seguidores").</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={dailyEvolution}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" fontSize={10} />
              <YAxis fontSize={10} tickFormatter={(v) => v > 999 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {brandsList.map((b) => (
                <Line key={b.key} type="monotone" dataKey={b.key} stroke={b.color}
                  strokeWidth={b.isClient ? 3 : 1.5} dot={false} activeDot={{ r: b.isClient ? 5 : 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-semibold text-sm">Top 20 publicaciones — {currentPeriod?.period_label}</h4>
        </div>
        {topPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Sin publicaciones cargadas para este periodo.</p>
        ) : (
          <div className="overflow-auto max-h-[500px] border border-border/40 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-background/60 sticky top-0">
                <tr>
                  <th className="text-left p-2">Perfil</th>
                  <th className="text-left p-2">Red</th>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Mensaje</th>
                  <th className="text-right p-2">Likes</th>
                  <th className="text-right p-2">Coment.</th>
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
                      <td className="p-2 text-right tabular-nums">{p.likes?.toLocaleString("es-MX") ?? "—"}</td>
                      <td className="p-2 text-right tabular-nums">{p.comments?.toLocaleString("es-MX") ?? "—"}</td>
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
    </div>
  );
}
