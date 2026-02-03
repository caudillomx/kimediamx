import { motion, AnimatePresence } from "framer-motion";
import { QuizQuestion } from "@/data/quizQuestions";

interface QuizCardProps {
  question: QuizQuestion;
  currentAnswer: number | null;
  onAnswer: (questionId: string, score: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function QuizCard({ 
  question, 
  currentAnswer, 
  onAnswer, 
  questionNumber, 
  totalQuestions 
}: QuizCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Pregunta {questionNumber} de {totalQuestions}</span>
            <span>{Math.round((questionNumber / totalQuestions) * 100)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-coral"
              initial={{ width: 0 }}
              animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = currentAnswer === option.score;
            return (
              <motion.button
                key={index}
                onClick={() => onAnswer(question.id, option.score)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full p-4 text-left rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "bg-coral/10 border-coral text-foreground"
                    : "bg-card border-border hover:border-coral/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-coral bg-coral"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </div>
                  <span className="flex-1">{option.text}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
