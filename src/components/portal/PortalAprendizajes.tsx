import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Lightbulb, Target, TrendingUp, TrendingDown, Clock, Bookmark, Share2, Type, Hash, CalendarCheck,
  Sparkles, Loader2, CheckCircle2, AlertTriangle, ExternalLink,
} from "lucide-react";

export type APost = {
  network: string; url?: string; text?: string; date?: string; image?: string; format?: string;
  likes?: number; comments?: number; shares?: number; saves?: number; interactions: number; reach: number; views?: number;
};

const NET: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", youtube: "YouTube", linkedin: "LinkedIn", x: "X" };
const FMT: Record<string, string> = { carrusel: "Carrusel", image: "Imagen", video: "Video", reel: "Reel", album: "Álbum", photo: "Foto", status: "Texto", link: "Enlace", post: "Publicación" };
const fmtL = (f?: string) => FMT[(f ?? "").toLowerCase()] ?? (f ? f[0].toUpperCase() + f.slice(1) : "Otro");
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const FRANJAS = [
  { k: "Madrugada", from: 0, to: 6 }, { k: "Mañana", from: 6, to: 12 }, { k: "Tarde", from: 12, to: 18 }, { k: "Noche", from: 18, to: 24 },
];
const nf = (v: number | null | undefined, d = 0) => v == null || !Number.isFinite(v) ? "—" : Number(v).toLocaleString("es-MX", { maximumFractionDigits: d });
const pct = (v: number | null) => v == null || !Number.isFinite(v) ? "—" : `${nf(v * 100, 1)}%`;
const avg = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
const er = (p: APost) => (p.reach ? p.interactions / p.reach : null);
const snippet = (t?: string, n = 90) => { const a = Array.from((t ?? "").replace(/\s+/g, " ").trim()); return a.length > n ? a.slice(0, n).join("") + "…" : a.join(""); };

const STOP = new Set(("de la que el en y a los del se las por un para con no una su al lo como más pero sus le ya o este sí porque esta entre cuando muy sin sobre también me hasta hay donde quien desde todo nos durante todos uno les ni contra otros ese eso ante ellos e esto mí antes algunos qué unos yo otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo nosotros mi mis tú te ti tu tus ellas nosotras vosotros os mío mía tuyo suyo nuestro nuestra es son fue ser hoy día vez cada tiene hace puede solo así bien cómo dónde qué cuál todas estás está están tan sea aquí ahí dios jesús señor").split(" "));

type ParrillaItem = { scheduled_date: string | null; network: string | null; status: string | null; title: string | null };

