import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  diagnosticQuestions, getDiagnosticLevel, frequencyOptions, perceptionOptions, goalOptions,
} from "@/data/brandKitData";

interface BrandDiagnosticStepProps {
  onNext: (score: number, level: string, extras: { frequency: string; perception: string; goal: string }) => void;
}

export function BrandDiagnosticStep({ onNext }: BrandDiagnosticStepProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [frequency, setFrequency] = useState("");
  const [perception, setPerception] = useState("");
  const [goal, setGoal] = useState("");
  const [showResult, setShowResult] = useState(false);

  const allAnswered = diagnosticQuestions.every(q => answers[q.id] !== undefined);
  const allExtras = frequency && perception && goal;
  const canProceed = allAnswered && allExtras;
  const totalScore = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const result = getDiagnosticLevel(totalScore);
  const totalFields = diagnosticQuestions.length + 3;
  const filledFields = Object.keys(answers).length + (frequency ? 1 : 0) + (perception ? 1 : 0) + (goal ? 1 : 0);
  const progress = Math.round((filledFields / totalFields) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-5"
        >
          <Activity className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          Diagnóstico de <span className="text-gradient">marca personal</span>
        </h2>
        <p className="text-muted-foreground text-sm">Responde honestamente para conocer tu nivel</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-coral rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground w-10 text-right">{progress}%</span>
      </div>

      {!showResult ? (
        <>
          <div className="space-y-4">
            {diagnosticQuestions.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-secondary rounded-2xl p-4 border border-border"
              >
                <p className="text-foreground font-medium text-sm mb-3">
                  <span className="text-primary mr-1.5">{idx + 1}.</span> {q.question}
                </p>
                <div className="space-y-1.5">
                  {q.options.map(opt => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setAnswers({ ...answers, [q.id]: opt.value })}
                      className={`w-full text-left rounded-xl px-4 py-2.5 text-sm transition-all border ${
                        answers[q.id] === opt.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-transparent bg-card text-muted-foreground hover:text-foreground hover:bg-card/80"
                      }`}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Extra questions */}
            {[
              { label: "¿Con qué frecuencia publicas contenido?", value: frequency, setter: setFrequency, options: frequencyOptions.map(o => ({ label: o.label, value: o.value })) },
              { label: "¿Cómo crees que te percibe tu audiencia?", value: perception, setter: setPerception, options: perceptionOptions.map(o => ({ label: o, value: o })) },
              { label: "¿Tu objetivo principal en los próximos 90 días?", value: goal, setter: setGoal, options: goalOptions.map(o => ({ label: o, value: o })) },
            ].map((extra, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (diagnosticQuestions.length + i) * 0.03 }}
                className="bg-secondary rounded-2xl p-4 border border-primary/20"
              >
                <p className="text-foreground font-medium text-sm mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> {extra.label}
                </p>
                <div className="space-y-1.5">
                  {extra.options.map(opt => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => extra.setter(opt.value)}
                      className={`w-full text-left rounded-xl px-4 py-2.5 text-sm transition-all border ${
                        extra.value === opt.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-transparent bg-card text-muted-foreground hover:text-foreground hover:bg-card/80"
                      }`}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={() => setShowResult(true)}
            disabled={!canProceed}
            className="w-full bg-gradient-coral text-primary-foreground font-bold rounded-xl h-12 mt-8 shadow-glow hover:shadow-glow-lg transition-all"
          >
            Ver mi resultado
          </Button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="bg-secondary rounded-3xl p-10 border border-border mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className={`w-24 h-24 rounded-full ${result.color} mx-auto mb-5 flex items-center justify-center shadow-lg`}
            >
              <span className="text-white font-display font-bold text-3xl">{totalScore}</span>
            </motion.div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">{result.label}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">{result.message}</p>
          </div>

          <Button
            onClick={() => onNext(totalScore, result.level, { frequency, perception, goal })}
            className="w-full bg-gradient-coral text-primary-foreground font-bold rounded-xl h-12 shadow-glow hover:shadow-glow-lg transition-all"
          >
            Construir mi identidad <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
