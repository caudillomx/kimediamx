import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Sparkles,
  FileText,
  Download,
  Eye,
  PlusCircle,
  Calendar,
  Mic,
} from "lucide-react";
import { toast } from "sonner";

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const DELIVERABLE_LABELS: Record<string, string> = {
  registro_consultorias: "Registro 1:1 (por dependencia)",
  resumen_consultorias: "Resumen consolidado del mes",
  reporte_mcn: "Reporte MCN (Matriz de Competencias)",
  bitacora_simulacros: "Bitácora de entrenamientos y simulacros",
};

const SESSION_TYPE_LABEL: Record<string, string> = {
  consultoria: "Consultoría 1:1",
  entrenamiento: "Entrenamiento",
  simulacro: "Simulacro",
};

interface Dependencia { id: string; nombre: string; siglas: string }
interface FFTranscript {
  id: string; title: string; date: number; duration: number;
  participants?: string[]; transcript_url?: string;
  summary?: { overview?: string; short_summary?: string };
}
interface TrainingSession {
  id: string; dependencia_id: string; session_type: string; session_date: string;
  duration_minutes: number | null; topic: string | null; modality: string | null;
  attendee_count: number | null; facilitator: string | null;
  fireflies_url: string | null; ai_extracted: any; created_at: string;
}
interface Deliverable {
  id: string; deliverable_type: string; dependencia_id: string | null;
  period_year: number; period_month: number; title: string; status: string;
  file_url: string | null; created_at: string;
}

