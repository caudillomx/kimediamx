import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import { Sparkles, Quote, AlertOctagon, Radio, Users } from "lucide-react";

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
};

const SENT_COLORS: Record<string, string> = {
  positivo: "#10b981",
  neutral: "#94a3b8",
  negativo: "#f59e0b",
  crisis: "#ef4444",
};

const CHANNEL_COLORS = ["#ef6a4d", "#0ea5e9", "#a855f7", "#10b981", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"];

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