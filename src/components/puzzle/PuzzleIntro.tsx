import { motion } from "framer-motion";
import { Puzzle, Zap, Clock, Trophy } from "lucide-react";
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
        className="text-6xl mb-4"
        animate={{ rotate: [0, -5, 5, -3, 3, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
      >
        🧩
      </motion.div>
      <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
        Construye tu Marca
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Arrastra las piezas correctas a su lugar y construye una marca digital sólida en 4 niveles
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { icon: Puzzle, label: "4 niveles", desc: "De cimientos a escala" },
          { icon: Clock, label: "Cronómetro", desc: "Contra el reloj" },
          { icon: Zap, label: "Puntuación", desc: "Precisión + velocidad" },
          { icon: Trophy, label: "Rangos", desc: "De Novato a Maestro" },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3 text-left">
            <Icon className="w-5 h-5 text-coral mb-1" />
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-bold">Niveles</p>
        <div className="flex justify-center gap-2">
          {PUZZLE_LEVELS.map((level) => (
            <div key={level.id} className="bg-secondary rounded-lg px-3 py-2 text-center">
              <span className="text-lg">{level.emoji}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">{level.name}</p>
            </div>
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

      <Button
        onClick={onStart}
        className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6 text-lg"
      >
        🧩 ¡Empezar a construir!
      </Button>
    </motion.div>
  );
}
