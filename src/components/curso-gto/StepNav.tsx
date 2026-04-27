import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = [
  { id: 0, label: "Bienvenida", short: "Inicio" },
  { id: 1, label: "Diagnóstico", short: "Pre-trabajo" },
  { id: 2, label: "Brief institucional", short: "Brief" },
  { id: 3, label: "Corpus", short: "Documentos" },
  { id: 4, label: "Prompt de sistema", short: "Prompt" },
  { id: 5, label: "Compromisos", short: "Cierre" },
];

interface Props {
  current: number;
  onJump: (step: number) => void;
  highest: number;
}

export const StepNav = ({ current, onJump, highest }: Props) => {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3 md:px-6">
        <div className="relative">
          <div className="absolute left-0 right-0 top-[18px] h-[2px] bg-border" />
          <motion.div
            className="absolute left-0 top-[18px] h-[2px] bg-gradient-coral"
            initial={false}
            animate={{ width: `${(current / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
          <div className="relative grid" style={{ gridTemplateColumns: `repeat(${STEPS.length}, 1fr)` }}>
            {STEPS.map((s) => {
              const isActive = s.id === current;
              const isPast = s.id < current;
              const reachable = s.id <= Math.max(highest, current);
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!reachable}
                  onClick={() => reachable && onJump(s.id)}
                  className="group flex flex-col items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <motion.div
                    whileHover={reachable ? { scale: 1.05 } : {}}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                      isActive
                        ? "border-primary bg-gradient-coral text-primary-foreground shadow-glow"
                        : isPast
                          ? "border-primary/60 bg-primary/15 text-primary"
                          : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    {isPast ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                  </motion.div>
                  <span
                    className={cn(
                      "hidden text-[10px] font-semibold uppercase tracking-wider md:block",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};