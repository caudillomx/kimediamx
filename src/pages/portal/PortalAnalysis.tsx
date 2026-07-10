import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid,
  Treemap, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, ScatterChart, Scatter, ZAxis,
  RadialBarChart, RadialBar,
} from "recharts";
import { Sparkles, Quote, AlertOctagon, Radio, Users, Activity, Grid3x3, Gauge, TrendingUp } from "lucide-react";

type Entry = {
  entry_date: string;
  sentiment: string | null;
  sentiment_score: number | null;
  urgency: string | null;
  topics: string[] | null;
  mentions: any[] | null;
  summary: string | null;
  analyzed_at: string | null;
  channels: any[] | null;
  entities: any[] | null;
  events: any[] | null;
  key_quotes: any[] | null;
  competitors: any[] | null;
  total_mentions?: number | null;
  sentiment_counts?: any | null;
};

const SENT_COLORS: Record<string, string> = {
  positivo: "#10b981",
  neutral: "#94a3b8",
  negativo: "#f59e0b",
  crisis: "#ef4444",
};

const CHANNEL_COLORS = ["#ef6a4d", "#0ea5e9", "#a855f7", "#10b981", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"];

const DOW_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const URGENCY_LEVEL: Record<string, number> = { baja: 1, media: 2, alta: 3, critica: 4 };
const HEAT_COLOR: Record<string, [number, number, number]> = {
  positivo: [16, 185, 129],
  neutral:  [148, 163, 184],
  negativo: [245, 158, 11],
  crisis:   [239, 68, 68],
};

export default function PortalAnalysis({ clientId, fromDate, toDate }: { clientId: string; fromDate: string; toDate: string; }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const e = await supabase.from("client_portal_listening_entries")
        .select("entry_date, sentiment, sentiment_score, urgency, topics, mentions, summary, analyzed_at, channels, entities, events, key_quotes, competitors")
        .eq("client_id", clientId)
        .gte("entry_date", fromDate).lte("entry_date", toDate)
        .not("analyzed_at", "is", null)
        .order("entry_date", { ascending: true }).limit(500);
      setEntries((e.data ?? []) as Entry[]);
      setLoading(false);
    })();
  }, [clientId, fromDate, toDate]);

  const volumeByDay = useMemo(() => {
    const map = new Map<string, { date: string; total: number; positivo: number; neutral: number; negativo: number; crisis: number }>();
    for (const e of entries) {
      const row = map.get(e.entry_date) ?? { date: e.entry_date, total: 0, positivo: 0, neutral: 0, negativo: 0, crisis: 0 };
      row.total++;
      const s = (e.sentiment ?? "neutral") as keyof typeof SENT_COLORS;
      (row as any)[s] = ((row as any)[s] ?? 0) + 1;
      map.set(e.entry_date, row);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);

  const sentimentBreakdown = useMemo(() => {
    const c: Record<string, number> = { positivo: 0, neutral: 0, negativo: 0, crisis: 0 };
    for (const e of entries) { const s = e.sentiment ?? "neutral"; c[s] = (c[s] ?? 0) + 1; }
    return Object.entries(c).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [entries]);

  const topTopics = useMemo(() => {
    const c = new Map<string, number>();
    for (const e of entries) for (const t of (e.topics ?? [])) c.set(t, (c.get(t) ?? 0) + 1);
    return Array.from(c.entries()).map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [entries]);

  const topMentions = useMemo(() => {
    const c = new Map<string, number>();
    for (const e of entries) for (const m of (e.mentions ?? [])) {
      const name = typeof m === "string" ? m : m?.name; if (!name) continue;
      c.set(name, (c.get(name) ?? 0) + 1);
    }
    return Array.from(c.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [entries]);

  const channelsBreakdown = useMemo(() => {
    const c = new Map<string, number>();
    for (const e of entries) for (const ch of (e.channels ?? [])) {
      const name = typeof ch === "string" ? ch : ch?.name; if (!name) continue;
      const n = typeof ch?.count === "number" ? ch.count : 1;
      c.set(name, (c.get(name) ?? 0) + n);
    }
    return Array.from(c.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [entries]);

  const topEntities = useMemo(() => {
    const c = new Map<string, { count: number; type?: string; sentiment?: string }>();
    for (const e of entries) for (const en of (e.entities ?? [])) {
      const name = typeof en === "string" ? en : en?.name; if (!name) continue;
      const prev = c.get(name) ?? { count: 0, type: en?.type, sentiment: en?.sentiment };
      prev.count += typeof en?.count === "number" ? en.count : 1;
      c.set(name, prev);
    }
    return Array.from(c.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count).slice(0, 12);
  }, [entries]);

  const shareOfVoice = useMemo(() => {
    const c = new Map<string, number>();
    let clientCount = 0;
    for (const e of entries) {
      clientCount++;
      for (const cp of (e.competitors ?? [])) {
        const name = typeof cp === "string" ? cp : cp?.name; if (!name) continue;
        const n = typeof cp?.count === "number" ? cp.count : 1;
        c.set(name, (c.get(name) ?? 0) + n);
      }
    }
    const arr = [{ name: "Cliente", value: clientCount, isClient: true }, ...Array.from(c.entries()).map(([name, value]) => ({ name, value, isClient: false }))];
    return arr.sort((a, b) => b.value - a.value).slice(0, 6);
  }, [entries]);

  const eventsTimeline = useMemo(() => {
    const items: { date: string; title: string; kind: string; impact: string; detail: string }[] = [];
    for (const e of entries) for (const ev of (e.events ?? [])) {
      items.push({
        date: e.entry_date,
        title: ev?.title ?? "",
        kind: ev?.kind ?? "otro",
        impact: ev?.impact ?? "medio",
        detail: ev?.detail ?? "",
      });
    }
    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
  }, [entries]);

  // ---------- Nuevos agregados ----------

  // 1) Heatmap día-de-semana × sentimiento
  const heatmap = useMemo(() => {
    const grid: Record<string, Record<string, number>> = {};
    for (const s of Object.keys(HEAT_COLOR)) grid[s] = Object.fromEntries(DOW_LABELS.map(d => [d, 0]));
    for (const e of entries) {
      const dow = DOW_LABELS[new Date(e.entry_date + "T00:00:00").getDay()];
      const sc = e.sentiment_counts ?? {};
      const hasCounts = sc && (sc.positivo || sc.neutral || sc.negativo || sc.crisis);
      if (hasCounts) {
        for (const k of Object.keys(HEAT_COLOR)) grid[k][dow] += Number(sc[k] ?? 0) || 0;
      } else if (e.sentiment) {
        grid[e.sentiment as string] = grid[e.sentiment as string] ?? {};
        grid[e.sentiment as string][dow] = (grid[e.sentiment as string][dow] ?? 0) + (Number(e.total_mentions ?? 0) || 1);
      }
    }
    const max = Math.max(1, ...Object.values(grid).flatMap(r => Object.values(r)));
    return { grid, max };
  }, [entries]);

  // 2) Treemap: entidades por frecuencia + tinte por sentimiento
  const entitiesTreemap = useMemo(() => {
    const map = new Map<string, { name: string; size: number; sentiment?: string }>();
    for (const e of entries) for (const en of (e.entities ?? [])) {
      const name = typeof en === "string" ? en : en?.name; if (!name) continue;
      const size = typeof en?.count === "number" ? en.count : 1;
      const prev = map.get(name) ?? { name, size: 0, sentiment: en?.sentiment };
      prev.size += size;
      map.set(name, prev);
    }
    if (map.size === 0) {
      for (const e of entries) for (const m of (e.mentions ?? [])) {
        const name = typeof m === "string" ? m : m?.name; if (!name) continue;
        const prev = map.get(name) ?? { name, size: 0 };
        prev.size += 1;
        map.set(name, prev);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.size - a.size).slice(0, 25);
  }, [entries]);

  // 3) Radar canales × sentimiento (normalizado 0-100 por sentimiento)
  const channelRadar = useMemo(() => {
    const byChan: Record<string, { positivo: number; neutral: number; negativo: number; crisis: number }> = {};
    for (const e of entries) for (const ch of (e.channels ?? [])) {
      const name = typeof ch === "string" ? ch : ch?.name; if (!name) continue;
      const w = typeof ch?.count === "number" ? ch.count : 1;
      const s = (ch?.sentiment ?? e.sentiment ?? "neutral") as keyof typeof HEAT_COLOR;
      const b = byChan[name] ?? { positivo: 0, neutral: 0, negativo: 0, crisis: 0 };
      (b as any)[s] = ((b as any)[s] ?? 0) + w;
      byChan[name] = b;
    }
    const rows = Object.entries(byChan).map(([channel, v]) => {
      const total = v.positivo + v.neutral + v.negativo + v.crisis || 1;
      return {
        channel,
        Positivo: Math.round((v.positivo / total) * 100),
        Negativo: Math.round((v.negativo / total) * 100),
        Crisis: Math.round((v.crisis / total) * 100),
        _total: total,
      };
    }).sort((a, b) => b._total - a._total).slice(0, 6);
    return rows;
  }, [entries]);

  // 4) SoV temporal (área apilada Cliente + competidores)
  const sovOverTime = useMemo(() => {
    const dates = Array.from(new Set(entries.map(e => e.entry_date))).sort();
    const competitorSet = new Set<string>();
    for (const e of entries) for (const cp of (e.competitors ?? [])) {
      const name = typeof cp === "string" ? cp : cp?.name; if (name) competitorSet.add(name);
    }
    const topCompetitors = (() => {
      const c = new Map<string, number>();
      for (const e of entries) for (const cp of (e.competitors ?? [])) {
        const name = typeof cp === "string" ? cp : cp?.name; if (!name) continue;
        const n = typeof cp?.count === "number" ? cp.count : 1;
        c.set(name, (c.get(name) ?? 0) + n);
      }
      return Array.from(c.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([n]) => n);
    })();
    const rows = dates.map(d => {
      const row: any = { date: d, Cliente: 0 };
      for (const c of topCompetitors) row[c] = 0;
      return row;
    });
    const byDate = new Map(rows.map(r => [r.date, r]));
    for (const e of entries) {
      const r = byDate.get(e.entry_date); if (!r) continue;
      r.Cliente += Number(e.total_mentions ?? 1) || 1;
      for (const cp of (e.competitors ?? [])) {
        const name = typeof cp === "string" ? cp : cp?.name; if (!name || !topCompetitors.includes(name)) continue;
        r[name] = (r[name] ?? 0) + (typeof cp?.count === "number" ? cp.count : 1);
      }
    }
    return { rows, competitors: topCompetitors };
  }, [entries]);

  // 5) Scatter urgencia × score sentimiento (por canal)
  const scatterData = useMemo(() => {
    const byChan: Record<string, { x: number; y: number; z: number }[]> = {};
    for (const e of entries) {
      if (typeof e.sentiment_score !== "number" && !e.urgency) continue;
      const y = typeof e.sentiment_score === "number" ? e.sentiment_score : (e.sentiment === "positivo" ? 0.5 : e.sentiment === "negativo" ? -0.5 : e.sentiment === "crisis" ? -1 : 0);
      const x = URGENCY_LEVEL[e.urgency ?? "baja"] ?? 1;
      const z = Number(e.total_mentions ?? 1) || 1;
      const chan = (e.channels ?? [])[0];
      const chanName = typeof chan === "string" ? chan : chan?.name ?? "Otro";
      byChan[chanName] = byChan[chanName] ?? [];
      byChan[chanName].push({ x, y, z });
    }
    return Object.entries(byChan).slice(0, 6).map(([name, pts]) => ({ name, pts }));
  }, [entries]);

  // 6) Salud reputacional (0-100)
  const reputationScore = useMemo(() => {
    let sum = 0, n = 0;
    for (const e of entries) {
      if (typeof e.sentiment_score === "number") { sum += e.sentiment_score; n++; }
    }
    const avg = n ? sum / n : 0;
    const crisisEvents = entries.reduce((acc, e) => acc + (e.events ?? []).filter((ev: any) => ev?.impact === "alto" || ev?.kind === "crisis").length, 0);
    const raw = 50 + 50 * avg - Math.min(30, crisisEvents * 6);
    const score = Math.max(0, Math.min(100, Math.round(raw)));
    const label = score >= 75 ? "Saludable" : score >= 55 ? "Estable" : score >= 40 ? "En riesgo" : "Crítico";
    const color = score >= 75 ? "#10b981" : score >= 55 ? "#0ea5e9" : score >= 40 ? "#f59e0b" : "#ef4444";
    return { score, label, color, avg: +avg.toFixed(2), crisisEvents };
  }, [entries]);

  const quotes = useMemo(() => {
    const items: { date: string; text: string; author: string; source: string; sentiment: string }[] = [];
    for (const e of entries) for (const q of (e.key_quotes ?? [])) {
      if (!q?.text) continue;
      items.push({
        date: e.entry_date,
        text: q.text,
        author: q.author ?? "",
        source: q.source ?? "",
        sentiment: q.sentiment ?? "neutral",
      });
    }
    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  }, [entries]);

  const scoreTrend = useMemo(() => {
    const map = new Map<string, { date: string; sum: number; n: number }>();
    for (const e of entries) {
      if (typeof e.sentiment_score !== "number") continue;
      const r = map.get(e.entry_date) ?? { date: e.entry_date, sum: 0, n: 0 };
      r.sum += e.sentiment_score; r.n++; map.set(e.entry_date, r);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
      .map(r => ({ date: r.date, score: +(r.sum / r.n).toFixed(2) }));
  }, [entries]);

  if (loading) return <div className="text-center py-12 text-muted-foreground">Cargando análisis...</div>;

  if (entries.length === 0) {
    return (
      <div className="glass rounded-xl p-10 text-center space-y-2">
        <Sparkles className="w-8 h-8 text-coral mx-auto" />
        <h3 className="font-semibold">Sin datos enriquecidos en este rango</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Aún no hay entradas de listening procesadas por IA en la ventana seleccionada. Prueba ampliar la comparación o esperar al próximo corte.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas: eventos de alto impacto */}
      {eventsTimeline.some(e => e.impact === "alto" || e.kind === "crisis") && (
        <Card className="p-5 border-rose-500/30 bg-rose-500/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            <h4 className="text-sm font-semibold">Eventos críticos del período</h4>
          </div>
          <div className="space-y-2">
            {eventsTimeline.filter(e => e.impact === "alto" || e.kind === "crisis").slice(0, 5).map((e, i) => (
              <div key={i} className="text-sm flex items-start gap-3 p-2 rounded bg-background/50">
                <Badge variant="destructive" className="text-[10px] shrink-0">{e.kind}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{e.title}</div>
                  {e.detail && <div className="text-xs text-muted-foreground">{e.detail}</div>}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{e.date}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Grid de gráficas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">Volumen y sentimiento por día</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={volumeByDay}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey="positivo" stackId="a" fill={SENT_COLORS.positivo} />
              <Bar dataKey="neutral" stackId="a" fill={SENT_COLORS.neutral} />
              <Bar dataKey="negativo" stackId="a" fill={SENT_COLORS.negativo} />
              <Bar dataKey="crisis" stackId="a" fill={SENT_COLORS.crisis} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">Sentimiento agregado</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sentimentBreakdown} dataKey="value" nameKey="name" outerRadius={80} label>
                {sentimentBreakdown.map((entry, i) => (
                  <Cell key={i} fill={SENT_COLORS[entry.name] ?? "#94a3b8"} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Radio className="w-4 h-4" />Menciones por canal</h4>
          {channelsBreakdown.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Sin canales identificados. Reprocesa las entradas para extraerlos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={channelsBreakdown} dataKey="value" nameKey="name" outerRadius={80} label>
                  {channelsBreakdown.map((_, i) => <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4" />Share of voice vs competidores</h4>
          {shareOfVoice.length <= 1 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Sin competidores citados en el período.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={shareOfVoice} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" fontSize={10} />
                <YAxis type="category" dataKey="name" fontSize={10} width={120} />
                <Tooltip />
                <Bar dataKey="value">
                  {shareOfVoice.map((s, i) => <Cell key={i} fill={s.isClient ? "#ef6a4d" : "#94a3b8"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">Score de sentimiento (tendencia)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={scoreTrend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" fontSize={10} />
              <YAxis domain={[-1, 1]} fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#ef6a4d" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">Temas más frecuentes</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topTopics} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" fontSize={10} />
              <YAxis type="category" dataKey="topic" fontSize={10} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#ef6a4d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">Entidades más citadas</h4>
          {topEntities.length === 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Sin entidades detectadas.</p>
              {topMentions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topMentions.map((m, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {m.name} <span className="ml-1 opacity-60">×{m.count}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              {topEntities.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{e.name}</span>
                    {e.type && <Badge variant="outline" className="text-[9px] shrink-0">{e.type}</Badge>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {e.sentiment && (
                      <span className="w-2 h-2 rounded-full" style={{ background: SENT_COLORS[e.sentiment] ?? "#94a3b8" }} />
                    )}
                    <span className="text-xs text-muted-foreground">×{e.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Bloque avanzado: heatmap + salud reputacional */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 md:col-span-2">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Grid3x3 className="w-4 h-4" />Heatmap día-semana × sentimiento</h4>
          <div className="space-y-2">
            {(["positivo", "neutral", "negativo", "crisis"] as const).map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-16 text-[11px] capitalize text-muted-foreground">{s}</div>
                <div className="grid grid-cols-7 gap-1 flex-1">
                  {DOW_LABELS.map(d => {
                    const v = heatmap.grid[s]?.[d] ?? 0;
                    const ratio = v / heatmap.max;
                    const [r, g, b] = HEAT_COLOR[s];
                    const bg = `rgba(${r}, ${g}, ${b}, ${0.08 + ratio * 0.85})`;
                    return (
                      <div key={d} title={`${d}: ${v}`} className="h-10 rounded flex items-center justify-center text-[10px] font-medium"
                        style={{ background: bg, color: ratio > 0.5 ? "#fff" : undefined }}>
                        {v > 0 ? v : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-7 gap-1 pl-[72px] pt-1">
              {DOW_LABELS.map(d => <div key={d} className="text-[9px] text-center text-muted-foreground uppercase tracking-wider">{d}</div>)}
            </div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Gauge className="w-4 h-4" />Salud reputacional</h4>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "score", value: reputationScore.score, fill: reputationScore.color }]} startAngle={210} endAngle={-30}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: "rgba(148,163,184,0.15)" } as any} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-4xl font-display font-bold" style={{ color: reputationScore.color }}>{reputationScore.score}</div>
              <div className="text-xs font-semibold" style={{ color: reputationScore.color }}>{reputationScore.label}</div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground text-center mt-1">
            Score: {reputationScore.avg} · crisis: {reputationScore.crisisEvents}
          </div>
        </Card>
      </div>

      {/* Treemap entidades + Radar canales */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" />Mapa de entidades</h4>
          {entitiesTreemap.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Sin entidades para mapear.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <Treemap
                data={entitiesTreemap}
                dataKey="size"
                stroke="#fff"
                content={<TreemapCell />}
              />
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Radio className="w-4 h-4" />Radar canales × sentimiento</h4>
          {channelRadar.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Sin canales identificados.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={channelRadar} outerRadius={90}>
                <PolarGrid strokeOpacity={0.3} />
                <PolarAngleAxis dataKey="channel" fontSize={10} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={9} />
                <Radar name="Positivo" dataKey="Positivo" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Radar name="Negativo" dataKey="Negativo" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Radar name="Crisis" dataKey="Crisis" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Área apilada SoV temporal + Scatter urgencia */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Activity className="w-4 h-4" />Share of voice · evolución</h4>
          {sovOverTime.rows.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Sin datos temporales.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={sovOverTime.rows}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="Cliente" stackId="1" stroke="#ef6a4d" fill="#ef6a4d" fillOpacity={0.7} />
                {sovOverTime.competitors.map((c, i) => (
                  <Area key={c} type="monotone" dataKey={c} stackId="1"
                    stroke={CHANNEL_COLORS[(i + 1) % CHANNEL_COLORS.length]}
                    fill={CHANNEL_COLORS[(i + 1) % CHANNEL_COLORS.length]}
                    fillOpacity={0.5} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">Urgencia × sentimiento (outliers)</h4>
          {scatterData.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Sin datos suficientes.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" dataKey="x" name="urgencia" domain={[0.5, 4.5]}
                  ticks={[1, 2, 3, 4]}
                  tickFormatter={(v) => ["", "Baja", "Media", "Alta", "Crítica"][v] ?? ""} fontSize={10} />
                <YAxis type="number" dataKey="y" name="sentimiento" domain={[-1, 1]} fontSize={10} />
                <ZAxis type="number" dataKey="z" range={[40, 300]} name="menciones" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {scatterData.map((s, i) => (
                  <Scatter key={s.name} name={s.name} data={s.pts} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} fillOpacity={0.7} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Frases destacadas */}
      {quotes.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Quote className="w-4 h-4" />Frases destacadas</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {quotes.map((q, i) => (
              <Card key={i} className="p-4 border-l-4" style={{ borderLeftColor: SENT_COLORS[q.sentiment] ?? "#94a3b8" }}>
                <p className="text-sm italic leading-relaxed mb-2">"{q.text}"</p>
                <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                  {q.author && <span className="font-medium">{q.author}</span>}
                  {q.source && <span>· {q.source}</span>}
                  <span className="ml-auto">{q.date}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Timeline de eventos */}
      {eventsTimeline.length > 0 && (
        <Card className="p-5">
          <h4 className="text-sm font-semibold mb-3">Timeline de hitos</h4>
          <div className="space-y-2">
            {eventsTimeline.map((e, i) => (
              <div key={i} className="flex items-start gap-3 text-sm py-2 border-b border-border/40 last:border-0">
                <span className="text-xs text-muted-foreground w-24 shrink-0 pt-0.5">{e.date}</span>
                <Badge variant={e.impact === "alto" ? "destructive" : "outline"} className="text-[10px] shrink-0">{e.kind}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{e.title}</div>
                  {e.detail && <div className="text-xs text-muted-foreground">{e.detail}</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}