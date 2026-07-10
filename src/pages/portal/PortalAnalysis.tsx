import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid,
  PolarAngleAxis, RadialBarChart, RadialBar, ReferenceDot,
} from "recharts";
import { Sparkles, Quote, AlertOctagon, Radio, Grid3x3, Gauge, TrendingUp, Flag } from "lucide-react";
import { Lightbulb } from "lucide-react";

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
  negativo: "#ef4444",
  crisis: "#991b1b",
};

// Brand-inspired colors per platform (lower-cased key)
const PLATFORM_COLORS: Record<string, string> = {
  "medios digitales": "#3b82f6",
  "medios": "#3b82f6",
  "prensa": "#3b82f6",
  "x": "#0f172a",
  "twitter": "#1da1f2",
  "x (twitter)": "#0f172a",
  "linkedin": "#0a66c2",
  "facebook": "#1877f2",
  "instagram": "#e1306c",
  "youtube": "#ff0000",
  "tiktok": "#111111",
  "reddit": "#ff4500",
  "threads": "#0f172a",
  "whatsapp": "#25d366",
  "telegram": "#0088cc",
  "spotify": "#1db954",
  "podcast": "#8b5cf6",
  "blog": "#64748b",
};
const CHANNEL_FALLBACK = ["#ef6a4d", "#0ea5e9", "#a855f7", "#10b981", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"];
function platformColor(name: string, i = 0) {
  return PLATFORM_COLORS[name.toLowerCase().trim()] ?? CHANNEL_FALLBACK[i % CHANNEL_FALLBACK.length];
}

const DOW_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HEAT_COLOR: Record<string, [number, number, number]> = {
  positivo: [16, 185, 129],
  neutral:  [148, 163, 184],
  negativo: [239, 68, 68],
  crisis:   [153, 27, 27],
};

export default function PortalAnalysis({ clientId, fromDate, toDate }: { clientId: string; fromDate: string; toDate: string; }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendPeriods, setTrendPeriods] = useState<{ label: string; total: number; delta: number | null }[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const e = await supabase.from("client_portal_listening_entries")
        .select("entry_date, sentiment, sentiment_score, urgency, topics, mentions, summary, analyzed_at, channels, entities, events, key_quotes, competitors, total_mentions, sentiment_counts")
        .eq("client_id", clientId)
        .gte("entry_date", fromDate).lte("entry_date", toDate)
        .not("analyzed_at", "is", null)
        .order("entry_date", { ascending: true }).limit(500);
      setEntries((e.data ?? []) as Entry[]);
      setLoading(false);
    })();
  }, [clientId, fromDate, toDate]);

  // Tendencia comparativa: 4 periodos con misma longitud que el rango actual
  useEffect(() => {
    (async () => {
      const from = new Date(fromDate + "T00:00:00");
      const to = new Date(toDate + "T00:00:00");
      const days = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
      if (!days || days < 1) return;
      const periods: { start: Date; end: Date }[] = [];
      for (let i = 3; i >= 0; i--) {
        const end = new Date(from); end.setDate(end.getDate() - 1 - i * days + days);
        const start = new Date(end); start.setDate(start.getDate() - days + 1);
        if (i === 0) { periods.push({ start: from, end: to }); }
        else periods.push({ start, end });
      }
      const results = await Promise.all(periods.map(async (p) => {
        const s = p.start.toISOString().slice(0, 10);
        const e = p.end.toISOString().slice(0, 10);
        const { data } = await supabase.from("client_portal_listening_entries")
          .select("total_mentions")
          .eq("client_id", clientId)
          .gte("entry_date", s).lte("entry_date", e)
          .not("analyzed_at", "is", null);
        const total = ((data ?? []) as any[]).reduce((acc, r) => acc + (Number(r.total_mentions ?? 0) || 0), 0);
        const label = p.start.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
        return { label, total };
      }));
      const withDelta = results.map((r, i) => ({
        ...r,
        delta: i === 0 ? null : (results[i - 1].total ? Math.round(((r.total - results[i - 1].total) / results[i - 1].total) * 100) : null),
      }));
      setTrendPeriods(withDelta);
    })();
  }, [clientId, fromDate, toDate]);

  const volumeByDay = useMemo(() => {
    const map = new Map<string, { date: string; total: number; positivo: number; neutral: number; negativo: number; crisis: number }>();
    for (const e of entries) {
      const row = map.get(e.entry_date) ?? { date: e.entry_date, total: 0, positivo: 0, neutral: 0, negativo: 0, crisis: 0 };
      const sc = e.sentiment_counts ?? {};
      const hasCounts = sc && (sc.positivo || sc.neutral || sc.negativo || sc.crisis);
      if (hasCounts) {
        row.positivo += Number(sc.positivo ?? 0) || 0;
        row.neutral += Number(sc.neutral ?? 0) || 0;
        row.negativo += Number(sc.negativo ?? 0) || 0;
        row.crisis += Number(sc.crisis ?? 0) || 0;
        row.total += Number(sc.positivo ?? 0) + Number(sc.neutral ?? 0) + Number(sc.negativo ?? 0) + Number(sc.crisis ?? 0);
      } else {
        const weight = Number(e.total_mentions ?? 0) || 1;
        row.total += weight;
        const s = (e.sentiment ?? "neutral") as keyof typeof SENT_COLORS;
        (row as any)[s] = ((row as any)[s] ?? 0) + weight;
      }
      map.set(e.entry_date, row);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);

  const sentimentBreakdown = useMemo(() => {
    const c: Record<string, number> = { positivo: 0, neutral: 0, negativo: 0, crisis: 0 };
    for (const e of entries) {
      const sc = e.sentiment_counts ?? {};
      const hasCounts = sc && (sc.positivo || sc.neutral || sc.negativo || sc.crisis);
      if (hasCounts) {
        c.positivo += Number(sc.positivo ?? 0) || 0;
        c.neutral += Number(sc.neutral ?? 0) || 0;
        c.negativo += Number(sc.negativo ?? 0) || 0;
        c.crisis += Number(sc.crisis ?? 0) || 0;
      } else {
        const s = e.sentiment ?? "neutral";
        c[s] = (c[s] ?? 0) + (Number(e.total_mentions ?? 0) || 1);
      }
    }
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

  // Salud reputacional (0-100)
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

  // Serie diaria: % positivo / neutral / negativo por día (para "Tonalidad y narrativas")
  const sentimentDaily = useMemo(() => {
    return volumeByDay.map(d => {
      const t = d.positivo + d.neutral + d.negativo + d.crisis || 1;
      return {
        date: d.date.slice(5),
        Positivo: Math.round((d.positivo / t) * 100),
        Neutral: Math.round((d.neutral / t) * 100),
        Negativo: Math.round(((d.negativo + d.crisis) / t) * 100),
      };
    });
  }, [volumeByDay]);

  // KPIs slide 1
  const totals = useMemo(() => {
    const total = volumeByDay.reduce((a, d) => a + d.positivo + d.neutral + d.negativo + d.crisis, 0);
    const peak = volumeByDay.reduce((p, d) => {
      const s = d.positivo + d.neutral + d.negativo + d.crisis;
      return s > p.value ? { date: d.date, value: s } : p;
    }, { date: "", value: 0 });
    const pos = volumeByDay.reduce((a, d) => a + d.positivo, 0);
    const neg = volumeByDay.reduce((a, d) => a + d.negativo + d.crisis, 0);
    const neu = volumeByDay.reduce((a, d) => a + d.neutral, 0);
    const posPct = total ? Math.round((pos / total) * 100) : 0;
    const negPct = total ? Math.round((neg / total) * 100) : 0;
    const neuPct = total ? Math.round((neu / total) * 100) : 0;
    return { total, peak, posPct, negPct, neuPct };
  }, [volumeByDay]);

  // Plataformas: totales + % + color de marca
  const platforms = useMemo(() => {
    const total = channelsBreakdown.reduce((a, c) => a + c.value, 0) || 1;
    return channelsBreakdown.map((c, i) => ({
      name: c.name,
      value: c.value,
      pct: +((c.value / total) * 100).toFixed(1),
      color: platformColor(c.name, i),
    }));
  }, [channelsBreakdown]);

  // Narrativas dominantes (top topics con % de días en los que aparecen)
  const narratives = useMemo(() => {
    const totalDays = new Set(entries.map(e => e.entry_date)).size || 1;
    const perTopic = new Map<string, Set<string>>();
    for (const e of entries) for (const t of (e.topics ?? [])) {
      if (!perTopic.has(t)) perTopic.set(t, new Set());
      perTopic.get(t)!.add(e.entry_date);
    }
    return Array.from(perTopic.entries())
      .map(([topic, days], i) => ({
        topic,
        pct: Math.round((days.size / totalDays) * 100),
        days: days.size,
        color: CHANNEL_FALLBACK[i % CHANNEL_FALLBACK.length],
      }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 6);
  }, [entries]);

  // Hitos: top 5 eventos por impacto/tipo, únicos por fecha
  const IMPACT_RANK: Record<string, number> = { crisis: 4, alto: 3, medio: 2, bajo: 1 };
  const milestones = useMemo(() => {
    if (!eventsTimeline.length) return [] as { date: string; dateKey: string; title: string; detail: string; kind: string; impact: string; color: string }[];
    const scored = eventsTimeline.map(e => {
      const r = Math.max(IMPACT_RANK[e.impact ?? ""] ?? 0, e.kind === "crisis" ? IMPACT_RANK.crisis : 0);
      const color = e.kind === "crisis" || e.impact === "alto" ? "#ef4444" : e.impact === "medio" ? "#f59e0b" : "#0ea5e9";
      return { ...e, _r: r, color };
    });
    const seen = new Set<string>();
    const picked: typeof scored = [];
    for (const ev of [...scored].sort((a, b) => (b._r - a._r) || b.date.localeCompare(a.date))) {
      if (seen.has(ev.date)) continue;
      picked.push(ev); seen.add(ev.date);
      if (picked.length >= 5) break;
    }
    return picked
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(m => ({ date: m.date, dateKey: m.date.slice(5), title: m.title, detail: m.detail, kind: m.kind, impact: m.impact, color: m.color }));
  }, [eventsTimeline]);

  // y-value por fecha para cada gráfica temporal
  const yByDateLine = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of volumeByDay) m.set(d.date.slice(5), d.positivo + d.neutral + d.negativo + d.crisis);
    return m;
  }, [volumeByDay]);
  const yByDateBar = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of volumeByDay) m.set(d.date, d.positivo + d.neutral + d.negativo + d.crisis);
    return m;
  }, [volumeByDay]);

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

  // ---------- Insights narrativos (explicaciones) ----------

  // Drivers de tonalidad: topics y entidades más asociados a cada polaridad
  const sentimentDrivers = useMemo(() => {
    const topicPolarity = new Map<string, { pos: number; neg: number; neu: number }>();
    const entityPolarity = new Map<string, { pos: number; neg: number; neu: number; count: number }>();
    for (const e of entries) {
      const s = (e.sentiment ?? "neutral") as string;
      const bucket = s === "positivo" ? "pos" : (s === "negativo" || s === "crisis") ? "neg" : "neu";
      for (const t of (e.topics ?? [])) {
        const row = topicPolarity.get(t) ?? { pos: 0, neg: 0, neu: 0 };
        (row as any)[bucket]++;
        topicPolarity.set(t, row);
      }
      for (const ent of (e.entities ?? [])) {
        const name = typeof ent === "string" ? ent : ent?.name; if (!name) continue;
        const localSent = (typeof ent === "object" && ent?.sentiment) ? ent.sentiment : s;
        const b = localSent === "positivo" ? "pos" : (localSent === "negativo" || localSent === "crisis") ? "neg" : "neu";
        const row = entityPolarity.get(name) ?? { pos: 0, neg: 0, neu: 0, count: 0 };
        (row as any)[b]++; row.count++;
        entityPolarity.set(name, row);
      }
    }
    const negTopics = Array.from(topicPolarity.entries())
      .filter(([_, v]) => v.neg > 0)
      .sort((a, b) => b[1].neg - a[1].neg).slice(0, 4)
      .map(([topic, v]) => ({ topic, count: v.neg }));
    const posTopics = Array.from(topicPolarity.entries())
      .filter(([_, v]) => v.pos > 0)
      .sort((a, b) => b[1].pos - a[1].pos).slice(0, 4)
      .map(([topic, v]) => ({ topic, count: v.pos }));
    const negEntities = Array.from(entityPolarity.entries())
      .filter(([_, v]) => v.neg > 0)
      .sort((a, b) => b[1].neg - a[1].neg).slice(0, 3)
      .map(([name, v]) => ({ name, count: v.neg }));
    const posEntities = Array.from(entityPolarity.entries())
      .filter(([_, v]) => v.pos > 0)
      .sort((a, b) => b[1].pos - a[1].pos).slice(0, 3)
      .map(([name, v]) => ({ name, count: v.pos }));
    // Representative quotes
    const negQuote = quotes.find(q => q.sentiment === "negativo" || q.sentiment === "crisis");
    const posQuote = quotes.find(q => q.sentiment === "positivo");
    return { negTopics, posTopics, negEntities, posEntities, negQuote, posQuote };
  }, [entries, quotes]);

  // Heatmap insights: día pico negativo y día pico positivo
  const heatmapInsights = useMemo(() => {
    const scan = (key: "positivo" | "negativo" | "crisis") => {
      const row = heatmap.grid[key] ?? {};
      let best = { day: "", value: 0 };
      for (const d of DOW_LABELS) {
        const v = row[d] ?? 0;
        if (v > best.value) best = { day: d, value: v };
      }
      return best;
    };
    return {
      pos: scan("positivo"),
      neg: scan("negativo"),
      crisis: scan("crisis"),
    };
  }, [heatmap]);

  // Salud reputacional: desglose explicativo
  const reputationBreakdown = useMemo(() => {
    const baseline = 50;
    const sentimentComponent = Math.round(50 * reputationScore.avg);
    const crisisPenalty = Math.min(30, reputationScore.crisisEvents * 6);
    const parts = [
      { label: "Base neutral", value: baseline, tone: "neutral" as const },
      { label: "Aporte del sentimiento promedio", value: sentimentComponent, tone: sentimentComponent >= 0 ? "positivo" : "negativo" as any },
      { label: "Penalización por crisis / alto impacto", value: -crisisPenalty, tone: crisisPenalty > 0 ? "negativo" : "neutral" as any },
    ];
    const explanation = (() => {
      const bits: string[] = [];
      if (sentimentComponent > 15) bits.push("el tono predominante fue claramente positivo");
      else if (sentimentComponent > 0) bits.push("el tono predominante fue ligeramente positivo");
      else if (sentimentComponent < -15) bits.push("el tono predominante fue marcadamente negativo");
      else if (sentimentComponent < 0) bits.push("el tono predominante fue ligeramente negativo");
      else bits.push("el tono predominante fue neutral");
      if (crisisPenalty > 0) bits.push(`se detectaron ${reputationScore.crisisEvents} evento(s) de alto impacto que restan al score`);
      else bits.push("no se detectaron eventos de crisis o alto impacto");
      return bits.join(" y ") + ".";
    })();
    return { parts, explanation };
  }, [reputationScore]);

  // Insights por plataforma: qué está pasando en cada una
  const platformInsights = useMemo(() => {
    // Agrupa entradas por plataforma (una entrada puede aparecer en varias plataformas)
    const perPlatform = new Map<string, {
      total: number;
      pos: number; neg: number; neu: number; crisis: number;
      topics: Map<string, number>;
      entities: Map<string, number>;
    }>();
    for (const e of entries) {
      const chs = (e.channels ?? []).map((c: any) => ({
        name: typeof c === "string" ? c : c?.name,
        count: typeof c?.count === "number" ? c.count : 1,
      })).filter(c => c.name);
      for (const ch of chs) {
        const key = ch.name;
        const row = perPlatform.get(key) ?? { total: 0, pos: 0, neg: 0, neu: 0, crisis: 0, topics: new Map(), entities: new Map() };
        row.total += ch.count;
        const s = (e.sentiment ?? "neutral") as string;
        if (s === "positivo") row.pos += ch.count;
        else if (s === "negativo") row.neg += ch.count;
        else if (s === "crisis") row.crisis += ch.count;
        else row.neu += ch.count;
        for (const t of (e.topics ?? []).slice(0, 3)) row.topics.set(t, (row.topics.get(t) ?? 0) + 1);
        for (const ent of (e.entities ?? []).slice(0, 3)) {
          const nm = typeof ent === "string" ? ent : ent?.name;
          if (nm) row.entities.set(nm, (row.entities.get(nm) ?? 0) + 1);
        }
        perPlatform.set(key, row);
      }
    }
    return platforms.map(p => {
      const row = perPlatform.get(p.name);
      if (!row) return { ...p, insight: "", dominant: "neutral", topTopics: [] as string[], topEntities: [] as string[] };
      const totalSent = row.pos + row.neg + row.neu + row.crisis || 1;
      const negPct = Math.round(((row.neg + row.crisis) / totalSent) * 100);
      const posPct = Math.round((row.pos / totalSent) * 100);
      const dominant = row.crisis > 0 && (row.crisis + row.neg) >= row.pos ? "crisis"
        : row.neg > row.pos ? "negativo"
        : row.pos > row.neg ? "positivo" : "neutral";
      const topTopics = Array.from(row.topics.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
      const topEntities = Array.from(row.entities.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);
      const insight = (() => {
        const parts: string[] = [];
        if (dominant === "positivo") parts.push(`Conversación mayoritariamente positiva (${posPct}%)`);
        else if (dominant === "negativo") parts.push(`Predomina la crítica (${negPct}% negativo)`);
        else if (dominant === "crisis") parts.push(`Foco de crisis activo (${negPct}% negativo)`);
        else parts.push(`Volumen neutral, sin polarización clara`);
        if (topTopics.length) parts.push(`Ejes: ${topTopics.join(", ")}`);
        if (topEntities.length) parts.push(`Actores citados: ${topEntities.join(", ")}`);
        return parts.join(". ") + ".";
      })();
      return { ...p, insight, dominant, negPct, posPct, topTopics, topEntities };
    });
  }, [entries, platforms]);

  // Detalles por narrativa: sentimiento dominante + snippet + fechas
  const narrativeDetails = useMemo(() => {
    return narratives.map(n => {
      const related = entries.filter(e => (e.topics ?? []).includes(n.topic));
      const sentCount: Record<string, number> = { positivo: 0, neutral: 0, negativo: 0, crisis: 0 };
      for (const e of related) sentCount[e.sentiment ?? "neutral"] = (sentCount[e.sentiment ?? "neutral"] ?? 0) + 1;
      const dominant = (Object.entries(sentCount).sort((a, b) => b[1] - a[1])[0] ?? ["neutral"])[0];
      const snippet = related.map(e => e.summary).filter(Boolean)[0] ?? "";
      const entities = new Set<string>();
      for (const e of related) for (const ent of (e.entities ?? []).slice(0, 3)) {
        const nm = typeof ent === "string" ? ent : ent?.name;
        if (nm) entities.add(nm);
        if (entities.size >= 4) break;
      }
      const firstDate = related.map(e => e.entry_date).sort()[0] ?? "";
      const lastDate = related.map(e => e.entry_date).sort().slice(-1)[0] ?? "";
      return { ...n, dominant, snippet, entities: Array.from(entities), firstDate, lastDate };
    });
  }, [entries, narratives]);

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

      {/* ============ SLIDE 1 · Conversación general ============ */}
      <Card className="p-5 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">01 · Listening</div>
              <h3 className="text-2xl font-display font-bold mt-1">Conversación general</h3>
            </div>
            {trendPeriods.length > 0 && (
              <div className="flex items-end gap-6 flex-wrap">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Tendencia:</span>
                {trendPeriods.map((p, i) => (
                  <div key={i}>
                    <div className="text-[10px] text-muted-foreground">{p.label}</div>
                    <div className={`text-xl font-display font-bold ${p.delta === null ? "text-foreground" : p.delta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {p.total.toLocaleString("es-MX")}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeByDay.map(d => ({ date: d.date.slice(5), total: d.positivo + d.neutral + d.negativo + d.crisis }))}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#ef6a4d" strokeWidth={2.5} dot={{ r: 3, fill: "#ef6a4d" }} activeDot={{ r: 5 }} />
                  {milestones.map((m, i) => {
                    const y = yByDateLine.get(m.dateKey);
                    if (y === undefined) return null;
                    return (
                      <ReferenceDot key={i} x={m.dateKey} y={y} r={7} fill={m.color} stroke="#fff" strokeWidth={2}
                        label={{ value: `H${i + 1}`, position: "top", fontSize: 10, fontWeight: 700, fill: m.color }} />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {milestones.length > 0 && <MilestonesLegend items={milestones} />}
          </div>
          <div className="lg:w-64 grid grid-cols-1 gap-3">
            <SlideKpi label="Menciones del período" value={totals.total.toLocaleString("es-MX")} accent="#ef6a4d" />
            {trendPeriods.length > 1 && trendPeriods[trendPeriods.length - 1].delta !== null && (
              <SlideKpi
                label="vs período previo"
                value={`${trendPeriods[trendPeriods.length - 1].delta! >= 0 ? "▲" : "▼"} ${Math.abs(trendPeriods[trendPeriods.length - 1].delta!)}%`}
                accent={trendPeriods[trendPeriods.length - 1].delta! >= 0 ? "#10b981" : "#ef4444"}
              />
            )}
            <SlideKpi label="Sentimiento positivo" value={`${totals.posPct}%`} accent="#10b981" />
            {totals.peak.value > 0 && (
              <SlideKpi label="Pico del período" value={new Date(totals.peak.date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })} accent="#0ea5e9" hint={`${totals.peak.value} menciones`} />
            )}
          </div>
        </div>
      </Card>

      {/* ============ SLIDE 2 · Plataformas y menciones ============ */}
      {platforms.length > 0 && (
        <Card className="p-5 md:p-6">
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">01 · Listening</div>
            <h3 className="text-2xl font-display font-bold mt-1 flex items-center gap-2"><Radio className="w-5 h-5" />Plataformas y menciones</h3>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={platforms} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110} paddingAngle={2}
                    label={({ pct }) => `${pct}%`} labelLine={false}>
                    {platforms.map((p, i) => <Cell key={i} fill={p.color} stroke="none" />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {platforms.map((p) => (
                <div key={p.name} className="flex items-center gap-3 pl-3 py-2 rounded-lg border-l-4" style={{ borderLeftColor: p.color, background: `${p.color}0f` }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.pct}% del volumen</div>
                  </div>
                  <div className="text-xl font-display font-bold" style={{ color: p.color }}>{p.value}</div>
                </div>
              ))}
            </div>
          </div>
          {platformInsights.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Qué está pasando en cada plataforma</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {platformInsights.map((p) => (
                  <div key={p.name} className="rounded-lg border border-border/40 bg-background/40 p-3 border-l-4" style={{ borderLeftColor: p.color }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-semibold" style={{ color: p.color }}>{p.name}</div>
                      <Badge variant="outline" className="text-[9px]" style={{ borderColor: SENT_COLORS[p.dominant] ?? "#94a3b8", color: SENT_COLORS[p.dominant] ?? "#94a3b8" }}>
                        {p.dominant}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ============ SLIDE 3 · Tonalidad y narrativas ============ */}
      <Card className="p-5 md:p-6">
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">01 · Listening</div>
          <h3 className="text-2xl font-display font-bold mt-1">Tonalidad y narrativas</h3>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentDaily}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={10} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Positivo" stroke={SENT_COLORS.positivo} strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Neutral" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Negativo" stroke={SENT_COLORS.negativo} strokeWidth={2.5} dot={{ r: 2 }} />
                {milestones.map((m, i) => (
                  <ReferenceDot key={i} x={m.dateKey} y={95} r={6} fill={m.color} stroke="#fff" strokeWidth={2}
                    label={{ value: `H${i + 1}`, position: "top", fontSize: 10, fontWeight: 700, fill: m.color }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <SlideKpi label="Positivo" value={`${totals.posPct}%`} accent={SENT_COLORS.positivo} />
            <SlideKpi label="Neutral" value={`${totals.neuPct}%`} accent="#f59e0b" />
            <SlideKpi label="Negativo" value={`${totals.negPct}%`} accent={SENT_COLORS.negativo} />
          </div>
        </div>
        {milestones.length > 0 && <MilestonesLegend items={milestones} />}

        {narratives.length > 0 && (
          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Narrativas dominantes</div>
            <div className="grid gap-2 md:grid-cols-2">
              {narratives.map((n) => (
                <div key={n.topic} className="flex items-center gap-3 p-3 rounded-lg bg-background/40 border border-border/40">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: n.color }}>
                    {n.pct}%
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{n.topic}</div>
                    <div className="text-[10px] text-muted-foreground">Presente en {n.days} día{n.days === 1 ? "" : "s"} del período</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Bloque táctico: volumen apilado + sentimiento agregado */}
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
              {milestones.map((m, i) => {
                const y = yByDateBar.get(m.date);
                if (y === undefined) return null;
                return (
                  <ReferenceDot key={i} x={m.date} y={y} r={6} fill={m.color} stroke="#fff" strokeWidth={2}
                    label={{ value: `H${i + 1}`, position: "top", fontSize: 9, fontWeight: 700, fill: m.color }} />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
          {milestones.length > 0 && <MilestonesLegend items={milestones} />}
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

function SlideKpi({ label, value, accent, hint }: { label: string; value: React.ReactNode; accent: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/40 p-4 border-l-4" style={{ borderLeftColor: accent }}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-2xl font-display font-bold mt-1" style={{ color: accent }}>{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function MilestonesLegend({ items }: { items: { date: string; title: string; detail: string; kind: string; color: string }[] }) {
  return (
    <div className="mt-3 rounded-lg border border-border/40 bg-background/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Flag className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Hitos del período</span>
      </div>
      <div className="grid gap-1.5 md:grid-cols-2">
        {items.map((m, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="mt-0.5 shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white" style={{ background: m.color }}>H{i + 1}</span>
            <div className="min-w-0">
              <div className="font-medium leading-tight truncate">{m.title || m.kind}</div>
              <div className="text-[10px] text-muted-foreground">
                {new Date(m.date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })} · {m.kind}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}