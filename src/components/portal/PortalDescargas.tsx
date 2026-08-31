import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { inMxRange } from "@/lib/tz";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, FileText, FileSpreadsheet, Building2, Newspaper, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  periodMatchesDisplayLabel,
  periodMonthLabel,
  periodRangeForDisplayLabel,
  uniqueMetricsForPeriods,
} from "@/lib/benchmarkReportData";
import { benchmarkPostKey, resolveGabineteMention, weightedRate } from "@/lib/gabineteReportUtils";
import { benchmarkAccountKey, buildValidCompetitorMaps, titularAccountIds } from "@/lib/benchmarkAccountIdentity";
import { buildDeltaLines } from "@/lib/dependenciaDeltas";

import {
  DependenciaPdfTemplate, GabinetePdfTemplate,
  type DependenciaReportData, type GabineteReportData, type DepPressRow,
  type ScopeBlock, type ScopeKey, type DepAccountRow,
} from "./DependenciaPdfTemplate";

type Dependencia = { id: string; nombre: string; tipo: string | null; titular: string | null; titular_cargo: string | null; sort_order: number | null };
type Competitor = { id: string; name: string; network: string; dependencia_id: string | null; account_type: string | null; profile_external_id: string | null; external_url: string | null };
type Period = { id: string; period_label: string; period_start: string; period_end: string; created_at?: string | null };
type Metric = { period_id: string; competitor_id: string; network: string; followers: number | null; follower_growth_rate: number | null; engagement_rate: number | null; posts_per_day: number | null; created_at?: string | null };
type Post = { period_id: string; competitor_id: string | null; network: string; profile_name: string; posted_at: string | null; message: string | null; interactions: number | null; link?: string | null };
type Report = { id: string; title: string; report_date: string; type: string };

const RATE_AVG = (vals: number[]) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null);

/** PostgREST corta en 1000 filas: paginamos siempre. */
async function fetchAllPages<T>(
  run: (from: number, to: number) => any,
  pageSize = 1000,
  maxRows = 60000,
): Promise<T[]> {
  const out: T[] = [];
  for (let offset = 0; offset < maxRows; offset += pageSize) {
    const { data, error } = await run(offset, offset + pageSize - 1);
    if (error) throw error;
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < pageSize) break;
  }
  return out;
}

const isoToday = () => new Date().toISOString().slice(0, 10);
const isoDaysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
const shiftIso = (d: string, n: number) =>
  new Date(new Date(d + "T00:00:00").getTime() + n * 86_400_000).toISOString().slice(0, 10);
const fmtDia = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
/** Una carga acumulada (p. ej. 1 jun–25 ago) debe aparecer dentro del mes de corte. */
const monthLabelOf = periodMonthLabel;

/** Última semana completa lunes→domingo. */
function ultimaSemanaCompleta() {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const dow = hoy.getDay();
  const domingo = new Date(hoy); domingo.setDate(hoy.getDate() - (dow === 0 ? 0 : dow));
  const lunes = new Date(domingo); lunes.setDate(domingo.getDate() - 6);
  return { from: lunes.toISOString().slice(0, 10), to: domingo.toISOString().slice(0, 10) };
}

const TONE_LABEL: Record<string, string> = { positivo: "Positivo", neutral: "Neutral", negativo: "Negativo", crisis: "Crisis" };

