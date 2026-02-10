import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PUZZLE_LEVELS } from "@/data/puzzleData";
import { PuzzleBoard } from "./PuzzleBoard";

interface LevelResult {
  score: number;
  correct: number;
  total: number;
  timeRemaining: number;
}

interface Props {
  onFinish: (results: LevelResult[]) => void;
}

export function PuzzleGame({ onFinish }: Props) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [results, setResults] = useState<LevelResult[]>([]);

  const handleLevelComplete = (score: number, correct: number, total: number, timeRemaining: number) => {
    const newResults = [...results, { score, correct, total, timeRemaining }];
    setResults(newResults);

    if (currentLevel < PUZZLE_LEVELS.length - 1) {
      setCurrentLevel((prev) => prev + 1);
    } else {
      onFinish(newResults);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <PuzzleBoard
        key={PUZZLE_LEVELS[currentLevel].id}
        level={PUZZLE_LEVELS[currentLevel]}
        onComplete={handleLevelComplete}
      />
    </AnimatePresence>
  );
}
