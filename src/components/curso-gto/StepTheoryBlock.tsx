import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen, Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEORY_BY_STEP } from "./theoryContent";

interface Props {
  step: number;
  /** Open by default (used in demo / projector mode) */
  defaultOpen?: boolean;
}

export const StepTheoryBlock = ({ step, defaultOpen = false }: Props) => {
  const theory = THEORY_BY_STEP[step];
  const [open, setOpen] = useState(defaultOpen);

  // Re-sync if step changes while mounted (e.g. demo navigation)
  useEffect(() => {
    setOpen(defaultOpen);
  }, [step, defaultOpen]);

  if (!theory) return null;
  const Icon = theory.icon;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "overflow-hidden rounded-2xl border backdrop-blur transition-colors",
          open
            ? "border-electric/40 bg-electric/5"
            : "border-border/60 bg-card/40 hover:border-electric/40",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 px-5 py-3 text-left"
        >
          <div className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
            open ? "bg-electric/20 text-electric" : "bg-muted/50 text-muted-foreground",
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-electric">
              📚 {theory.badge} · Por qué este paso
            </div>
            <div className="truncate text-sm font-semibold md:text-base">
              {theory.titulo}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-5 border-t border-electric/20 px-5 pb-6 pt-5 md:px-6">
                {/* Definición */}
                <p className="text-sm leading-relaxed text-foreground/85 md:text-base">
                  {theory.definicion}
                </p>

                {/* Principios */}
                <div className="grid gap-3 md:grid-cols-3">
                  {theory.principios.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border/50 bg-background/40 p-4"
                    >
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-coral">
                        Principio {i + 1}
                      </div>
                      <div className="mb-1 font-display text-sm font-bold leading-tight">
                        {p.titulo}
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {p.detalle}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Analogía */}
                <div className="rounded-xl border border-coral/30 bg-coral/5 p-4">
                  <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-coral">
                    <Lightbulb className="h-3 w-3" /> Analogía · {theory.analogia.titulo}
                  </div>
                  <p className="text-sm italic leading-relaxed text-foreground/80">
                    “{theory.analogia.texto}”
                  </p>
                </div>

                {/* Acción */}
                <div className="flex items-start gap-2 rounded-xl border border-lime/30 bg-lime/5 p-4">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-lime">
                      Qué vas a hacer ahora
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-foreground/90">
                      {theory.accion}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
