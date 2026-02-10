import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Zap, Timer, CheckCircle2, XCircle } from "lucide-react";
import { type TriviaQuestion, categoryIcons } from "@/data/triviaData";

interface Props {
  questions: TriviaQuestion[];
  onEnd: (score: number, bestStreak: number) => void;
}

const TIMER_SECONDS = 15;
const BASE_XP = 100;
const STREAK_BONUS = 50;

export function TriviaGame({ questions, onEnd }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = questions[currentIndex];

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (showFeedback) return;
      if (timerRef.current) clearInterval(timerRef.current);

      const correct = optionIndex === q.correctIndex;
      setSelected(optionIndex);
      setIsCorrect(correct);
      setShowFeedback(true);

      if (correct) {
        const xp = BASE_XP + streak * STREAK_BONUS;
        setScore((s) => s + xp);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
      } else {
        setStreak(0);
        setLives((l) => l - 1);
      }
    },
    [showFeedback, q, streak]
  );

  const handleTimeout = useCallback(() => {
    if (showFeedback) return;
    setSelected(-1);
    setIsCorrect(false);
    setShowFeedback(true);
    setStreak(0);
    setLives((l) => l - 1);
  }, [showFeedback]);

  // Timer
  useEffect(() => {
    if (showFeedback) return;
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, showFeedback, handleTimeout]);

  // Auto-advance after feedback
  useEffect(() => {
    if (!showFeedback) return;
    const timeout = setTimeout(() => {
      if (lives <= 0 || currentIndex >= questions.length - 1) {
        onEnd(score + (isCorrect ? 0 : 0), bestStreak);
      } else {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
        setShowFeedback(false);
      }
    }, 2200);
    return () => clearTimeout(timeout);
  }, [showFeedback, lives, currentIndex, questions.length, score, bestStreak, onEnd, isCorrect]);

  // Game over check
  useEffect(() => {
    if (lives <= 0 && showFeedback) {
      const timeout = setTimeout(() => onEnd(score, bestStreak), 2200);
      return () => clearTimeout(timeout);
    }
  }, [lives, showFeedback, score, bestStreak, onEnd]);

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-amber-500" : "bg-green-500";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* HUD */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-6 h-6 transition-all ${
                i < lives ? "text-red-500 fill-red-500" : "text-muted-foreground/30"
              } ${i === lives && showFeedback && !isCorrect ? "animate-ping" : ""}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <motion.div
              key={streak}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-amber-500/20 text-amber-400 rounded-full px-3 py-1 text-xs font-bold"
            >
              <Zap className="w-3 h-3" /> x{streak}
            </motion.div>
          )}
          <div className="bg-card rounded-full px-4 py-1.5 border border-border">
            <span className="text-foreground font-bold text-sm">{score.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-2 bg-border rounded-full mb-6 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${timerColor} transition-colors`}
          style={{ width: `${timerPct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-muted-foreground text-xs font-medium">
          Pregunta {currentIndex + 1} de {questions.length}
        </span>
        <span className="text-muted-foreground text-xs flex items-center gap-1">
          <Timer className="w-3 h-3" /> {timeLeft}s
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-card rounded-2xl p-6 border border-border mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{categoryIcons[q.category]}</span>
              <span className="text-[10px] text-coral font-bold uppercase tracking-wide">{q.category}</span>
            </div>
            <h2 className="text-foreground font-bold text-base md:text-lg leading-snug">{q.question}</h2>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {q.options.map((option, i) => {
              let borderClass = "border-border bg-card hover:border-coral/40";
              let textClass = "text-foreground";

              if (showFeedback) {
                if (i === q.correctIndex) {
                  borderClass = "border-green-500 bg-green-500/10";
                  textClass = "text-green-400";
                } else if (i === selected && !isCorrect) {
                  borderClass = "border-red-500 bg-red-500/10";
                  textClass = "text-red-400";
                } else {
                  borderClass = "border-border/50 bg-card/50 opacity-50";
                  textClass = "text-muted-foreground";
                }
              } else if (selected === i) {
                borderClass = "border-coral bg-coral/10";
              }

              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAnswer(i)}
                  disabled={showFeedback}
                  className={`w-full rounded-xl p-4 text-left transition-all border flex items-center gap-3 ${borderClass}`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    showFeedback && i === q.correctIndex
                      ? "bg-green-500 text-white"
                      : showFeedback && i === selected && !isCorrect
                      ? "bg-red-500 text-white"
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {showFeedback && i === q.correctIndex ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : showFeedback && i === selected && !isCorrect ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </span>
                  <span className={`text-sm font-medium ${textClass}`}>{option}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback explanation */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className={`rounded-xl p-4 border ${
                  isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {isCorrect ? (
                      <span className="text-green-400 font-bold text-sm">✅ ¡Correcto! +{BASE_XP + (streak - 1) * STREAK_BONUS} XP</span>
                    ) : selected === -1 ? (
                      <span className="text-red-400 font-bold text-sm">⏰ ¡Tiempo agotado!</span>
                    ) : (
                      <span className="text-red-400 font-bold text-sm">❌ Incorrecto</span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{q.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
