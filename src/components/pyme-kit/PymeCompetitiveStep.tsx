import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onNext: (data: { competitors: string; marketPosition: string }) => void;
}

const positionOptions = [
  { value: "lider", label: "Líder del mercado", desc: "Los más conocidos en nuestra zona o nicho", emoji: "👑" },
  { value: "retador", label: "Retador", desc: "Competimos fuerte con los líderes", emoji: "⚡" },
  { value: "seguidor", label: "Seguidor", desc: "Seguimos las tendencias del mercado", emoji: "📈" },
  { value: "nicho", label: "Especialista de nicho", desc: "Atendemos un segmento muy específico", emoji: "🎯" },
  { value: "nuevo", label: "Nuevo entrante", desc: "Estamos empezando en el mercado", emoji: "🌱" },
];

export function PymeCompetitiveStep({ onNext }: Props) {
  const [competitors, setCompetitors] = useState("");
  const [marketPosition, setMarketPosition] = useState("");

  const canProceed = competitors.trim().length > 3 && marketPosition;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-5"
        >
          <Search className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          Análisis <span className="text-gradient">competitivo</span>
        </h2>
        <p className="text-muted-foreground text-sm">Conoce tu posición en el mercado para diferenciarte</p>
      </div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            ¿Quiénes son tus principales competidores?
          </Label>
          <Textarea
            value={competitors}
            onChange={e => setCompetitors(e.target.value)}
            placeholder="Menciona 2-3 empresas que ofrecen algo similar al tuyo"
            className="bg-secondary border-border rounded-xl min-h-[80px] text-foreground resize-none placeholder:text-muted-foreground/50"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground/70">Puedes separar con comas.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            ¿Cómo describes tu posición en el mercado?
          </Label>
          <div className="space-y-2">
            {positionOptions.map((opt, i) => (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                type="button"
                onClick={() => setMarketPosition(opt.value)}
                className={`w-full rounded-2xl p-4 text-left transition-all border flex items-start gap-3 ${
                  marketPosition === opt.value
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-secondary hover:border-primary/30 hover:bg-secondary/80"
                }`}
              >
                <span className="text-lg mt-0.5">{opt.emoji}</span>
                <div>
                  <span className={`block text-sm font-bold ${
                    marketPosition === opt.value ? "text-primary" : "text-foreground"
                  }`}>
                    {opt.label}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{opt.desc}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <Button
        onClick={() => onNext({ competitors, marketPosition })}
        disabled={!canProceed}
        className="w-full bg-gradient-coral text-primary-foreground font-bold rounded-xl h-12 mt-8 shadow-glow hover:shadow-glow-lg transition-all"
      >
        Construir identidad de marca <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}
