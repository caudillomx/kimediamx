import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import { BarChart3, Download, TrendingUp, PieChart as PieIcon, Table as TableIcon } from "lucide-react";

type Competitor = { id: string; name: string; brand_color: string; active: boolean };
type Week = { id: string; week_start: string; week_end: string };
type Metric = {
  id: string;
  week_id: string;
  competitor_id: string | null;
  is_self: boolean;
  brand_name: string;
  platform: string;
  fans: number | null;
  fan_change: number | null;
  followers: number | null;
  posts: number | null;
  interactions: number | null;
  engagement_rate: number | null;
  reach: number | null;
  video_views: number | null;
};

const METRICS: { key: keyof Metric; label: string; format: (n: number) => string }[] = [
  { key: "fans", label: "Fans / Seguidores", format: (n) => n.toLocaleString("es-MX") },
  { key: "interactions", label: "Interacciones", format: (n) => n.toLocaleString("es-MX") },
  { key: "engagement_rate", label: "Engagement rate (%)", format: (n) => n.toFixed(2) + "%" },
  { key: "posts", label: "Posts publicados", format: (n) => n.toLocaleString("es-MX") },
  { key: "reach", label: "Alcance", format: (n) => n.toLocaleString("es-MX") },
];

const RANGES = [
  { value: "4", label: "Últimas 4 semanas" },
  { value: "8", label: "Últimas 8 semanas" },
  { value: "12", label: "Últimas 12 semanas" },
  { value: "all", label: "Todas las semanas" },
];

const CLIENT_COLOR = "#ef6a4d"; // coral

