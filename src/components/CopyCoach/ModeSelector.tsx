import { motion } from "framer-motion";
import { PenLine, Sparkles } from "lucide-react";

type Mode = "review" | "generate";

interface ModeSelectorProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

const ModeSelector = ({ mode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-lg">
      <button
        onClick={() => onModeChange("review")}
        className="relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
      >
        {mode === "review" && (
          <motion.div
            layoutId="mode-bg"
            className="absolute inset-0 rounded-md bg-card border border-border"
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          />
        )}
        <span className={`relative z-10 flex items-center gap-2 ${mode === "review" ? "text-foreground" : "text-muted-foreground"}`}>
          <PenLine className="w-4 h-4" />
          Revisar Copy
        </span>
      </button>
      <button
        onClick={() => onModeChange("generate")}
        className="relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
      >
        {mode === "generate" && (
          <motion.div
            layoutId="mode-bg"
            className="absolute inset-0 rounded-md bg-card border border-border"
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          />
        )}
        <span className={`relative z-10 flex items-center gap-2 ${mode === "generate" ? "text-foreground" : "text-muted-foreground"}`}>
          <Sparkles className="w-4 h-4" />
          Generar Copy
        </span>
      </button>
    </div>
  );
};

export default ModeSelector;
