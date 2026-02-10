import { motion } from "framer-motion";
import type { Badge } from "@/data/gamificationData";

interface Props {
  allBadges: Badge[];
  unlockedBadges: Badge[];
}

export function BadgeCollection({ allBadges, unlockedBadges }: Props) {
  const unlockedIds = new Set(unlockedBadges.map((b) => b.id));

  return (
    <div className="flex items-center gap-1.5">
      {allBadges.map((badge) => {
        const unlocked = unlockedIds.has(badge.id);
        return (
          <motion.div
            key={badge.id}
            title={unlocked ? `${badge.name}: ${badge.description}` : "???"}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
              unlocked ? "bg-secondary" : "bg-secondary/40 grayscale opacity-40"
            }`}
            animate={unlocked ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {unlocked ? badge.emoji : "🔒"}
          </motion.div>
        );
      })}
    </div>
  );
}
