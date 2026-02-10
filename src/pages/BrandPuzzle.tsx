import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import kimediaLogo from "@/assets/kimedia-logo.png";
import { PuzzleIntro } from "@/components/puzzle/PuzzleIntro";
import { PuzzleGame } from "@/components/puzzle/PuzzleGame";
import { PuzzleResult } from "@/components/puzzle/PuzzleResult";

type Phase = "intro" | "playing" | "result";

interface LevelResult {
  score: number;
  correct: number;
  total: number;
  timeRemaining: number;
}

export default function BrandPuzzle() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [results, setResults] = useState<LevelResult[]>([]);

  const handleFinish = (res: LevelResult[]) => {
    setResults(res);
    setPhase("result");
  };

  const handleRestart = () => {
    setResults([]);
    setPhase("intro");
  };

  return (
    <div className="min-h-screen bg-background bg-mesh relative">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={kimediaLogo} alt="KiMedia" className="h-6 w-auto" />
          </Link>
          <span className="text-xs text-muted-foreground font-medium">🧩 Construye tu Marca</span>
        </div>
      </div>

      <div className="pt-20 pb-12 px-4 min-h-screen flex items-center">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {phase === "intro" && <PuzzleIntro key="intro" onStart={() => setPhase("playing")} />}
            {phase === "playing" && <PuzzleGame key="game" onFinish={handleFinish} />}
            {phase === "result" && <PuzzleResult key="result" results={results} onRestart={handleRestart} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
