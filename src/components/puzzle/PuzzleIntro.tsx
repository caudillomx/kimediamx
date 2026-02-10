import { motion } from "framer-motion";
import { Puzzle, Zap, Clock, Trophy, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PUZZLE_LEVELS, PUZZLE_CATEGORIES } from "@/data/puzzleData";

interface Props {
  onStart: () => void;
}

export function PuzzleIntro({ onStart }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-lg mx-auto text-center"
    >
      <motion.div
        className="text-7xl mb-4 inline-block"
        animate={{ rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.5 }}
      >
        🧩
      </motion.div>
      <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
        Construye tu Marca
      </h1>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Coloca las piezas correctas en su lugar y construye una marca digital sólida en 4 niveles
      </p>

      {/* How to play */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6 text-left">
        <p className="text-xs text-coral font-bold uppercase tracking-wider mb-3 text-center">¿Cómo se juega?</p>
        <div className="space-y-2">
          {[
            { step: "1", text: "Toca una pieza para seleccionarla (se ilumina)" },
            { step: "2", text: "Toca el espacio donde crees que va" },
            { step: "3", text: "¡También puedes arrastrar las piezas!" },
            { step: "4", text: "Completa antes de que se acabe el tiempo" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-coral/20 text-coral text-xs font-bold flex items-center justify-center shrink-0">
                {step}
              </span>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: Puzzle, label: "4 niveles", desc: "De cimientos a escala" },
          { icon: Clock, label: "Cronómetro", desc: "Contra el reloj" },
          { icon: Zap, label: "Combos", desc: "Aciertos consecutivos" },
          { icon: Trophy, label: "Rangos", desc: "De Novato a Maestro" },
        ].map(({ icon: Icon, label, desc }) => (
          <motion.div
            key={label}
            className="bg-card border border-border rounded-xl p-3 text-left"
            whileHover={{ scale: 1.03, borderColor: "hsl(var(--coral))" }}
          >
            <Icon className="w-5 h-5 text-coral mb-1" />
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-6">
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-bold">Niveles</p>
        <div className="flex justify-center gap-2">
          {PUZZLE_LEVELS.map((level, i) => (
            <motion.div
              key={level.id}
              className="bg-secondary rounded-lg px-3 py-2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-xl">{level.emoji}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">{level.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {Object.values(PUZZLE_CATEGORIES).map((cat) => (
          <span key={cat.label} className="text-xs bg-secondary rounded-full px-2.5 py-1 text-muted-foreground">
            {cat.emoji} {cat.label}
          </span>
        ))}
      </div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={onStart}
          className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6 text-lg shadow-glow"
        >
          🧩 ¡Empezar a construir!
        </Button>
      </motion.div>
    </motion.div>
  );
}
