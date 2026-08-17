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
import { nameTokens } from "@/lib/entityNames";
import {
  DependenciaPdfTemplate, GabinetePdfTemplate,
  type DependenciaReportData, type GabineteReportData, type DepPressRow,
} from "./DependenciaPdfTemplate";

type Dependencia = { id: string; nombre: string; tipo: string | null; titular: string | null; titular_cargo: string | null; sort_order: number | null };
type Competitor = { id: string; name: string; network: string; dependencia_id: string | null; account_type: string | null };
type Period = { id: string; period_label: string; period_start: string; period_end: string };
type Metric = { period_id: string; competitor_id: string; network: string; followers: number | null; follower_growth_rate: number | null; engagement_rate: number | null; posts_per_day: number | null };
type Post = { period_id: string; competitor_id: string | null; network: string; profile_name: string; posted_at: string | null; message: string | null; interactions: number | null };
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
    if (error) break;
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

/** Última semana completa lunes→domingo. */
function ultimaSemanaCompleta() {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const dow = hoy.getDay();
  const domingo = new Date(hoy); domingo.setDate(hoy.getDate() - (dow === 0 ? 0 : dow));
  const lunes = new Date(domingo); lunes.setDate(domingo.getDate() - 6);
  return { from: lunes.toISOString().slice(0, 10), to: domingo.toISOString().slice(0, 10) };
}

const TONE_LABEL: Record<string, string> = { positivo: "Positivo", neutral: "Neutral", negativo: "Negativo", crisis: "Crisis" };

