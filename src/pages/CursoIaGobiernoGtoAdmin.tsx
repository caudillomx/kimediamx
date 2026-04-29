import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Loader2,
  Download,
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  LogOut,
  Activity,
  Users,
  Monitor,
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  User,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { STEPS } from "@/components/curso-gto/StepNav";

interface Dependencia {
  id: string;
  nombre: string;
  siglas: string;
  contacto_enlace: string | null;
  contacto_email: string | null;
  contacto_telefono: string | null;
  access_code: string;
}

interface Sesion {
  id: string;
  dependencia_id: string;
  titular_nombre: string | null;
  titular_cargo: string | null;
  herramienta_ia: string | null;
  brief_mision: string | null;
  brief_audiencias: any;
  brief_tono: string | null;
  brief_terminos_prohibidos: any;
  brief_terminos_preferidos: any;
  brief_mensajes_clave: any;
  brief_tipo_texto: string | null;
  corpus_documentos: any;
  corpus_notas: string | null;
  prompt_sistema: string | null;
  prompt_generado_at: string | null;
  compromiso_corpus_subido: boolean;
  compromiso_prompt_probado: boolean;
  compromiso_resultado_compartido: boolean;
  notas_kimedia: string | null;
  paso_actual: number;
  estado: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface Diagnostico {
  id: string;
  sesion_id: string;
  participante_id: string | null;
  participante_nombre: string | null;
  titulo: string | null;
  texto_original: string;
  resumen_diagnostico: string | null;
  score_calidad: number | null;
  errores_detectados: any;
  created_at: string;
}

interface Participante {
  id: string;
  sesion_id: string;
  nombre: string;
  cargo: string | null;
  email: string | null;
  ultimo_paso: number;
  ultima_actividad: string;
  created_at: string;
}

type Row = {
  dep: Dependencia;
  sesion: Sesion | null;
  diags: Diagnostico[];
  participantes: Participante[];
};

const TOTAL_PASOS = 6; // 0..5

const stateBadge = (estado: string, paso: number) => {
  if (estado === "finalizada")
    return <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">Finalizada</Badge>;
  if (paso === 0)
    return <Badge variant="outline" className="text-muted-foreground">Sin iniciar</Badge>;
  return <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30">En curso</Badge>;
};

const fmtDate = (s: string | null) => {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtRel = (s: string | null) => {
  if (!s) return "—";
  const diff = Date.now() - new Date(s).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
};

const CursoIaGobiernoGtoAdmin = () => {
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Row | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Curso IA GTO · Seguimiento · KiMedia";
  }, []);

