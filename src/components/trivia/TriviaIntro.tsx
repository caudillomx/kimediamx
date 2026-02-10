import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, User, Building2, Zap, Heart, Trophy, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onStart: (mode: "personal" | "pyme") => void;
}

export function TriviaIntro({ onStart }: Props) {
  const [mode, setMode] = useState<"personal" | "pyme" | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-lg mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 rounded-2xl bg-gradient-coral flex items-center justify-center mx-auto mb-6 shadow-glow"
      >
        <Gamepad2 className="w-10 h-10 text-primary-foreground" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3"
      >
        Trivia de Marca
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto leading-relaxed"
      >
        ¿Cuánto sabes sobre branding digital? Pon a prueba tus conocimientos y descubre tu nivel.
      </motion.p>

      {/* Game rules */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {[
          { icon: <Heart className="w-5 h-5 text-red-400" />, label: "3 vidas", desc: "No pierdas las 3" },
          { icon: <Timer className="w-5 h-5 text-amber-400" />, label: "15 segundos", desc: "Por pregunta" },
          { icon: <Trophy className="w-5 h-5 text-yellow-400" />, label: "Streaks", desc: "Racha = más XP" },
        ].map((rule) => (
          <div key={rule.label} className="bg-card rounded-xl p-3 border border-border">
            <div className="flex justify-center mb-2">{rule.icon}</div>
            <p className="text-foreground text-xs font-bold">{rule.label}</p>
            <p className="text-muted-foreground text-[10px]">{rule.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Mode selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 mb-6"
      >
        <p className="text-foreground text-sm font-bold">Elige tu categoría:</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("personal")}
            className={`rounded-xl p-5 text-center transition-all border ${
              mode === "personal"
                ? "border-coral bg-coral/10 shadow-lg shadow-coral/10"
                : "border-border bg-card hover:border-coral/30"
            }`}
          >
            <User className={`w-8 h-8 mx-auto mb-2 ${mode === "personal" ? "text-coral" : "text-muted-foreground"}`} />
            <span className={`block text-sm font-bold ${mode === "personal" ? "text-coral" : "text-foreground"}`}>
              Marca Personal
            </span>
            <span className="block text-[10px] text-muted-foreground mt-1">Para profesionales</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("pyme")}
            className={`rounded-xl p-5 text-center transition-all border ${
              mode === "pyme"
                ? "border-coral bg-coral/10 shadow-lg shadow-coral/10"
                : "border-border bg-card hover:border-coral/30"
            }`}
          >
            <Building2 className={`w-8 h-8 mx-auto mb-2 ${mode === "pyme" ? "text-coral" : "text-muted-foreground"}`} />
            <span className={`block text-sm font-bold ${mode === "pyme" ? "text-coral" : "text-foreground"}`}>
              PyME
            </span>
            <span className="block text-[10px] text-muted-foreground mt-1">Para empresas</span>
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <Button
          onClick={() => mode && onStart(mode)}
          disabled={!mode}
          className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6 text-base"
        >
          <Zap className="w-5 h-5 mr-2" />
          ¡Comenzar Trivia!
        </Button>
      </motion.div>
    </motion.div>
  );
}
