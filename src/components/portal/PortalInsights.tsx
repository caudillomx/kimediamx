import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import {
  Users, TrendingUp, MessageCircle, Eye, Megaphone, Download, Sparkles, ArrowUpRight, ArrowDownRight,
  Heart, Share2, Bookmark, Play, ExternalLink, Clock, CalendarDays,
} from "lucide-react";

type Social = {
  id: string; network: string; account_name: string; period_start: string; period_end: string; period_label: string | null;
  followers: number | null; follower_growth: number | null; posts: number | null; interactions: number | null;
  reach: number | null; impressions: number | null; engagement_rate: number | null; raw: any;
};
type Ad = {
  id: string; platform: string; campaign_key: string; campaign_name: string; objective: string | null;
  period_start: string; period_end: string; period_label: string | null; spend: number | null; impressions: number | null;
  reach: number | null; clicks: number | null; ctr: number | null; cpc: number | null; cpm: number | null;
  results: number | null; result_type: string | null; cost_per_result: number | null; raw: any;
};
type Post = {
  network: string; url?: string; text?: string; date?: string; image?: string; format?: string;
  likes?: number; comments?: number; shares?: number; saves?: number; interactions: number; reach: number; views?: number;
};

export type InsightsView = "panorama" | "contenido" | "publicidad";

const NET: Record<string, { label: string; color: string }> = {
  instagram: { label: "Instagram", color: "hsl(330 85% 60%)" },
  facebook: { label: "Facebook", color: "hsl(220 85% 60%)" },
  tiktok: { label: "TikTok", color: "hsl(185 85% 50%)" },
  youtube: { label: "YouTube", color: "hsl(0 85% 55%)" },
  linkedin: { label: "LinkedIn", color: "hsl(205 80% 45%)" },
  x: { label: "X", color: "hsl(0 0% 60%)" },
};
const FORMAT_LABEL: Record<string, string> = {
  carrusel: "Carrusel", image: "Imagen", video: "Video", reel: "Reel", album: "Álbum", photo: "Foto",
  status: "Texto", link: "Enlace", post: "Publicación",
};
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const nf = (v: number | null | undefined, d = 0) =>
  v == null || Number.isNaN(v) ? "—" : Number(v).toLocaleString("es-MX", { maximumFractionDigits: d, minimumFractionDigits: 0 });
const money = (v: number | null | undefined) =>
  v == null ? "—" : `$${Number(v).toLocaleString("es-MX", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
const sum = (xs: (number | null | undefined)[]) => xs.reduce<number>((a, x) => a + (Number(x) || 0), 0);
const monthKey = (d: string) => d.slice(0, 7);
const monthLabel = (k: string) => `${MESES[Number(k.slice(5, 7)) - 1]} ${k.slice(2, 4)}`;
const fmtLabel = (f?: string) => FORMAT_LABEL[(f ?? "").toLowerCase()] ?? (f ? f[0].toUpperCase() + f.slice(1) : "Otro");

function Delta({ cur, prev, invert }: { cur: number | null; prev: number | null; invert?: boolean }) {
  if (cur == null || prev == null || !prev) return null;
  const p = ((cur - prev) / Math.abs(prev)) * 100;
  if (!Number.isFinite(p) || Math.abs(p) < 0.5) return <span className="text-[11px] text-muted-foreground">sin cambio</span>;
  const good = invert ? p < 0 : p > 0;
  const Icon = p > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${good ? "text-emerald-500" : "text-red-500"}`}>
      <Icon className="w-3 h-3" />{nf(Math.abs(p), 1)}% vs. periodo anterior
    </span>
  );
}

function Kpi({ icon: Icon, label, value, cur, prev, hint, invert }: any) {
  return (
    <Card className="glass border-border/50 p-4 space-y-1.5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="w-3.5 h-3.5 text-coral" /> {label}
      </div>
      <div className="text-2xl font-display font-bold">{value}</div>
      <Delta cur={cur ?? null} prev={prev ?? null} invert={invert} />
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </Card>
  );
}

const tooltipStyle = {
  contentStyle: { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 },
  labelStyle: { color: "hsl(var(--foreground))" },
};

