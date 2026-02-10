import { motion } from "framer-motion";
import { Trophy, TrendingUp, BarChart3, RotateCcw, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { getSimLevel, type SimRoundResult } from "@/data/simulatorData";

interface Props {
  results: SimRoundResult[];
  mode: "personal" | "pyme";
  onReplay: () => void;
}

export function SimulatorResult({ results, mode, onReplay }: Props) {
  const avgEngagement = Math.round(
    results.reduce((sum, r) => sum + r.metrics.engagement, 0) / results.length
  );
  const totalLikes = results.reduce((sum, r) => sum + r.metrics.likes, 0);
  const totalReach = results.reduce((sum, r) => sum + r.metrics.reach, 0);
  const bestPost = results.reduce((best, r) => (r.metrics.engagement > best.metrics.engagement ? r : best));

  const level = getSimLevel(avgEngagement);

  const handleShare = async () => {
    const text = `${level.emoji} ¡Soy "${level.title}" en el Simulador de Redes de KiMedia!\n\n📊 Engagement promedio: ${avgEngagement}/100\n❤️ Total likes: ${totalLikes}\n👁️ Alcance total: ${totalReach.toLocaleString()}\n\n¿Qué tan bueno eres creando contenido? ¡Pruébalo!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Simulador de Redes - KiMedia", text, url: window.location.href });
      } catch { /* cancelled */ }
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
        className={`w-28 h-28 rounded-full bg-gradient-to-br ${level.color} mx-auto mb-6 flex items-center justify-center shadow-lg`}
      >
        <span className="text-5xl">{level.emoji}</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2"
      >
        {level.title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto"
      >
        {level.message}
      </motion.p>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <div className="bg-card rounded-xl p-4 border border-border">
          <TrendingUp className="w-6 h-6 text-coral mx-auto mb-1" />
          <p className="text-foreground font-bold text-lg">{avgEngagement}</p>
          <p className="text-muted-foreground text-[10px]">Engagement avg</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <p className="text-foreground font-bold text-lg">{totalLikes}</p>
          <p className="text-muted-foreground text-[10px]">Total Likes</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <BarChart3 className="w-6 h-6 text-cyan mx-auto mb-1" />
          <p className="text-foreground font-bold text-lg">
            {totalReach >= 1000 ? `${(totalReach / 1000).toFixed(1)}k` : totalReach}
          </p>
          <p className="text-muted-foreground text-[10px]">Alcance total</p>
        </div>
      </motion.div>

      {/* Best post highlight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-card rounded-xl p-4 border border-coral/20 mb-8 text-left"
      >
        <p className="text-coral text-xs font-bold mb-2">🏅 Tu mejor publicación (Reto {bestPost.challenge.round})</p>
        <p className="text-foreground text-xs leading-relaxed line-clamp-3">{bestPost.userPost}</p>
        <p className="text-muted-foreground text-[10px] mt-2">
          Engagement: {bestPost.metrics.engagement}/100 · {bestPost.metrics.likes} likes
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-3"
      >
        <Button
          onClick={handleShare}
          className="w-full bg-gradient-sunset hover:opacity-90 text-primary-foreground font-bold py-6"
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
