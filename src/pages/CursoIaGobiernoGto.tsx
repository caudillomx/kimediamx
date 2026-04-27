import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AccessGate } from "@/components/curso-gto/AccessGate";
import { StepNav, STEPS } from "@/components/curso-gto/StepNav";
import { StepWelcome } from "@/components/curso-gto/StepWelcome";
import { StepDiagnostico } from "@/components/curso-gto/StepDiagnostico";
import { StepBrief, type BriefData } from "@/components/curso-gto/StepBrief";
import { StepCorpus, type CorpusData } from "@/components/curso-gto/StepCorpus";
import { StepPromptGenerator } from "@/components/curso-gto/StepPromptGenerator";
import { StepCompromisos, type CompromisosData } from "@/components/curso-gto/StepCompromisos";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Dependencia {
  id: string;
  nombre: string;
  siglas: string;
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
  compromiso_corpus_subido: boolean;
  compromiso_prompt_probado: boolean;
  compromiso_resultado_compartido: boolean;
  notas_kimedia: string | null;
  paso_actual: number;
  estado: string;
}

const STORAGE_KEY = "gto_curso_session";

const CursoIaGobiernoGto = () => {
  const [bootLoading, setBootLoading] = useState(true);
  const [dependencia, setDependencia] = useState<Dependencia | null>(null);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [diagnosticos, setDiagnosticos] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const [highest, setHighest] = useState(0);

  useEffect(() => {
    document.title = dependencia
      ? `${dependencia.siglas} · Curso IA · KiMedia`
      : "Curso IA Gobierno GTO · KiMedia";
  }, [dependencia]);

  // Auto-restore from localStorage
  useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          setBootLoading(false);
          return;
        }
        const { sesionId } = JSON.parse(stored);
        if (!sesionId) {
          setBootLoading(false);
          return;
        }
        const { data: s } = await supabase
          .from("gto_sesiones")
          .select("*")
          .eq("id", sesionId)
          .maybeSingle();
        if (!s) {
          localStorage.removeItem(STORAGE_KEY);
          setBootLoading(false);
          return;
        }
        const { data: dep } = await supabase
          .from("gto_dependencias")
          .select("*")
          .eq("id", s.dependencia_id)
          .maybeSingle();
        if (!dep) {
          setBootLoading(false);
          return;
        }
        const { data: diags } = await supabase
          .from("gto_diagnostico_textos")
          .select("*")
          .eq("sesion_id", sesionId)
          .order("created_at", { ascending: false });

        setDependencia(dep as Dependencia);
        setSesion(s as Sesion);
        setDiagnosticos(
          (diags || []).map((d: any) => ({
            id: d.id,
            titulo: d.titulo,
            texto_original: d.texto_original,
            resumen: d.resumen_diagnostico,
            score_calidad: d.score_calidad,
            errores_detectados: d.errores_detectados || [],
            terminos_prohibidos_sugeridos: [],
          }))
        );
        setStep(s.paso_actual || 0);
        setHighest(s.paso_actual || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setBootLoading(false);
      }
    })();
  }, []);

  const validateCode = useCallback(async (code: string) => {
    const { data: dep, error } = await supabase
      .from("gto_dependencias")
      .select("*")
      .eq("access_code", code)
      .maybeSingle();
    if (error || !dep) return { ok: false, error: "Código no reconocido. Verifica con KiMedia." };

    // Reuse existing session for that dependency or create new
    const { data: existing } = await supabase
      .from("gto_sesiones")
      .select("*")
      .eq("dependencia_id", dep.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let sess = existing;
    if (!sess) {
      const { data: created, error: e2 } = await supabase
        .from("gto_sesiones")
        .insert({ dependencia_id: dep.id, paso_actual: 0, estado: "en_curso" })
        .select()
        .single();
      if (e2 || !created) return { ok: false, error: "No se pudo iniciar la sesión." };
      sess = created;
    }

    const { data: diags } = await supabase
      .from("gto_diagnostico_textos")
      .select("*")
      .eq("sesion_id", sess.id)
      .order("created_at", { ascending: false });

    setDependencia(dep as Dependencia);
    setSesion(sess as Sesion);
    setDiagnosticos(
      (diags || []).map((d: any) => ({
        id: d.id,
        titulo: d.titulo,
        texto_original: d.texto_original,
        resumen: d.resumen_diagnostico,
        score_calidad: d.score_calidad,
        errores_detectados: d.errores_detectados || [],
        terminos_prohibidos_sugeridos: [],
      }))
    );
    setStep(sess.paso_actual || 0);
    setHighest(sess.paso_actual || 0);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sesionId: sess.id }));
    return { ok: true };
  }, []);

  const advanceTo = async (next: number) => {
    if (!sesion) return;
    const newHighest = Math.max(highest, next);
    setStep(next);
    setHighest(newHighest);
    if (next !== sesion.paso_actual) {
      await supabase.from("gto_sesiones").update({ paso_actual: newHighest }).eq("id", sesion.id);
      setSesion({ ...sesion, paso_actual: newHighest });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveBrief = async (data: BriefData) => {
    if (!sesion) return;
    const { data: updated, error } = await supabase
      .from("gto_sesiones")
      .update({
        titular_nombre: data.titular_nombre,
        titular_cargo: data.titular_cargo,
        herramienta_ia: data.herramienta_ia,
        brief_mision: data.brief_mision,
        brief_audiencias: data.brief_audiencias,
        brief_tono: data.brief_tono,
        brief_terminos_prohibidos: data.brief_terminos_prohibidos,
        brief_terminos_preferidos: data.brief_terminos_preferidos,
        brief_mensajes_clave: data.brief_mensajes_clave,
        brief_tipo_texto: data.brief_tipo_texto,
      })
      .eq("id", sesion.id)
      .select()
      .single();
    if (error) {
      toast.error("No se pudo guardar el brief.");
      return;
    }
    if (updated) setSesion(updated as Sesion);
    await advanceTo(3);
  };

  const saveCorpus = async (d: CorpusData) => {
    if (!sesion) return;
    const { data: updated } = await supabase
      .from("gto_sesiones")
      .update({ corpus_documentos: d.corpus_documentos, corpus_notas: d.corpus_notas })
      .eq("id", sesion.id)
      .select()
      .single();
    if (updated) setSesion(updated as Sesion);
    await advanceTo(4);
  };

  const savePrompt = async (prompt: string) => {
    if (!sesion) return;
    await supabase
      .from("gto_sesiones")
      .update({ prompt_sistema: prompt, prompt_generado_at: new Date().toISOString() })
      .eq("id", sesion.id);
    setSesion({ ...sesion, prompt_sistema: prompt });
  };

  const saveCompromisos = async (d: CompromisosData & { finalizar?: boolean }) => {
    if (!sesion) return;
    const patch: any = {
      compromiso_corpus_subido: d.compromiso_corpus_subido,
      compromiso_prompt_probado: d.compromiso_prompt_probado,
      compromiso_resultado_compartido: d.compromiso_resultado_compartido,
      notas_kimedia: d.notas_kimedia,
    };
    if (d.finalizar) {
      patch.estado = "finalizada";
      patch.completed_at = new Date().toISOString();
    }
    await supabase.from("gto_sesiones").update(patch).eq("id", sesion.id);
    setSesion({ ...sesion, ...patch });
  };

  const propagateProhibidos = async (terminos: string[]) => {
    if (!sesion) return;
    const current: string[] = (sesion.brief_terminos_prohibidos as string[]) || [];
    const merged = Array.from(new Set([...current, ...terminos]));
    await supabase
      .from("gto_sesiones")
      .update({ brief_terminos_prohibidos: merged })
      .eq("id", sesion.id);
    setSesion({ ...sesion, brief_terminos_prohibidos: merged });
    toast.success("Términos agregados al brief.");
  };

  if (bootLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!dependencia || !sesion) {
    return (
      <AccessGate onValidate={validateCode} />
    );
  }

  const briefInitial: BriefData = {
    titular_nombre: sesion.titular_nombre || "",
    titular_cargo: sesion.titular_cargo || "",
    herramienta_ia: sesion.herramienta_ia || "",
    brief_mision: sesion.brief_mision || "",
    brief_audiencias:
      Array.isArray(sesion.brief_audiencias) && sesion.brief_audiencias.length
        ? (sesion.brief_audiencias as any)
        : [{ nombre: "", expectativa: "" }],
    brief_tono: sesion.brief_tono || "",
    brief_terminos_prohibidos: (sesion.brief_terminos_prohibidos as string[]) || [],
    brief_terminos_preferidos: (sesion.brief_terminos_preferidos as string[]) || [],
    brief_mensajes_clave: (sesion.brief_mensajes_clave as string[]) || [],
    brief_tipo_texto: sesion.brief_tipo_texto || "",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-mesh opacity-25" />
      <div className="pointer-events-none fixed inset-0 bg-glow opacity-25" />
      <div className="relative">
        <StepNav current={step} highest={highest} onJump={(s) => setStep(s)} />

        <div className="border-b border-border/40 bg-card/40 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 md:px-6">
            <div className="text-[11px] uppercase tracking-[1.5px] text-muted-foreground">
              <span className="font-bold text-foreground">{dependencia.siglas}</span> · {dependencia.nombre}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {STEPS[step]?.label}
            </div>
          </div>
        </div>

        {step === 0 && (
          <StepWelcome
            dependenciaNombre={dependencia.nombre}
            dependenciaSiglas={dependencia.siglas}
            onContinue={() => advanceTo(1)}
          />
        )}
        {step === 1 && (
          <StepDiagnostico
            sesionId={sesion.id}
            diagnosticos={diagnosticos}
            onAdded={(d) => setDiagnosticos((prev) => [d, ...prev])}
            onPropagateProhibidos={propagateProhibidos}
            onNext={() => advanceTo(2)}
            onBack={() => advanceTo(0)}
          />
        )}
        {step === 2 && (
          <StepBrief initial={briefInitial} onSave={saveBrief} onBack={() => advanceTo(1)} />
        )}
        {step === 3 && (
          <StepCorpus
            initial={{
              corpus_documentos: (sesion.corpus_documentos as string[]) || [],
              corpus_notas: sesion.corpus_notas || "",
            }}
            onSave={saveCorpus}
            onBack={() => advanceTo(2)}
          />
        )}
        {step === 4 && (
          <StepPromptGenerator
            brief={{
              dependencia_nombre: dependencia.nombre,
              titular_nombre: briefInitial.titular_nombre,
              titular_cargo: briefInitial.titular_cargo,
              brief_mision: briefInitial.brief_mision,
              brief_audiencias: briefInitial.brief_audiencias,
              brief_tono: briefInitial.brief_tono,
              brief_terminos_prohibidos: briefInitial.brief_terminos_prohibidos,
              brief_terminos_preferidos: briefInitial.brief_terminos_preferidos,
              brief_mensajes_clave: briefInitial.brief_mensajes_clave,
              brief_tipo_texto: briefInitial.brief_tipo_texto,
            }}
            herramienta={briefInitial.herramienta_ia}
            initialPrompt={sesion.prompt_sistema || ""}
            onSavePrompt={savePrompt}
            onNext={() => advanceTo(5)}
            onBack={() => advanceTo(3)}
          />
        )}
        {step === 5 && (
          <StepCompromisos
            initial={{
              compromiso_corpus_subido: sesion.compromiso_corpus_subido,
              compromiso_prompt_probado: sesion.compromiso_prompt_probado,
              compromiso_resultado_compartido: sesion.compromiso_resultado_compartido,
              notas_kimedia: sesion.notas_kimedia || "",
            }}
            dependenciaNombre={dependencia.nombre}
            onSave={saveCompromisos}
            onBack={() => advanceTo(4)}
          />
        )}

        <footer className="border-t border-border/40 py-6 text-center text-[11px] text-muted-foreground">
          Hecho por <a href="https://kimedia.mx" className="text-primary hover:underline">KiMedia</a> ·
          Soporte: hola@kimedia.mx · WhatsApp +52 55 7350 0846
        </footer>
      </div>
    </div>
  );
};

export default CursoIaGobiernoGto;