import { motion, AnimatePresence } from "framer-motion";
import type { Badge } from "@/data/gamificationData";

interface Props {
  badge: Badge | null;
  onDismiss: () => void;
}

export function BadgeUnlock({ badge, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={onDismiss}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] cursor-pointer"
        >
          <div className="bg-card border border-border rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3">
            <motion.span
              className="text-3xl"
              animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6 }}
            >
              {badge.emoji}
            </motion.span>
            <div>
              <p className="text-[10px] text-coral font-bold uppercase tracking-wider">¡Badge desbloqueado!</p>
              <p className="text-sm font-bold text-foreground">{badge.name}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
