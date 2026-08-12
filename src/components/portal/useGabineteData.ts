import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { nameTokens } from "@/lib/entityNames";

export type Dependencia = {
  id: string; nombre: string; nombre_corto?: string | null; tipo: string | null;
  titular: string | null; titular_cargo: string | null; sort_order: number | null;
};
export type Competitor = { id: string; name: string; network: string; dependencia_id: string | null; account_type: string | null };
export type Period = { id: string; period_label: string; period_start: string; period_end: string };
export type Metric = {
  period_id: string; competitor_id: string; network: string; followers: number | null;
  follower_growth_rate: number | null; engagement_rate: number | null; posts_per_day: number | null;
};
export type Post = {
  period_id: string; competitor_id: string | null; network: string; profile_name: string;
  posted_at: string | null; message: string | null; interactions: number | null; link?: string | null;
};
export type Mention = {
  fecha: string; medio: string; titular: string; cita: string; url: string;
  tono: string; canal: string; dep: string | null;
};
export type Enfoque = "combinado" | "institucional" | "titular";

export const ENFOQUE_LABEL: Record<Enfoque, string> = {
  combinado: "Dependencia + titular",
  institucional: "Solo cuentas institucionales",
  titular: "Solo cuentas del titular",
};

export type DepAgg = { followers: number; engagement: number | null; postsDia: number | null; cuentas: number };
/** Actividad publicada dentro de una ventana de fechas exacta (semana, quincena, rango). */
export type DepActivity = {
  publicaciones: number; interacciones: number; promedio: number | null;
  porDia: number | null; mejor: Post | null;
};

export function daysInWindow(from: string, to: string) {
  return Math.max(
    1,
    Math.round((new Date(to + "T00:00:00").getTime() - new Date(from + "T00:00:00").getTime()) / 86_400_000) + 1,
  );
}

const RATE_AVG = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : null);
const isoDaysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
const isoToday = () => new Date().toISOString().slice(0, 10);

/** Palabras genéricas del directorio que no identifican a una dependencia. */
const GENERIC = new Set([
  "secretaria", "secretaría", "subsecretaria", "instituto", "organismo", "procuraduria", "coordinacion",
  "direccion", "general", "estado", "estatal", "guanajuato", "gobierno", "sistema", "comision", "consejo", "unidad",
]);

export function pctDelta(a: number | null | undefined, b: number | null | undefined) {
  if (a == null || b == null || !b) return null;
  return (a - b) / Math.abs(b);
}