export default function CursoGtoEntregables() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [deps, setDeps] = useState<Dependencia[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [filterDep, setFilterDep] = useState<string>("all");
  const [sessRange, setSessRange] = useState<"month" | "90d" | "6m" | "all">("all");

  const [ffLoading, setFfLoading] = useState(false);
  const [ffList, setFfList] = useState<FFTranscript[]>([]);
  const [ffRange, setFfRange] = useState<"month" | "90d" | "6m" | "all">("6m");
  const [importingId, setImportingId] = useState<string | null>(null);

  const [genType, setGenType] = useState<string>("registro_consultorias");
  const [genDep, setGenDep] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number; current: string }>({
    done: 0, total: 0, current: "",
  });
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  useEffect(() => {
    document.title = "Entregables Curso IA GTO · KiMedia";
  }, []);

  // Auth
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/operaciones/login");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", session.user.id);
      const admin = (roles ?? []).some((r: any) => r.role === "admin");
      setIsAdmin(admin);
      setAuthChecking(false);
      if (!admin) toast.error("Acceso restringido a administradores.");
    })();
  }, [navigate]);

  const fetchData = async () => {
    let sessQ = supabase.from("gto_training_sessions").select("*")
      .order("session_date", { ascending: false });
    if (sessRange === "month") {
      const s = new Date(year, month - 1, 1).toISOString().split("T")[0];
      const e = new Date(year, month, 0).toISOString().split("T")[0];
      sessQ = sessQ.gte("session_date", s).lte("session_date", e);
    } else if (sessRange === "90d") {
      const s = new Date(); s.setDate(s.getDate() - 90);
      sessQ = sessQ.gte("session_date", s.toISOString().split("T")[0]);
    } else if (sessRange === "6m") {
      const s = new Date(); s.setMonth(s.getMonth() - 6);
      sessQ = sessQ.gte("session_date", s.toISOString().split("T")[0]);
    }
    const [{ data: d1 }, { data: d2 }, { data: d3 }] = await Promise.all([
      supabase.from("gto_dependencias").select("id, nombre, siglas").order("sort_order"),
      sessQ,
      supabase.from("gto_deliverables").select("*")
        .eq("period_year", year).eq("period_month", month)
        .order("created_at", { ascending: false }),
    ]);
    setDeps((d1 ?? []) as Dependencia[]);
    setSessions((d2 ?? []) as TrainingSession[]);
    setDeliverables((d3 ?? []) as Deliverable[]);
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, year, month, sessRange]);

  const filteredSessions = useMemo(() => {
    if (filterDep === "all") return sessions;
    return sessions.filter((s) => s.dependencia_id === filterDep);
  }, [sessions, filterDep]);

  const depName = (id: string | null) => {
    if (!id) return "—";
    const d = deps.find((x) => x.id === id);
    return d ? `${d.siglas} · ${d.nombre}` : "—";
  };

  // Fireflies: list recent transcripts
  const loadFireflies = async () => {
    setFfLoading(true);
    try {
      let fromDate: string | null = null;
      let toDate: string | null = null;
      const today = new Date();
      if (ffRange === "month") {
        fromDate = new Date(year, month - 1, 1).toISOString();
        toDate = new Date(year, month, 0, 23, 59, 59).toISOString();
      } else if (ffRange === "90d") {
        fromDate = new Date(today.getTime() - 90 * 86400000).toISOString();
      } else if (ffRange === "6m") {
        fromDate = new Date(today.getFullYear(), today.getMonth() - 6, 1).toISOString();
      }
      const { data, error } = await supabase.functions.invoke("fireflies-list-meetings", {
        body: { limit: 300, fromDate, toDate },
      });
      if (error) throw error;
      setFfList((data as any)?.transcripts ?? []);
      toast.success(`${((data as any)?.transcripts ?? []).length} reuniones encontradas`);
    } catch (e: any) {
      toast.error(`Error Fireflies: ${e?.message ?? "desconocido"}`);
    } finally {
      setFfLoading(false);
    }
  };

  const importTranscript = async (
    transcriptId: string,
    sessionType: string,
  ) => {
    setImportingId(transcriptId);
    try {
      const { data, error } = await supabase.functions.invoke("fireflies-import-session", {
        body: { transcriptId, sessionType },
      });
      if (error) throw error;
      const d = data as any;
      if (d?.requiresManual) {
        toast.warning("La IA no identificó dependencias. Importa manualmente desde la base de datos o reasigna después.");
      } else {
        const detected: string[] = d?.dependencias_detectadas ?? [];
        toast.success(
          detected.length
            ? `Importado para: ${detected.join(", ")}`
            : "Sesión importada"
        );
      }
      fetchData();
    } catch (e: any) {
      toast.error(`Error al importar: ${e?.message ?? "desconocido"}`);
    } finally {
      setImportingId(null);
    }
  };

  const generateDeliverable = async () => {
    if (!genType) return;
    if (genType !== "resumen_consultorias" && !genDep) {
      toast.error("Selecciona una dependencia (o usa 'Resumen consolidado').");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("gto-generate-deliverable", {
        body: {
          deliverableType: genType,
          dependenciaId: genType === "resumen_consultorias" ? null : genDep,
          year, month,
          consultantName: "KiMedia",
        },
      });
      if (error) throw error;
      toast.success("Entregable generado");
      fetchData();
      const html = (data as any)?.html;
      if (html) {
        setPreviewHtml(html);
        setPreviewTitle((data as any)?.deliverable?.title ?? "Entregable");
      }
    } catch (e: any) {
      toast.error(`Error: ${e?.message ?? "desconocido"}`);
    } finally {
      setGenerating(false);
    }
  };

  // Genera TODOS los entregables del mes: por dependencia (registro, MCN, bitácora)
  // + uno consolidado (resumen). Corre secuencial para no saturar la IA.
  const generateAllDeliverables = async (opts: { wholeCycle?: boolean; recomputeMcn?: boolean } = {}) => {
    const wholeCycle = opts.wholeCycle ?? true;
    const recomputeMcn = opts.recomputeMcn ?? true;
    if (deps.length === 0) {
      toast.error("No hay dependencias cargadas.");
      return;
    }
    const perDepTypes = ["registro_consultorias", "reporte_mcn", "bitacora_simulacros"];
    const mcnSteps = recomputeMcn ? deps.length : 0;
    const total = mcnSteps + deps.length * perDepTypes.length + 1; // +1 resumen consolidado
    setBulkRunning(true);
    setBulkErrors([]);
    setBulkProgress({ done: 0, total, current: "Preparando…" });
    let done = 0;
    const errors: string[] = [];

    const runMcn = async (dep: Dependencia) => {
      const label = `Calcular MCN · ${dep.siglas}`;
      setBulkProgress({ done, total, current: label });
      try {
        const { data, error } = await supabase.functions.invoke("gto-compute-mcn", {
          body: { dependenciaId: dep.id, year, month, wholeCycle },
        });
        if (error) throw error;
        if ((data as any)?.error) throw new Error((data as any).error);
      } catch (e: any) {
        errors.push(`${label}: ${e?.message ?? "desconocido"}`);
      } finally {
        done += 1;
        setBulkProgress({ done, total, current: label });
      }
    };

    const runOne = async (type: string, depId: string | null, label: string) => {
      setBulkProgress({ done, total, current: label });
      try {
        const { data, error } = await supabase.functions.invoke("gto-generate-deliverable", {
          body: {
            deliverableType: type,
            dependenciaId: depId,
            year, month,
            wholeCycle,
            consultantName: "KiMedia",
          },
        });
        if (error) throw error;
        if ((data as any)?.error) throw new Error((data as any).error);
      } catch (e: any) {
        errors.push(`${label}: ${e?.message ?? "desconocido"}`);
      } finally {
        done += 1;
        setBulkProgress({ done, total, current: label });
      }
    };

    if (recomputeMcn) {
      for (const dep of deps) {
        // eslint-disable-next-line no-await-in-loop
        await runMcn(dep);
      }
    }

    for (const dep of deps) {
      for (const type of perDepTypes) {
        const label = `${DELIVERABLE_LABELS[type]} · ${dep.siglas}`;
        // eslint-disable-next-line no-await-in-loop
        await runOne(type, dep.id, label);
      }
    }
    // Resumen consolidado al final
    await runOne("resumen_consultorias", null, DELIVERABLE_LABELS.resumen_consultorias);

    setBulkErrors(errors);
    setBulkRunning(false);
    await fetchData();
    if (errors.length === 0) {
      toast.success(`Listo: ${total} entregables generados`);
    } else {
      toast.warning(`Generados ${total - errors.length}/${total}. ${errors.length} con error.`);
    }
  };

  const previewDeliverable = async (d: Deliverable) => {
    const { data } = await supabase
      .from("gto_deliverables").select("generated_content")
      .eq("id", d.id).maybeSingle();
    const html = (data?.generated_content as any)?.html;
    if (html) {
      setPreviewHtml(html);
      setPreviewTitle(d.title);
    } else {
      toast.error("No hay vista previa disponible.");
    }
  };

  const downloadDeliverable = async (d: Deliverable) => {
    const { data } = await supabase
      .from("gto_deliverables").select("generated_content")
      .eq("id", d.id).maybeSingle();
    const html = (data?.generated_content as any)?.html;
    if (!html) return toast.error("Sin contenido");
    // Download as .doc (Word reads HTML perfectly when extension is .doc)
    const blob = new Blob(
      ["\ufeff", html],
      { type: "application/msword" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${d.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Acceso restringido.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/curso/ia-gobierno-gto/admin")}>
              <ArrowLeft className="w-4 h-4 mr-2" />Admin
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Entregables del curso</h1>
              <p className="text-xs text-muted-foreground">Sesiones Fireflies · MCN · Reportes mensuales</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[year - 1, year, year + 1].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sessions"><Mic className="w-4 h-4 mr-2" />Sesiones del mes</TabsTrigger>
            <TabsTrigger value="fireflies"><PlusCircle className="w-4 h-4 mr-2" />Importar de Fireflies</TabsTrigger>
            <TabsTrigger value="mcn"><Calendar className="w-4 h-4 mr-2" />Calificaciones MCN</TabsTrigger>
            <TabsTrigger value="generate"><Sparkles className="w-4 h-4 mr-2" />Generar entregable</TabsTrigger>
            <TabsTrigger value="deliverables"><FileText className="w-4 h-4 mr-2" />Entregables</TabsTrigger>
          </TabsList>

          {/* SESSIONS */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {sessRange === "month"
                      ? `Sesiones registradas en ${MONTHS[month - 1]} ${year}`
                      : sessRange === "all"
                        ? "Todas las sesiones registradas"
                        : sessRange === "90d"
                          ? "Sesiones de los últimos 90 días"
                          : "Sesiones de los últimos 6 meses"}
                  </CardTitle>
                  <CardDescription>{sessions.length} sesiones totales</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={sessRange} onValueChange={(v: "month" | "90d" | "6m" | "all") => setSessRange(v)}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Mes seleccionado</SelectItem>
                      <SelectItem value="90d">Últimos 90 días</SelectItem>
                      <SelectItem value="6m">Últimos 6 meses</SelectItem>
                      <SelectItem value="all">Todas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterDep} onValueChange={setFilterDep}>
                    <SelectTrigger className="w-64"><SelectValue placeholder="Filtrar dependencia" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las dependencias</SelectItem>
                      {deps.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.siglas} · {d.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Dependencia</TableHead>
                      <TableHead>Tema</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Asistentes</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{new Date(s.session_date).toLocaleDateString("es-MX")}</TableCell>
                        <TableCell><Badge variant="outline">{SESSION_TYPE_LABEL[s.session_type] ?? s.session_type}</Badge></TableCell>
                        <TableCell className="text-sm">{depName(s.dependencia_id)}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{s.topic ?? "—"}</TableCell>
                        <TableCell>{s.duration_minutes ? `${s.duration_minutes} min` : "—"}</TableCell>
                        <TableCell>{s.attendee_count ?? 0}</TableCell>
                        <TableCell>
                          {s.fireflies_url && (
                            <a href={s.fireflies_url} target="_blank" rel="noreferrer" className="text-xs text-coral hover:underline">
                              Fireflies ↗
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSessions.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Sin sesiones registradas en este mes.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FIREFLIES */}
          <TabsContent value="fireflies">
            <Card>
              <CardHeader>
                <CardTitle>Importar de Fireflies</CardTitle>
                <CardDescription>Trae transcripciones desde tu cuenta Fireflies y la IA extrae datos para el formato.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1">
                    <Label>Rango</Label>
                    <Select value={ffRange} onValueChange={(v) => setFfRange(v as any)}>
                      <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Mes seleccionado ({MONTHS[month - 1]} {year})</SelectItem>
                        <SelectItem value="90d">Últimos 90 días</SelectItem>
                        <SelectItem value="6m">Últimos 6 meses</SelectItem>
                        <SelectItem value="all">Todas (sin filtro)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={loadFireflies} disabled={ffLoading}>
                    {ffLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Listar reuniones
                  </Button>
                  {ffList.length > 0 && (
                    <span className="text-xs text-muted-foreground">{ffList.length} reuniones</span>
                  )}
                </div>
                {ffList.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Reunión</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ffList.map((t) => (
                        <FfRow
                          key={t.id}
                          t={t}
                          importing={importingId === t.id}
                          onImport={importTranscript}
                        />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MCN */}
          <TabsContent value="mcn">
            <McnEditor
              year={year}
              month={month}
              deps={deps}
              onSaved={fetchData}
            />
          </TabsContent>

          {/* GENERATE */}
          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle>Generar entregable</CardTitle>
                <CardDescription>La IA arma un borrador con datos del sistema + transcripciones. Tú revisas y editas en Word.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Tipo de entregable</Label>
                    <Select value={genType} onValueChange={setGenType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(DELIVERABLE_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Dependencia {genType === "resumen_consultorias" && <span className="text-xs text-muted-foreground">(no aplica)</span>}</Label>
                    <Select value={genDep} onValueChange={setGenDep} disabled={genType === "resumen_consultorias"}>
                      <SelectTrigger><SelectValue placeholder="Selecciona…" /></SelectTrigger>
                      <SelectContent>
                        {deps.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.siglas} · {d.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={generateDeliverable} disabled={generating} className="w-full">
                      {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Generar borrador
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  La IA usa: sesiones del mes ({sessions.length}), calificaciones MCN, brief y diagnósticos del curso. Si falta data, escribirá <code>[pendiente]</code>.
                </p>
                <div className="border-t border-border pt-4 mt-2 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm font-medium">Generar TODOS los entregables del mes</p>
                      <p className="text-xs text-muted-foreground">
                        {deps.length} dependencias × 3 entregables + 1 resumen consolidado = {deps.length * 3 + 1} archivos.
                        Corre secuencial; puede tardar varios minutos.
                      </p>
                    </div>
                    <Button
                      onClick={generateAllDeliverables}
                      disabled={bulkRunning || generating || deps.length === 0}
                      variant="default"
                    >
                      {bulkRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Generar todos
                    </Button>
                  </div>
                  {bulkRunning && (
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-muted rounded overflow-hidden">
                        <div
                          className="h-full bg-coral transition-all"
                          style={{ width: `${bulkProgress.total ? (bulkProgress.done / bulkProgress.total) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {bulkProgress.done}/{bulkProgress.total} · {bulkProgress.current}
                      </p>
                    </div>
                  )}
                  {!bulkRunning && bulkProgress.total > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Última ejecución: {bulkProgress.done}/{bulkProgress.total} completados
                      {bulkErrors.length > 0 ? ` · ${bulkErrors.length} con error` : " · sin errores"}.
                    </p>
                  )}
                  {bulkErrors.length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-destructive">Ver errores ({bulkErrors.length})</summary>
                      <ul className="mt-1 list-disc list-inside text-muted-foreground space-y-0.5">
                        {bulkErrors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DELIVERABLES LIST */}
          <TabsContent value="deliverables">
            <Card>
              <CardHeader>
                <CardTitle>Entregables generados</CardTitle>
                <CardDescription>{deliverables.length} en {MONTHS[month - 1]} {year}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Dependencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Generado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliverables.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="text-sm">{DELIVERABLE_LABELS[d.deliverable_type] ?? d.deliverable_type}</TableCell>
                        <TableCell className="text-sm">{depName(d.dependencia_id)}</TableCell>
                        <TableCell><Badge variant="outline">{d.status}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(d.created_at).toLocaleString("es-MX")}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => previewDeliverable(d)}>
                            <Eye className="w-3.5 h-3.5 mr-1" />Ver
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => downloadDeliverable(d)}>
                            <Download className="w-3.5 h-3.5 mr-1" />.doc
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {deliverables.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Aún no hay entregables generados para este mes.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* PREVIEW DIALOG */}
      <Dialog open={!!previewHtml} onOpenChange={(o) => !o && setPreviewHtml(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{previewTitle}</DialogTitle></DialogHeader>
          {previewHtml && (
            <iframe
              title="preview"
              srcDoc={previewHtml}
              className="w-full h-[70vh] border rounded bg-white"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ================ Sub: Fireflies row with dep selector ================ */
function FfRow({
  t, importing, onImport,
}: {
  t: FFTranscript;
  importing: boolean;
  onImport: (id: string, type: string) => void;
}) {
  const [type, setType] = useState("consultoria");
  return (
    <TableRow>
      <TableCell className="text-xs">{new Date(Number(t.date)).toLocaleDateString("es-MX")}</TableCell>
      <TableCell className="text-sm max-w-sm truncate">{t.title}</TableCell>
      <TableCell>{t.duration ? `${Math.round(Number(t.duration))} min` : "—"}</TableCell>
      <TableCell>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="consultoria">Consultoría</SelectItem>
            <SelectItem value="entrenamiento">Entrenamiento</SelectItem>
            <SelectItem value="simulacro">Simulacro</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Button size="sm" disabled={importing} onClick={() => onImport(t.id, type)}>
          {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Importar"}
        </Button>
      </TableCell>
    </TableRow>
  );
}

/* ================ Sub: MCN editor ================ */
const MCN_DIMENSIONS: { key: string; label: string }[] = [
  { key: "deteccion_temprana", label: "1. Detección temprana" },
  { key: "analisis_riesgos", label: "2. Análisis de riesgos" },
  { key: "coordinacion", label: "3. Coordinación" },
  { key: "tiempo_respuesta", label: "4. Tiempo de respuesta" },
  { key: "trazabilidad", label: "5. Trazabilidad" },
];

function McnEditor({
  year, month, deps, onSaved,
}: {
  year: number; month: number; deps: Dependencia[]; onSaved: () => void;
}) {
  const [depId, setDepId] = useState<string>("");
  const [scores, setScores] = useState<Record<string, string>>({});
  const [fortalezas, setFortalezas] = useState("");
  const [areas, setAreas] = useState("");
  const [loading, setLoading] = useState(false);
  const [computing, setComputing] = useState(false);
  const [computedBy, setComputedBy] = useState<string>("manual");
  const [computedAt, setComputedAt] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<Record<string, string[]>>({});
  const [sources, setSources] = useState<any | null>(null);
  const [resumenIa, setResumenIa] = useState<string>("");

  useEffect(() => {
    if (!depId) return;
    (async () => {
      const { data } = await supabase
        .from("gto_mcn_scores").select("*")
        .eq("dependencia_id", depId)
        .eq("period_year", year).eq("period_month", month)
        .maybeSingle();
      if (data) {
        const s: Record<string, string> = {};
        MCN_DIMENSIONS.forEach((d) => {
          const v = (data as any)[d.key];
          s[d.key] = v != null ? String(v) : "";
        });
        setScores(s);
        setFortalezas(data.fortalezas ?? "");
        setAreas(data.areas_mejora ?? "");
        setComputedBy((data as any).computed_by ?? "manual");
        setComputedAt((data as any).computed_at ?? null);
        setEvidence(((data as any).evidence ?? {}) as Record<string, string[]>);
        const obs = (data as any).observaciones ?? {};
        setResumenIa(obs?.resumen_ejecutivo ?? "");
      } else {
        setScores({});
        setFortalezas("");
        setAreas("");
        setComputedBy("manual");
        setComputedAt(null);
        setEvidence({});
        setResumenIa("");
      }
      setSources(null);
    })();
  }, [depId, year, month]);

  const save = async () => {
    if (!depId) return toast.error("Selecciona dependencia");
    setLoading(true);
    try {
      const payload: any = {
        dependencia_id: depId,
        period_year: year,
        period_month: month,
        fortalezas, areas_mejora: areas,
        computed_by: computedBy === "ai" ? "ai_edited" : "manual",
      };
      MCN_DIMENSIONS.forEach((d) => {
        const v = scores[d.key];
        payload[d.key] = v === "" || v == null ? null : Number(v);
      });
      const { error } = await supabase
        .from("gto_mcn_scores")
        .upsert(payload, { onConflict: "dependencia_id,period_year,period_month" });
      if (error) throw error;
      toast.success("MCN guardada");
      onSaved();
    } catch (e: any) {
      toast.error(`Error: ${e?.message ?? "desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  const computeAi = async () => {
    if (!depId) return toast.error("Selecciona dependencia");
    setComputing(true);
    try {
      const { data, error } = await supabase.functions.invoke("gto-compute-mcn", {
        body: { dependenciaId: depId, year, month },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const score = (data as any).score;
      const s: Record<string, string> = {};
      MCN_DIMENSIONS.forEach((d) => {
        const v = score?.[d.key];
        s[d.key] = v != null ? String(v) : "";
      });
      setScores(s);
      setFortalezas(score?.fortalezas ?? "");
      setAreas(score?.areas_mejora ?? "");
      setEvidence((score?.evidence ?? {}) as Record<string, string[]>);
      setComputedBy(score?.computed_by ?? "ai");
      setComputedAt(score?.computed_at ?? null);
      setResumenIa(score?.observaciones?.resumen_ejecutivo ?? "");
      setSources((data as any).sources ?? null);
      toast.success("MCN calculada por IA");
      onSaved();
    } catch (e: any) {
      toast.error(`IA falló: ${e?.message ?? "desconocido"}`);
    } finally {
      setComputing(false);
    }
  };

  const badge =
    computedBy === "ai"
      ? { label: "Calculado por IA", cls: "bg-coral/15 text-coral border-coral/30" }
      : computedBy === "ai_edited"
        ? { label: "IA + edición humana", cls: "bg-amber-500/15 text-amber-600 border-amber-500/30" }
        : { label: "Manual", cls: "bg-muted text-muted-foreground border-border" };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Matriz de Competencias Narrativas (MCN)</CardTitle>
            <CardDescription>
              La IA califica 0–10 por dimensión con base en sesiones Fireflies y bitácoras del curso. Puedes editar antes de guardar.
            </CardDescription>
          </div>
          {depId && (
            <span className={`text-xs px-2 py-1 rounded border ${badge.cls}`}>
              {badge.label}
              {computedAt ? ` · ${new Date(computedAt).toLocaleDateString("es-MX")}` : ""}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2 flex-wrap">
          <div className="space-y-1 flex-1 min-w-[240px] max-w-md">
            <Label>Dependencia</Label>
            <Select value={depId} onValueChange={setDepId}>
              <SelectTrigger><SelectValue placeholder="Selecciona…" /></SelectTrigger>
              <SelectContent>
                {deps.map((d) => (<SelectItem key={d.id} value={d.id}>{d.siglas} · {d.nombre}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="default"
            onClick={computeAi}
            disabled={!depId || computing}
          >
            {computing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Calcular con IA
          </Button>
        </div>
        {sources && (
          <p className="text-xs text-muted-foreground">
            Fuentes usadas: {sources.fireflies_sessions} sesiones Fireflies · {sources.curso_sesiones} sesiones del curso · {sources.corpus_docs} documentos · {sources.diagnosticos} diagnósticos
          </p>
        )}
        {depId && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {MCN_DIMENSIONS.map((d) => (
                <div key={d.key} className="space-y-1">
                  <Label className="text-xs">{d.label}</Label>
                  <Input
                    type="number" step="0.1" min="0" max="10"
                    value={scores[d.key] ?? ""}
                    onChange={(e) => setScores({ ...scores, [d.key]: e.target.value })}
                  />
                  {evidence?.[d.key]?.length ? (
                    <ul className="text-[10px] text-muted-foreground mt-1 space-y-0.5 list-disc list-inside">
                      {evidence[d.key].slice(0, 3).map((ev, i) => (
                        <li key={i} className="line-clamp-2">{ev}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
            {resumenIa && (
              <div className="text-xs bg-muted/40 border border-border rounded p-3">
                <span className="font-medium">Resumen IA:</span> {resumenIa}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Fortalezas</Label>
                <Textarea value={fortalezas} onChange={(e) => setFortalezas(e.target.value)} rows={3} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Áreas de mejora</Label>
                <Textarea value={areas} onChange={(e) => setAreas(e.target.value)} rows={3} />
              </div>
            </div>
            <Button onClick={save} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Guardar MCN
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}