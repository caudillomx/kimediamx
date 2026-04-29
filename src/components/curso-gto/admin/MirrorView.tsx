import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Lock,
  Activity,
  User,
  Monitor,
  CheckCircle2,
  Clock,
  ExternalLink,
  Play,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STEPS } from "@/components/curso-gto/StepNav";

interface Participante {
  id: string;
  nombre: string;
  cargo: string | null;
  email: string | null;
  ultimo_paso: number;
  ultima_actividad: string;
}

interface Diagnostico {
  id: string;
  participante_id: string | null;
  participante_nombre: string | null;
  titulo: string | null;
  texto_original: string;
  resumen_diagnostico: string | null;
  score_calidad: number | null;
  errores_detectados: any;
  created_at: string;
}

interface Sesion {
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
  paso_actual: number;
  estado: string;
}

interface Dependencia {
  siglas: string;
  nombre: string;
  access_code: string;
}

interface Props {
  dep: Dependencia;
  sesion: Sesion | null;
  participantes: Participante[];
  diagnosticos: Diagnostico[];
  onClose: () => void;
}

const fmtDate = (s: string | null | undefined) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtRel = (s: string | null | undefined) => {
  if (!s) return "—";
  const m = Math.floor((Date.now() - new Date(s).getTime()) / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
};

export const MirrorView = ({ dep, sesion, participantes, diagnosticos, onClose }: Props) => {
  // Capacitador navega libremente
  const [step, setStep] = useState<number>(sesion?.paso_actual ?? 0);
  const [participanteId, setParticipanteId] = useState<string>("__all__");
  const isDemo = dep.siglas === "DEMO";

  // Sync inicial al paso actual de la sesión la primera vez
  useEffect(() => {
    setStep(sesion?.paso_actual ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atajos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") setStep((s) => Math.min(STEPS.length - 1, s + 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1));
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const diagsFiltered = useMemo(() => {
    if (participanteId === "__all__") return diagnosticos;
    return diagnosticos.filter((d) => d.participante_id === participanteId);
  }, [diagnosticos, participanteId]);

  const personaActual = participantes.find((p) => p.id === participanteId) || null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border/60 bg-card/40 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Monitor className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[2px] text-muted-foreground flex items-center gap-2">
                Modo espejo · Capacitador
                <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30 text-[9px] px-1.5 py-0">
                  <Lock className="h-2.5 w-2.5 mr-1" /> Solo lectura
                </Badge>
              </div>
              <h2 className="text-base font-bold truncate">
                {dep.siglas} <span className="text-sm text-muted-foreground font-normal">· {dep.nombre}</span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[11px] text-muted-foreground hidden md:flex items-center gap-1">
              <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
              Refresca cada 4s
            </div>
            {isDemo && (
              <Button
                size="sm"
                onClick={() =>
                  window.open(
                    `/curso/ia-gobierno-gto?demo=1&code=${encodeURIComponent(dep.access_code)}`,
                    "kimedia-demo",
                    "noopener",
                  )
                }
                className="bg-gradient-coral text-primary-foreground"
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Abrir flujo en vivo
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-1" /> Cerrar (Esc)
            </Button>
          </div>
        </div>

        {isDemo && (
          <div className="border-t border-amber-500/30 bg-amber-500/10">
            <div className="mx-auto max-w-6xl px-4 md:px-6 py-2 flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                <strong>Sandbox del capacitador.</strong> Abre el flujo en vivo en otra pestaña, proyéctalo y trabaja como demo. Lo que escribas ahí se verá aquí en menos de 4s. Esta dependencia no afecta a ninguna real.
              </span>
            </div>
          </div>
        )}

        {/* Stepper navegable libremente */}
        <div className="border-t border-border/40 bg-background/60">
          <div className="mx-auto max-w-6xl px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${STEPS.length}, 1fr)` }}>
                {STEPS.map((s) => {
                  const isActive = s.id === step;
                  const isReal = s.id === (sesion?.paso_actual ?? 0);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStep(s.id)}
                      className={`group flex flex-col items-center gap-1 px-1 py-1.5 rounded-md transition-all ${
                        isActive ? "bg-gradient-coral text-primary-foreground shadow-glow" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold">{s.id}</span>
                        {isReal && !isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Paso real del participante" />
                        )}
                      </div>
                      <span className="text-[9px] uppercase tracking-wider truncate max-w-full">
                        {s.short}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button
                size="icon"
                variant="outline"
                disabled={step === STEPS.length - 1}
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Selector de participante */}
            {participantes.length > 0 && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Vista de:
                </span>
                <Select value={participanteId} onValueChange={setParticipanteId}>
                  <SelectTrigger className="h-8 text-xs w-auto min-w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">
                      Toda la dependencia ({participantes.length} personas)
                    </SelectItem>
                    {participantes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre} {p.cargo ? `· ${p.cargo}` : ""} · paso {p.ultimo_paso + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {personaActual && (
                  <Badge variant="outline" className="text-[10px]">
                    Última actividad: {fmtRel(personaActual.ultima_actividad)}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido del paso */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <StepHeader idx={step} />
              {step === 0 && <StepWelcomeMirror sesion={sesion} dep={dep} participantes={participantes} />}
              {step === 1 && (
                <StepDiagnosticoMirror
                  diagnosticos={diagsFiltered}
                  participanteFiltro={personaActual}
                />
              )}
              {step === 2 && <StepBriefMirror sesion={sesion} />}
              {step === 3 && <StepCorpusMirror sesion={sesion} />}
              {step === 4 && <StepPromptMirror sesion={sesion} />}
              {step === 5 && <StepCompromisosMirror sesion={sesion} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const StepHeader = ({ idx }: { idx: number }) => (
  <div className="border-b border-border/40 pb-3 mb-4">
    <div className="text-[10px] uppercase tracking-[2px] text-muted-foreground">
      Paso {idx + 1} de {STEPS.length}
    </div>
    <h3 className="text-2xl font-bold">{STEPS[idx]?.label}</h3>
  </div>
);

const Empty = ({ label }: { label: string }) => (
  <div className="text-center py-16 text-muted-foreground text-sm border border-dashed border-border/40 rounded-lg">
    {label}
  </div>
);

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
  <div className="space-y-1">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div
      className={`rounded-md border border-border/40 bg-card/40 p-3 ${
        mono ? "font-mono text-xs" : "text-sm"
      } ${multiline ? "whitespace-pre-wrap" : ""}`}
    >
      {value || <span className="text-muted-foreground italic">Sin completar</span>}
    </div>
  </div>
);

/* ---------- Pasos ---------- */

const StepWelcomeMirror = ({
  sesion,
  dep,
  participantes,
}: {
  sesion: Sesion | null;
  dep: Dependencia;
  participantes: Participante[];
}) => (
  <div className="space-y-4">
    <div className="grid md:grid-cols-2 gap-3">
      <Field label="Código de acceso" value={dep.access_code} mono />
      <Field label="Herramienta IA elegida" value={sesion?.herramienta_ia} />
      <Field label="Titular de comunicación" value={sesion?.titular_nombre} />
      <Field label="Cargo del titular" value={sesion?.titular_cargo} />
    </div>
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        Personas conectadas ({participantes.length})
      </div>
      {participantes.length === 0 ? (
        <Empty label="Aún nadie ha entrado con este código." />
      ) : (
        <div className="space-y-2">
          {participantes.map((p) => {
            const active = Date.now() - new Date(p.ultima_actividad).getTime() < 5 * 60 * 1000;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between gap-3 rounded-md border p-3 ${
                  active ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/40 bg-card/30"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {active && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{p.nombre}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {p.cargo || "—"} · {p.email || "sin email"}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="outline" className="text-[10px]">{STEPS[p.ultimo_paso]?.short}</Badge>
                  <div className="text-[10px] text-muted-foreground mt-1">{fmtRel(p.ultima_actividad)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

const StepDiagnosticoMirror = ({
  diagnosticos,
  participanteFiltro,
}: {
  diagnosticos: Diagnostico[];
  participanteFiltro: Participante | null;
}) => (
  <div className="space-y-3">
    <p className="text-xs text-muted-foreground">
      {participanteFiltro
        ? `Mostrando solo los textos diagnosticados por ${participanteFiltro.nombre}.`
        : "Mostrando todos los textos diagnosticados de la dependencia."}
    </p>
    {diagnosticos.length === 0 ? (
      <Empty label="Aún no hay textos diagnosticados." />
    ) : (
      diagnosticos.map((d) => (
        <div key={d.id} className="rounded-md border border-border/40 bg-card/30 p-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{d.titulo || "Sin título"}</div>
              {d.participante_nombre && (
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  👤 {d.participante_nombre}
                </div>
              )}
            </div>
            <Badge variant="outline" className="font-mono shrink-0">
              Score: {d.score_calidad ?? "—"}/10
            </Badge>
          </div>
          <div className="text-[10px] text-muted-foreground">{fmtDate(d.created_at)}</div>
          {d.resumen_diagnostico && (
            <p className="text-xs italic text-muted-foreground border-l-2 border-primary/40 pl-2">
              {d.resumen_diagnostico}
            </p>
          )}
          {Array.isArray(d.errores_detectados) && d.errores_detectados.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(d.errores_detectados as any[]).map((e, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  {typeof e === "string" ? e : e.tipo || JSON.stringify(e)}
                </Badge>
              ))}
            </div>
          )}
          <details className="text-xs">
            <summary className="cursor-pointer text-primary">Ver texto original</summary>
            <pre className="whitespace-pre-wrap mt-2 bg-muted/40 p-2 rounded text-[11px]">
              {d.texto_original}
            </pre>
          </details>
        </div>
      ))
    )}
  </div>
);

const StepBriefMirror = ({ sesion }: { sesion: Sesion | null }) => {
  if (!sesion) return <Empty label="La dependencia aún no ha llenado el brief." />;
  return (
    <div className="space-y-3">
      <Field label="Misión" value={sesion.brief_mision} multiline />
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Tono" value={sesion.brief_tono} />
        <Field label="Tipo de texto principal" value={sesion.brief_tipo_texto} />
      </div>
      <Field
        label="Audiencias"
        value={
          Array.isArray(sesion.brief_audiencias)
            ? (sesion.brief_audiencias as any[])
                .map((a) => `• ${a.nombre || "—"}: ${a.expectativa || ""}`)
                .join("\n")
            : null
        }
        multiline
      />
      <div className="grid md:grid-cols-2 gap-3">
        <Field
          label="Términos prohibidos"
          value={(sesion.brief_terminos_prohibidos as string[] | null)?.join(", ")}
        />
        <Field
          label="Términos preferidos"
          value={(sesion.brief_terminos_preferidos as string[] | null)?.join(", ")}
        />
      </div>
      <Field
        label="Mensajes clave"
        value={(sesion.brief_mensajes_clave as string[] | null)?.map((m) => `• ${m}`).join("\n")}
        multiline
      />
    </div>
  );
};

const StepCorpusMirror = ({ sesion }: { sesion: Sesion | null }) => {
  const docs = (sesion?.corpus_documentos as string[] | null) || [];
  return (
    <div className="space-y-3">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Documentos seleccionados ({docs.length})
        </div>
        {docs.length === 0 ? (
          <Empty label="Aún no se han marcado documentos del corpus." />
        ) : (
          <ul className="space-y-1">
            {docs.map((d, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-md border border-border/40 bg-card/30 p-2 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="truncate">{d}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Field label="Notas / contexto adicional del corpus" value={sesion?.corpus_notas} multiline />
    </div>
  );
};

const StepPromptMirror = ({ sesion }: { sesion: Sesion | null }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Prompt de sistema
      </div>
      {sesion?.prompt_generado_at && (
        <Badge variant="outline" className="text-[10px]">
          Generado: {fmtDate(sesion.prompt_generado_at)}
        </Badge>
      )}
    </div>
    {sesion?.prompt_sistema ? (
      <pre className="text-xs bg-muted/40 p-4 rounded-md whitespace-pre-wrap font-mono max-h-[60vh] overflow-y-auto border border-border/40">
        {sesion.prompt_sistema}
      </pre>
    ) : (
      <Empty label="Aún no se ha generado el prompt de sistema." />
    )}
  </div>
);

const StepCompromisosMirror = ({ sesion }: { sesion: Sesion | null }) => {
  const items = [
    { label: "Subir corpus a la herramienta IA elegida", done: !!sesion?.compromiso_corpus_subido },
    { label: "Probar el prompt de sistema con un caso real", done: !!sesion?.compromiso_prompt_probado },
    { label: "Compartir el resultado con el equipo de comunicación", done: !!sesion?.compromiso_resultado_compartido },
  ];
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 rounded-md border p-3 ${
            it.done ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/40 bg-card/30"
          }`}
        >
          {it.done ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          ) : (
            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
          <span className={`text-sm ${it.done ? "text-foreground" : "text-muted-foreground"}`}>
            {it.label}
          </span>
        </div>
      ))}
      <div className="text-xs text-muted-foreground pt-2 border-t border-border/40 mt-3">
        Estado de la sesión:{" "}
        <Badge
          className={
            sesion?.estado === "finalizada"
              ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
              : "bg-amber-500/15 text-amber-600 border border-amber-500/30"
          }
        >
          {sesion?.estado || "pendiente"}
        </Badge>
      </div>
    </div>
  );
};