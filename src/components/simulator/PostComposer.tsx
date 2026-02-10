import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Lightbulb, Loader2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { platformIcons, platformNames, isVisualPlatform, type SimChallenge } from "@/data/simulatorData";

interface Props {
  challenge: SimChallenge;
  round: number;
  totalRounds: number;
  isLoading: boolean;
  onSubmit: (post: string, visualDescription?: string) => void;
}

export function PostComposer({ challenge, round, totalRounds, isLoading, onSubmit }: Props) {
  const [post, setPost] = useState("");
  const [visualDesc, setVisualDesc] = useState("");
  const [showTips, setShowTips] = useState(false);

  const maxChars = challenge.platform === "twitter" ? 280 : 2200;
  const charPct = (post.length / maxChars) * 100;
  const needsVisual = isVisualPlatform(challenge.platform);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Round indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-muted-foreground text-xs font-medium">
          Reto {round} de {totalRounds}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-lg">{platformIcons[challenge.platform]}</span>
          <span className="text-xs text-coral font-bold">{platformNames[challenge.platform]}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-border rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-sunset"
          initial={{ width: 0 }}
          animate={{ width: `${(round / totalRounds) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Scenario card */}
      <div className="bg-card rounded-2xl p-5 border border-border mb-4">
        <p className="text-foreground text-sm leading-relaxed mb-3">{challenge.scenario}</p>
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-coral text-xs font-bold mb-1">🎯 Objetivo:</p>
          <p className="text-muted-foreground text-xs leading-relaxed">{challenge.objective}</p>
        </div>
      </div>

      {/* Tips toggle */}
      <button
        type="button"
        onClick={() => setShowTips(!showTips)}
        className="flex items-center gap-2 text-muted-foreground hover:text-coral transition-colors mb-3 text-xs"
      >
        <Lightbulb className="w-3.5 h-3.5" />
        {showTips ? "Ocultar tips" : "Ver tips para este reto"}
      </button>

      {showTips && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-card rounded-xl p-4 border border-coral/20 mb-4"
        >
          <ul className="space-y-2">
            {challenge.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-coral mt-0.5">💡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Visual description for IG/TikTok */}
      {needsVisual && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-3"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Image className="w-3.5 h-3.5 text-magenta" />
            <span className="text-foreground text-xs font-bold">
              {challenge.platform === "tiktok" ? "Describe tu video" : "Describe tu imagen"}
            </span>
            <span className="text-muted-foreground text-[10px]">(La IA evaluará coherencia copy+visual)</span>
          </div>
          <Textarea
            value={visualDesc}
            onChange={(e) => setVisualDesc(e.target.value.slice(0, 300))}
            placeholder={
              challenge.platform === "tiktok"
                ? "Ej: Video de 15s mostrando mi escritorio mientras trabajo, con zoom a la pantalla..."
                : "Ej: Foto mía en la oficina con laptop, sonriendo, fondo minimalista..."
            }
            className="min-h-[70px] bg-card border-border text-foreground text-sm resize-none focus:border-magenta/50"
            disabled={isLoading}
          />
          <span className="text-muted-foreground text-[10px]">{visualDesc.length}/300</span>
        </motion.div>
      )}

      {/* Post composer */}
      <div className="relative mb-2">
        <Textarea
          value={post}
          onChange={(e) => setPost(e.target.value.slice(0, maxChars))}
          placeholder={
            challenge.platform === "tiktok"
              ? "Escribe el caption/guion de tu video..."
              : "Escribe tu publicación aquí..."
          }
          className="min-h-[140px] bg-card border-border text-foreground text-sm resize-none focus:border-coral/50"
          disabled={isLoading}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className={`text-[10px] ${charPct > 90 ? "text-destructive" : "text-muted-foreground"}`}>
            {post.length}/{maxChars}
          </span>
        </div>
      </div>

      <Button
        onClick={() => onSubmit(post, needsVisual ? visualDesc || undefined : undefined)}
        disabled={post.trim().length < 5 || isLoading}
        className="w-full bg-gradient-sunset hover:opacity-90 text-primary-foreground font-bold py-5"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analizando tu post...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Publicar
          </>
        )}
      </Button>
    </motion.div>
  );
}
