import { motion } from "framer-motion";
import { Share2, RotateCcw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PUZZLE_LEVELS, getPuzzleRank } from "@/data/puzzleData";
import { toast } from "@/hooks/use-toast";

interface LevelResult {
  score: number;
  correct: number;
  total: number;
  timeRemaining: number;
}

interface Props {
  results: LevelResult[];
  onRestart: () => void;
}

export function PuzzleResult({ results, onRestart }: Props) {
  const totalScore = results.reduce((acc, r) => acc + r.score, 0);
  const avgScore = Math.round(totalScore / results.length);
  const totalCorrect = results.reduce((acc, r) => acc + r.correct, 0);
  const totalPieces = results.reduce((acc, r) => acc + r.total, 0);
  const rank = getPuzzleRank(avgScore);

  const handleShare = async () => {
    const text = `🧩 ¡Completé "Construye tu Marca" de @KiMedia!\n\n${rank.emoji} Rango: ${rank.name}\n⭐ Puntuación: ${avgScore}/100\n✅ ${totalCorrect}/${totalPieces} piezas correctas\n\n¿Puedes superarme? 👇`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        toast({ title: "¡Resultado copiado!" });
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto text-center"
    >
      <motion.div
        className="text-6xl mb-3"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 1 }}
      >
        {rank.emoji}
      </motion.div>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
        {rank.name}
      </h2>
      <p className="text-muted-foreground mb-6">{rank.message}</p>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="text-4xl font-bold text-foreground mb-1">{avgScore}<span className="text-lg text-muted-foreground">/100</span></div>
        <p className="text-sm text-muted-foreground mb-4">Puntuación promedio</p>

        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="bg-secondary rounded-xl p-3">
            <p className="text-lg font-bold text-foreground">{totalCorrect}/{totalPieces}</p>
            <p className="text-xs text-muted-foreground">Piezas correctas</p>
          </div>
          <div className="bg-secondary rounded-xl p-3">
            <p className="text-lg font-bold text-foreground">{totalScore}</p>
            <p className="text-xs text-muted-foreground">Puntos totales</p>
          </div>
        </div>
      </div>

      {/* Level breakdown */}
      <div className="space-y-2 mb-6">
        {results.map((r, i) => (
          <div key={i} className="flex items-center justify-between bg-secondary rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">{PUZZLE_LEVELS[i].emoji}</span>
              <span className="text-sm font-medium text-foreground">{PUZZLE_LEVELS[i].name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{r.correct}/{r.total}</span>
              <span className="text-sm font-bold text-foreground">{r.score} pts</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button variant="outline" onClick={handleShare} className="border-border">
          <Share2 className="w-4 h-4 mr-2" /> Compartir
        </Button>
        <Button variant="outline" onClick={onRestart} className="border-border">
          <RotateCcw className="w-4 h-4 mr-2" /> Reintentar
        </Button>
      </div>

      <Link to="/kit/marca-personal">
        <Button className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-5">
          <Sparkles className="w-4 h-4 mr-2" /> Construir mi marca de verdad
        </Button>
      </Link>
    </motion.div>
  );
}
