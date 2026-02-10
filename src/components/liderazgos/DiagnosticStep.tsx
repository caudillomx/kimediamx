import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { diagnosticQuestions, getDiagnosticLevel } from "@/data/liderazgosData";

interface DiagnosticStepProps {
  onNext: (score: number, level: string) => void;
}

export function DiagnosticStep({ onNext }: DiagnosticStepProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const allAnswered = diagnosticQuestions.every((q) => answers[q.id] !== undefined);
  const totalScore = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const result = getDiagnosticLevel(totalScore);
  const progress = (Object.keys(answers).length / diagnosticQuestions.length) * 100;

  const handleShowResult = () => setShowResult(true);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <Activity className="w-7 h-7 text-coral" />
        </div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">
          Diagnóstico de visibilidad
        </h2>
        <p className="text-muted-foreground text-sm">Responde honestamente para obtener tu nivel</p>
      </div>

      <Progress value={progress} className="mb-6 h-2" />

      {!showResult ? (
        <>
          <div className="space-y-6">
            {diagnosticQuestions.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card rounded-xl p-4 border border-border"
              >
                <p className="text-foreground font-medium text-sm mb-3">
                  {idx + 1}. {q.question}
                </p>
                <RadioGroup
                  value={answers[q.id]?.toString()}
                  onValueChange={(v) => setAnswers({ ...answers, [q.id]: parseInt(v) })}
                  className="space-y-2"
                >
                  {q.options.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={opt.value.toString()} id={`q${q.id}-${opt.value}`} />
                      <Label htmlFor={`q${q.id}-${opt.value}`} className="text-sm text-muted-foreground cursor-pointer">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={handleShowResult}
            disabled={!allAnswered}
            className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6 mt-6"
          >
            Ver mi resultado
          </Button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-card rounded-2xl p-8 border border-border mb-6">
            <div className={`w-20 h-20 rounded-full ${result.color} mx-auto mb-4 flex items-center justify-center`}>
              <span className="text-white font-display font-bold text-2xl">{totalScore}</span>
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-1">{result.label}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{result.message}</p>
          </div>

          <Button
            onClick={() => onNext(totalScore, result.level)}
            className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6"
          >
            Construir mi mensaje <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