export default function PortalAprendizajes({
  clientId, posts, allPosts, periodLabel, months,
}: { clientId: string; posts: APost[]; allPosts: APost[]; periodLabel: string; months: string[] }) {
  const [plan, setPlan] = useState<ParrillaItem[]>([]);
  const [ai, setAi] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    supabase.from("notion_parrilla_items").select("scheduled_date, network, status, title").eq("client_id", clientId)
      .then(({ data }) => setPlan((data ?? []) as ParrillaItem[]));
  }, [clientId]);
  useEffect(() => setAi(null), [periodLabel]);

  const a = useMemo(() => {
    const base = avg(allPosts.map((p) => p.interactions || 0));
    const cur = avg(posts.map((p) => p.interactions || 0));

    // Formato x red
    const matrix = new Map<string, Map<string, number[]>>();
    posts.forEach((p) => {
      const f = fmtL(p.format); const m = matrix.get(p.network) ?? new Map(); const xs = m.get(f) ?? [];
      xs.push(p.interactions || 0); m.set(f, xs); matrix.set(p.network, m);
    });
    const formatNet = [...matrix.entries()].map(([n, m]) => ({
      n, rows: [...m.entries()].map(([f, xs]) => ({ f, n: xs.length, avg: avg(xs) })).sort((x, y) => y.avg - x.avg),
    }));

    // Día x franja
    const heat = DIAS.map(() => FRANJAS.map(() => [] as number[]));
    const hours = Array.from({ length: 24 }, () => [] as number[]);
    posts.forEach((p) => {
      if (!p.date) return; const d = new Date(String(p.date).slice(0, 19)); if (Number.isNaN(d.getTime())) return;
      const h = d.getHours(); const fi = FRANJAS.findIndex((f) => h >= f.from && h < f.to);
      heat[d.getDay()][fi].push(p.interactions || 0); hours[h].push(p.interactions || 0);
    });
    const heatMax = Math.max(1, ...heat.flat().map((xs) => avg(xs)));
    let bestSlot: { d: number; f: number; v: number; n: number } | null = null;
    heat.forEach((row, d) => row.forEach((xs, f) => { if (xs.length >= 2 && (!bestSlot || avg(xs) > bestSlot.v)) bestSlot = { d, f, v: avg(xs), n: xs.length }; }));

    // Longitud de texto
    const lenBuckets = [
      { k: "Corto (<150 car.)", test: (l: number) => l < 150 }, { k: "Medio (150–400)", test: (l: number) => l >= 150 && l <= 400 },
      { k: "Largo (>400)", test: (l: number) => l > 400 },
    ].map((b) => { const xs = posts.filter((p) => b.test(Array.from(p.text ?? "").length)); return { k: b.k, n: xs.length, avg: avg(xs.map((p) => p.interactions || 0)) }; });

    // Preguntas / llamados
    const withQ = posts.filter((p) => /\?/.test(p.text ?? "")); const noQ = posts.filter((p) => !/\?/.test(p.text ?? ""));
    const qEffect = withQ.length >= 2 && noQ.length >= 2 ? { withQ: avg(withQ.map((p) => p.interactions)), noQ: avg(noQ.map((p) => p.interactions)), nQ: withQ.length } : null;

    // Temas (palabras) ponderados — desde histórico para tener volumen
    const words = new Map<string, number[]>();
    allPosts.forEach((p) => {
      const ws = new Set(((p.text ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-zñ]{5,}/g) ?? []).filter((w) => !STOP.has(w)));
      ws.forEach((w) => { const xs = words.get(w) ?? []; xs.push(p.interactions || 0); words.set(w, xs); });
    });
    const themes = [...words.entries()].filter(([, xs]) => xs.length >= 4)
      .map(([w, xs]) => ({ w, n: xs.length, avg: avg(xs), lift: base ? avg(xs) / base : 1 }))
      .sort((x, y) => y.lift - x.lift);
    const themesUp = themes.slice(0, 8);
    const themesDown = [...themes].reverse().filter((t) => t.lift < 0.85).slice(0, 5);

    // Calidad: guardados+compartidos por alcance
    const quality = posts.map((p) => ({ p, q: p.reach ? ((p.saves || 0) + (p.shares || 0)) / p.reach : 0 })).sort((x, y) => y.q - x.q);

    const withEr = posts.filter((p) => p.reach >= 100);
    const byEr = [...withEr].sort((x, y) => (er(y) ?? 0) - (er(x) ?? 0));
    const top = byEr.slice(0, 4); const bottom = byEr.slice(-4).reverse();

    // Frecuencia por red (por semana)
    const days = Math.max(1, months.length * 30);
    const freq = Object.entries(posts.reduce<Record<string, number>>((acc, p) => { acc[p.network] = (acc[p.network] ?? 0) + 1; return acc; }, {}))
      .map(([n, c]) => ({ n, perWeek: (c / days) * 7, c }));

    // Plan vs real
    const inPeriod = plan.filter((i) => i.scheduled_date && months.includes(i.scheduled_date.slice(0, 7)));
    const planned = inPeriod.length;
    const pubDates = new Set(posts.map((p) => String(p.date ?? "").slice(0, 10)));
    const delivered = inPeriod.filter((i) => pubDates.has(i.scheduled_date!)).length;

    return { base, cur, formatNet, heat, heatMax, bestSlot: bestSlot as any, hours, lenBuckets, qEffect, themesUp, themesDown, quality, top, bottom, freq, planned, delivered };
  }, [posts, allPosts, plan, months]);

  // Recomendaciones basadas en reglas (solo evidencia calculada)
  const recs = useMemo(() => {
    const out: { tipo: "hacer" | "dejar" | "probar"; titulo: string; porque: string }[] = [];
    a.formatNet.forEach(({ n, rows }) => {
      const good = rows.filter((r) => r.n >= 2);
      if (good.length >= 2 && good[0].avg > good[good.length - 1].avg * 1.5) {
        out.push({ tipo: "hacer", titulo: `En ${NET[n] ?? n}, prioriza ${good[0].f}`, porque: `Promedia ${nf(good[0].avg)} interacciones (${good[0].n} piezas) contra ${nf(good[good.length - 1].avg)} de ${good[good.length - 1].f}.` });
      }
    });
    if (a.bestSlot) out.push({ tipo: "hacer", titulo: `Programa las piezas clave el ${DIAS[a.bestSlot.d].toLowerCase()} por la ${FRANJAS[a.bestSlot.f].k.toLowerCase()}`, porque: `Es la franja con mejor promedio del periodo: ${nf(a.bestSlot.v)} interacciones en ${a.bestSlot.n} publicaciones.` });
    const lb = a.lenBuckets.filter((b) => b.n >= 3).sort((x, y) => y.avg - x.avg);
    if (lb.length >= 2 && lb[0].avg > lb[lb.length - 1].avg * 1.3) out.push({ tipo: "probar", titulo: `Textos de largo ${lb[0].k.split(" ")[0].toLowerCase()}`, porque: `Rinden ${nf(lb[0].avg)} interacciones en promedio vs. ${nf(lb[lb.length - 1].avg)} los de largo ${lb[lb.length - 1].k.split(" ")[0].toLowerCase()}.` });
    if (a.qEffect) {
      const up = a.qEffect.withQ > a.qEffect.noQ;
      out.push({ tipo: up ? "hacer" : "probar", titulo: up ? "Cierra con una pregunta" : "Revisa cómo se formulan las preguntas", porque: `Las piezas con pregunta promedian ${nf(a.qEffect.withQ)} interacciones vs. ${nf(a.qEffect.noQ)} sin pregunta (${a.qEffect.nQ} con pregunta).` });
    }
    if (a.themesUp[0]) out.push({ tipo: "hacer", titulo: `Más contenido sobre "${a.themesUp[0].w}"${a.themesUp[1] ? ` y "${a.themesUp[1].w}"` : ""}`, porque: `Las piezas que lo mencionan rinden ${nf(a.themesUp[0].lift, 1)}× el promedio histórico de la cuenta (${a.themesUp[0].n} piezas).` });
    if (a.themesDown[0]) out.push({ tipo: "dejar", titulo: `Replantear piezas sobre "${a.themesDown[0].w}"`, porque: `Rinden ${nf(a.themesDown[0].lift * 100)}% del promedio histórico (${a.themesDown[0].n} piezas). Cambiar ángulo o formato.` });
    const low = a.freq.filter((f) => f.perWeek < 2);
    low.forEach((f) => out.push({ tipo: "probar", titulo: `Subir frecuencia en ${NET[f.n] ?? f.n}`, porque: `Hoy se publica ${nf(f.perWeek, 1)} veces por semana (${f.c} en el periodo); con tan poco volumen el algoritmo tiene poco que distribuir.` }));
    if (a.planned && a.delivered / a.planned < 0.8) out.push({ tipo: "dejar", titulo: "Cerrar la brecha entre parrilla y publicación", porque: `De ${a.planned} piezas planeadas en Notion para el periodo, ${a.delivered} coinciden con un día publicado.` });
    return out;
  }, [a]);

  const genAi = async () => {
    setAiLoading(true);
    const payload = {
      periodo: periodLabel,
      promedio_periodo: Math.round(a.cur), promedio_historico: Math.round(a.base),
      formato_por_red: a.formatNet.map((x) => ({ red: NET[x.n], formatos: x.rows.map((r) => ({ formato: r.f, piezas: r.n, promedio: Math.round(r.avg) })) })),
      mejor_franja: a.bestSlot ? { dia: DIAS[a.bestSlot.d], franja: FRANJAS[a.bestSlot.f].k, promedio: Math.round(a.bestSlot.v), piezas: a.bestSlot.n } : null,
      largo_texto: a.lenBuckets, efecto_preguntas: a.qEffect,
      temas_que_rinden: a.themesUp.map((t) => ({ tema: t.w, piezas: t.n, veces_promedio: +t.lift.toFixed(2) })),
      temas_debiles: a.themesDown.map((t) => ({ tema: t.w, piezas: t.n, veces_promedio: +t.lift.toFixed(2) })),
      frecuencia_semanal: a.freq.map((f) => ({ red: NET[f.n], por_semana: +f.perWeek.toFixed(1) })),
      mejores: a.top.map((p) => ({ red: NET[p.network], formato: fmtL(p.format), texto: snippet(p.text, 140), interacciones: p.interactions, alcance: p.reach })),
      peores: a.bottom.map((p) => ({ red: NET[p.network], formato: fmtL(p.format), texto: snippet(p.text, 140), interacciones: p.interactions, alcance: p.reach })),
      parrilla: { planeadas: a.planned, coinciden_con_publicacion: a.delivered },
    };
    const { data, error } = await supabase.functions.invoke("portal-strategy-ai", { body: { data: payload } });
    setAiLoading(false);
    if (error || !(data as any)?.text) { toast.error("No se pudo generar la lectura"); return; }
    setAi((data as any).text);
  };

  if (!posts.length) return <Card className="glass border-border/50 p-12 text-center text-sm text-muted-foreground">No hay publicaciones en este periodo.</Card>;

  const recStyle = { hacer: { icon: CheckCircle2, cls: "text-emerald-500", label: "Hacer más" }, dejar: { icon: AlertTriangle, cls: "text-coral", label: "Ajustar" }, probar: { icon: Lightbulb, cls: "text-amber-500", label: "Probar" } };

  return (
    <div className="space-y-5">
      {/* Recomendaciones */}
      <Card className="glass border-border/50 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-semibold"><Target className="w-4 h-4 text-coral" /> Qué hacer el próximo periodo</div>
          <Button size="sm" variant="outline" onClick={genAi} disabled={aiLoading}>
            {aiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} Lectura estratégica con IA
          </Button>
        </div>
        {ai && <div className="rounded-xl border border-coral/30 bg-coral/5 p-4 text-sm whitespace-pre-line leading-relaxed">{ai}</div>}
        {recs.length ? (
          <div className="grid md:grid-cols-2 gap-3">
            {recs.map((r, i) => { const S = recStyle[r.tipo]; return (
              <div key={i} className="rounded-xl border border-border/50 p-4 space-y-1.5">
                <div className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wide ${S.cls}`}><S.icon className="w-3.5 h-3.5" /> {S.label}</div>
                <div className="text-sm font-semibold">{r.titulo}</div>
                <div className="text-xs text-muted-foreground">{r.porque}</div>
              </div>
            ); })}
          </div>
        ) : <p className="text-sm text-muted-foreground">Todavía no hay volumen suficiente para recomendaciones firmes en este periodo.</p>}
      </Card>

      {/* Mejores y peores por tasa */}
      <div className="grid lg:grid-cols-2 gap-5">
        <PostList title="Lo que funcionó" subtitle="Mayor tasa de interacción sobre alcance" icon={TrendingUp} posts={a.top} tone="good" />
        <PostList title="Lo que no conectó" subtitle="Menor tasa de interacción sobre alcance" icon={TrendingDown} posts={a.bottom} tone="bad" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Heatmap */}
        <Card className="glass border-border/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><Clock className="w-4 h-4 text-coral" /> Cuándo publicar</div>
          <div className="grid grid-cols-[48px_repeat(4,1fr)] gap-1 text-[11px]">
            <div />{FRANJAS.map((f) => <div key={f.k} className="text-center text-muted-foreground">{f.k}</div>)}
            {DIAS.map((d, di) => (
              <>
                <div key={d} className="text-muted-foreground flex items-center">{d}</div>
                {FRANJAS.map((f, fi) => { const xs = a.heat[di][fi]; const v = avg(xs); return (
                  <div key={d + f.k} title={`${xs.length} piezas`} className="h-9 rounded-md flex items-center justify-center font-medium"
                    style={{ background: xs.length ? `hsl(15 95% 55% / ${0.1 + (v / a.heatMax) * 0.8})` : "hsl(var(--muted) / 0.4)" }}>
                    {xs.length ? nf(v) : ""}
                  </div>
                ); })}
              </>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">Promedio de interacciones por pieza, según día y hora de publicación.</p>
        </Card>

        {/* Formato x red */}
        <Card className="glass border-border/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="w-4 h-4 text-coral" /> Qué formato rinde en cada red</div>
          <div className="space-y-4">
            {a.formatNet.map(({ n, rows }) => { const max = Math.max(1, ...rows.map((r) => r.avg)); return (
              <div key={n} className="space-y-1.5">
                <div className="text-xs font-semibold">{NET[n] ?? n}</div>
                {rows.map((r) => (
                  <div key={r.f} className="grid grid-cols-[90px_1fr_110px] items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{r.f}</span>
                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden"><div className="h-full bg-coral rounded-full" style={{ width: `${(r.avg / max) * 100}%` }} /></div>
                    <span className="text-right">{nf(r.avg)} <span className="text-muted-foreground">· {r.n} pzs</span></span>
                  </div>
                ))}
              </div>
            ); })}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="glass border-border/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><Hash className="w-4 h-4 text-coral" /> Temas que mueven a la comunidad</div>
          <div className="flex flex-wrap gap-1.5">
            {a.themesUp.map((t) => <Badge key={t.w} variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400">{t.w} · {nf(t.lift, 1)}×</Badge>)}
          </div>
          {!!a.themesDown.length && <>
            <div className="text-[11px] text-muted-foreground pt-1">Por debajo del promedio</div>
            <div className="flex flex-wrap gap-1.5">{a.themesDown.map((t) => <Badge key={t.w} variant="outline" className="border-coral/40 text-coral">{t.w} · {nf(t.lift, 1)}×</Badge>)}</div>
          </>}
          <p className="text-[11px] text-muted-foreground">Palabras presentes en 4 o más piezas del año; "2×" = rinde el doble del promedio de la cuenta.</p>
        </Card>
        <Card className="glass border-border/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><Type className="w-4 h-4 text-coral" /> Cómo se escribe</div>
          {a.lenBuckets.map((b) => <Row key={b.k} k={b.k} v={b.n ? `${nf(b.avg)} prom. · ${b.n} pzs` : "—"} />)}
          {a.qEffect && <>
            <Row k="Con pregunta" v={`${nf(a.qEffect.withQ)} prom.`} />
            <Row k="Sin pregunta" v={`${nf(a.qEffect.noQ)} prom.`} />
          </>}
        </Card>
        <Card className="glass border-border/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><CalendarCheck className="w-4 h-4 text-coral" /> Ritmo y cumplimiento</div>
          {a.freq.map((f) => <Row key={f.n} k={NET[f.n] ?? f.n} v={`${nf(f.perWeek, 1)} por semana`} />)}
          {a.planned > 0 && <Row k="Parrilla cumplida" v={`${a.delivered} de ${a.planned} (${pct(a.delivered / a.planned)})`} />}
          <Row k="Promedio del periodo" v={`${nf(a.cur)} interacciones`} />
          <Row k="Promedio histórico" v={`${nf(a.base)} interacciones`} />
        </Card>
      </div>

      <Card className="glass border-border/50 p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold"><Bookmark className="w-4 h-4 text-coral" /> Contenido de valor (guardados + compartidos)</div>
        <p className="text-xs text-muted-foreground">Los guardados y compartidos indican que la pieza se quiso conservar o recomendar: son la mejor señal de contenido útil.</p>
        <div className="grid md:grid-cols-3 gap-3">
          {a.quality.slice(0, 3).filter((x) => x.q > 0).map(({ p, q }, i) => (
            <a key={i} href={p.url} target="_blank" rel="noreferrer" className="rounded-xl border border-border/50 p-3 flex gap-3 hover:border-coral/40 transition-colors">
              {p.image && <img src={p.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" loading="lazy" />}
              <div className="min-w-0 space-y-1">
                <div className="text-[11px] text-muted-foreground">{NET[p.network]} · {fmtL(p.format)}</div>
                <div className="text-xs line-clamp-2">{snippet(p.text, 80)}</div>
                <div className="text-[11px] flex gap-2"><span className="inline-flex items-center gap-0.5"><Bookmark className="w-3 h-3" />{nf(p.saves)}</span><span className="inline-flex items-center gap-0.5"><Share2 className="w-3 h-3" />{nf(p.shares)}</span><span className="text-coral font-medium">{pct(q)} del alcance</span></div>
              </div>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3 text-xs border-b border-border/40 pb-1.5 last:border-0"><span className="text-muted-foreground">{k}</span><span className="font-medium text-right">{v}</span></div>;
}

function PostList({ title, subtitle, icon: Icon, posts, tone }: { title: string; subtitle: string; icon: any; posts: APost[]; tone: "good" | "bad" }) {
  return (
    <Card className="glass border-border/50 p-5 space-y-3">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold"><Icon className={`w-4 h-4 ${tone === "good" ? "text-emerald-500" : "text-coral"}`} /> {title}</div>
        <div className="text-[11px] text-muted-foreground">{subtitle}</div>
      </div>
      <div className="space-y-2">
        {posts.map((p, i) => (
          <a key={i} href={p.url} target="_blank" rel="noreferrer" className="flex gap-3 rounded-xl border border-border/50 p-2.5 hover:border-coral/40 transition-colors">
            {p.image ? <img src={p.image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" loading="lazy" /> : <div className="w-14 h-14 rounded-lg bg-muted shrink-0" />}
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">{NET[p.network]} · {fmtL(p.format)} · {String(p.date ?? "").slice(5, 10).split("-").reverse().join("/")} <ExternalLink className="w-3 h-3 ml-auto" /></div>
              <div className="text-xs line-clamp-2">{snippet(p.text, 110)}</div>
              <div className="text-[11px]"><span className={tone === "good" ? "text-emerald-500 font-medium" : "text-coral font-medium"}>{pct(er(p))}</span> <span className="text-muted-foreground">· {nf(p.interactions)} interacciones · {nf(p.reach)} alcance</span></div>
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
}
