import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { TriviaIntro } from "@/components/trivia/TriviaIntro";
import { TriviaGame } from "@/components/trivia/TriviaGame";
import { TriviaResult } from "@/components/trivia/TriviaResult";
import { personalBrandQuestions, pymeQuestions, shuffleArray, type TriviaQuestion } from "@/data/triviaData";
import kimediaLogo from "@/assets/kimedia-logo.png";

type Phase = "intro" | "playing" | "result";
type Mode = "personal" | "pyme";

const QUESTIONS_PER_GAME = 10;

export default function BrandTrivia() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [mode, setMode] = useState<Mode>("personal");
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalStreak, setFinalStreak] = useState(0);

  const handleStart = (selectedMode: Mode) => {
    setMode(selectedMode);
    const pool = selectedMode === "personal" ? personalBrandQuestions : pymeQuestions;
    setQuestions(shuffleArray(pool).slice(0, QUESTIONS_PER_GAME));
    setPhase("playing");
  };

  const handleGameEnd = (score: number, bestStreak: number) => {
    setFinalScore(score);
    setFinalStreak(bestStreak);
    setPhase("result");
  };

  const handleReplay = () => {
    setPhase("intro");
    setFinalScore(0);
    setFinalStreak(0);
  };

  return (
    <div className="min-h-screen bg-background bg-mesh relative">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={kimediaLogo} alt="KiMedia" className="h-6 w-auto" />
          </Link>
          <span className="text-xs text-muted-foreground font-medium">🎮 Trivia de Marca</span>
        </div>
      </div>

      <div className="pt-20 pb-12 px-4 min-h-screen flex items-center">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {phase === "intro" && <TriviaIntro key="intro" onStart={handleStart} />}
            {phase === "playing" && (
              <TriviaGame key="playing" questions={questions} onEnd={handleGameEnd} />
            )}
            {phase === "result" && (
              <TriviaResult
                key="result"
                score={finalScore}
                totalQuestions={QUESTIONS_PER_GAME}
                bestStreak={finalStreak}
                mode={mode}
                onReplay={handleReplay}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
