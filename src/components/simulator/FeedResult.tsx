import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformFeed } from "./PlatformFeed";
import { type SimChallenge, type SimMetrics, platformIcons, platformNames } from "@/data/simulatorData";

interface Props {
  challenge: SimChallenge;
  userPost: string;
  visualDescription?: string;
  metrics: SimMetrics;
  round: number;
  totalRounds: number;
  onNext: () => void;
  isLast: boolean;
}

export function FeedResult({ challenge, userPost, visualDescription, metrics, round, totalRounds, onNext, isLast }: Props) {
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

      {/* Platform-specific feed mockup */}
      <div className="mb-4">
        <PlatformFeed
          platform={challenge.platform}
          userPost={userPost}
          visualDescription={visualDescription}
          metrics={metrics}
        />
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

      {/* Visual feedback */}
      {metrics.visualFeedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-4 border border-magenta/20 mb-4"
        >
          <p className="text-foreground text-xs font-bold mb-1.5 flex items-center gap-2">
            🎨 Feedback visual:
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">{metrics.visualFeedback}</p>
        </motion.div>
      )}

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