  // Auth check
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/operaciones/login");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const admin = (roles || []).some((r: any) => r.role === "admin");
      setIsAdmin(admin);
      setAuthChecking(false);
      if (!admin) toast.error("Acceso restringido a administradores.");
    })();
  }, [navigate]);

  const fetchAll = async () => {
    const [{ data: deps }, { data: sess }, { data: diags }, { data: parts }] = await Promise.all([
      supabase.from("gto_dependencias").select("*").order("sort_order"),
      supabase.from("gto_sesiones").select("*").order("updated_at", { ascending: false }),
      supabase.from("gto_diagnostico_textos").select("*").order("created_at", { ascending: false }),
      supabase.from("gto_participantes").select("*").order("ultima_actividad", { ascending: false }),
    ]);
    const sesByDep = new Map<string, Sesion>();
    (sess || []).forEach((s: any) => {
      // keep newest per dependencia
      if (!sesByDep.has(s.dependencia_id)) sesByDep.set(s.dependencia_id, s);
    });
    const diagsBySes = new Map<string, Diagnostico[]>();
    (diags || []).forEach((d: any) => {
      const arr = diagsBySes.get(d.sesion_id) || [];
      arr.push(d);
      diagsBySes.set(d.sesion_id, arr);
    });
    const partsBySes = new Map<string, Participante[]>();
    (parts || []).forEach((p: any) => {
      const arr = partsBySes.get(p.sesion_id) || [];
      arr.push(p);
      partsBySes.set(p.sesion_id, arr);
    });
    const built: Row[] = (deps || []).map((dep: any) => {
      const sesion = sesByDep.get(dep.id) || null;
      return {
        dep,
        sesion,
        diags: sesion ? diagsBySes.get(sesion.id) || [] : [],
        participantes: sesion ? partsBySes.get(sesion.id) || [] : [],
      };
    });
    setRows(built);
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchAll();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !autoRefresh) return;
    const t = setInterval(fetchAll, 4000);
    return () => clearInterval(t);
  }, [isAdmin, autoRefresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.dep.nombre.toLowerCase().includes(q) ||
        r.dep.siglas.toLowerCase().includes(q) ||
        (r.dep.contacto_enlace || "").toLowerCase().includes(q) ||
        (r.sesion?.titular_nombre || "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    const iniciadas = rows.filter((r) => r.sesion && (r.sesion.paso_actual > 0 || r.sesion.estado !== "pendiente"));
    const finalizadas = rows.filter((r) => r.sesion?.estado === "finalizada");
    const enCurso = iniciadas.filter((r) => r.sesion?.estado !== "finalizada");
    const activosAhora = rows.filter(
      (r) =>
        r.participantes.some(
          (p) => Date.now() - new Date(p.ultima_actividad).getTime() < 5 * 60 * 1000,
        ),
    );
    const totalParticipantes = rows.reduce((acc, r) => acc + r.participantes.length, 0);
    return {
      total: rows.length,
      iniciadas: iniciadas.length,
      enCurso: enCurso.length,
      finalizadas: finalizadas.length,
      activosAhora: activosAhora.length,
      totalParticipantes,
    };
  }, [rows]);

  const exportXLSX = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Resumen
    const resumen = filtered.map((r) => {
      const s = r.sesion;
      const completados =
        (s?.compromiso_corpus_subido ? 1 : 0) +
        (s?.compromiso_prompt_probado ? 1 : 0) +
        (s?.compromiso_resultado_compartido ? 1 : 0);
      return {
        Siglas: r.dep.siglas,
        Dependencia: r.dep.nombre,
        Enlace: r.dep.contacto_enlace || "",
        Email: r.dep.contacto_email || "",
        Telefono: r.dep.contacto_telefono || "",
        Participantes: r.participantes.length,
        Estado: s?.estado || "sin_iniciar",
        "Paso actual": s ? `${s.paso_actual + 1}/${TOTAL_PASOS} · ${STEPS[s.paso_actual]?.label || ""}` : "—",
        "Avance %": s ? Math.round(((s.paso_actual + 1) / TOTAL_PASOS) * 100) : 0,
        Titular: s?.titular_nombre || "",
        "Cargo titular": s?.titular_cargo || "",
        Herramienta: s?.herramienta_ia || "",
        "Tono brief": s?.brief_tono || "",
        "Términos prohibidos": (s?.brief_terminos_prohibidos as string[] | null)?.join(" | ") || "",
        "Documentos corpus": (s?.corpus_documentos as string[] | null)?.length || 0,
        "Prompt generado": s?.prompt_sistema ? "Sí" : "No",
        "Diagnósticos": r.diags.length,
        "Score promedio":
          r.diags.length > 0
            ? Math.round(
                r.diags.reduce((a, d) => a + (d.score_calidad || 0), 0) / r.diags.length,
              )
            : "",
        "Compromisos (3)": completados,
        "Iniciada": fmtDate(s?.created_at || null),
        "Última actividad": fmtDate(s?.updated_at || null),
        "Finalizada": fmtDate(s?.completed_at || null),
        "Notas KiMedia": s?.notas_kimedia || "",
      };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen), "Resumen");

    // Sheet: Participantes
    const partsRows: any[] = [];
    filtered.forEach((r) => {
      r.participantes.forEach((p) => {
        const pct = Math.round(((p.ultimo_paso + 1) / TOTAL_PASOS) * 100);
        const diagsPersona = r.diags.filter((d) => d.participante_id === p.id);
        partsRows.push({
          Siglas: r.dep.siglas,
          Dependencia: r.dep.nombre,
          Nombre: p.nombre,
          Cargo: p.cargo || "",
          Email: p.email || "",
          "Paso actual": STEPS[p.ultimo_paso]?.label || "",
          "Avance %": pct,
          "Diagnósticos": diagsPersona.length,
          "Última actividad": fmtDate(p.ultima_actividad),
          "Registrado": fmtDate(p.created_at),
        });
      });
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(partsRows), "Participantes");

    // Sheet 2: Diagnósticos
    const diagsRows: any[] = [];
    filtered.forEach((r) => {
      r.diags.forEach((d) => {
        diagsRows.push({
          Siglas: r.dep.siglas,
          Dependencia: r.dep.nombre,
          Participante: d.participante_nombre || "",
          Titulo: d.titulo || "",
          Score: d.score_calidad ?? "",
          Errores: Array.isArray(d.errores_detectados)
            ? (d.errores_detectados as any[]).map((e) => e.tipo || e).join(", ")
            : "",
          Resumen: d.resumen_diagnostico || "",
          Texto: d.texto_original,
          Fecha: fmtDate(d.created_at),
        });
      });
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(diagsRows), "Diagnósticos");

    // Sheet 3: Prompts
    const promptRows = filtered
      .filter((r) => r.sesion?.prompt_sistema)
      .map((r) => ({
        Siglas: r.dep.siglas,
        Dependencia: r.dep.nombre,
        Titular: r.sesion?.titular_nombre || "",
        Generado: fmtDate(r.sesion?.prompt_generado_at || null),
        "Prompt sistema": r.sesion?.prompt_sistema || "",
      }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(promptRows), "Prompts");

    const stamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
    XLSX.writeFile(wb, `curso-ia-gto_seguimiento_${stamp}.xlsx`);
    toast.success("Reporte XLSX descargado.");
  };

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">Acceso restringido</h1>
          <p className="text-muted-foreground">
            Este panel es solo para administradores de KiMedia.
          </p>
          <Button onClick={() => navigate("/admin/operaciones/login")}>
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-mesh opacity-20" />
      <div className="relative">
        {/* Header */}
        <div className="border-b border-border/40 bg-card/40 backdrop-blur sticky top-0 z-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[2px] text-muted-foreground">KiMedia · Capacitador</div>
              <h1 className="text-lg font-bold">Seguimiento Curso IA · Gobierno GTO</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[11px] text-muted-foreground hidden md:flex items-center gap-1">
                <Activity className={`h-3 w-3 ${autoRefresh ? "text-emerald-500 animate-pulse" : "text-muted-foreground"}`} />
                Actualizado {fmtRel(lastRefresh.toISOString())}
              </div>
              <Button
                size="sm"
                variant={autoRefresh ? "default" : "outline"}
                onClick={() => setAutoRefresh((v) => !v)}
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${autoRefresh ? "animate-spin-slow" : ""}`} />
                {autoRefresh ? "Auto 10s" : "Manual"}
              </Button>
              <Button size="sm" variant="outline" onClick={fetchAll}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" onClick={exportXLSX}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Exportar XLSX
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/admin/operaciones/login");
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <StatCard label="Dependencias" value={stats.total} />
            <StatCard label="Participantes" value={stats.totalParticipantes} accent="electric" />
            <StatCard label="Iniciadas" value={stats.iniciadas} accent="amber" />
            <StatCard label="En curso" value={stats.enCurso} accent="amber" />
            <StatCard label="Finalizadas" value={stats.finalizadas} accent="emerald" />
            <StatCard label="Activos (5 min)" value={stats.activosAhora} accent="electric" />
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar dependencia, siglas, enlace o titular…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-lg border border-border/40 bg-card/40 backdrop-blur overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Dependencia</TableHead>
                    <TableHead>Enlace</TableHead>
                    <TableHead className="text-center">Personas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Avance</TableHead>
                    <TableHead className="text-center">Diag.</TableHead>
                    <TableHead className="text-center">Prompt</TableHead>
                    <TableHead className="text-center">Compromisos</TableHead>
                    <TableHead>Última actividad</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const s = r.sesion;
                    const pct = s ? Math.round(((s.paso_actual + 1) / TOTAL_PASOS) * 100) : 0;
                    const compr =
                      (s?.compromiso_corpus_subido ? 1 : 0) +
                      (s?.compromiso_prompt_probado ? 1 : 0) +
                      (s?.compromiso_resultado_compartido ? 1 : 0);
                    const lastActivity = r.participantes[0]?.ultima_actividad || s?.updated_at || null;
                    const isActive =
                      !!lastActivity && Date.now() - new Date(lastActivity).getTime() < 5 * 60 * 1000;
                    return (
                      <TableRow key={r.dep.id} className={isActive ? "bg-emerald-500/5" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isActive && (
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                            <div>
                              <div className="font-semibold text-sm">{r.dep.siglas}</div>
                              <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[220px]">
                                {r.dep.nombre}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {r.dep.contacto_enlace ? (
                            <div>
                              <div>{r.dep.contacto_enlace}</div>
                              <div className="text-muted-foreground text-[10px]">{r.dep.contacto_email}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {r.participantes.length > 0 ? (
                            <Badge variant="outline" className="font-mono">
                              <Users className="h-3 w-3 mr-1" />
                              {r.participantes.length}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>{stateBadge(s?.estado || "pendiente", s?.paso_actual || 0)}</TableCell>
                        <TableCell>
                          {s ? (
                            <div className="space-y-1 min-w-[140px]">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-muted-foreground">{STEPS[s.paso_actual]?.label}</span>
                                <span className="font-mono">{pct}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-coral to-magenta transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin acceder</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono">{r.diags.length}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {s?.prompt_sistema ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs font-mono">{compr}/3</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {fmtRel(lastActivity)}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        Sin resultados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Detail dialog */}
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-base font-bold">{selected.dep.siglas}</span>
                    <span className="text-sm font-normal text-muted-foreground">{selected.dep.nombre}</span>
                  </DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="resumen">
                  <TabsList>
                    <TabsTrigger value="resumen">Resumen</TabsTrigger>
                    <TabsTrigger value="personas">
                      Personas ({selected.participantes.length})
                    </TabsTrigger>
                    <TabsTrigger value="brief">Brief</TabsTrigger>
                    <TabsTrigger value="corpus">Corpus</TabsTrigger>
                    <TabsTrigger value="prompt">Prompt</TabsTrigger>
                    <TabsTrigger value="diag">
                      Diagnósticos ({selected.diags.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="resumen" className="space-y-3 text-sm">
                    <Field label="Enlace" value={selected.dep.contacto_enlace} />
                    <Field label="Email" value={selected.dep.contacto_email} />
                    <Field label="Teléfono" value={selected.dep.contacto_telefono} />
                    <Field label="Código de acceso" value={selected.dep.access_code} mono />
                    <Field label="Titular" value={selected.sesion?.titular_nombre} />
                    <Field label="Cargo" value={selected.sesion?.titular_cargo} />
                    <Field label="Herramienta IA" value={selected.sesion?.herramienta_ia} />
                    <Field label="Iniciada" value={fmtDate(selected.sesion?.created_at || null)} />
                    <Field label="Última actividad" value={fmtDate(selected.sesion?.updated_at || null)} />
                    <Field label="Finalizada" value={fmtDate(selected.sesion?.completed_at || null)} />
                    <Field label="Notas KiMedia" value={selected.sesion?.notas_kimedia} />
                  </TabsContent>

                  <TabsContent value="personas" className="space-y-2">
                    {selected.participantes.length === 0 && (
                      <p className="text-sm text-muted-foreground py-8 text-center">
                        Aún nadie ha entrado con este código.
                      </p>
                    )}
                    {selected.participantes.map((p) => {
                      const pct = Math.round(((p.ultimo_paso + 1) / TOTAL_PASOS) * 100);
                      const isActive = Date.now() - new Date(p.ultima_actividad).getTime() < 5 * 60 * 1000;
                      const diagsPersona = selected.diags.filter((d) => d.participante_id === p.id).length;
                      return (
                        <div
                          key={p.id}
                          className={`border border-border/40 rounded-md p-3 ${isActive ? "bg-emerald-500/5 border-emerald-500/30" : "bg-card/30"}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                {isActive && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                                <span className="font-semibold text-sm truncate">{p.nombre}</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {p.cargo || "—"} · {p.email || "sin email"}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                {STEPS[p.ultimo_paso]?.label}
                              </div>
                              <div className="font-mono text-xs">{pct}% · {diagsPersona} diag.</div>
                              <div className="text-[10px] text-muted-foreground">
                                {fmtRel(p.ultima_actividad)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  <TabsContent value="brief" className="space-y-3 text-sm">
                    <Field label="Misión" value={selected.sesion?.brief_mision} multiline />
                    <Field label="Tono" value={selected.sesion?.brief_tono} />
                    <Field label="Tipo de texto" value={selected.sesion?.brief_tipo_texto} />
                    <Field
                      label="Audiencias"
                      value={
                        Array.isArray(selected.sesion?.brief_audiencias)
                          ? (selected.sesion!.brief_audiencias as any[])
                              .map((a) => `${a.nombre}: ${a.expectativa}`)
                              .join("\n")
                          : null
                      }
                      multiline
                    />
                    <Field
                      label="Términos prohibidos"
                      value={(selected.sesion?.brief_terminos_prohibidos as string[] | null)?.join(", ")}
                    />
                    <Field
                      label="Términos preferidos"
                      value={(selected.sesion?.brief_terminos_preferidos as string[] | null)?.join(", ")}
                    />
                    <Field
                      label="Mensajes clave"
                      value={(selected.sesion?.brief_mensajes_clave as string[] | null)?.join("\n")}
                      multiline
                    />
                  </TabsContent>

                  <TabsContent value="corpus" className="space-y-3 text-sm">
                    <Field
                      label="Documentos seleccionados"
                      value={(selected.sesion?.corpus_documentos as string[] | null)?.join("\n")}
                      multiline
                    />
                    <Field label="Notas corpus" value={selected.sesion?.corpus_notas} multiline />
                  </TabsContent>

                  <TabsContent value="prompt">
                    {selected.sesion?.prompt_sistema ? (
                      <pre className="text-xs bg-muted/40 p-4 rounded-md whitespace-pre-wrap font-mono max-h-[60vh] overflow-y-auto">
                        {selected.sesion.prompt_sistema}
                      </pre>
                    ) : (
                      <p className="text-sm text-muted-foreground py-8 text-center">
                        Aún no se ha generado el prompt sistema.
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="diag" className="space-y-3">
                    {selected.diags.length === 0 && (
                      <p className="text-sm text-muted-foreground py-8 text-center">Sin textos diagnosticados.</p>
                    )}
                    {selected.diags.map((d) => (
                      <div key={d.id} className="border border-border/40 rounded-md p-3 space-y-2 bg-card/30">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{d.titulo || "Sin título"}</div>
                            {d.participante_nombre && (
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                👤 {d.participante_nombre}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="font-mono">
                            Score: {d.score_calidad ?? "—"}/10
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground">{fmtDate(d.created_at)}</div>
                        {d.resumen_diagnostico && (
                          <p className="text-xs italic text-muted-foreground">{d.resumen_diagnostico}</p>
                        )}
                        <details className="text-xs">
                          <summary className="cursor-pointer text-primary">Ver texto original</summary>
                          <pre className="whitespace-pre-wrap mt-2 bg-muted/40 p-2 rounded text-[11px]">
                            {d.texto_original}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "emerald" | "amber" | "electric";
}) => {
  const colors = {
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    electric: "text-electric",
  };
  return (
    <div className="rounded-lg border border-border/40 bg-card/40 backdrop-blur p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${accent ? colors[accent] : "text-foreground"}`}>{value}</div>
    </div>
  );
};

const Field = ({
  label,
  value,
  multiline,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  multiline?: boolean;
  mono?: boolean;
}) => (
  <div className="grid grid-cols-3 gap-3">
    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className={`col-span-2 ${mono ? "font-mono text-xs" : "text-sm"} ${multiline ? "whitespace-pre-wrap" : ""}`}>
      {value || <span className="text-muted-foreground">—</span>}
    </div>
  </div>
);

export default CursoIaGobiernoGtoAdmin;