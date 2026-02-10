import { useState, useCallback } from "react";
import { STEP_XP, getLevel, Badge } from "@/data/gamificationData";

export function useKitGamification(badges: Badge[]) {
  const [totalXP, setTotalXP] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [latestBadge, setLatestBadge] = useState<Badge | null>(null);
  const [xpGained, setXpGained] = useState(0);

  const completeStep = useCallback(
    (stepName: string) => {
      const xp = STEP_XP[stepName] || 50;
      setTotalXP((prev) => prev + xp);
      setXpGained(xp);

      const badge = badges.find((b) => b.unlocksAtStep === stepName);
      if (badge && !unlockedBadges.find((b) => b.id === badge.id)) {
        setUnlockedBadges((prev) => [...prev, badge]);
        setLatestBadge(badge);
        // auto-clear after animation
        setTimeout(() => setLatestBadge(null), 3000);
      }
    },
    [badges, unlockedBadges]
  );

  const dismissBadge = useCallback(() => setLatestBadge(null), []);

  return {
    totalXP,
    xpGained,
    unlockedBadges,
    latestBadge,
    dismissBadge,
    completeStep,
    level: getLevel(totalXP),
  };
}
