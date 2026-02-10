import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Eye, TrendingUp, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { platformIcons, platformNames, type SimChallenge, type SimMetrics } from "@/data/simulatorData";

interface Props {
  challenge: SimChallenge;
  userPost: string;
  metrics: SimMetrics;
  round: number;
  totalRounds: number;
  onNext: () => void;
  isLast: boolean;
}

export function FeedResult({ challenge, userPost, metrics, round, totalRounds, onNext, isLast }: Props) {
  const engagementColor =
    metrics.engagement >= 65
      ? "text-green-400"
      : metrics.engagement >= 40
      ? "text-amber-400"
      : "text-red-400";

  const engagementBg =
    metrics.engagement >= 65
      ? "bg-green-500/10 border-green-500/30"
      : metrics.engagement >= 40
      ? "bg-amber-500/10 border-amber-500/30"
      : "bg-red-500/10 border-red-500/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Round indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-muted-foreground text-xs font-medium">
          Resultado del Reto {round}
        </span>
        <span className="text-xs text-coral font-bold">
          {platformIcons[challenge.platform]} {platformNames[challenge.platform]}
        </span>
      </div>

      {/* Simulated post card */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
        {/* Post header */}
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-gradient-sunset flex items-center justify-center text-primary-foreground text-sm font-bold">
            TÚ
          </div>
          <div>
            <p className="text-foreground text-sm font-bold">Tu Marca</p>
            <p className="text-muted-foreground text-[10px]">Publicado hace 2h · {platformNames[challenge.platform]}</p>
          </div>
        </div>

        {/* Post content */}
        <div className="p-4">
          <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{userPost}</p>
        </div>

        {/* Simulated metrics */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: <Heart className="w-4 h-4" />, value: metrics.likes, label: "Likes" },
              { icon: <MessageCircle className="w-4 h-4" />, value: metrics.comments, label: "Comentarios" },
              { icon: <Share2 className="w-4 h-4" />, value: metrics.shares, label: "Compartidos" },
              { icon: <Eye className="w-4 h-4" />, value: metrics.reach, label: "Alcance" },
            ].map((m) => (
              <motion.div
                key={m.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-center"
              >
                <div className="flex justify-center text-muted-foreground mb-1">{m.icon}</div>
                <p className="text-foreground font-bold text-sm">
                  {m.value >= 1000 ? `${(m.value / 1000).toFixed(1)}k` : m.value}
                </p>
                <p className="text-muted-foreground text-[9px]">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className={`rounded-xl p-4 border mb-4 ${engagementBg}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${engagementColor}`} />
            <span className={`font-bold text-lg ${engagementColor}`}>{metrics.engagement}/100</span>
          </div>
          <span className={`text-xs font-bold ${engagementColor}`}>
            {metrics.engagement >= 65 ? "🔥 Excelente" : metrics.engagement >= 40 ? "👍 Bueno" : "📉 Mejorable"}
          </span>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">{metrics.feedback}</p>
      </motion.div>

      {/* Suggestions */}
      {metrics.suggestions?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl p-4 border border-border mb-4"
        >
          <p className="text-foreground text-xs font-bold mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-coral" />
            Sugerencias para mejorar:
          </p>
          <ul className="space-y-1.5">
            {metrics.suggestions.map((s, i) => (
              <li key={i} className="text-muted-foreground text-xs flex items-start gap-2">
                <span className="text-coral">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <Button
        onClick={onNext}
        className="w-full bg-gradient-sunset hover:opacity-90 text-primary-foreground font-bold py-5"
      >
        {isLast ? (
          <>Ver mis resultados finales</>
        ) : (
          <>
            Siguiente reto
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </motion.div>
  );
}