export default function PortalBenchmark({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>("interactions");
  const [range, setRange] = useState<string>("4");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [c, w] = await Promise.all([
        supabase.from("client_portal_benchmark_competitors").select("id, name, brand_color, active").eq("client_id", clientId).eq("active", true).order("sort_order"),
        supabase.from("client_portal_benchmark_weeks").select("id, week_start, week_end").eq("client_id", clientId).order("week_start", { ascending: true }),
      ]);
      setCompetitors((c.data ?? []) as Competitor[]);
      setWeeks((w.data ?? []) as Week[]);
      if ((w.data ?? []).length > 0) {
        const weekIds = (w.data as Week[]).map(x => x.id);
        const m = await supabase.from("client_portal_benchmark_metrics").select("*").in("week_id", weekIds);
        setMetrics((m.data ?? []) as Metric[]);
      }
      setLoading(false);
    })();
  }, [clientId]);

  const filteredWeeks = useMemo(() => {
    if (range === "all") return weeks;
    return weeks.slice(-parseInt(range));
  }, [weeks, range]);

  const filteredWeekIds = useMemo(() => new Set(filteredWeeks.map(w => w.id)), [filteredWeeks]);
  const filteredMetrics = useMemo(() => metrics.filter(m => filteredWeekIds.has(m.week_id)), [metrics, filteredWeekIds]);

  const lastWeek = filteredWeeks[filteredWeeks.length - 1];
  const currentMetric = METRICS.find(m => m.key === selectedMetric) ?? METRICS[0];

  // Colores por marca (cliente = CLIENT_COLOR, competidores por brand_color)
  const brandColor = (brandName: string, isSelf: boolean): string => {
    if (isSelf) return CLIENT_COLOR;
    const c = competitors.find(x => x.name.toLowerCase() === brandName.toLowerCase());
    return c?.brand_color ?? "#94a3b8";
  };

  // ---------- Ranking (última semana del rango) ----------
  const rankingData = useMemo(() => {
    if (!lastWeek) return [];
    return filteredMetrics
      .filter(m => m.week_id === lastWeek.id)
      .map(m => ({
        brand: m.brand_name,
        value: Number(m[selectedMetric as keyof Metric] ?? 0),
        isSelf: m.is_self,
        color: brandColor(m.brand_name, m.is_self),
      }))
      .filter(r => r.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredMetrics, lastWeek, selectedMetric, competitors]);

  // ---------- Evolución semanal ----------
  const evolutionData = useMemo(() => {
    const brands = new Set<string>();
    filteredMetrics.forEach(m => brands.add(m.brand_name));
    const byWeek = new Map<string, Record<string, any>>();
    for (const w of filteredWeeks) {
      byWeek.set(w.id, { week: w.week_start });
    }
    for (const m of filteredMetrics) {
      const row = byWeek.get(m.week_id);
      if (row) row[m.brand_name] = Number(m[selectedMetric as keyof Metric] ?? 0);
    }
    return Array.from(byWeek.values());
  }, [filteredMetrics, filteredWeeks, selectedMetric]);

  const brandsList = useMemo(() => {
    const seen = new Map<string, { name: string; isSelf: boolean; color: string }>();
    for (const m of filteredMetrics) {
      if (!seen.has(m.brand_name)) {
        seen.set(m.brand_name, {
          name: m.brand_name,
          isSelf: m.is_self,
          color: brandColor(m.brand_name, m.is_self),
        });
      }
    }
    return Array.from(seen.values()).sort((a, b) => (a.isSelf === b.isSelf ? 0 : a.isSelf ? -1 : 1));
  }, [filteredMetrics, competitors]);

  // ---------- Share of engagement (última semana) ----------
  const shareData = useMemo(() => {
    return rankingData.map(r => ({ name: r.brand, value: r.value, color: r.color }));
  }, [rankingData]);
  const shareTotal = shareData.reduce((a, b) => a + b.value, 0);

  // ---------- Export CSV ----------
  function exportCsv() {
    const header = ["semana_inicio", "semana_fin", "marca", "es_cliente", "plataforma", "fans", "fan_change", "posts", "interacciones", "engagement_rate", "alcance", "video_views"];
    const weekMap = new Map(filteredWeeks.map(w => [w.id, w]));
    const rows = filteredMetrics.map(m => {
      const w = weekMap.get(m.week_id);
      return [
        w?.week_start ?? "", w?.week_end ?? "", m.brand_name,
        m.is_self ? "si" : "no", m.platform,
        m.fans ?? "", m.fan_change ?? "", m.posts ?? "",
        m.interactions ?? "", m.engagement_rate ?? "", m.reach ?? "", m.video_views ?? "",
      ];
    });
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [header.join(","), ...rows.map(r => r.map(esc).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `benchmark_${clientName}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <Card className="p-8 text-center text-sm text-muted-foreground">Cargando benchmark…</Card>;
  }

  if (weeks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-display font-bold text-lg">Sin datos de benchmark todavía</h3>
        <p className="text-sm text-muted-foreground mt-2">
          El equipo de KiMedia aún no ha cargado el primer export de FanpageKarma para este cliente.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Métrica</span>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[220px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {METRICS.map(m => <SelectItem key={m.key as string} value={m.key as string}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Rango</span>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RANGES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-1" />Exportar CSV
          </Button>
        </div>
      </div>

      {/* Ranking + Share */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">Ranking de la semana — {currentMetric.label}</h4>
          </div>
          {rankingData.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Sin datos para esta métrica.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, rankingData.length * 34)}>
              <BarChart data={rankingData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" fontSize={10} tickFormatter={(v) => v > 999 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
                <YAxis type="category" dataKey="brand" fontSize={11} width={110} />
                <Tooltip formatter={(v: number) => currentMetric.format(v)} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {rankingData.map((r, i) => <Cell key={i} fill={r.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {lastWeek && (
            <p className="text-[11px] text-muted-foreground mt-2 italic">Semana del {lastWeek.week_start} al {lastWeek.week_end}</p>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <PieIcon className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">Share del sector — {currentMetric.label}</h4>
          </div>
          {shareData.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Sin datos para esta métrica.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={shareData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {shareData.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip formatter={(v: number, _n, p) => [`${currentMetric.format(v)} (${((v / shareTotal) * 100).toFixed(1)}%)`, String(p.payload.name)]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Evolución */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-semibold text-sm">Evolución semanal — {currentMetric.label}</h4>
        </div>
        {evolutionData.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Sin datos para el rango seleccionado.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="week" fontSize={10} />
              <YAxis fontSize={10} tickFormatter={(v) => v > 999 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
              <Tooltip formatter={(v: number) => currentMetric.format(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {brandsList.map((b) => (
                <Line
                  key={b.name}
                  type="monotone"
                  dataKey={b.name}
                  stroke={b.color}
                  strokeWidth={b.isSelf ? 3 : 1.5}
                  dot={{ r: b.isSelf ? 4 : 2 }}
                  activeDot={{ r: b.isSelf ? 6 : 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Tabla detallada */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <TableIcon className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-semibold text-sm">Tabla detallada</h4>
        </div>
        <div className="overflow-auto max-h-[500px] border border-border/40 rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-background/60 sticky top-0">
              <tr>
                <th className="text-left p-2">Semana</th>
                <th className="text-left p-2">Marca</th>
                <th className="text-right p-2">Fans</th>
                <th className="text-right p-2">Δ Fans</th>
                <th className="text-right p-2">Posts</th>
                <th className="text-right p-2">Interacc.</th>
                <th className="text-right p-2">Eng.%</th>
                <th className="text-right p-2">Alcance</th>
              </tr>
            </thead>
            <tbody>
              {filteredMetrics
                .slice()
                .sort((a, b) => {
                  const wa = filteredWeeks.find(w => w.id === a.week_id)?.week_start ?? "";
                  const wb = filteredWeeks.find(w => w.id === b.week_id)?.week_start ?? "";
                  if (wa !== wb) return wa < wb ? 1 : -1;
                  return a.is_self === b.is_self ? 0 : a.is_self ? -1 : 1;
                })
                .map(m => {
                  const w = filteredWeeks.find(x => x.id === m.week_id);
                  return (
                    <tr key={m.id} className={`border-t border-border/30 ${m.is_self ? "bg-coral/5 font-medium" : ""}`}>
                      <td className="p-2 tabular-nums text-muted-foreground">{w?.week_start ?? "—"}</td>
                      <td className="p-2">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: brandColor(m.brand_name, m.is_self) }} />
                          {m.brand_name}
                        </span>
                      </td>
                      <td className="p-2 text-right tabular-nums">{m.fans?.toLocaleString("es-MX") ?? "—"}</td>
                      <td className="p-2 text-right tabular-nums">
                        {m.fan_change != null ? (
                          <span className={m.fan_change >= 0 ? "text-emerald-600" : "text-rose-600"}>
                            {m.fan_change > 0 ? "+" : ""}{m.fan_change.toLocaleString("es-MX")}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="p-2 text-right tabular-nums">{m.posts ?? "—"}</td>
                      <td className="p-2 text-right tabular-nums">{m.interactions?.toLocaleString("es-MX") ?? "—"}</td>
                      <td className="p-2 text-right tabular-nums">{m.engagement_rate != null ? m.engagement_rate.toFixed(2) + "%" : "—"}</td>
                      <td className="p-2 text-right tabular-nums">{m.reach?.toLocaleString("es-MX") ?? "—"}</td>
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