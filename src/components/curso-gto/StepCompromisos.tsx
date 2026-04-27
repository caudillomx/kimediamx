import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowLeft, Trophy, Sparkles, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface CompromisosData {
  compromiso_corpus_subido: boolean;
  compromiso_prompt_probado: boolean;
  compromiso_resultado_compartido: boolean;
  notas_kimedia: string;
}

interface Props {
  initial: CompromisosData;
  dependenciaNombre: string;
  onSave: (d: CompromisosData & { finalizar?: boolean }) => Promise<void>;
  onBack: () => void;
}

const ITEMS = [
  {
    key: "compromiso_corpus_subido" as const,
    titulo: "Subiré el corpus a la herramienta de IA esta semana",
    detalle: "Plan de trabajo, informe, discursos del titular y boletines recientes.",
  },
  {
    key: "compromiso_prompt_probado" as const,
    titulo: "Probaré el prompt con 3 textos reales antes del próximo viernes",
    detalle: "Compararé contra textos que ya teníamos para detectar diferencias.",
  },
  {
    key: "compromiso_resultado_compartido" as const,
    titulo: "Compartiré con KiMedia 1 ejemplo (antes / después) en 14 días",
    detalle: "Para que el equipo pueda iterar mi prompt y el de las demás dependencias.",
  },
];

export const StepCompromisos = ({ initial, dependenciaNombre, onSave, onBack }: Props) => {
  const [data, setData] = useState<CompromisosData>(initial);
  const [saving, setSaving] = useState(false);
  const [finalizado, setFinalizado] = useState(false);

  const toggle = (k: keyof CompromisosData) =>
    k !== "notas_kimedia" && setData((d) => ({ ...d, [k]: !d[k] }));

  const finalizar = async () => {
    setSaving(true);
    await onSave({ ...data, finalizar: true });
    setSaving(false);
    setFinalizado(true);
  };

  const total = 3;
  const cumplidos = [data.compromiso_corpus_subido, data.compromiso_prompt_probado, data.compromiso_resultado_compartido].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-10 md:px-6"
    >
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-lime/40 bg-lime/10 px-3 py-1">
        <Trophy className="h-3 w-3 text-lime" />
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-lime">
          Paso 4 · Compromisos y cierre
        </span>
      </div>
      <h2 className="mb-3 font-display text-3xl font-bold leading-tight md:text-4xl">
        ¿Qué te <span className="text-gradient-sunset">comprometes</span> a hacer en los próximos 14 días?
      </h2>
      <p className="mb-7 text-sm text-muted-foreground md:text-base">
        Marca los compromisos que asumes como enlace de comunicación de <strong className="text-foreground">{dependenciaNombre}</strong>.
        Solo cuentan los que realmente vas a ejecutar.
      </p>

      <div className="space-y-3">
        {ITEMS.map((it) => {
          const checked = !!data[it.key];
          return (
            <Card
              key={it.key}
              onClick={() => toggle(it.key)}
              className={cn(
                "cursor-pointer border-border bg-card/70 p-5 transition-all hover:border-primary/60",
                checked && "border-lime/60 bg-lime/5 shadow-glow"
              )}
            >
              <div className="flex items-start gap-3">
                {checked ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-lime" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/60" />
                )}
                <div>
                  <div className="font-display text-sm font-bold md:text-base">{it.titulo}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">{it.detalle}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-5 border-border bg-card/70 p-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Mensaje para el equipo de KiMedia (opcional)
        </label>
        <Textarea
          value={data.notas_kimedia}
          onChange={(e) => setData((d) => ({ ...d, notas_kimedia: e.target.value }))}
          rows={3}
          placeholder="Dudas, bloqueos o cosas que quieras que revisemos antes del seguimiento."
          className="bg-background/50"
        />
      </Card>

      <div className="mt-7 rounded-2xl border border-electric/30 bg-electric/5 p-5">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-electric">Tu progreso</div>
        <div className="font-display text-xl font-bold">
          {cumplidos} de {total} compromisos asumidos
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          KiMedia te contactará en 14 días para revisar avances y afinar el prompt si hace falta.
        </p>
      </div>

      {finalizado && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 rounded-2xl border border-lime/40 bg-lime/10 p-6 text-center"
        >
          <Sparkles className="mx-auto mb-2 h-8 w-8 text-lime" />
          <div className="font-display text-xl font-bold text-lime">¡Sesión finalizada!</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Tu repositorio queda guardado con este código. Puedes volver cuando quieras a editar tu prompt o
            sumar nuevos textos al diagnóstico.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-3 py-1">
              <Mail className="h-3 w-3" /> hola@kimedia.mx
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-3 py-1">
              <MessageSquare className="h-3 w-3" /> +52 55 7350 0846
            </span>
          </div>
        </motion.div>
      )}

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="mr-1 h-4 w-4" /> Atrás
        </Button>
        <Button
          onClick={finalizar}
          disabled={saving || cumplidos === 0}
          className="rounded-xl bg-gradient-coral font-semibold shadow-glow"
        >
          {saving ? "Guardando…" : finalizado ? "Guardar cambios" : "Finalizar y entregar a KiMedia"}
        </Button>
      </div>
    </motion.div>
  );
};