export default function PortalDescargas({
  clientId, portalName,
}: { clientId: string; portalName: string }) {
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [narratives, setNarratives] = useState<any[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const [depId, setDepId] = useState<string>("");
  const [enfoque, setEnfoque] = useState<"combinado" | "institucional" | "titular">("combinado");
  const [periodLabel, setPeriodLabel] = useState<string>("");
  const [cut, setCut] = useState<"mensual" | "semanal">("mensual");
  const [weekFrom, setWeekFrom] = useState(ultimaSemanaCompleta().from);
  const [weekTo, setWeekTo] = useState(ultimaSemanaCompleta().to);
  const [busy, setBusy] = useState<string | null>(null);
  const [conRecomendaciones, setConRecomendaciones] = useState(true);


  // Prensa
  const [pressFrom, setPressFrom] = useState(isoDaysAgo(29));
  const [pressTo, setPressTo] = useState(isoToday());
  const [pressDep, setPressDep] = useState<string>("todas");
  const [pressMedio, setPressMedio] = useState<string>("todos");
  const [pressTono, setPressTono] = useState<string>("todos");
  const [pressRows, setPressRows] = useState<DepPressRow[] & { _dep?: string }[]>([]);
  const [pressAll, setPressAll] = useState<{ fecha: string; medio: string; titular: string; cita: string; url: string; tono: string; canal: string; dep: string | null; scope: ScopeKey | null; match: string | null }[]>([]);
  const [pressLoading, setPressLoading] = useState(false);

  const depPdfRef = useRef<HTMLDivElement>(null);
  const gabPdfRef = useRef<HTMLDivElement>(null);
  const [depData, setDepData] = useState<DependenciaReportData | null>(null);
  const [gabData, setGabData] = useState<GabineteReportData | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [dep, comps, per, rep] = await Promise.all([
        supabase.from("client_portal_dependencias").select("*").eq("client_id", clientId).eq("active", true).order("sort_order"),
        fetchAllPages<Competitor>((from, to) =>
          supabase.from("client_portal_benchmark_competitors")
            .select("id,name,network,dependencia_id,account_type,profile_external_id,external_url")
            .eq("client_id", clientId).eq("active", true)
            .order("id").range(from, to)),
        supabase.from("client_portal_benchmark_periods").select("id,period_label,period_start,period_end,created_at").eq("client_id", clientId).order("period_start"),
        supabase.from("client_portal_reports").select("id,title,report_date,type").eq("client_id", clientId).order("report_date", { ascending: false }).limit(30),
      ]);
      const ps = ((per.data ?? []) as Period[]).map((p) => ({ ...p, period_label: monthLabelOf(p) }));
      setDependencias((dep.data ?? []) as Dependencia[]);
      setCompetitors(comps);
      setPeriods(ps);
      setReports((rep.data ?? []) as Report[]);
      if (ps.length) {
        const labels = Array.from(new Set(ps.map((p) => p.period_label)));
        setPeriodLabel(labels[labels.length - 1]);
        const ids = ps.map((p) => p.id);
        const [m, po, nar] = await Promise.all([
          // `id` como desempate: paginar con un orden no único hace que PostgREST
          // omita filas entre páginas y desaparezcan cuentas del reporte.
          fetchAllPages<Metric>((from, to) =>
            supabase.from("client_portal_benchmark_metrics")
              .select("period_id,competitor_id,network,followers,follower_growth_rate,engagement_rate,posts_per_day,created_at")
              .in("period_id", ids).order("period_id").order("id").range(from, to)),
          fetchAllPages<Post>((from, to) =>
            supabase.from("client_portal_benchmark_posts")
              .select("period_id,competitor_id,network,profile_name,posted_at,message,interactions,link")
              .in("period_id", ids).order("interactions", { ascending: false }).order("id").range(from, to), 1000, 8000),
          supabase.from("client_portal_benchmark_narratives").select("profile_name,network,narratives").eq("client_id", clientId).limit(500),
        ]);
        setMetrics(m);
        setPosts(po);
        setNarratives(nar.data ?? []);
      }
      if ((dep.data ?? []).length) setDepId((dep.data as Dependencia[])[0].id);
      setLoading(false);
    })();
  }, [clientId]);

  const periodLabels = useMemo(
    () => Array.from(new Set(periods.map((p) => p.period_label))),
    [periods],
  );
  const selectActiveReportPeriods = (sourcePeriods: Period[]) => {
    if (cut !== "semanal") return sourcePeriods.filter((p) => periodMatchesDisplayLabel(p, periodLabel));

    // Un corte semanal necesita el snapshot más reciente disponible de CADA
    // cuenta. Las cargas suelen cerrar en lunes o en cortes mixtos, así que se
    // aceptan periodos que terminen antes de la semana o que se solapen con ella
    // con una tolerancia breve de captura posterior. Esto evita reportes en cero
    // cuando la base sí trae el corte nuevo, pero no permite jalar un mes futuro.
    const lookaheadTo = shiftIso(weekTo, 2);
    return sourcePeriods.filter((p) => (
      p.period_end <= weekTo
      || (p.period_start <= weekTo && p.period_end >= weekFrom && p.period_end <= lookaheadTo)
    ));
  };

  const selectPreviousReportPeriods = (sourcePeriods: Period[], labels = periodLabels) => {
    if (cut === "semanal") return sourcePeriods.filter((p) => p.period_end < weekFrom);
    const idx = labels.indexOf(periodLabel);
    return idx > 0 ? sourcePeriods.filter((p) => periodMatchesDisplayLabel(p, labels[idx - 1])) : [];
  };

  const activePeriods = useMemo(
    () => selectActiveReportPeriods(periods),
    [periods, periodLabel, cut, weekFrom, weekTo],
  );
  const prevPeriods = useMemo(
    () => selectPreviousReportPeriods(periods),
    [periods, periodLabels, periodLabel, cut, weekFrom],
  );

  /** Corte de datos realmente usado en semanal: el snapshot más reciente disponible. */
  const latestActivePeriodLabel = useMemo(() => {
    if (activePeriods.length === 0) return null;
    return activePeriods.reduce((a, b) => (b.period_end > a.period_end ? b : a)).period_label;
  }, [activePeriods]);




  /** Etiqueta del corte activo y ventana de fechas para prensa/publicaciones. */
  const cutLabel = cut === "semanal"
    ? `Semana ${fmtDia(weekFrom)} — ${fmtDia(weekTo)}`
    : (periodLabel || "Periodo");
  const cutSlug = cut === "semanal" ? `semana-${weekFrom}` : (periodLabel || "reporte").replace(/\s+/g, "-").toLowerCase();

  const competitorMaps = useMemo(
    () => buildValidCompetitorMaps(competitors, dependencias),
    [competitors, dependencias],
  );
  const depOfCompetitor = competitorMaps.depOfCompetitor;
  const typeOfCompetitor = competitorMaps.typeOfCompetitor;

  const accountIdentity = useMemo(
    () => new Map(competitors.map((c) => [c.id, benchmarkAccountKey(c)])),
    [competitors],
  );

  const matchesEnfoque = (accountType: string | null | undefined) =>
    enfoque === "combinado" ? true : (accountType ?? "institucional") === enfoque;

  const matchesScope = (accountType: string | null | undefined, scope: "combinado" | ScopeKey) =>
    scope === "combinado" ? true : (accountType ?? "institucional") === scope;

  const ENFOQUE_LABEL: Record<string, string> = {
    combinado: "Dependencia + titular",
    institucional: "Solo cuentas institucionales",
    titular: "Solo cuentas del titular",
  };

  /** Una sola métrica por cuenta+red (evita duplicados por cargas repetidas del mismo corte). */
  const uniqueMetrics = (periodIds: string[]) => {
    return uniqueMetricsForPeriods(metrics, periodIds, accountIdentity, periods);
  };

  /** Agregado por dependencia para un conjunto de periodos y un ámbito. */
  const aggregate = (periodIds: string[], scope: "combinado" | ScopeKey = enfoque) => {
    const acc = new Map<string, { followers: number; eng: { rate: number | null; weight: number | null }[]; posts: number[] }>();
    for (const m of uniqueMetrics(periodIds)) {

      const dep = depOfCompetitor.get(m.competitor_id);
      if (!dep) continue;
      if (!matchesScope(typeOfCompetitor.get(m.competitor_id), scope)) continue;
      const e = acc.get(dep) ?? { followers: 0, eng: [], posts: [] };
      e.followers += Number(m.followers) || 0;
      if (Number.isFinite(Number(m.engagement_rate))) e.eng.push({ rate: Number(m.engagement_rate), weight: Number(m.followers) || null });
      if (Number.isFinite(Number(m.posts_per_day))) e.posts.push(Number(m.posts_per_day));
      acc.set(dep, e);
    }
    const out = new Map<string, { followers: number; engagement: number | null; postsDia: number | null }>();
    acc.forEach((v, k) => out.set(k, {
      followers: v.followers,
      engagement: weightedRate(v.eng),
      postsDia: v.posts.length ? v.posts.reduce((a, b) => a + b, 0) : null,
    }));
    return out;
  };

  // ---------- Menciones de prensa ----------
  /**
   * Resuelve una mención a dependencia y distingue si apunta al titular o a la institución.
   * Exige coincidencia de frases contiguas (no bolsa de palabras) para evitar falsos positivos
   * del tipo "Salvador Sánchez Romero" ↔ "Luis Ignacio Sánchez Gómez".
   */
  const resolveMention = (haystack: string) => resolveGabineteMention(haystack, dependencias);
  const resolveDep = (haystack: string): string | null => resolveMention(haystack).dep;

  const loadPress = async () => {
    setPressLoading(true);
    setPressAll(await fetchMentions(pressFrom, pressTo));
    setPressLoading(false);
  };

  useEffect(() => { loadPress(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [clientId, pressFrom, pressTo, dependencias.length]);

  const medios = useMemo(() => Array.from(new Set(pressAll.map((r) => r.medio))).sort().slice(0, 200), [pressAll]);

  const pressFiltered = useMemo(() => pressAll.filter((r) => {
    if (pressDep !== "todas" && r.dep !== pressDep) return false;
    if (pressMedio !== "todos" && r.medio !== pressMedio) return false;
    if (pressTono !== "todos") {
      if (pressTono === "negativo") { if (r.tono !== "negativo" && r.tono !== "crisis") return false; }
      else if (r.tono !== pressTono) return false;
    }
    return true;
  }), [pressAll, pressDep, pressMedio, pressTono]);

  const exportPressCsv = () => {
    if (!pressFiltered.length) { toast.error("No hay menciones con esos filtros"); return; }
    const depName = new Map(dependencias.map((d) => [d.id, d.nombre]));
    const header = ["fecha", "canal", "medio", "titular", "extracto", "dependencia", "tono", "url"];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [header.join(",")].concat(
      pressFiltered.map((r) => [r.fecha, r.canal, r.medio, r.titular, r.cita, r.dep ? depName.get(r.dep) ?? "" : "", r.tono, r.url].map(esc).join(",")),
    ).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `menciones_${pressFrom}_${pressTo}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast.success(`${pressFiltered.length} menciones exportadas`);
  };

  // ---------- PDFs ----------
  const renderPdf = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current) return;
    const { default: html2pdf } = await import("html2pdf.js");
    await html2pdf().set({
      margin: [8, 0, 8, 0],
      filename,
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", windowWidth: 794, scrollX: 0, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: {
        mode: ["css", "legacy"],
        before: [".pdf-page-break"],
        avoid: [".pdf-avoid", "svg", "tr"],
      },
    } as any).from(ref.current).save();
  };

  /** Menciones (media + social) de un rango, resueltas a dependencia. */
  const fetchMentions = async (from: string, to: string) => {
    const { data } = await supabase
      .from("client_portal_listening_entries")
      .select("entry_date, media_mentions, social_mentions")
      .eq("client_id", clientId)
      .gte("entry_date", from).lte("entry_date", to)
      .not("analyzed_at", "is", null)
      .order("entry_date", { ascending: false })
      .limit(600);
    const rows: { fecha: string; medio: string; titular: string; cita: string; url: string; tono: string; canal: string; dep: string | null; scope: ScopeKey | null; match: string | null }[] = [];
    for (const e of (data ?? []) as any[]) {
      for (const m of (e.media_mentions ?? [])) {
        const medio = String(m?.outlet ?? "").trim();
        if (!medio) continue;
        const titular = String(m?.headline ?? m?.topic ?? "").trim();
        const cita = String(m?.quote ?? "").trim();
        const r = resolveMention([titular, cita, String(m?.topic ?? "")].join(" "));
        rows.push({
          fecha: e.entry_date, medio, titular, cita, url: String(m?.url ?? ""),
          tono: String(m?.sentiment ?? "neutral"), canal: "medios",
          dep: r.dep, scope: r.scope, match: r.match,
        });
      }
      for (const p of (e.social_mentions ?? [])) {
        const medio = String(p?.profile ?? p?.handle ?? "").trim();
        if (!medio) continue;
        const titular = String(p?.topic ?? "").trim();
        const cita = String(p?.quote ?? "").trim();
        const r = resolveMention([titular, cita].join(" "));
        rows.push({
          fecha: e.entry_date, medio, titular, cita, url: String(p?.url ?? ""),
          tono: String(p?.sentiment ?? "neutral"), canal: String(p?.platform ?? "social"),
          dep: r.dep, scope: r.scope, match: r.match,
        });
      }
    }
    return rows;
  };

  const buildDependenciaReport = async (): Promise<DependenciaReportData | null> => {
    const dep = dependencias.find((d) => d.id === depId);
    if (!dep) return null;

    // El PDF debe leerse contra la base actual, no contra el estado que pudo
    // quedar abierto antes de una importación nueva.
    const [freshPeriodsRes, freshCompetitors] = await Promise.all([
      supabase.from("client_portal_benchmark_periods")
        .select("id,period_label,period_start,period_end,created_at")
        .eq("client_id", clientId)
        .order("period_start"),
      fetchAllPages<Competitor>((from, to) =>
        supabase.from("client_portal_benchmark_competitors")
          .select("id,name,network,dependencia_id,account_type,profile_external_id,external_url")
          .eq("client_id", clientId).eq("active", true)
          .order("id").range(from, to)),
    ]);
    const reportPeriods = ((freshPeriodsRes.data ?? []) as Period[]).length
      ? ((freshPeriodsRes.data ?? []) as Period[]).map((p) => ({ ...p, period_label: monthLabelOf(p) }))
      : periods;
    const reportCompetitors = freshCompetitors.length ? freshCompetitors : competitors;
    const reportLabels = Array.from(new Set(reportPeriods.map((p) => p.period_label)));
    const reportActivePeriods = selectActiveReportPeriods(reportPeriods);
    const reportPrevPeriods = selectPreviousReportPeriods(reportPeriods, reportLabels);
    const periodIds = reportActivePeriods.map((p) => p.id);
    const prevIds = reportPrevPeriods.map((p) => p.id);
    const reportMetricIds = Array.from(new Set([...periodIds, ...prevIds]));
    const freshMetrics = reportMetricIds.length
      ? await fetchAllPages<Metric>((from, to) =>
          supabase.from("client_portal_benchmark_metrics")
            .select("period_id,competitor_id,network,followers,follower_growth_rate,engagement_rate,posts_per_day,created_at")
            .in("period_id", reportMetricIds)
            .order("period_id").order("id").range(from, to))
      : [];
    const reportMetrics = freshMetrics.length ? freshMetrics : metrics;
    const reportAccountIdentity = new Map(reportCompetitors.map((c) => [c.id, benchmarkAccountKey(c)]));
    const reportCompetitorMaps = buildValidCompetitorMaps(reportCompetitors, dependencias);
    const reportUniqueMetrics = (ids: string[]) => uniqueMetricsForPeriods(reportMetrics, ids, reportAccountIdentity, reportPeriods);
    const reportDepOfCompetitor = reportCompetitorMaps.depOfCompetitor;
    const reportTypeOfCompetitor = reportCompetitorMaps.typeOfCompetitor;

    const aggregateForReport = (ids: string[], scope: "combinado" | ScopeKey = enfoque) => {
      const acc = new Map<string, { followers: number; eng: { rate: number | null; weight: number | null }[]; posts: number[] }>();
      for (const m of reportUniqueMetrics(ids)) {
        const targetDep = reportDepOfCompetitor.get(m.competitor_id);
        if (!targetDep) continue;
        if (!matchesScope(reportTypeOfCompetitor.get(m.competitor_id), scope)) continue;
        const e = acc.get(targetDep) ?? { followers: 0, eng: [], posts: [] };
        e.followers += Number(m.followers) || 0;
        if (Number.isFinite(Number(m.engagement_rate))) e.eng.push({ rate: Number(m.engagement_rate), weight: Number(m.followers) || null });
        if (Number.isFinite(Number(m.posts_per_day))) e.posts.push(Number(m.posts_per_day));
        acc.set(targetDep, e);
      }
      const out = new Map<string, { followers: number; engagement: number | null; postsDia: number | null }>();
      acc.forEach((v, k) => out.set(k, {
        followers: v.followers,
        engagement: weightedRate(v.eng),
        postsDia: v.posts.length ? v.posts.reduce((a, b) => a + b, 0) : null,
      }));
      return out;
    };

    const assignedDepComps = reportCompetitors.filter((c) => c.dependencia_id === dep.id);
    const validTitularIds = titularAccountIds(
      assignedDepComps.filter((c) => c.account_type === "titular"),
      dep.titular,
    );
    const allDepComps = assignedDepComps.filter(
      (c) => c.account_type !== "titular" || validTitularIds.has(c.id),
    );
    const depComps = allDepComps.filter((c) => matchesEnfoque(c.account_type));
    const compById = new Map(depComps.map((c) => [c.id, c]));
    const depIdentityKeys = new Set(depComps.map((c) => benchmarkAccountKey(c)));
    const compByIdentity = new Map<string, Competitor>();
    for (const c of depComps) {
      const key = benchmarkAccountKey(c);
      const current = compByIdentity.get(key);
      if (!current || c.name.length > current.name.length) compByIdentity.set(key, c);
    }

    const monthlyRange = cut === "semanal" ? null : periodRangeForDisplayLabel(periodLabel, reportPeriods);
    const monthlyStarts = reportActivePeriods.map((p) => p.period_start).sort();
    const monthlyEnds = reportActivePeriods.map((p) => p.period_end).sort();
    const winFrom = cut === "semanal" ? weekFrom : (monthlyRange?.from ?? monthlyStarts[0] ?? pressFrom);
    const winTo = cut === "semanal" ? weekTo : (monthlyRange?.to ?? monthlyEnds[monthlyEnds.length - 1] ?? pressTo);
    const winDays = Math.max(
      1,
      Math.round((new Date(winTo + "T00:00:00").getTime() - new Date(winFrom + "T00:00:00").getTime()) / 86_400_000) + 1,
    );

    // Crecimiento diario real (fallback cuando la métrica del periodo llega vacía).
    const growthByKey = new Map<string, number[]>();
    if (depComps.length && periodIds.length) {
      const { data: fd } = await supabase
        .from("client_portal_benchmark_follower_daily")
        .select("competitor_id,network,day,delta")
          .in("period_id", periodIds)
        .in("competitor_id", depComps.map((c) => c.id))
        .gte("day", winFrom)
        .lte("day", winTo)
        .order("day", { ascending: true })
        .limit(20000);
      for (const r of (fd ?? []) as any[]) {
        const identity = reportAccountIdentity.get(r.competitor_id) ?? r.competitor_id;
        const k = `${identity}|${String(r.network).toLowerCase()}`;
        growthByKey.set(k, [...(growthByKey.get(k) ?? []), Number(r.delta) || 0]);
      }
    }

    // Seguidores del periodo previo por cuenta/red: segundo fallback de crecimiento.
    const prevFollowers = new Map<string, number>();
    for (const m of reportUniqueMetrics(prevIds)) {
      if (!compById.has(m.competitor_id)) continue;

       const identity = reportAccountIdentity.get(m.competitor_id) ?? m.competitor_id;
       if (Number.isFinite(Number(m.followers))) prevFollowers.set(`${identity}|${m.network.toLowerCase()}`, Number(m.followers));
    }

    // Ventana del corte anterior: sirve para el bloque "Lo que cambió".
    const prevStarts = reportPrevPeriods.map((p) => p.period_start).sort();
    const prevEnds = reportPrevPeriods.map((p) => p.period_end).sort();
    const prevFrom = cut === "semanal"
      ? shiftIso(winFrom, -7)
      : (prevStarts[0] ?? shiftIso(winFrom, -winDays));
    const prevTo = cut === "semanal"
      ? shiftIso(winFrom, -1)
      : (prevEnds[prevEnds.length - 1] ?? shiftIso(winFrom, -1));

    // Publicaciones del rango: se consultan por fecha real en todos los cortes
    // que se solapan con la ventana. Un post del día 17 puede vivir en la carga
    // 1–17 y otro del 20 en la carga 20–24; ambos pertenecen al reporte 17–23.
    let depPosts: Post[] = [];
    const postPeriodIds = reportPeriods
      .filter((p) => p.period_start <= winTo && p.period_end >= prevFrom)
      .map((p) => p.id);
    if (depComps.length && postPeriodIds.length) {
      depPosts = await fetchAllPages<Post>((from, to) =>
        supabase.from("client_portal_benchmark_posts")
          .select("period_id,competitor_id,network,profile_name,posted_at,message,interactions,link")
          .in("period_id", postPeriodIds)
          .in("competitor_id", depComps.map((c) => c.id))
          .order("interactions", { ascending: false })
          .order("id")
          .range(from, to), 1000, 8000);
    }

    // Publicaciones idénticas (misma cuenta, red, fecha y texto) cargadas más de una vez no se cuentan doble.
    const seenPost = new Set<string>();
    depPosts = depPosts.filter((p) => {
      const k = benchmarkPostKey(p, reportAccountIdentity);
      if (seenPost.has(k)) return false;
      seenPost.add(k);
      return true;
    });

    const postsCount = new Map<string, number>();
    const prevPostsByScope = new Map<string, number>();
    for (const p of depPosts) {
      if (!p.competitor_id || !compById.has(p.competitor_id)) continue;
      const identity = reportAccountIdentity.get(p.competitor_id) ?? p.competitor_id;
      const k = `${identity}|${p.network.toLowerCase()}`;
      if (inMxRange(p.posted_at, winFrom, winTo)) {
        postsCount.set(k, (postsCount.get(k) ?? 0) + 1);
      } else if (inMxRange(p.posted_at, prevFrom, prevTo)) {
        const tipo = compById.get(p.competitor_id)?.account_type ?? "institucional";
        prevPostsByScope.set(tipo, (prevPostsByScope.get(tipo) ?? 0) + 1);
      }
    }


    const latestMetricByIdentity = new Map(
      reportUniqueMetrics(periodIds)
        .filter((m) => depIdentityKeys.has(reportAccountIdentity.get(m.competitor_id) ?? m.competitor_id))
        .map((m) => [`${reportAccountIdentity.get(m.competitor_id) ?? m.competitor_id}|${m.network.toLowerCase()}`, m]),
    );
    const cuentas: DepAccountRow[] = Array.from(compByIdentity.entries())
      .map(([identity, c]) => {
        const k = `${identity}|${c.network.toLowerCase()}`;
        const m = latestMetricByIdentity.get(k);
        const deltas = growthByKey.get(k) ?? [];
        const avgDelta = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : null;
        const prevF = prevFollowers.get(k) ?? null;
        const followers = m?.followers != null && Number.isFinite(Number(m.followers)) ? Number(m.followers) : null;
        let crecimiento: number | null = avgDelta != null && followers ? avgDelta / followers : null;
        if (crecimiento == null && m?.follower_growth_rate != null && Number.isFinite(Number(m.follower_growth_rate))) {
          const rawGrowth = Number(m.follower_growth_rate);
          crecimiento = Math.abs(rawGrowth) > 1 ? rawGrowth / 100 : rawGrowth;
        }
        if (crecimiento == null && prevF && followers) crecimiento = (followers - prevF) / prevF / winDays;
        const publicaciones = postsCount.get(k) ?? null;
        const postsDia = m?.posts_per_day != null && Number.isFinite(Number(m.posts_per_day))
          ? Number(m.posts_per_day)
          : (publicaciones != null ? publicaciones / winDays : null);
        const eng = m?.engagement_rate != null && Number.isFinite(Number(m.engagement_rate)) ? Number(m.engagement_rate) : null;
        const sinDatos = followers == null && eng == null && publicaciones == null;
        return {
          perfil: c.name, red: c.network, tipo: c.account_type ?? "institucional",
          seguidores: followers, crecimiento, engagement: eng, postsDia, publicaciones, sinDatos,
        };
      })
      .sort((a, b) => (b.seguidores ?? 0) - (a.seguidores ?? 0));

    // Rankings del gabinete por ámbito.
    const rankingDe = (scope: "combinado" | ScopeKey) => {
      const curr = aggregateForReport(periodIds, scope);
      const prev = aggregateForReport(prevIds, scope);
      const order = (map: typeof curr) => Array.from(map.entries())
        .filter(([, v]) => v.engagement != null)
        .sort((a, b) => (b[1].engagement ?? 0) - (a[1].engagement ?? 0));
      const entries = order(curr);
      const prevEntries = order(prev);
      const idx = entries.findIndex(([id]) => id === dep.id);
      const prevIdx = prevEntries.findIndex(([id]) => id === dep.id);
      return {
        mine: curr.get(dep.id) ?? { followers: 0, engagement: null, postsDia: null },
        prevMine: prev.get(dep.id) ?? null,
        rank: idx >= 0 ? idx + 1 : null,
        prevRank: prevIdx >= 0 ? prevIdx + 1 : null,
        total: entries.length,
        promedio: RATE_AVG(entries.map(([, v]) => v.engagement as number)),
        prevPromedio: RATE_AVG(prevEntries.map(([, v]) => v.engagement as number)),
      };
    };


    const pctDelta = (a: number | null | undefined, b: number | null | undefined) =>
      a == null || b == null || !b ? null : (a - b) / Math.abs(b);

    // Narrativas y publicaciones por ámbito.
    const narrativasDe = (scope: ScopeKey) => {
      const names = new Set(
        depComps.filter((c) => (c.account_type ?? "institucional") === scope).map((c) => c.name.toLowerCase()),
      );
      const fuentes: string[] = [];
      const axes: { name: string; description?: string }[] = [];
      for (const n of narratives) {
        if (!names.has(String(n.profile_name ?? "").toLowerCase())) continue;
        const fuente = `${n.profile_name} · ${n.network}`;
        if (!fuentes.includes(fuente)) fuentes.push(fuente);
        for (const a of (n.narratives?.narrative_axes ?? [])) {
          if (a?.name && !axes.some((x) => x.name === a.name)) axes.push({ name: a.name, description: a.description });
        }
      }
      return { axes, fuentes };
    };

    const postsDe = (scope: ScopeKey) => depPosts
      .filter((p) => p.competitor_id && compById.has(p.competitor_id))
      .filter((p) => (compById.get(p.competitor_id!)?.account_type ?? "institucional") === scope)
      .filter((p) => inMxRange(p.posted_at, winFrom, winTo))
      .sort((a, b) => (b.interactions ?? 0) - (a.interactions ?? 0))
      .slice(0, 3)
      .map((p) => ({
        perfil: p.profile_name || compById.get(p.competitor_id!)?.name || "",
        red: p.network, fecha: p.posted_at, texto: p.message ?? "", interacciones: p.interactions ?? 0,
      }));

    // Prensa separada: menciones al titular vs a la institución.
    const [mentionsRaw, prevMentionsRaw] = await Promise.all([
      fetchMentions(winFrom, winTo),
      fetchMentions(prevFrom, prevTo),
    ]);
    const mentions = mentionsRaw.filter((r) => r.dep === dep.id);
    const prevMentions = prevMentionsRaw.filter((r) => r.dep === dep.id);
    const prensaDe = (scope: ScopeKey) => {
      const rows = mentions
        .filter((r) => (r.scope ?? "institucional") === scope)
        .map((r) => ({
          fecha: r.fecha, medio: r.medio, titular: r.titular || r.cita.slice(0, 90),
          tono: r.tono, url: r.url, cita: r.cita, canal: r.canal, match: r.match ?? undefined,
        }));
      const medioCount = new Map<string, number>();
      rows.forEach((p) => medioCount.set(p.medio, (medioCount.get(p.medio) ?? 0) + 1));
      return {
        prensa: rows.slice(0, 8),
        prensaTotal: rows.length,
        prensaMedios: Array.from(medioCount.entries()).map(([medio, n]) => ({ medio, n })).sort((a, b) => b.n - a.n),
        prensaTono: {
          positivo: rows.filter((p) => p.tono === "positivo").length,
          neutral: rows.filter((p) => p.tono === "neutral").length,
          negativo: rows.filter((p) => p.tono === "negativo" || p.tono === "crisis").length,
        },
      };
    };
    const prensaPreviaDe = (scope: ScopeKey) => {
      const rows = prevMentions.filter((r) => (r.scope ?? "institucional") === scope);
      return {
        total: rows.length,
        negativa: rows.filter((r) => r.tono === "negativo" || r.tono === "crisis").length,
      };
    };

    const bloqueDe = (scope: ScopeKey): ScopeBlock => {
      const rows = cuentas.filter((c) => (c.tipo ?? "institucional") === scope);
      const r = rankingDe(scope);
      const nar = narrativasDe(scope);
      const pr = prensaDe(scope);
      const prPrev = prensaPreviaDe(scope);
      const pds = rows.map((x) => x.postsDia).filter((v): v is number => v != null && Number.isFinite(v));
      const publicaciones = rows.reduce((a, x) => a + (x.publicaciones ?? 0), 0);

      // Seguidores por red, actual vs previo, para señalar la red que más se movió.
      const redes = Array.from(new Set(rows.map((x) => x.red.toLowerCase()))).map((red) => {
        const actual = rows.filter((x) => x.red.toLowerCase() === red)
          .reduce((a, x) => a + (x.seguidores ?? 0), 0);
        let previo = 0; let hayPrevio = false;
        compByIdentity.forEach((c, identity) => {
          if ((c.account_type ?? "institucional") !== scope) return;
          if (c.network.toLowerCase() !== red) return;
          const v = prevFollowers.get(`${identity}|${red}`);
          if (v != null) { previo += v; hayPrevio = true; }
        });
        return { red, seguidores: actual || null, prevSeguidores: hayPrevio ? previo : null };
      });

      return {
        key: scope,
        label: scope === "titular" ? "Comunicación del titular" : "Comunicación institucional",
        sujeto: scope === "titular"
          ? `${dep.titular ?? "Titular sin registrar"}${dep.titular_cargo ? ` · ${dep.titular_cargo}` : ""}`
          : dep.nombre,
        cuentas: rows,
        seguidores: rows.reduce((a, x) => a + (x.seguidores ?? 0), 0),
        engagement: weightedRate(rows.map((x) => ({ rate: x.engagement, weight: x.seguidores }))),
        postsDia: pds.length ? pds.reduce((a, b) => a + b, 0) : null,
        publicaciones,
        variacionSeguidores: pctDelta(r.mine.followers, r.prevMine?.followers),
        rank: r.rank,
        rankTotal: r.total,
        promedioGabinete: r.promedio,
        topPosts: postsDe(scope),
        narrativas: nar.axes,
        narrativasFuentes: nar.fuentes,
        cambios: buildDeltaLines({
          scope,
          seguidores: r.mine.followers || null,
          prevSeguidores: r.prevMine?.followers ?? null,
          engagement: r.mine.engagement,
          prevEngagement: r.prevMine?.engagement ?? null,
          promedioGabinete: r.promedio,
          prevPromedioGabinete: r.prevPromedio,
          publicaciones,
          prevPublicaciones: prevPostsByScope.get(scope) ?? (prevMentions.length || prevIds.length ? 0 : null),
          rank: r.rank,
          prevRank: r.prevRank,
          rankTotal: r.total,
          prensaTotal: pr.prensaTotal,
          prevPrensaTotal: prPrev.total,
          prensaNegativa: pr.prensaTono.negativo,
          prevPrensaNegativa: prPrev.negativa,
          redes,
        }),
        ...pr,
      };
    };


    const bloques: ScopeBlock[] =
      enfoque === "combinado" ? [bloqueDe("institucional"), bloqueDe("titular")]
        : [bloqueDe(enfoque)];

    const comb = rankingDe("combinado");
    const conjunto = enfoque === "combinado"
      ? {
          seguidores: bloques.reduce((a, b) => a + b.seguidores, 0),
          engagement: comb.mine.engagement,
          postsDia: comb.mine.postsDia,
          prensaTotal: bloques.reduce((a, b) => a + b.prensaTotal, 0),
          variacionSeguidores: pctDelta(comb.mine.followers, comb.prevMine?.followers),
          rank: comb.rank,
          rankTotal: comb.total,
        }
      : null;

    // Recomendaciones con IA: se piden con el corte ya calculado. Si fallan, el
    // reporte se entrega igual (sin la sección) en vez de romper la descarga.
    let recomendaciones: DependenciaReportData["recomendaciones"] = null;
    if (conRecomendaciones) {
      try {
        const contexto = {
          dependencia: dep.nombre,
          titular: dep.titular,
          periodo: cutLabel,
          enfoque: ENFOQUE_LABEL[enfoque],
          bloques: bloques.map((b) => ({
            ambito: b.label,
            sujeto: b.sujeto,
            seguidores: b.seguidores,
            interaccion: b.engagement,
            promedio_gabinete: b.promedioGabinete,
            lugar_en_gabinete: b.rank,
            total_dependencias: b.rankTotal,
            publicaciones: b.publicaciones,
            cambios: (b.cambios ?? []).map((c) => c.texto),
            temas: b.narrativas.map((n) => n.name),
            mejores_publicaciones: b.topPosts.map((p) => ({
              red: p.red, fecha: p.fecha, interacciones: p.interacciones, texto: (p.texto || "").slice(0, 220),
            })),
            prensa_total: b.prensaTotal,
            prensa_tono: b.prensaTono,
            prensa: b.prensa.slice(0, 8).map((p) => ({ fecha: p.fecha, medio: p.medio, titular: p.titular, tono: p.tono })),
          })),
        };
        const { data, error } = await supabase.functions.invoke("generate-dependencia-recommendations", {
          body: {
            client_id: clientId,
            dependencia_id: dep.id,
            range_start: winFrom,
            range_end: winTo,
            enfoque,
            contexto,
          },
        });
        if (error) throw error;
        const items = Array.isArray(data?.payload?.recomendaciones) ? data.payload.recomendaciones : [];
        if (items.length) recomendaciones = { lectura: data?.payload?.lectura, items };
      } catch (e) {
        console.error("recomendaciones", e);
        toast.message("El reporte se generó sin la sección de recomendaciones.");
      }
    }

    return {
      dependencia: dep.nombre,
      tipo: dep.tipo,
      titular: dep.titular,
      titularCargo: dep.titular_cargo,
      periodoLabel: cutLabel,
      modo: enfoque,
      enfoqueLabel: ENFOQUE_LABEL[enfoque],
      bloques,
      conjunto,
      recomendaciones,
    };
  };


  const buildGabineteReport = (): GabineteReportData => {
    const curr = aggregate(activePeriods.map((p) => p.id));
    const prev = aggregate(prevPeriods.map((p) => p.id));
    const depName = new Map(dependencias.map((d) => [d.id, d.nombre]));
    const ranking = Array.from(curr.entries())
      .filter(([, v]) => v.engagement != null || v.followers > 0)
      .sort((a, b) => (b[1].engagement ?? 0) - (a[1].engagement ?? 0))
      .map(([id, v]) => ({ nombre: depName.get(id) ?? "—", engagement: v.engagement, seguidores: v.followers }));
    const moves = Array.from(curr.entries()).map(([id, v]) => {
      const p = prev.get(id);
      const d = p && p.followers ? (v.followers - p.followers) / Math.abs(p.followers) : null;
      return { nombre: depName.get(id) ?? "—", delta: d };
    }).filter((r) => r.delta != null) as { nombre: string; delta: number }[];
    return {
      periodoLabel: `${cutLabel} · ${ENFOQUE_LABEL[enfoque]}`,
      ranking,
      suben: moves.slice().sort((a, b) => b.delta - a.delta).slice(0, 5),
      bajan: moves.slice().sort((a, b) => a.delta - b.delta).slice(0, 5),
      promedioEngagement: RATE_AVG(ranking.map((r) => r.engagement).filter((v): v is number => v != null && Number.isFinite(v))),
      dependencias: ranking.length,
    };
  };

  const downloadDepPdf = async () => {
    setBusy("dep");
    toast.loading("Generando reporte…", { id: "dep-pdf" });
    const data = await buildDependenciaReport();
    if (!data) { toast.error("Selecciona una dependencia", { id: "dep-pdf" }); setBusy(null); return; }
    setDepData(data);
    try {
      await new Promise((r) => setTimeout(r, 350));
      await renderPdf(depPdfRef, `${data.dependencia.replace(/\s+/g, "-").toLowerCase()}-${enfoque}-${cutSlug}.pdf`);
      toast.success("Reporte descargado", { id: "dep-pdf" });
    } catch {
      toast.error("No se pudo generar el PDF", { id: "dep-pdf" });
    } finally { setBusy(null); }
  };

  const downloadGabPdf = async () => {
    setBusy("gab");
    setGabData(buildGabineteReport());
    toast.loading("Generando panorama…", { id: "gab-pdf" });
    try {
      await new Promise((r) => setTimeout(r, 350));
      await renderPdf(gabPdfRef, `gabinete-${enfoque}-${cutSlug}.pdf`);
      toast.success("Panorama descargado", { id: "gab-pdf" });
    } catch {
      toast.error("No se pudo generar el PDF", { id: "gab-pdf" });
    } finally { setBusy(null); }
  };

  if (loading) return <Card className="p-8 text-center text-sm text-muted-foreground">Cargando centro de descargas…</Card>;

  const depSel = dependencias.find((d) => d.id === depId);

  return (
    <div className="space-y-5">
      {/* Reporte por dependencia */}
      <Card className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Building2 className="w-5 h-5 text-primary" /></div>
          <div>
            <h3 className="font-display font-bold">Reporte ejecutivo por dependencia</h3>
            <p className="text-xs text-muted-foreground">
              Cuentas, posición frente al gabinete, mejores publicaciones, narrativas y menciones de prensa en un PDF listo para circular.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Dependencia</span>
            <Select value={depId} onValueChange={setDepId}>
              <SelectTrigger className="w-[320px] h-9"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent className="max-h-80">
                {dependencias.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Corte</span>
            <Select value={cut} onValueChange={(v) => setCut(v as typeof cut)}>
              <SelectTrigger className="w-[170px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mensual">Mensual</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {cut === "mensual" ? (
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Periodo</span>
              <Select value={periodLabel} onValueChange={setPeriodLabel}>
                <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {periodLabels.slice().reverse().map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Semana desde</span>
                <Input type="date" value={weekFrom} max={weekTo} onChange={(e) => setWeekFrom(e.target.value)} className="h-9 w-[150px]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Hasta</span>
                <Input type="date" value={weekTo} min={weekFrom} onChange={(e) => setWeekTo(e.target.value)} className="h-9 w-[150px]" />
              </div>
              <Button
                variant="ghost" size="sm" className="h-9"
                onClick={() => { const w = ultimaSemanaCompleta(); setWeekFrom(w.from); setWeekTo(w.to); }}
              >
                Última semana completa
              </Button>
            </>
          )}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Enfoque</span>
            <Select value={enfoque} onValueChange={(v) => setEnfoque(v as typeof enfoque)}>
              <SelectTrigger className="w-[240px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="combinado">Combinado (institución + titular)</SelectItem>
                <SelectItem value="institucional">Solo institucional</SelectItem>
                <SelectItem value="titular">Solo titular (funcionario)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-primary w-4 h-4"
              checked={conRecomendaciones}
              onChange={(e) => setConRecomendaciones(e.target.checked)}
            />
            Incluir recomendaciones
          </label>

          <Button onClick={downloadDepPdf} disabled={busy !== null || !depId}>
            {busy === "dep" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileText className="w-4 h-4 mr-1" />}
            Descargar reporte
          </Button>
          <Button variant="outline" onClick={downloadGabPdf} disabled={busy !== null}>
            {busy === "gab" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
            Panorama de todo el gabinete
          </Button>
        </div>

        {depSel?.titular && (
          <p className="text-xs text-muted-foreground">
            Titular: <span className="text-foreground font-medium">{depSel.titular}</span>
            {depSel.titular_cargo ? ` · ${depSel.titular_cargo}` : ""}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">
          {cut === "semanal"
            ? `Corte semanal ${fmtDia(weekFrom)} — ${fmtDia(weekTo)}: publicaciones y menciones de prensa se filtran a esos días; las métricas de seguidores y engagement provienen del corte de datos más reciente disponible${latestActivePeriodLabel ? ` (${latestActivePeriodLabel})` : ""}.`
            : `Corte mensual: publicaciones, métricas y prensa del periodo ${periodLabel || "seleccionado"}.`}
        </p>
      </Card>

      {/* Menciones de prensa */}
      <Card className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Newspaper className="w-5 h-5 text-primary" /></div>
          <div>
            <h3 className="font-display font-bold">Menciones de prensa</h3>
            <p className="text-xs text-muted-foreground">
              Filtra el periodo, la dependencia, el medio y el tono; descarga la base completa en Excel/CSV.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Desde</span>
            <Input type="date" value={pressFrom} onChange={(e) => setPressFrom(e.target.value)} className="h-9 w-[150px]" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Hasta</span>
            <Input type="date" value={pressTo} onChange={(e) => setPressTo(e.target.value)} className="h-9 w-[150px]" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Dependencia</span>
            <Select value={pressDep} onValueChange={setPressDep}>
              <SelectTrigger className="w-[260px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="todas">Todas</SelectItem>
                {dependencias.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Medio</span>
            <Select value={pressMedio} onValueChange={setPressMedio}>
              <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="todos">Todos</SelectItem>
                {medios.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Tono</span>
            <Select value={pressTono} onValueChange={setPressTono}>
              <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="positivo">Positivo</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negativo">Negativo / crisis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={exportPressCsv} disabled={pressLoading || pressFiltered.length === 0}>
            <FileSpreadsheet className="w-4 h-4 mr-1" />Descargar Excel/CSV
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {pressLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          <Badge variant="secondary">{pressFiltered.length}</Badge>
          menciones se incluirán en la descarga
          {pressAll.length > 0 && <span>· {pressAll.filter((r) => r.dep).length} vinculadas a una dependencia</span>}
        </div>

        {pressFiltered.length > 0 && (
          <div className="max-h-64 overflow-auto rounded-lg border border-border/50">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-background">
                <tr className="text-left text-muted-foreground">
                  <th className="p-2 font-medium">Fecha</th>
                  <th className="p-2 font-medium">Medio</th>
                  <th className="p-2 font-medium">Titular</th>
                  <th className="p-2 font-medium">Tono</th>
                </tr>
              </thead>
              <tbody>
                {pressFiltered.slice(0, 40).map((r, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="p-2 whitespace-nowrap">{r.fecha}</td>
                    <td className="p-2">{r.medio}</td>
                    <td className="p-2">{r.titular || r.cita.slice(0, 80)}</td>
                    <td className="p-2">{TONE_LABEL[r.tono] ?? r.tono}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Reportes publicados */}
      {reports.length > 0 && (
        <Card className="p-5 space-y-3">
          <h3 className="font-display font-bold">Reportes publicados por KiMedia</h3>
          <div className="grid gap-2">
            {reports.map((r) => (
              <Link key={r.id} to={`/reporte/${r.id}`} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium flex-1 truncate">{r.title}</span>
                <span className="text-xs text-muted-foreground">{r.report_date}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Plantillas ocultas para PDF */}
      <div className="fixed -left-[10000px] top-0" aria-hidden>
        <DependenciaPdfTemplate ref={depPdfRef} data={depData} />
        <GabinetePdfTemplate ref={gabPdfRef} data={gabData} portalName={portalName} />
      </div>
    </div>
  );
}