/** Palabras genéricas del directorio que no sirven para identificar una dependencia. */
const GENERIC = new Set([
  "secretaria", "secretaría", "subsecretaria", "instituto", "organismo", "procuraduria", "coordinacion",
  "direccion", "general", "estado", "estatal", "guanajuato", "gobierno", "sistema", "comision", "consejo", "unidad",
]);

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

  // Prensa
  const [pressFrom, setPressFrom] = useState(isoDaysAgo(29));
  const [pressTo, setPressTo] = useState(isoToday());
  const [pressDep, setPressDep] = useState<string>("todas");
  const [pressMedio, setPressMedio] = useState<string>("todos");
  const [pressTono, setPressTono] = useState<string>("todos");
  const [pressRows, setPressRows] = useState<DepPressRow[] & { _dep?: string }[]>([]);
  const [pressAll, setPressAll] = useState<{ fecha: string; medio: string; titular: string; cita: string; url: string; tono: string; canal: string; dep: string | null }[]>([]);
  const [pressLoading, setPressLoading] = useState(false);

  const depPdfRef = useRef<HTMLDivElement>(null);
  const gabPdfRef = useRef<HTMLDivElement>(null);
  const [depData, setDepData] = useState<DependenciaReportData | null>(null);
  const [gabData, setGabData] = useState<GabineteReportData | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [dep, comps, per, rep] = await Promise.all([
        supabase.from("client_portal_dependencias").select("*").eq("client_id", clientId).order("sort_order"),
        fetchAllPages<Competitor>((from, to) =>
          supabase.from("client_portal_benchmark_competitors")
            .select("id,name,network,dependencia_id,account_type")
            .eq("client_id", clientId).eq("active", true)
            .order("id").range(from, to)),
        supabase.from("client_portal_benchmark_periods").select("id,period_label,period_start,period_end").eq("client_id", clientId).order("period_start"),
        supabase.from("client_portal_reports").select("id,title,report_date,type").eq("client_id", clientId).order("report_date", { ascending: false }).limit(30),
      ]);
      const ps = (per.data ?? []) as Period[];
      setDependencias((dep.data ?? []) as Dependencia[]);
      setCompetitors(comps);
      setPeriods(ps);
      setReports((rep.data ?? []) as Report[]);
      if (ps.length) {
        const labels = Array.from(new Set(ps.map((p) => p.period_label)));
        setPeriodLabel(labels[labels.length - 1]);
        const ids = ps.map((p) => p.id);
        const [m, po, nar] = await Promise.all([
          fetchAllPages<Metric>((from, to) =>
            supabase.from("client_portal_benchmark_metrics")
              .select("period_id,competitor_id,network,followers,follower_growth_rate,engagement_rate,posts_per_day")
              .in("period_id", ids).order("period_id").range(from, to)),
          fetchAllPages<Post>((from, to) =>
            supabase.from("client_portal_benchmark_posts")
              .select("period_id,competitor_id,network,profile_name,posted_at,message,interactions")
              .in("period_id", ids).order("interactions", { ascending: false }).range(from, to), 1000, 8000),
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
  /** En corte semanal las métricas provienen del último corte de datos disponible. */
  const semanalLabel = useMemo(() => {
    const cand = periods.filter((p) => p.period_start <= weekTo);
    return cand.length ? cand[cand.length - 1].period_label : (periodLabels[periodLabels.length - 1] ?? "");
  }, [periods, periodLabels, weekTo]);
  const activePeriods = useMemo(
    () => periods.filter((p) => p.period_label === (cut === "semanal" ? semanalLabel : periodLabel)),
    [periods, periodLabel, cut, semanalLabel],
  );
  const prevPeriods = useMemo(() => {
    const ref = cut === "semanal" ? activePeriods[0]?.period_label ?? "" : periodLabel;
    const idx = periodLabels.indexOf(ref);
    if (idx <= 0) return [];
    return periods.filter((p) => p.period_label === periodLabels[idx - 1]);
  }, [periods, periodLabels, periodLabel, cut, activePeriods]);

  /** Etiqueta del corte activo y ventana de fechas para prensa/publicaciones. */
  const cutLabel = cut === "semanal"
    ? `Semana ${fmtDia(weekFrom)} — ${fmtDia(weekTo)}`
    : (periodLabel || "Periodo");
  const cutSlug = cut === "semanal" ? `semana-${weekFrom}` : (periodLabel || "reporte").replace(/\s+/g, "-").toLowerCase();

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

  const matchesEnfoque = (accountType: string | null | undefined) =>
    enfoque === "combinado" ? true : (accountType ?? "institucional") === enfoque;

  const ENFOQUE_LABEL: Record<string, string> = {
    combinado: "Dependencia + titular",
    institucional: "Solo cuentas institucionales",
    titular: "Solo cuentas del titular",
  };

  /** Agregado por dependencia para un conjunto de periodos. */
  const aggregate = (periodIds: string[]) => {
    const acc = new Map<string, { followers: number; eng: number[]; posts: number[] }>();
    for (const m of metrics) {
      if (!periodIds.includes(m.period_id)) continue;
      const dep = depOfCompetitor.get(m.competitor_id);
      if (!dep) continue;
      if (!matchesEnfoque(typeOfCompetitor.get(m.competitor_id))) continue;
      const e = acc.get(dep) ?? { followers: 0, eng: [], posts: [] };
      e.followers += Number(m.followers) || 0;
      if (Number.isFinite(Number(m.engagement_rate))) e.eng.push(Number(m.engagement_rate));
      if (Number.isFinite(Number(m.posts_per_day))) e.posts.push(Number(m.posts_per_day));
      acc.set(dep, e);
    }
    const out = new Map<string, { followers: number; engagement: number | null; postsDia: number | null }>();
    acc.forEach((v, k) => out.set(k, {
      followers: v.followers,
      engagement: RATE_AVG(v.eng),
      postsDia: v.posts.length ? v.posts.reduce((a, b) => a + b, 0) : null,
    }));
    return out;
  };

  // ---------- Menciones de prensa ----------
  const depMatchers = useMemo(() => {
    return dependencias.map((d) => {
      const depTokens = nameTokens(d.nombre).filter((t) => !GENERIC.has(t));
      const titTokens = d.titular ? nameTokens(d.titular) : [];
      return { id: d.id, nombre: d.nombre, depTokens, titTokens };
    });
  }, [dependencias]);

  const resolveDep = (haystack: string): string | null => {
    const toks = new Set(nameTokens(haystack));
    for (const m of depMatchers) {
      if (m.titTokens.length >= 2 && m.titTokens.filter((t) => toks.has(t)).length >= 2) return m.id;
    }
    for (const m of depMatchers) {
      if (m.depTokens.length && m.depTokens.every((t) => toks.has(t))) return m.id;
    }
    return null;
  };

  const loadPress = async () => {
    setPressLoading(true);
    setPressAll(await fetchMentions(pressFrom, pressTo));
    setPressLoading(false);
  };

  useEffect(() => { loadPress(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [clientId, pressFrom, pressTo, depMatchers.length]);

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
      pagebreak: { mode: ["css", "legacy"], avoid: [".pdf-avoid", "svg", "tr"] },
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
    const rows: { fecha: string; medio: string; titular: string; cita: string; url: string; tono: string; canal: string; dep: string | null }[] = [];
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
  };

  const buildDependenciaReport = async (): Promise<DependenciaReportData | null> => {
    const dep = dependencias.find((d) => d.id === depId);
    if (!dep) return null;
    const periodIds = activePeriods.map((p) => p.id);
    const depComps = competitors.filter((c) => c.dependencia_id === dep.id && matchesEnfoque(c.account_type));
    const compById = new Map(depComps.map((c) => [c.id, c]));

    const cuentas = metrics
      .filter((m) => periodIds.includes(m.period_id) && compById.has(m.competitor_id))
      .map((m) => {
        const c = compById.get(m.competitor_id)!;
        return {
          perfil: c.name, red: m.network, tipo: c.account_type ?? "institucional",
          seguidores: m.followers, crecimiento: m.follower_growth_rate,
          engagement: m.engagement_rate, postsDia: m.posts_per_day,
        };
      })
      .sort((a, b) => (b.seguidores ?? 0) - (a.seguidores ?? 0));

    const curr = aggregate(periodIds);
    const prev = aggregate(prevPeriods.map((p) => p.id));
    const mine = curr.get(dep.id) ?? { followers: 0, engagement: null, postsDia: null };
    const prevMine = prev.get(dep.id);

    const engEntries = Array.from(curr.entries()).filter(([, v]) => v.engagement != null && v.engagement > 0)
      .sort((a, b) => (b[1].engagement ?? 0) - (a[1].engagement ?? 0));
    const rank = engEntries.findIndex(([id]) => id === dep.id);
    const engAvg = RATE_AVG(engEntries.map(([, v]) => v.engagement as number));
    const folAvg = engEntries.length
      ? Array.from(curr.values()).reduce((a, b) => a + b.followers, 0) / curr.size
      : null;

    const pctDelta = (a: number | null | undefined, b: number | null | undefined) =>
      a == null || b == null || !b ? null : (a - b) / Math.abs(b);

    const topPosts = posts
      .filter((p) => periodIds.includes(p.period_id) && p.competitor_id && compById.has(p.competitor_id))
      .filter((p) => cut !== "semanal"
        || inMxRange(p.posted_at, weekFrom, weekTo))
      .sort((a, b) => (b.interactions ?? 0) - (a.interactions ?? 0))
      .slice(0, 3)
      .map((p) => ({
        perfil: p.profile_name || compById.get(p.competitor_id!)?.name || "",
        red: p.network, fecha: p.posted_at, texto: p.message ?? "", interacciones: p.interactions ?? 0,
      }));

    const profileNames = new Set(depComps.map((c) => c.name.toLowerCase()));
    const axes: { name: string; description?: string }[] = [];
    for (const n of narratives) {
      if (!profileNames.has(String(n.profile_name ?? "").toLowerCase())) continue;
      for (const a of (n.narratives?.narrative_axes ?? [])) {
        if (a?.name && !axes.some((x) => x.name === a.name)) axes.push({ name: a.name, description: a.description });
      }
    }

    const periodo = activePeriods[0];
    const from = cut === "semanal" ? weekFrom : (periodo?.period_start ?? pressFrom);
    const to = cut === "semanal" ? weekTo : (periodo?.period_end ?? pressTo);
    const mentions = await fetchMentions(from, to);
    const prensaAll = mentions
      .filter((r) => r.dep === dep.id)
      .map((r) => ({ fecha: r.fecha, medio: r.medio, titular: r.titular || r.cita.slice(0, 90), tono: r.tono, url: r.url }));
    const prensa = prensaAll.slice(0, 12);
    const prensaTono = {
      positivo: prensaAll.filter((p) => p.tono === "positivo").length,
      neutral: prensaAll.filter((p) => p.tono === "neutral").length,
      negativo: prensaAll.filter((p) => p.tono === "negativo" || p.tono === "crisis").length,
    };

    return {
      dependencia: dep.nombre,
      tipo: dep.tipo,
      titular: dep.titular,
      titularCargo: dep.titular_cargo,
      periodoLabel: `${cutLabel} · ${ENFOQUE_LABEL[enfoque]}`,
      redes: Array.from(new Set(cuentas.map((c) => c.red))),
      cuentas,
      totales: { seguidores: mine.followers, engagement: mine.engagement, postsDia: mine.postsDia },
      promedioGabinete: { engagement: engAvg, seguidores: folAvg },
      posicion: { rank: rank >= 0 ? rank + 1 : null, total: engEntries.length },
      variacion: {
        seguidores: pctDelta(mine.followers, prevMine?.followers),
        engagement: pctDelta(mine.engagement, prevMine?.engagement),
      },
      topPosts,
      prensa,
      prensaTotal: prensaAll.length,
      prensaTono,
      narrativas: axes,
    };
  };

  const buildGabineteReport = (): GabineteReportData => {
    const curr = aggregate(activePeriods.map((p) => p.id));
    const prev = aggregate(prevPeriods.map((p) => p.id));
    const depName = new Map(dependencias.map((d) => [d.id, d.nombre]));
    const ranking = Array.from(curr.entries())
      .filter(([, v]) => (v.engagement ?? 0) > 0 || v.followers > 0)
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
      promedioEngagement: RATE_AVG(ranking.map((r) => r.engagement).filter((v): v is number => v != null && v > 0)),
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
            ? `Corte semanal ${fmtDia(weekFrom)} — ${fmtDia(weekTo)}: publicaciones y menciones de prensa se filtran a esos días; las métricas de seguidores y engagement provienen del corte de datos ${activePeriods[0]?.period_label ?? "más cercano"}.`
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
