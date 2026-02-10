import { motion, AnimatePresence } from "framer-motion";
import { getLevel, getNextLevel, getLevelProgress } from "@/data/gamificationData";

interface Props {
  totalXP: number;
  xpGained: number;
}

export function XPBar({ totalXP, xpGained }: Props) {
  const level = getLevel(totalXP);
  const next = getNextLevel(totalXP);
  const progress = getLevelProgress(totalXP);

  return (
    <div className="flex items-center gap-3 w-full max-w-xs">
      <span className="text-lg" title={level.name}>{level.emoji}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-bold text-foreground">{level.name}</span>
          <div className="flex items-center gap-1">
            <AnimatePresence>
              {xpGained > 0 && (
                <motion.span
                  key={totalXP}
                  initial={{ opacity: 0, y: 6, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5 }}
                  className="text-[10px] font-bold text-coral"
                >
                  +{xpGained} XP
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-[10px] text-muted-foreground">{totalXP} XP</span>
          </div>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-coral rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        {next && (
          <p className="text-[9px] text-muted-foreground mt-0.5">
            {next.minXP - totalXP} XP para {next.emoji} {next.name}
          </p>
        )}
      </div>
    </div>
  );
}
