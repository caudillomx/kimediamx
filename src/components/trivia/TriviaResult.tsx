import { motion } from "framer-motion";
import { Trophy, Zap, RotateCcw, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLevelFromScore } from "@/data/triviaData";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Props {
  score: number;
  totalQuestions: number;
  bestStreak: number;
  mode: "personal" | "pyme";
  onReplay: () => void;
}

export function TriviaResult({ score, totalQuestions, bestStreak, mode, onReplay }: Props) {
  const result = getLevelFromScore(score, totalQuestions * 150);

  const handleShare = async () => {
    const text = `${result.emoji} ¡Soy ${result.title} en la Trivia de Marca de KiMedia!\n\n🎮 Score: ${score.toLocaleString()} XP\n🔥 Mejor racha: ${bestStreak}\n\n¿Cuánto sabes tú sobre branding? ¡Juega ahora!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: "Trivia de Marca - KiMedia", text, url: window.location.href });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text + "\n" + window.location.href);
      toast({ title: "¡Resultado copiado! Compártelo en tus redes" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-lg mx-auto text-center"
    >
      {/* Level badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
        className={`w-28 h-28 rounded-full bg-gradient-to-br ${result.color} mx-auto mb-6 flex items-center justify-center shadow-lg`}
      >
        <span className="text-5xl">{result.emoji}</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2"
      >
        {result.title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto"
      >
        {result.message}
      </motion.p>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        <div className="bg-card rounded-xl p-4 border border-border">
          <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <p className="text-foreground font-bold text-lg">{score.toLocaleString()}</p>
          <p className="text-muted-foreground text-[10px]">XP Total</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <Zap className="w-6 h-6 text-coral mx-auto mb-1" />
          <p className="text-foreground font-bold text-lg">{bestStreak}</p>
          <p className="text-muted-foreground text-[10px]">Mejor racha</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <span className="text-2xl block mb-1">{result.emoji}</span>
          <p className="text-foreground font-bold text-lg capitalize">{result.level}</p>
          <p className="text-muted-foreground text-[10px]">Nivel</p>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="space-y-3"
      >
        <Button
          onClick={handleShare}
          className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Compartir mi resultado
        </Button>

        <Button onClick={onReplay} variant="outline" className="w-full border-border py-6">
          <RotateCcw className="w-4 h-4 mr-2" />
          Jugar de nuevo
        </Button>

        <Link to={mode === "personal" ? "/kit/marca-personal" : "/kit/pyme"} className="block">
          <Button variant="outline" className="w-full border-coral/30 text-coral hover:bg-coral/10 py-6">
            Construir mi {mode === "personal" ? "marca personal" : "marca empresarial"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
