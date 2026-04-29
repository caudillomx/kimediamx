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

  const [ffLoading, setFfLoading] = useState(false);
  const [ffList, setFfList] = useState<FFTranscript[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);

  const [genType, setGenType] = useState<string>("registro_consultorias");
  const [genDep, setGenDep] = useState<string>("");
  const [generating, setGenerating] = useState(false);

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
    const periodStart = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const periodEnd = new Date(year, month, 0).toISOString().split("T")[0];
    const [{ data: d1 }, { data: d2 }, { data: d3 }] = await Promise.all([
      supabase.from("gto_dependencias").select("id, nombre, siglas").order("sort_order"),
      supabase.from("gto_training_sessions").select("*")
        .gte("session_date", periodStart).lte("session_date", periodEnd)
        .order("session_date", { ascending: false }),
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
  }, [isAdmin, year, month]);

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
      const fromDate = new Date(year, month - 1, 1).toISOString();
      const { data, error } = await supabase.functions.invoke("fireflies-list-meetings", {
        body: { limit: 50, fromDate },
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
    dependenciaId: string,
    sessionType: string,
  ) => {
    if (!dependenciaId) {
      toast.error("Selecciona la dependencia primero.");
      return;
    }
    setImportingId(transcriptId);
    try {
      const { data, error } = await supabase.functions.invoke("fireflies-import-session", {
        body: { transcriptId, dependenciaId, sessionType },
      });
      if (error) throw error;
      toast.success("Sesión importada y datos extraídos por IA");
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
                  <CardTitle>Sesiones registradas en {MONTHS[month - 1]} {year}</CardTitle>
                  <CardDescription>{sessions.length} sesiones totales</CardDescription>
                </div>
                <Select value={filterDep} onValueChange={setFilterDep}>
                  <SelectTrigger className="w-64"><SelectValue placeholder="Filtrar dependencia" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {deps.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.siglas} · {d.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Button onClick={loadFireflies} disabled={ffLoading}>
                  {ffLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Listar reuniones del mes
                </Button>
                {ffList.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Reunión</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Dependencia</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ffList.map((t) => (
                        <FfRow
                          key={t.id}
                          t={t}
                          deps={deps}
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
  t, deps, importing, onImport,
}: {
  t: FFTranscript;
  deps: Dependencia[];
  importing: boolean;
  onImport: (id: string, depId: string, type: string) => void;
}) {
  const [dep, setDep] = useState("");
  const [type, setType] = useState("consultoria");
  return (
    <TableRow>
      <TableCell className="text-xs">{new Date(Number(t.date)).toLocaleDateString("es-MX")}</TableCell>
      <TableCell className="text-sm max-w-sm truncate">{t.title}</TableCell>
      <TableCell>{t.duration ? `${Math.round(t.duration / 60)} min` : "—"}</TableCell>
      <TableCell>
        <Select value={dep} onValueChange={setDep}>
          <SelectTrigger className="w-44 h-8"><SelectValue placeholder="Dependencia" /></SelectTrigger>
          <SelectContent>
            {deps.map((d) => <SelectItem key={d.id} value={d.id}>{d.siglas}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
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
        <Button size="sm" disabled={!dep || importing} onClick={() => onImport(t.id, dep, type)}>
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
      } else {
        setScores({});
        setFortalezas("");
        setAreas("");
      }
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
        computed_by: "manual",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Competencias Narrativas (MCN)</CardTitle>
        <CardDescription>Calificaciones 0–10 por dimensión. Se usan en el reporte mensual MCN.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1 max-w-md">
          <Label>Dependencia</Label>
          <Select value={depId} onValueChange={setDepId}>
            <SelectTrigger><SelectValue placeholder="Selecciona…" /></SelectTrigger>
            <SelectContent>
              {deps.map((d) => (<SelectItem key={d.id} value={d.id}>{d.siglas} · {d.nombre}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
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
                </div>
              ))}
            </div>
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