export default function PortalInsights({ clientId, clientName, view }: { clientId: string; clientName: string; view: InsightsView }) {
  const [social, setSocial] = useState<Social[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<string>("");
  const [netFilter, setNetFilter] = useState("all");
  const [fmtFilter, setFmtFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"interactions" | "reach" | "date">("interactions");
  const [downloading, setDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [s, a] = await Promise.all([
        supabase.from("client_portal_social_metrics").select("*").eq("client_id", clientId).order("period_start").limit(1000),
        supabase.from("client_portal_ads_metrics").select("*").eq("client_id", clientId).order("period_start").limit(1000),
      ]);
      if (!alive) return;
      setSocial((s.data ?? []) as Social[]);
      setAds((a.data ?? []) as Ad[]);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [clientId]);

  // Solo cortes mensuales (inicio día 1)
  const months = useMemo(() => {
    const set = new Set<string>();
    [...social, ...ads].forEach((r) => { if (r.period_start.endsWith("-01")) set.add(monthKey(r.period_start)); });
    return [...set].sort();
  }, [social, ads]);

  const ranges = useMemo(() => {
    if (!months.length) return [] as { key: string; label: string; months: string[] }[];
    const last = months[months.length - 1];
    const year = last.slice(0, 4);
    const list = [
      ...[...months].reverse().map((m) => ({ key: m, label: `${monthLabel(m)} (mes)`, months: [m] })),
      { key: "q", label: "Últimos 3 meses", months: months.slice(-3) },
      { key: "ytd", label: `Año ${year} a la fecha`, months: months.filter((m) => m.startsWith(year)) },
    ];
    return list;
  }, [months]);

  useEffect(() => {
    if (ranges.length && !ranges.some((r) => r.key === range)) setRange(ranges[0].key);
  }, [ranges, range]);

  const sel = ranges.find((r) => r.key === range);
  const selMonths = sel?.months ?? [];
  const prevMonths = useMemo(() => {
    if (!selMonths.length) return [];
    const i = months.indexOf(selMonths[0]);
    const n = selMonths.length;
    return i - n >= 0 ? months.slice(i - n, i) : [];
  }, [selMonths, months]);

  const inMonths = <T extends { period_start: string }>(rows: T[], ms: string[]) =>
    rows.filter((r) => r.period_start.endsWith("-01") && ms.includes(monthKey(r.period_start)));

  const sCur = inMonths(social, selMonths);
  const sPrev = inMonths(social, prevMonths);
  const aCur = inMonths(ads, selMonths);
  const aPrev = inMonths(ads, prevMonths);
  const networks = [...new Set(social.map((r) => r.network))];

  /** Seguidores al cierre: último valor conocido por red dentro del rango. */
  const followersAt = (rows: Social[], only?: string[]) => {
    let total = 0; let any = false;
    for (const n of only ?? networks) {
      const v = rows.filter((r) => r.network === n && r.followers != null).sort((a, b) => (a.period_start < b.period_start ? 1 : -1))[0];
      if (v) { total += Number(v.followers); any = true; }
    }
    return any ? total : null;
  };

  const agg = (s: Social[], a: Ad[]) => ({
    followers: followersAt(s),
    growth: sum(s.map((r) => r.follower_growth)),
    posts: sum(s.map((r) => r.posts)),
    interactions: sum(s.map((r) => r.interactions)),
    reach: sum(s.map((r) => r.reach)),
    views: sum(s.map((r) => r.raw?.totals?.views)),
    spend: sum(a.map((r) => r.spend)),
    results: sum(a.map((r) => r.results)),
  });
  const cur = agg(sCur, aCur);
  const prev = agg(sPrev, aPrev);
  // Comparar seguidores solo con las redes que tienen dato en ambos periodos
  const hasF = (rows: Social[], n: string) => rows.some((r) => r.network === n && r.followers != null);
  const common = networks.filter((n) => hasF(sCur, n) && hasF(sPrev, n));
  const followersCmp = common.length ? { cur: followersAt(sCur, common), prev: followersAt(sPrev, common) } : { cur: null, prev: null };
  const cpr = cur.results ? cur.spend / cur.results : null;
  const cprPrev = prev.results ? prev.spend / prev.results : null;

  const posts: Post[] = useMemo(
    () => sCur.flatMap((r) => ((r.raw?.posts ?? r.raw?.top_posts ?? []) as any[]).map((p) => ({ ...p, network: r.network }))),
    [sCur]
  );

  // Tendencia mensual (todo el histórico disponible)
  const trend = useMemo(() => months.map((m) => {
    const row: any = { mes: monthLabel(m) };
    const rs = social.filter((r) => r.period_start === `${m}-01`);
    for (const n of networks) {
      const x = rs.find((r) => r.network === n);
      row[`f_${n}`] = x?.followers ?? null;
      row[`i_${n}`] = x?.interactions ?? 0;
    }
    const as = ads.filter((r) => r.period_start === `${m}-01`);
    row.spend = sum(as.map((r) => r.spend));
    row.results = sum(as.map((r) => r.results));
    return row;
  }), [months, social, ads, networks]);

  const byNetwork = networks.map((n) => {
    const rs = sCur.filter((r) => r.network === n);
    const ps = rs.filter((r) => r.network === n);
    const p = sPrev.filter((r) => r.network === n);
    const inter = sum(ps.map((r) => r.interactions));
    const nposts = sum(ps.map((r) => r.posts));
    return {
      n, followers: followersAt(rs), growth: sum(rs.map((r) => r.follower_growth)), posts: nposts, inter,
      reach: sum(rs.map((r) => r.reach)), perPost: nposts ? inter / nposts : null,
      prevInter: sum(p.map((r) => r.interactions)),
      totals: rs.reduce((acc, r) => {
        const t = r.raw?.totals ?? {};
        for (const k of ["likes", "comments", "shares", "saves", "views"]) acc[k] = (acc[k] ?? 0) + (t[k] ?? 0);
        return acc;
      }, {} as Record<string, number>),
    };
  }).filter((x) => x.posts || x.followers != null);

  const formats = useMemo(() => {
    const m = new Map<string, { n: number; inter: number; reach: number }>();
    posts.forEach((p) => {
      const k = fmtLabel(p.format);
      const x = m.get(k) ?? { n: 0, inter: 0, reach: 0 };
      x.n++; x.inter += p.interactions || 0; x.reach += p.reach || 0; m.set(k, x);
    });
    return [...m.entries()].map(([k, v]) => ({ formato: k, publicaciones: v.n, promedio: Math.round(v.inter / v.n), alcance: Math.round(v.reach / v.n) }))
      .sort((a, b) => b.promedio - a.promedio);
  }, [posts]);

  const weekdays = useMemo(() => {
    const m = Array.from({ length: 7 }, (_, i) => ({ dia: DIAS[i], n: 0, inter: 0 }));
    posts.forEach((p) => {
      if (!p.date) return;
      const d = new Date(String(p.date).slice(0, 19));
      if (Number.isNaN(d.getTime())) return;
      m[d.getDay()].n++; m[d.getDay()].inter += p.interactions || 0;
    });
    return m.map((x) => ({ dia: x.dia.slice(0, 3), promedio: x.n ? Math.round(x.inter / x.n) : 0, n: x.n, full: x.dia }));
  }, [posts]);

  const campaigns = useMemo(() => {
    const m = new Map<string, Ad & { months: number }>();
    aCur.forEach((r) => {
      const k = `${r.platform}|${r.campaign_key}`;
      const x = m.get(k);
      if (!x) m.set(k, { ...r, months: 1, raw: { ...r.raw, actions: { ...(r.raw?.actions ?? {}) } } });
      else {
        x.spend = sum([x.spend, r.spend]); x.impressions = sum([x.impressions, r.impressions]); x.reach = sum([x.reach, r.reach]);
        x.clicks = sum([x.clicks, r.clicks]); x.results = sum([x.results, r.results]); x.months++;
        for (const [a, v] of Object.entries(r.raw?.actions ?? {})) x.raw.actions[a] = (x.raw.actions[a] ?? 0) + (v as number);
      }
    });
    return [...m.values()].map((c) => ({ ...c, cost_per_result: c.results ? (c.spend ?? 0) / c.results : null,
      ctr: c.impressions ? ((c.clicks ?? 0) / c.impressions) * 100 : null, cpm: c.impressions ? ((c.spend ?? 0) / c.impressions) * 1000 : null }))
      .sort((a, b) => (b.spend ?? 0) - (a.spend ?? 0));
  }, [aCur]);

  const adActions = useMemo(() => {
    const t: Record<string, number> = {};
    campaigns.forEach((c) => Object.entries(c.raw?.actions ?? {}).forEach(([k, v]) => { t[k] = (t[k] ?? 0) + (v as number); }));
    const pick = (k: string) => t[k] ?? 0;
    return [
      { label: "Conversaciones iniciadas", v: pick("onsite_conversion.messaging_conversation_started_7d") },
      { label: "Primeras respuestas", v: pick("onsite_conversion.messaging_first_reply") },
      { label: "Clics al enlace", v: pick("link_click") },
      { label: "Interacciones con publicaciones", v: pick("post_engagement") },
      { label: "Reproducciones de video", v: pick("video_play_actions.video_views") || pick("video_view") },
      { label: "Reacciones", v: pick("post_reaction") },
      { label: "Guardados", v: pick("onsite_conversion.post_save") },
      { label: "Comentarios", v: pick("comment") },
    ].filter((x) => x.v > 0);
  }, [campaigns]);

  // Lectura automática: solo hechos calculados de los datos cargados
  const insights = useMemo(() => {
    const out: string[] = [];
    const topNet = [...byNetwork].sort((a, b) => b.inter - a.inter)[0];
    if (topNet && cur.interactions) out.push(`${NET[topNet.n]?.label ?? topNet.n} concentra el ${nf((topNet.inter / cur.interactions) * 100)}% de las interacciones del periodo (${nf(topNet.inter)} de ${nf(cur.interactions)}).`);
    const perPost = byNetwork.filter((x) => x.perPost).sort((a, b) => (b.perPost ?? 0) - (a.perPost ?? 0))[0];
    if (perPost && perPost.n !== topNet?.n) out.push(`Por publicación, ${NET[perPost.n]?.label} rinde más: ${nf(perPost.perPost)} interacciones en promedio.`);
    if (formats.length > 1) out.push(`El formato con mejor promedio es ${formats[0].formato} (${nf(formats[0].promedio)} interacciones por pieza, ${formats[0].publicaciones} publicaciones).`);
    const bestDay = [...weekdays].filter((d) => d.n >= 2).sort((a, b) => b.promedio - a.promedio)[0];
    if (bestDay) out.push(`Las publicaciones del ${bestDay.full} tuvieron el mejor promedio (${nf(bestDay.promedio)} interacciones, ${bestDay.n} piezas).`);
    const best = [...posts].sort((a, b) => b.interactions - a.interactions)[0];
    if (best) out.push(`La pieza más fuerte fue en ${NET[best.network]?.label}: "${Array.from(best.text ?? "").slice(0, 70).join("")}…" con ${nf(best.interactions)} interacciones.`);
    if (cur.spend && cur.results) out.push(`La publicidad generó ${nf(cur.results)} resultados con ${money(cur.spend)} de inversión: ${money(cpr)} por resultado${cprPrev ? ` (antes ${money(cprPrev)})` : ""}.`);
    const missing = byNetwork.filter((x) => x.followers == null).map((x) => NET[x.n]?.label);
    if (missing.length) out.push(`Metricool no registró el total de seguidores de ${missing.join(" y ")} en este periodo; se muestran publicaciones e interacciones reales.`);
    return out;
  }, [byNetwork, cur, formats, weekdays, posts, cpr, cprPrev]);

  const filteredPosts = useMemo(() => posts
    .filter((p) => netFilter === "all" || p.network === netFilter)
    .filter((p) => fmtFilter === "all" || fmtLabel(p.format) === fmtFilter)
    .sort((a, b) => sortBy === "date" ? String(b.date ?? "").localeCompare(String(a.date ?? "")) : (b[sortBy] ?? 0) - (a[sortBy] ?? 0)),
    [posts, netFilter, fmtFilter, sortBy]);

  const download = async () => {
    if (!pdfRef.current) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const bg = getComputedStyle(document.body).backgroundColor;
      await html2pdf().set({
        margin: 6, filename: `${clientName.replace(/\s+/g, "-").toLowerCase()}-${view}-${range}.pdf`,
        image: { type: "jpeg", quality: 0.95 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: bg },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } as any,
      }).from(pdfRef.current).save();
    } catch { toast.error("No se pudo generar el PDF"); } finally { setDownloading(false); }
  };

  if (loading) return <div className="grid gap-3 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>;
  if (!months.length) {
    return (
      <Card className="glass border-border/50 p-14 text-center space-y-2">
        <Users className="w-8 h-8 text-coral mx-auto" />
        <h3 className="font-semibold">Aún no hay datos cargados</h3>
        <p className="text-sm text-muted-foreground">En cuanto conectemos tus redes, aquí verás tu desempeño.</p>
      </Card>
    );
  }

  const header = (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={range} onValueChange={setRange}>
        <SelectTrigger className="h-9 w-56"><CalendarDays className="w-4 h-4 mr-2 text-coral" /><SelectValue /></SelectTrigger>
        <SelectContent>{ranges.map((r) => <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>)}</SelectContent>
      </Select>
      {prevMonths.length > 0 && <span className="text-xs text-muted-foreground">Comparado con {prevMonths.map(monthLabel).join(" – ")}</span>}
      <Button size="sm" variant="outline" className="ml-auto h-9" onClick={download} disabled={downloading}>
        <Download className="w-4 h-4 mr-2" /> {downloading ? "Generando…" : "Descargar PDF"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {header}
      <div ref={pdfRef} className="space-y-6">
        {view === "panorama" && (
          <>
            <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
              <Kpi icon={Users} label="Comunidad total" value={nf(cur.followers)} cur={followersCmp.cur} prev={followersCmp.prev} hint={`${cur.growth >= 0 ? "+" : ""}${nf(cur.growth)} seguidores nuevos`} />
              <Kpi icon={Heart} label="Interacciones" value={nf(cur.interactions)} cur={cur.interactions} prev={prev.interactions} hint={`${nf(cur.posts)} publicaciones`} />
              <Kpi icon={Eye} label="Alcance orgánico" value={nf(cur.reach)} cur={cur.reach} prev={prev.reach} hint={cur.views ? `${nf(cur.views)} reproducciones` : undefined} />
              {cur.spend ? (
                <Kpi icon={Megaphone} label="Costo por resultado" value={money(cpr)} cur={cpr} prev={cprPrev} invert hint={`${nf(cur.results)} resultados · ${money(cur.spend)}`} />
              ) : (
                <Kpi icon={TrendingUp} label="Interacciones por pieza" value={nf(cur.posts ? cur.interactions / cur.posts : null)} cur={cur.posts ? cur.interactions / cur.posts : null} prev={prev.posts ? prev.interactions / prev.posts : null} />
              )}
            </div>

            {insights.length > 0 && (
              <Card className="glass border-coral/30 p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="w-4 h-4 text-coral" /> Lectura del periodo</div>
                <ul className="space-y-2 text-sm">
                  {insights.map((t, i) => <li key={i} className="flex gap-2"><span className="text-coral">•</span><span>{t}</span></li>)}
                </ul>
              </Card>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="glass border-border/50 p-5 space-y-3">
                <div className="text-sm font-semibold">Crecimiento de comunidad por red</div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <LineChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={48} />
                      <Tooltip {...tooltipStyle} formatter={(v: any) => nf(v)} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {networks.map((n) => <Line key={n} type="monotone" dataKey={`f_${n}`} name={NET[n]?.label ?? n} stroke={NET[n]?.color} strokeWidth={2} dot={{ r: 3 }} connectNulls />)}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-muted-foreground">Los meses sin punto son meses en que Metricool no registró el total de seguidores.</p>
              </Card>
              <Card className="glass border-border/50 p-5 space-y-3">
                <div className="text-sm font-semibold">Interacciones por mes</div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={48} />
                      <Tooltip {...tooltipStyle} formatter={(v: any) => nf(v)} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {networks.map((n) => <Bar key={n} dataKey={`i_${n}`} name={NET[n]?.label ?? n} stackId="a" fill={NET[n]?.color} />)}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {byNetwork.map((x) => (
                <Card key={x.n} className="glass border-border/50 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold" style={{ color: NET[x.n]?.color }}>{NET[x.n]?.label ?? x.n}</div>
                    <Delta cur={x.inter} prev={x.prevInter || null} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><div className="text-[11px] text-muted-foreground">Seguidores</div><div className="font-semibold">{nf(x.followers)}</div></div>
                    <div><div className="text-[11px] text-muted-foreground">Nuevos</div><div className="font-semibold">{x.followers == null ? "—" : `+${nf(x.growth)}`}</div></div>
                    <div><div className="text-[11px] text-muted-foreground">Publicaciones</div><div className="font-semibold">{nf(x.posts)}</div></div>
                    <div><div className="text-[11px] text-muted-foreground">Interacciones</div><div className="font-semibold">{nf(x.inter)}</div></div>
                    <div><div className="text-[11px] text-muted-foreground">Alcance</div><div className="font-semibold">{nf(x.reach)}</div></div>
                    <div><div className="text-[11px] text-muted-foreground">Por pieza</div><div className="font-semibold">{nf(x.perPost)}</div></div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
                    <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3" />{nf(x.totals.likes)}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" />{nf(x.totals.comments)}</span>
                    <span className="inline-flex items-center gap-1"><Share2 className="w-3 h-3" />{nf(x.totals.shares)}</span>
                    {!!x.totals.saves && <span className="inline-flex items-center gap-1"><Bookmark className="w-3 h-3" />{nf(x.totals.saves)}</span>}
                    {!!x.totals.views && <span className="inline-flex items-center gap-1"><Play className="w-3 h-3" />{nf(x.totals.views)}</span>}
                  </div>
                </Card>
              ))}
            </div>

            <TopPosts posts={[...posts].sort((a, b) => b.interactions - a.interactions).slice(0, 6)} title="Lo que mejor funcionó" />
          </>
        )}

        {view === "contenido" && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="glass border-border/50 p-5 space-y-3">
                <div className="text-sm font-semibold">Qué formato rinde más</div>
                {formats.length ? (
                  <div className="h-56">
                    <ResponsiveContainer>
                      <BarChart data={formats} layout="vertical" margin={{ left: 10 }}>
                        <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis type="category" dataKey="formato" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={80} />
                        <Tooltip {...tooltipStyle} formatter={(v: any, k: any) => [nf(v), k === "promedio" ? "Interacciones promedio" : k]} />
                        <Bar dataKey="promedio" fill="hsl(var(--coral, 15 95% 55%))" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className="text-sm text-muted-foreground">Sin publicaciones en el periodo.</p>}
                <div className="text-[11px] text-muted-foreground">{formats.map((f) => `${f.formato}: ${f.publicaciones} piezas`).join(" · ")}</div>
              </Card>
              <Card className="glass border-border/50 p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><Clock className="w-4 h-4 text-coral" /> Mejor día para publicar</div>
                <div className="h-56">
                  <ResponsiveContainer>
                    <BarChart data={weekdays}>
                      <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={40} />
                      <Tooltip {...tooltipStyle} formatter={(v: any) => [nf(v), "Interacciones promedio"]} />
                      <Bar dataKey="promedio" fill="hsl(185 85% 50%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[11px] text-muted-foreground">Promedio de interacciones por pieza según el día de publicación.</div>
              </Card>
            </div>

            <Card className="glass border-border/50 p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold mr-auto">Todas las publicaciones ({filteredPosts.length})</div>
                <Select value={netFilter} onValueChange={setNetFilter}>
                  <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las redes</SelectItem>
                    {networks.map((n) => <SelectItem key={n} value={n}>{NET[n]?.label ?? n}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={fmtFilter} onValueChange={setFmtFilter}>
                  <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los formatos</SelectItem>
                    {formats.map((f) => <SelectItem key={f.formato} value={f.formato}>{f.formato}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interactions">Más interacciones</SelectItem>
                    <SelectItem value="reach">Más alcance</SelectItem>
                    <SelectItem value="date">Más recientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredPosts.slice(0, 60).map((p, i) => <PostCard key={i} p={p} />)}
              </div>
            </Card>
          </>
        )}

        {view === "publicidad" && (
          campaigns.length ? (
            <>
              <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
                <Kpi icon={Megaphone} label="Inversión" value={money(cur.spend)} cur={cur.spend} prev={prev.spend} />
                <Kpi icon={MessageCircle} label="Resultados" value={nf(cur.results)} cur={cur.results} prev={prev.results} hint={campaigns[0]?.result_type ?? undefined} />
                <Kpi icon={TrendingUp} label="Costo por resultado" value={money(cpr)} cur={cpr} prev={cprPrev} invert />
                <Kpi icon={Eye} label="Impresiones" value={nf(sum(campaigns.map((c) => c.impressions)))} cur={sum(campaigns.map((c) => c.impressions))} prev={sum(aPrev.map((c) => c.impressions)) || null} hint={`CPM ${money(sum(campaigns.map((c) => c.impressions)) ? (cur.spend / sum(campaigns.map((c) => c.impressions))) * 1000 : null)}`} />
              </div>

              <Card className="glass border-border/50 p-5 space-y-3">
                <div className="text-sm font-semibold">Inversión y resultados por mes</div>
                <div className="h-60">
                  <ResponsiveContainer>
                    <BarChart data={trend.filter((t) => t.spend)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis yAxisId="l" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={48} />
                      <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={40} />
                      <Tooltip {...tooltipStyle} formatter={(v: any, k: any) => [k === "Inversión" ? money(v) : nf(v), k]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar yAxisId="l" dataKey="spend" name="Inversión" fill="hsl(45 100% 55%)" radius={[6, 6, 0, 0]} />
                      <Bar yAxisId="r" dataKey="results" name="Resultados" fill="hsl(330 85% 60%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {adActions.length > 0 && (
                <Card className="glass border-border/50 p-5 space-y-3">
                  <div className="text-sm font-semibold">Lo que generó la publicidad</div>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                    {adActions.map((a) => (
                      <div key={a.label} className="rounded-xl border border-border/50 p-3">
                        <div className="text-[11px] text-muted-foreground">{a.label}</div>
                        <div className="text-lg font-semibold">{nf(a.v)}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="glass border-border/50 p-5 space-y-3">
                <div className="text-sm font-semibold">Campañas</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border/50">
                        <th className="text-left py-2 font-medium">Campaña</th>
                        <th className="text-right py-2 font-medium">Inversión</th>
                        <th className="text-right py-2 font-medium">Alcance</th>
                        <th className="text-right py-2 font-medium">Clics</th>
                        <th className="text-right py-2 font-medium">CTR</th>
                        <th className="text-right py-2 font-medium">Resultados</th>
                        <th className="text-right py-2 font-medium">Costo c/u</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((c) => (
                        <tr key={c.campaign_key} className="border-b border-border/30 last:border-0">
                          <td className="py-2">
                            <div className="font-medium">{c.campaign_name}</div>
                            <div className="text-[11px] text-muted-foreground">Meta · {c.raw?.status === "ACTIVE" ? "Activa" : "Finalizada"}</div>
                          </td>
                          <td className="text-right py-2">{money(c.spend)}</td>
                          <td className="text-right py-2">{nf(c.reach)}</td>
                          <td className="text-right py-2">{nf(c.clicks)}</td>
                          <td className="text-right py-2">{c.ctr == null ? "—" : `${nf(c.ctr, 2)}%`}</td>
                          <td className="text-right py-2">{nf(c.results)} <span className="text-[11px] text-muted-foreground">{c.result_type}</span></td>
                          <td className="text-right py-2">{money(c.cost_per_result)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <Card className="glass border-border/50 p-14 text-center space-y-2">
              <Megaphone className="w-8 h-8 text-coral mx-auto" />
              <h3 className="font-semibold">Sin campañas en este periodo</h3>
              <p className="text-sm text-muted-foreground">Elige otro mes o el año completo para ver la publicidad.</p>
            </Card>
          )
        )}
      </div>
    </div>
  );
}

function PostCard({ p }: { p: Post }) {
  return (
    <a href={p.url ?? undefined} target="_blank" rel="noreferrer" className="group rounded-xl border border-border/50 overflow-hidden hover:border-coral/50 transition-colors flex flex-col">
      {p.image && (
        <div className="aspect-[4/3] bg-muted overflow-hidden">
          <img src={p.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" onError={(e) => ((e.target as HTMLImageElement).parentElement!.style.display = "none")} />
        </div>
      )}
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Badge variant="outline" className="text-[10px]" style={{ color: NET[p.network]?.color }}>{NET[p.network]?.label ?? p.network}</Badge>
          <span>{fmtLabel(p.format)}</span>
          <span className="ml-auto">{p.date ? new Date(String(p.date).slice(0, 19)).toLocaleDateString("es-MX", { day: "numeric", month: "short" }) : ""}</span>
        </div>
        <p className="text-xs line-clamp-3 flex-1">{p.text || "Publicación sin texto"}</p>
        <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{nf(p.interactions)} interacciones</span>
          <span>{nf(p.reach)} alcance</span>
          {!!p.saves && <span className="inline-flex items-center gap-1"><Bookmark className="w-3 h-3" />{nf(p.saves)}</span>}
          {!!p.shares && <span className="inline-flex items-center gap-1"><Share2 className="w-3 h-3" />{nf(p.shares)}</span>}
          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    </a>
  );
}

function TopPosts({ posts, title }: { posts: Post[]; title: string }) {
  if (!posts.length) return null;
  return (
    <Card className="glass border-border/50 p-5 space-y-3">
      <div className="text-sm font-semibold">{title}</div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{posts.map((p, i) => <PostCard key={i} p={p} />)}</div>
    </Card>
  );
}
