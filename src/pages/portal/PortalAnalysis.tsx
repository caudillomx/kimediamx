import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import { Sparkles, AlertTriangle, TrendingUp } from "lucide-react";

type Entry = {
  entry_date: string;
  sentiment: string | null;
  sentiment_score: number | null;
  urgency: string | null;
  topics: string[] | null;
  mentions: any[] | null;
  summary: string | null;
  analyzed_at: string | null;
};

type Analysis = {
  id: string;
  week_start: string;
  week_end: string;
  entries_count: number;
  executive_summary: string | null;
  key_findings: any[];
  alerts: any[];
  recommendations_client: string | null;
  sentiment_breakdown: Record<string, number>;
  top_topics: { topic: string; count: number }[];
  top_mentions: { name: string; type: string; count: number }[];
};

const SENT_COLORS: Record<string, string> = {
  positivo: "#10b981",
  neutral: "#94a3b8",
  negativo: "#f59e0b",
  crisis: "#ef4444",
};

export default function PortalAnalysis({ clientId, fromDate, toDate }: { clientId: string; fromDate: string; toDate: string; }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [e, a] = await Promise.all([
        supabase.from("client_portal_listening_entries")
          .select("entry_date, sentiment, sentiment_score, urgency, topics, mentions, summary, analyzed_at")
          .eq("client_id", clientId)
          .gte("entry_date", fromDate).lte("entry_date", toDate)
          .not("analyzed_at", "is", null)
          .order("entry_date", { ascending: true }).limit(500),
        supabase.from("client_portal_listening_analyses")
          .select("*")
          .eq("client_id", clientId)
          .gte("week_start", fromDate).lte("week_start", toDate)
          .order("week_start", { ascending: false }),
      ]);
      setEntries((e.data ?? []) as Entry[]);
      setAnalyses(((a.data ?? []) as unknown) as Analysis[]);
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

  if (entries.length === 0 && analyses.length === 0) {
    return (
      <div className="glass rounded-xl p-10 text-center space-y-2">
        <Sparkles className="w-8 h-8 text-coral mx-auto" />
        <h3 className="font-semibold">Análisis IA en construcción</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Aún no hay entradas de listening enriquecidas por IA en este rango. El equipo KiMedia procesará las próximas entradas y aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Última narrativa semanal */}
      {analyses[0] && (
        <Card className="p-5 border-coral/30 bg-coral/5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-coral" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Resumen ejecutivo · semana {analyses[0].week_start} → {analyses[0].week_end}</span>
          </div>
          {analyses[0].executive_summary && (
            <p className="text-sm leading-relaxed mb-4">{analyses[0].executive_summary}</p>
          )}
          {analyses[0].alerts?.length > 0 && (
            <div className="space-y-2 mb-4">
              {analyses[0].alerts.map((a: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm p-2 rounded bg-red-500/10 border border-red-500/30">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <Badge className="text-[10px] mr-2">{a.level}</Badge>
                    {a.detail}
                  </div>
                </div>
              ))}
            </div>
          )}
          {analyses[0].key_findings?.length > 0 && (
            <div className="grid gap-2 mb-4">
              {analyses[0].key_findings.map((f: any, i: number) => (
                <div key={i} className="p-2 rounded bg-background/50 border border-border">
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <TrendingUp className="w-3 h-3" /> {f.title}
                    <Badge variant="outline" className="text-[10px] ml-auto">impacto {f.impact}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{f.detail}</p>
                </div>
              ))}
            </div>
          )}
          {analyses[0].recommendations_client && (
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recomendaciones</div>
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0">
                <ReactMarkdown>{analyses[0].recommendations_client}</ReactMarkdown>
              </div>
            </div>
          )}
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

        <Card className="p-4 md:col-span-2">
          <h4 className="text-sm font-semibold mb-3">Menciones destacadas</h4>
          {topMentions.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin menciones detectadas todavía.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topMentions.map((m, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {m.name} <span className="ml-1 opacity-60">×{m.count}</span>
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Semanas anteriores */}
      {analyses.length > 1 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Semanas anteriores</h3>
          {analyses.slice(1).map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-2">
                  Semana {a.week_start} → {a.week_end} · {a.entries_count} entradas
                </div>
                {a.executive_summary && <p className="text-sm mb-2">{a.executive_summary}</p>}
                {a.recommendations_client && (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0">
                    <ReactMarkdown>{a.recommendations_client}</ReactMarkdown>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}