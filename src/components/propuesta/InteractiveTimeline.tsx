import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export interface TimelineItem {
  n: string;
  title: string;
  time: string;
  desc: string;
  tools: string[];
  deliverable: string;
}

export const InteractiveTimeline = ({ items }: { items: TimelineItem[] }) => {
  const [active, setActive] = useState(0);
  const current = items[active];

  return (
    <div>
      {/* Timeline rail */}
      <div className="relative mb-6">
        <div className="absolute left-0 right-0 top-7 h-[2px] bg-border" />
        <motion.div
          className="absolute left-0 top-7 h-[2px] bg-gradient-coral"
          initial={false}
          animate={{ width: `${((active + 1) / items.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
          {items.map((item, i) => {
            const isActive = i === active;
            const isPast = i < active;
            return (
              <button
                key={item.n}
                type="button"
                onClick={() => setActive(i)}
                className="group flex flex-col items-center text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex h-14 w-14 items-center justify-center rounded-full border-2 font-display text-lg font-bold transition-all ${
                    isActive
                      ? "border-primary bg-gradient-coral text-primary-foreground shadow-glow"
                      : isPast
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border bg-card text-muted-foreground group-hover:border-primary/40"
                  }`}
                >
                  {isPast ? <CheckCircle2 className="h-5 w-5" /> : item.n}
                </motion.div>
                <div
                  className={`mt-3 max-w-[110px] text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.n}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border-border bg-card/70 p-6 backdrop-blur md:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge className="bg-gradient-coral text-primary-foreground">Módulo {current.n}</Badge>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                {current.time}
              </Badge>
              <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-electric">
                100% práctico
              </span>
            </div>
            <h3 className="mb-3 font-display text-2xl font-bold leading-tight md:text-3xl">{current.title}</h3>
            <p className="mb-6 text-base leading-relaxed text-foreground/85">{current.desc}</p>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
                  Herramientas de IA en uso
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {current.tools.map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="border-electric/30 bg-electric/10 text-xs text-electric"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
                  Cada asistente se lleva
                </div>
                <p className="text-sm leading-relaxed text-foreground">{current.deliverable}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};