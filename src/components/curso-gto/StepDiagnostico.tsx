import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2, AlertCircle, ArrowRight, ArrowLeft, Plus, X, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ERRORES_CATALOGO, type ErrorTipo } from "./data";
import { toast } from "sonner";

interface DiagnosticoResultado {
  resumen: string;
  score_calidad: number;
  errores_detectados: Array<{ tipo: ErrorTipo; ejemplo: string; sugerencia: string }>;
  terminos_prohibidos_sugeridos: string[];
}

interface DiagnosticoGuardado extends DiagnosticoResultado {
  id: string;
  titulo: string;
  texto_original: string;
}

interface Props {
  sesionId: string;
  diagnosticos: DiagnosticoGuardado[];
  onAdded: (d: DiagnosticoGuardado) => void;
  onPropagateProhibidos: (terminos: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepDiagnostico = ({ sesionId, diagnosticos, onAdded, onPropagateProhibidos, onNext, onBack }: Props) => {
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (texto.trim().length < 30) {
      toast.error("El texto debe tener al menos 30 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gto-diagnose-text", {
        body: { texto: texto.trim(), titulo: titulo.trim() || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Persist
      const insert = await supabase
        .from("gto_diagnostico_textos")
        .insert({
          sesion_id: sesionId,
          titulo: titulo.trim() || "Texto sin título",
          texto_original: texto.trim(),
          errores_detectados: data.errores_detectados || [],
          resumen_diagnostico: data.resumen,
          score_calidad: data.score_calidad,
          analizado_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (insert.error) throw insert.error;

      onAdded({
        id: insert.data.id,
        titulo: insert.data.titulo,
        texto_original: insert.data.texto_original,
        resumen: data.resumen,
        score_calidad: data.score_calidad,
        errores_detectados: data.errores_detectados || [],
        terminos_prohibidos_sugeridos: data.terminos_prohibidos_sugeridos || [],
      });
      setTitulo("");
      setTexto("");
      toast.success("Diagnóstico listo");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Error analizando el texto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl px-4 py-10 md:px-6"
    >
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-electric/40 bg-electric/10 px-3 py-1">
        <FileSearch className="h-3 w-3 text-electric" />
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-electric">
          Pre-trabajo · Diagnóstico
        </span>
      </div>
      <h2 className="mb-3 font-display text-3xl font-bold leading-tight md:text-4xl">
        Antes de configurar tu IA, <span className="text-gradient-sunset">veamos cómo está hoy</span>
      </h2>
      <p className="mb-8 max-w-3xl text-sm text-muted-foreground md:text-base">
        Pega 1 o 2 textos recientes producidos por tu dependencia. La IA detectará los 5 errores recurrentes
        que encontramos en materiales gubernamentales y te dirá qué corregir. Lo que aparezca aquí lo usaremos
        después para construir tu prompt de sistema.
      </p>

      <Card className="mb-6 border-border bg-card/70 p-5 md:p-6">
        <Input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título o tipo de texto (boletín, post, discurso…)"
          className="mb-3 h-11 bg-background/50"
        />
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pega aquí un texto reciente producido por tu equipo de comunicación…"
          rows={8}
          className="mb-4 bg-background/50"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{texto.length} caracteres</span>
          <Button
            onClick={analyze}
            disabled={loading || texto.trim().length < 30}
            className="rounded-xl bg-gradient-coral font-semibold shadow-glow"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Analizando…
              </>
            ) : (
              <>
                <Wand2 className="mr-1.5 h-4 w-4" />
                Diagnosticar con IA
              </>
            )}
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {diagnosticos.map((d) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4"
          >
            <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5 p-5 md:p-6">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
                    {d.titulo}
                  </div>
                  <p className="text-sm text-foreground/90">{d.resumen}</p>
                </div>
                <Badge className="bg-gradient-coral text-primary-foreground">
                  {d.score_calidad}/10
                </Badge>
              </div>

              {d.errores_detectados.length === 0 ? (
                <p className="text-sm text-muted-foreground">No se detectaron errores graves. 🎉</p>
              ) : (
                <div className="space-y-2.5">
                  {d.errores_detectados.map((err, i) => {
                    const meta = ERRORES_CATALOGO[err.tipo];
                    if (!meta) return null;
                    return (
                      <div
                        key={i}
                        className={`rounded-xl border p-3 ${meta.color}`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <div className="text-[11px] font-bold uppercase tracking-wider">
                            {meta.nombre}
                          </div>
                        </div>
                        <p className="mb-1.5 text-xs italic opacity-90">"{err.ejemplo}"</p>
                        <p className="text-xs font-medium">{err.sugerencia}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {d.terminos_prohibidos_sugeridos.length > 0 && (
                <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
                      Términos a prohibir en tu prompt
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onPropagateProhibidos(d.terminos_prohibidos_sugeridos)}
                      className="h-7 text-[11px] text-primary hover:text-primary"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Agregar al brief
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {d.terminos_prohibidos_sugeridos.map((t) => (
                      <Badge key={t} variant="outline" className="text-[11px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={onNext} className="rounded-xl bg-gradient-coral font-semibold shadow-glow">
          {diagnosticos.length === 0 ? "Saltar y continuar" : "Continuar al brief"}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};