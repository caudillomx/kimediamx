import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type PuzzleLevel, type PuzzlePiece, calculatePuzzleScore } from "@/data/puzzleData";

interface Props {
  level: PuzzleLevel;
  onComplete: (score: number, correct: number, total: number, timeRemaining: number) => void;
}

export function PuzzleBoard({ level, onComplete }: Props) {
  const [shuffledPieces, setShuffledPieces] = useState<PuzzlePiece[]>([]);
  const [placements, setPlacements] = useState<Record<string, PuzzlePiece | null>>({});
  const [draggedPiece, setDraggedPiece] = useState<PuzzlePiece | null>(null);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number; score: number } | null>(null);

  useEffect(() => {
    const shuffled = [...level.pieces].sort(() => Math.random() - 0.5);
    setShuffledPieces(shuffled);
    const initial: Record<string, PuzzlePiece | null> = {};
    level.slots.forEach((s) => (initial[s.id] = null));
    setPlacements(initial);
    setTimeLeft(level.timeLimit);
    setIsFinished(false);
    setResults(null);
  }, [level]);

  useEffect(() => {
    if (isFinished) return;
    if (timeLeft <= 0) {
      finishLevel();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const finishLevel = useCallback(() => {
    setIsFinished(true);
    let correct = 0;
    level.slots.forEach((slot, i) => {
      const placed = placements[slot.id];
      if (placed && placed.category === slot.category && placed.id === level.pieces[i].id) {
        correct++;
      } else if (placed && placed.category === slot.category) {
        correct += 0.5;
      }
    });
    const roundedCorrect = Math.round(correct);
    const score = calculatePuzzleScore(correct, level.slots.length, Math.max(0, timeLeft), level.timeLimit);
    setResults({ correct: roundedCorrect, total: level.slots.length, score });
  }, [level, placements, timeLeft]);

  // Check if all slots filled
  useEffect(() => {
    if (isFinished) return;
    const allFilled = level.slots.every((s) => placements[s.id] !== null);
    if (allFilled) finishLevel();
  }, [placements, isFinished, level.slots, finishLevel]);

  const handleDragStart = (piece: PuzzlePiece) => {
    setDraggedPiece(piece);
  };

  const handleDrop = (slotId: string) => {
    if (!draggedPiece || isFinished) return;
    // Remove from previous slot if any
    const newPlacements = { ...placements };
    Object.keys(newPlacements).forEach((key) => {
      if (newPlacements[key]?.id === draggedPiece.id) {
        newPlacements[key] = null;
      }
    });
    // If slot already has a piece, put it back
    const existing = newPlacements[slotId];
    newPlacements[slotId] = draggedPiece;
    setPlacements(newPlacements);

    // Update available pieces
    setShuffledPieces((prev) => {
      let updated = prev.filter((p) => p.id !== draggedPiece.id);
      if (existing) updated = [...updated, existing];
      return updated;
    });
    setDraggedPiece(null);
  };

  const handlePieceClick = (piece: PuzzlePiece) => {
    if (isFinished) return;
    // Find first empty slot
    const emptySlot = level.slots.find((s) => !placements[s.id]);
    if (emptySlot) {
      const newPlacements = { ...placements };
      newPlacements[emptySlot.id] = piece;
      setPlacements(newPlacements);
      setShuffledPieces((prev) => prev.filter((p) => p.id !== piece.id));
    }
  };

  const handleSlotClick = (slotId: string) => {
    if (isFinished) return;
    const piece = placements[slotId];
    if (piece) {
      setPlacements((prev) => ({ ...prev, [slotId]: null }));
      setShuffledPieces((prev) => [...prev, piece]);
    }
  };

  const timerPercent = (timeLeft / level.timeLimit) * 100;
  const timerColor = timeLeft <= 5 ? "text-red-500" : timeLeft <= 10 ? "text-amber-500" : "text-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-coral font-bold uppercase tracking-wider">Nivel {level.id}</p>
          <h2 className="font-display text-lg font-bold text-foreground">
            {level.emoji} {level.name}
          </h2>
        </div>
        <div className={`flex items-center gap-2 ${timerColor} font-mono text-xl font-bold`}>
          <Clock className="w-5 h-5" />
          {timeLeft}s
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 bg-secondary rounded-full mb-6 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-amber-500" : "bg-gradient-coral"}`}
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <p className="text-sm text-muted-foreground text-center mb-4">{level.description}</p>

      {/* Slots */}
      <div className="grid gap-2 mb-6">
        {level.slots.map((slot, i) => {
          const placed = placements[slot.id];
          const isCorrect = placed && placed.id === level.pieces[i].id;
          return (
            <motion.div
              key={slot.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(slot.id)}
              onClick={() => handleSlotClick(slot.id)}
              className={`border-2 border-dashed rounded-xl p-3 flex items-center gap-3 transition-all min-h-[56px] cursor-pointer ${
                placed
                  ? isFinished
                    ? isCorrect
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-red-500/50 bg-red-500/10"
                    : "border-coral/40 bg-coral/5"
                  : "border-border hover:border-coral/30 hover:bg-secondary/50"
              }`}
              layout
            >
              {placed ? (
                <>
                  <span className="text-xl">{placed.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{placed.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{placed.description}</p>
                  </div>
                  {isFinished && (
                    isCorrect
                      ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      : <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground italic flex-1">{slot.hint}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Available pieces */}
      {!isFinished && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-bold uppercase tracking-wider">
            Piezas disponibles ({shuffledPieces.length})
          </p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {shuffledPieces.map((piece) => (
                <motion.div
                  key={piece.id}
                  draggable
                  onDragStart={() => handleDragStart(piece)}
                  onClick={() => handlePieceClick(piece)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-card border border-border rounded-xl px-3 py-2 cursor-grab active:cursor-grabbing flex items-center gap-2 hover:border-coral/40 transition-colors"
                >
                  <span className="text-lg">{piece.emoji}</span>
                  <span className="text-xs font-bold text-foreground">{piece.label}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Results */}
      {isFinished && results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <div className="bg-card border border-border rounded-2xl p-5 mb-4">
            <p className="text-3xl font-bold text-foreground mb-1">{results.score} pts</p>
            <p className="text-sm text-muted-foreground">
              {results.correct}/{results.total} piezas correctas · {Math.max(0, timeLeft)}s restantes
            </p>
          </div>
          <Button
            onClick={() => onComplete(results.score, results.correct, results.total, Math.max(0, timeLeft))}
            className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-5"
          >
            {level.id < 4 ? "Siguiente nivel" : "Ver resultados"} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