export function fmtPct(v: number | null | undefined, digits = 1) {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${(v * 100).toFixed(digits)}%`;
}

export function fmtNum(v: number | null | undefined) {
  if (v == null || !Number.isFinite(v)) return "—";
  return new Intl.NumberFormat("es-MX").format(Math.round(v));
}

const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MES_LARGO = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

/**
 * Etiqueta determinista de un periodo a partir de sus fechas reales. Evita que
 * una carga que abarca dos meses (p. ej. 1 jul – 12 ago) se muestre como un solo
 * mes y esconda los datos más recientes.
 */
export function periodLabelOf(p: { period_start: string; period_end: string; period_label?: string }) {
  const s = new Date(p.period_start + "T00:00:00");
  const e = new Date(p.period_end + "T00:00:00");
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return p.period_label ?? "—";
  const mismoMes = s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth();
  if (mismoMes) return `${MES_LARGO[s.getMonth()]} ${s.getFullYear()}`;
  const d = (x: Date) => `${String(x.getDate()).padStart(2, "0")} ${MES[x.getMonth()]}`;
  return `${d(s)} – ${d(e)} ${e.getFullYear()}`;
}

/** Lee una tabla completa paginando: PostgREST corta cada respuesta en 1000 filas. */
async function fetchAllPages<T>(
  run: (from: number, to: number) => any,
  pageSize = 1000,
  maxRows = 60000,
): Promise<T[]> {
  const out: T[] = [];
  for (let offset = 0; offset < maxRows; offset += pageSize) {
    const { data, error } = await run(offset, offset + pageSize - 1);
    if (error) break;
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < pageSize) break;
  }
  return out;
}

/**
 * Carga y normaliza el universo dependencia–titular de un portal:
 * directorio, cuentas, periodos, métricas, publicaciones, narrativas y
 * menciones de prensa resueltas a dependencia.
 */
export function useGabineteData(clientId: string, pressDays = 30) {
  const [loading, setLoading] = useState(true);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [narratives, setNarratives] = useState<any[]>([]);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [pressLoading, setPressLoading] = useState(true);
  const [lastPressDate, setLastPressDate] = useState<string | null>(null);
  const [lastPostDate, setLastPostDate] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("client_portal_listening_entries")
        .select("entry_date")
        .eq("client_id", clientId)
        .not("analyzed_at", "is", null)
        .order("entry_date", { ascending: false })
        .limit(1);
      if (cancelled) return;
      setLastPressDate((data?.[0] as any)?.entry_date ?? null);
    })();
    return () => { cancelled = true; };
  }, [clientId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [dep, comp, per] = await Promise.all([
        supabase.from("client_portal_dependencias").select("*").eq("client_id", clientId).eq("active", true).order("sort_order"),
        supabase.from("client_portal_benchmark_competitors").select("id,name,network,dependencia_id,account_type").eq("client_id", clientId).eq("active", true).limit(2000),
        supabase.from("client_portal_benchmark_periods").select("id,period_label,period_start,period_end").eq("client_id", clientId).order("period_start"),
      ]);
      if (cancelled) return;
      const ps = (per.data ?? []) as Period[];
      setDependencias((dep.data ?? []) as Dependencia[]);
      setCompetitors((comp.data ?? []) as Competitor[]);
      setPeriods(ps);

      if (ps.length) {
        const ids = ps.map((p) => p.id);
        const [m, po, nar, last] = await Promise.all([
          fetchAllPages<Metric>((from, to) =>
            supabase.from("client_portal_benchmark_metrics")
              .select("period_id,competitor_id,network,followers,follower_growth_rate,engagement_rate,posts_per_day")
              .in("period_id", ids)
              .order("period_id", { ascending: true })
              .range(from, to)),
          fetchAllPages<Post>((from, to) =>
            supabase.from("client_portal_benchmark_posts")
              .select("period_id,competitor_id,network,profile_name,posted_at,message,interactions,link")
              .in("period_id", ids)
              .order("interactions", { ascending: false })
              .range(from, to), 1000, 20000),
          supabase.from("client_portal_benchmark_narratives")
            .select("profile_name,network,narratives").eq("client_id", clientId).limit(500),
          supabase.from("client_portal_benchmark_posts")
            .select("posted_at").in("period_id", ids)
            .not("posted_at", "is", null)
            .order("posted_at", { ascending: false }).limit(1),
        ]);
        if (cancelled) return;
        setMetrics(m);
        setPosts(po);
        setNarratives(nar.data ?? []);
        setLastPostDate(((last.data?.[0] as any)?.posted_at ?? null)?.slice?.(0, 10) ?? null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [clientId]);

  const depMatchers = useMemo(() => dependencias.map((d) => ({
    id: d.id,
    nombre: d.nombre,
    depTokens: nameTokens(d.nombre).filter((t) => !GENERIC.has(t)),
    titTokens: d.titular ? nameTokens(d.titular) : [],
  })), [dependencias]);

  const resolveDep = useCallback((haystack: string): string | null => {
    const toks = new Set(nameTokens(haystack));
    for (const m of depMatchers) {
      if (m.titTokens.length >= 2 && m.titTokens.filter((t) => toks.has(t)).length >= 2) return m.id;
    }
    for (const m of depMatchers) {
      if (m.depTokens.length && m.depTokens.every((t) => toks.has(t))) return m.id;
    }
    return null;
  }, [depMatchers]);

  const fetchMentions = useCallback(async (from: string, to: string): Promise<Mention[]> => {
    const { data } = await supabase
      .from("client_portal_listening_entries")
      .select("entry_date, media_mentions, social_mentions")
      .eq("client_id", clientId)
      .gte("entry_date", from).lte("entry_date", to)
      .not("analyzed_at", "is", null)
      .order("entry_date", { ascending: false })
      .limit(600);
    const rows: Mention[] = [];
    for (const e of (data ?? []) as any[]) {
      for (const m of (e.media_mentions ?? [])) {
        const medio = String(m?.outlet ?? "").trim();
        if (!medio) continue;
        const titular = String(m?.headline ?? m?.topic ?? "").trim();
        const cita = String(m?.quote ?? "").trim();
        rows.push({
          fecha: e.entry_date, medio, titular, cita, url: String(m?.url ?? ""),
          tono: String(m?.sentiment ?? "neutral"), canal: "medios",
          dep: resolveDep([titular, cita, String(m?.topic ?? "")].join(" ")),
        });
      }
      for (const p of (e.social_mentions ?? [])) {
        const medio = String(p?.profile ?? p?.handle ?? "").trim();
        if (!medio) continue;
        const titular = String(p?.topic ?? "").trim();
        const cita = String(p?.quote ?? "").trim();
        rows.push({
          fecha: e.entry_date, medio, titular, cita, url: String(p?.url ?? ""),
          tono: String(p?.sentiment ?? "neutral"), canal: String(p?.platform ?? "social"),
          dep: resolveDep([titular, cita].join(" ")),
        });
      }
    }
    return rows;
  }, [clientId, resolveDep]);

  useEffect(() => {
    if (!depMatchers.length) return;
    let cancelled = false;
    (async () => {
      setPressLoading(true);
      const rows = await fetchMentions(isoDaysAgo(pressDays - 1), isoToday());
      if (cancelled) return;
      setMentions(rows);
      setPressLoading(false);
    })();
    return () => { cancelled = true; };
  }, [depMatchers.length, fetchMentions, pressDays]);

  const periodLabels = useMemo(() => Array.from(new Set(periods.map((p) => p.period_label))), [periods]);

  /**
   * Publicaciones fechadas dentro de una ventana exacta. Se consulta a la base
   * en vez de usar `posts` (que sólo trae el top por interacciones) para que los
   * cortes semanales y quincenales cuenten todo lo publicado.
   */
  const fetchPostsWindow = useCallback(async (from: string, to: string): Promise<Post[]> => {
    if (!periods.length) return [];
    const ids = periods.map((p) => p.id);
    const PAGE = 1000;
    const out: Post[] = [];
    // PostgREST corta en 1000 filas por respuesta: se pagina hasta agotar la ventana.
    for (let offset = 0; offset < 30000; offset += PAGE) {
      const { data, error } = await supabase
        .from("client_portal_benchmark_posts")
        .select("period_id,competitor_id,network,profile_name,posted_at,message,interactions,link")
        .in("period_id", ids)
        .gte("posted_at", `${from}T00:00:00`)
        .lte("posted_at", `${to}T23:59:59`)
        .order("posted_at", { ascending: true })
        .range(offset, offset + PAGE - 1);
      if (error) break;
      const rows = (data ?? []) as Post[];
      out.push(...rows);
      if (rows.length < PAGE) break;
    }
    return out;
  }, [periods]);

  const depOfCompetitor = useMemo(() => {
    const m = new Map<string, string>();
    competitors.forEach((c) => { if (c.dependencia_id) m.set(c.id, c.dependencia_id); });
    return m;
  }, [competitors]);

  const typeOfCompetitor = useMemo(() => {
    const m = new Map<string, string>();
    competitors.forEach((c) => m.set(c.id, c.account_type ?? "institucional"));
    return m;
  }, [competitors]);

  const depById = useMemo(() => new Map(dependencias.map((d) => [d.id, d])), [dependencias]);

  /** Agregado por dependencia para un conjunto de periodos y un enfoque de cuentas. */
  const aggregate = useCallback((periodIds: string[], enfoque: Enfoque) => {
    const ids = new Set(periodIds);
    const acc = new Map<string, { followers: number; eng: number[]; posts: number[]; cuentas: Set<string> }>();
    for (const m of metrics) {
      if (!ids.has(m.period_id)) continue;
      const dep = depOfCompetitor.get(m.competitor_id);
      if (!dep) continue;
      const tipo = typeOfCompetitor.get(m.competitor_id) ?? "institucional";
      if (enfoque !== "combinado" && tipo !== enfoque) continue;
      const e = acc.get(dep) ?? { followers: 0, eng: [], posts: [], cuentas: new Set<string>() };
      e.followers += Number(m.followers) || 0;
      if (Number.isFinite(Number(m.engagement_rate))) e.eng.push(Number(m.engagement_rate));
      if (Number.isFinite(Number(m.posts_per_day))) e.posts.push(Number(m.posts_per_day));
      e.cuentas.add(m.competitor_id);
      acc.set(dep, e);
    }
    const out = new Map<string, DepAgg>();
    acc.forEach((v, k) => out.set(k, {
      followers: v.followers,
      engagement: RATE_AVG(v.eng),
      postsDia: v.posts.length ? v.posts.reduce((a, b) => a + b, 0) : null,
      cuentas: v.cuentas.size,
    }));
    return out;
  }, [metrics, depOfCompetitor, typeOfCompetitor]);

  /**
   * Agregado por dependencia a partir de las publicaciones fechadas dentro de una
   * ventana exacta. Permite cortes semanales o quincenales aunque las métricas de
   * cuenta (seguidores, engagement) sólo existan por periodo mensual.
   */
  const aggregateActivity = useCallback((from: string, to: string, enfoque: Enfoque, source?: Post[]) => {
    const dias = daysInWindow(from, to);
    const acc = new Map<string, { n: number; sum: number; mejor: Post | null }>();
    for (const p of (source ?? posts)) {
      if (!p.posted_at || !p.competitor_id) continue;
      const fecha = p.posted_at.slice(0, 10);
      if (fecha < from || fecha > to) continue;
      const dep = depOfCompetitor.get(p.competitor_id);
      if (!dep) continue;
      const tipo = typeOfCompetitor.get(p.competitor_id) ?? "institucional";
      if (enfoque !== "combinado" && tipo !== enfoque) continue;
      const e = acc.get(dep) ?? { n: 0, sum: 0, mejor: null as Post | null };
      e.n += 1;
      e.sum += Number(p.interactions) || 0;
      if (!e.mejor || (Number(p.interactions) || 0) > (Number(e.mejor.interactions) || 0)) e.mejor = p;
      acc.set(dep, e);
    }
    const out = new Map<string, DepActivity>();
    acc.forEach((v, k) => out.set(k, {
      publicaciones: v.n,
      interacciones: v.sum,
      promedio: v.n ? v.sum / v.n : null,
      porDia: v.n / dias,
      mejor: v.mejor,
    }));
    return out;
  }, [posts, depOfCompetitor, typeOfCompetitor]);

  return {
    loading, pressLoading,
    dependencias, depById, competitors, periods, periodLabels,
    metrics, posts, narratives, mentions,
    lastPressDate, lastPostDate,
    depOfCompetitor, typeOfCompetitor,
    aggregate, aggregateActivity, resolveDep, fetchMentions, fetchPostsWindow,
  };
}
