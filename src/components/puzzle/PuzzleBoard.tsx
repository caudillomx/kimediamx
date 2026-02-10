import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, XCircle, ArrowRight, Flame, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type PuzzleLevel, type PuzzlePiece, PUZZLE_CATEGORIES, calculatePuzzleScore } from "@/data/puzzleData";

interface Props {
  level: PuzzleLevel;
  onComplete: (score: number, correct: number, total: number, timeRemaining: number) => void;
}

function CategoryBadge({ category }: { category: PuzzlePiece["category"] }) {
  const cat = PUZZLE_CATEGORIES[category];
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
      {cat.emoji} {cat.label}
    </span>
  );
}

export function PuzzleBoard({ level, onComplete }: Props) {
  const [availablePieces, setAvailablePieces] = useState<PuzzlePiece[]>([]);
  const [placements, setPlacements] = useState<Record<string, PuzzlePiece | null>>({});
  const [selectedPiece, setSelectedPiece] = useState<PuzzlePiece | null>(null);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number; score: number } | null>(null);
  const [combo, setCombo] = useState(0);
  const [shakeSlot, setShakeSlot] = useState<string | null>(null);
  const [flashCorrect, setFlashCorrect] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize level
  useEffect(() => {
    const shuffled = [...level.pieces].sort(() => Math.random() - 0.5);
    setAvailablePieces(shuffled);
    const initial: Record<string, PuzzlePiece | null> = {};
    level.slots.forEach((s) => (initial[s.id] = null));
    setPlacements(initial);
    setTimeLeft(level.timeLimit);
    setIsFinished(false);
    setResults(null);
    setCombo(0);
    setSelectedPiece(null);
  }, [level]);

  // Timer
  useEffect(() => {
    if (isFinished) return;
    if (timeLeft <= 0) {
      finishLevel();
      return;
    }
    timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, isFinished]);

  const finishLevel = useCallback(() => {
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
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

  // Check all slots filled
  useEffect(() => {
    if (isFinished) return;
    const allFilled = level.slots.every((s) => placements[s.id] !== null);
    if (allFilled) finishLevel();
  }, [placements, isFinished, level.slots, finishLevel]);

  // Select a piece
  const handleSelectPiece = (piece: PuzzlePiece) => {
    if (isFinished) return;
    setSelectedPiece(selectedPiece?.id === piece.id ? null : piece);
  };

  // Place selected piece into a slot
  const handleSlotTap = (slotId: string) => {
    if (isFinished) return;

    const existing = placements[slotId];
    if (existing && !selectedPiece) {
      setPlacements((prev) => ({ ...prev, [slotId]: null }));
      setAvailablePieces((prev) => [...prev, existing]);
      return;
    }

    if (selectedPiece) {
      const newPlacements = { ...placements };
      Object.keys(newPlacements).forEach((key) => {
        if (newPlacements[key]?.id === selectedPiece.id) {
          newPlacements[key] = null;
        }
      });

      if (existing) {
        setAvailablePieces((prev) => [...prev.filter(p => p.id !== selectedPiece.id), existing]);
      } else {
        setAvailablePieces((prev) => prev.filter(p => p.id !== selectedPiece.id));
      }

      newPlacements[slotId] = selectedPiece;
      setPlacements(newPlacements);

      const slot = level.slots.find(s => s.id === slotId);
      if (slot && selectedPiece.category === slot.category) {
        setCombo(c => c + 1);
        setFlashCorrect(slotId);
        setTimeout(() => setFlashCorrect(null), 600);
      } else {
        setCombo(0);
        setShakeSlot(slotId);
        setTimeout(() => setShakeSlot(null), 500);
      }

      setSelectedPiece(null);
    }
  };

  // HTML5 drag and drop
  const handleDragStart = (e: React.DragEvent, piece: PuzzlePiece) => {
    setSelectedPiece(piece);
    e.dataTransfer.setData("text/plain", piece.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    const pieceId = e.dataTransfer.getData("text/plain");
    const piece = [...availablePieces, ...Object.values(placements).filter(Boolean) as PuzzlePiece[]]
      .find(p => p.id === pieceId);
    if (piece) {
      setSelectedPiece(piece);
      queueMicrotask(() => handleSlotTap(slotId));
    }
  };

  const timerPercent = (timeLeft / level.timeLimit) * 100;
  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 10 && !isUrgent;
  const filledCount = Object.values(placements).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Compact header: level + timer in one row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{level.emoji}</span>
          <div>
            <p className="text-[10px] text-coral font-bold uppercase tracking-wider">
              Nivel {level.id}/4
            </p>
            <h2 className="font-display text-sm font-bold text-foreground leading-tight">
              {level.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {combo >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-coral text-primary-foreground"
            >
              <Flame className="w-3 h-3" /> x{combo}
            </motion.div>
          )}
          <span className="text-[10px] text-muted-foreground font-mono">
            {filledCount}/{level.slots.length}
          </span>
          <motion.div
            className={`flex items-center gap-1.5 font-mono text-lg font-bold rounded-lg px-2.5 py-1 ${
              isUrgent
                ? "bg-destructive/20 text-destructive"
                : isWarning
                ? "bg-amber-500/20 text-amber-400"
                : "bg-secondary text-foreground"
            }`}
            animate={isUrgent ? { scale: [1, 1.08, 1] } : {}}
            transition={isUrgent ? { duration: 0.5, repeat: Infinity } : {}}
          >
            <Clock className={`w-4 h-4 ${isUrgent ? "animate-spin" : ""}`} />
            <span>{timeLeft}s</span>
          </motion.div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 bg-secondary rounded-full mb-3 overflow-hidden relative">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${
            isUrgent ? "bg-destructive" : isWarning ? "bg-amber-500" : "bg-gradient-coral"
          }`}
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* ===== PIECES FIRST (top) ===== */}
      {!isFinished && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-coral font-bold uppercase tracking-wider">
              ① Elige una pieza
            </p>
            <p className="text-[10px] text-muted-foreground">
              {availablePieces.length} disponibles
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence mode="popLayout">
              {availablePieces.map((piece) => {
                const isSelected = selectedPiece?.id === piece.id;
                return (
                  <motion.button
                    key={piece.id}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, piece)}
                    onClick={() => handleSelectPiece(piece)}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: isSelected ? 1.05 : 1,
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 cursor-grab active:cursor-grabbing transition-all select-none text-left ${
                      isSelected
                        ? "bg-coral/20 border-2 border-coral shadow-glow ring-2 ring-coral/30"
                        : "bg-card border border-border hover:border-coral/40"
                    }`}
                    layout
                  >
                    <span className="text-base">{piece.emoji}</span>
                    <div>
                      <span className="text-[11px] font-bold text-foreground block leading-tight">{piece.label}</span>
                      <span className="text-[9px] text-muted-foreground leading-tight">{piece.description}</span>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
          {availablePieces.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-coral font-medium text-center py-2"
            >
              🎯 ¡Todas colocadas! Evaluando...
            </motion.p>
          )}
        </div>
      )}

      {/* Arrow indicator when piece is selected */}
      {!isFinished && selectedPiece && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-2"
        >
          <ArrowDown className="w-4 h-4 text-coral animate-bounce" />
          <p className="text-xs text-coral font-bold">
            Ahora toca un espacio abajo para colocar "{selectedPiece.label}"
          </p>
          <ArrowDown className="w-4 h-4 text-coral animate-bounce" />
        </motion.div>
      )}

      {/* Instruction when no piece selected */}
      {!isFinished && !selectedPiece && filledCount === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-2"
        >
          <p className="text-[11px] text-muted-foreground">
            👆 Toca una pieza arriba para seleccionarla, luego colócala en su espacio abajo
          </p>
        </motion.div>
      )}

      {/* ===== SLOTS (bottom) ===== */}
      <div className="mb-2">
        {!isFinished && (
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">
            ② Colócala en su lugar
          </p>
        )}
        <div className="grid gap-1.5">
          {level.slots.map((slot, i) => {
            const placed = placements[slot.id];
            const isCorrect = placed && placed.id === level.pieces[i].id;
            const isCategoryMatch = placed && placed.category === slot.category;
            const isShaking = shakeSlot === slot.id;
            const isFlashing = flashCorrect === slot.id;

            return (
              <motion.div
                key={slot.id}
                onClick={() => handleSlotTap(slot.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slot.id)}
                className={`border-2 border-dashed rounded-xl px-3 py-2.5 flex items-center gap-2.5 transition-all min-h-[48px] cursor-pointer select-none ${
                  placed
                    ? isFinished
                      ? isCorrect
                        ? "border-green-500/60 bg-green-500/10"
                        : isCategoryMatch
                        ? "border-amber-500/60 bg-amber-500/10"
                        : "border-destructive/50 bg-destructive/10"
                      : "border-coral/40 bg-coral/5"
                    : selectedPiece
                    ? "border-coral/50 bg-coral/5 hover:bg-coral/10 hover:border-coral/70 animate-pulse"
                    : "border-border hover:border-muted-foreground/30 hover:bg-secondary/50"
                }`}
                animate={
                  isShaking
                    ? { x: [0, -6, 6, -4, 4, 0] }
                    : isFlashing
                    ? { scale: [1, 1.03, 1] }
                    : {}
                }
                transition={{ duration: 0.4 }}
                layout
              >
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-sm shrink-0">
                  {placed ? placed.emoji : <span className="text-muted-foreground/50 text-xs">{i + 1}</span>}
                </div>
                {placed ? (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{placed.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{placed.description}</p>
                    </div>
                    {isFinished && (
                      isCorrect ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        </motion.div>
                      ) : (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <XCircle className="w-4 h-4 text-destructive shrink-0" />
                        </motion.div>
                      )
                    )}
                  </>
                ) : (
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <p className="text-[11px] text-muted-foreground italic truncate">{slot.hint}</p>
                    <CategoryBadge category={slot.category} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {isFinished && results && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="mt-4 text-center"
        >
          <div className="bg-card border border-border rounded-2xl p-5 mb-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-glow opacity-30" />
            <div className="relative">
              <motion.p
                className="text-3xl font-bold text-foreground mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                {results.score} <span className="text-sm text-muted-foreground">pts</span>
              </motion.p>
              <p className="text-xs text-muted-foreground">
                ✅ {results.correct}/{results.total} piezas · ⏱️ {Math.max(0, timeLeft)}s restantes
              </p>
              {results.score >= 70 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-coral font-bold mt-1"
                >
                  🔥 ¡Excelente nivel!
                </motion.p>
              )}
            </div>
          </div>
          <Button
            onClick={() => onComplete(results.score, results.correct, results.total, Math.max(0, timeLeft))}
            className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-4 text-sm"
          >
            {level.id < 4 ? (
              <>Siguiente nivel <ArrowRight className="w-4 h-4 ml-2" /></>
            ) : (
              <>🏆 Ver resultados finales</>
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
