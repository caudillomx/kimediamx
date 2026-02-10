import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { pymeDiagnosticQuestions, getPymeDiagnosticLevel, pymeGoalOptions } from "@/data/pymeKitData";
import { frequencyOptions, perceptionOptions } from "@/data/brandKitData";

interface Props {
  onNext: (score: number, level: string, extras: { frequency: string; perception: string; goal: string }) => void;
}

export function PymeDiagnosticStep({ onNext }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [frequency, setFrequency] = useState("");
  const [perception, setPerception] = useState("");
  const [goal, setGoal] = useState("");
  const [showResult, setShowResult] = useState(false);

  const allAnswered = pymeDiagnosticQuestions.every((q) => answers[q.id] !== undefined);
  const canProceed = allAnswered && frequency && perception && goal;
  const totalScore = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const result = getPymeDiagnosticLevel(totalScore);
  const totalFields = pymeDiagnosticQuestions.length + 3;
  const filledFields = Object.keys(answers).length + (frequency ? 1 : 0) + (perception ? 1 : 0) + (goal ? 1 : 0);
  const progress = (filledFields / totalFields) * 100;

  const pymePerceptionOptions = [
    "Referente en nuestro mercado",
    "Confiable y estable",
    "Poco visible o desconocida",
    "Activa pero sin estrategia clara",
    "Innovadora en su sector",
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="w-full max-w-lg mx-auto">
      <div className="text-center mb-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <Activity className="w-7 h-7 text-coral" />
        </motion.div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">Diagnóstico digital empresarial</h2>
        <p className="text-muted-foreground text-sm">Evalúa la presencia digital de tu empresa</p>
      </div>

      <Progress value={progress} className="mb-6 h-2" />

      {!showResult ? (
        <>
          <div className="space-y-6">
            {pymeDiagnosticQuestions.map((q, idx) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                className="bg-card rounded-xl p-4 border border-border">
                <p className="text-foreground font-medium text-sm mb-3">{idx + 1}. {q.question}</p>
                <RadioGroup value={answers[q.id]?.toString()} onValueChange={(v) => setAnswers({ ...answers, [q.id]: parseInt(v) })} className="space-y-2">
                  {q.options.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={opt.value.toString()} id={`pq${q.id}-${opt.value}`} />
                      <Label htmlFor={`pq${q.id}-${opt.value}`} className="text-sm text-muted-foreground cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-4 border border-coral/20">
              <p className="text-foreground font-medium text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-coral" /> ¿Con qué frecuencia publican contenido?
              </p>
              <RadioGroup value={frequency} onValueChange={setFrequency} className="space-y-2">
                {frequencyOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={opt.value} id={`pfreq-${opt.value}`} />
                    <Label htmlFor={`pfreq-${opt.value}`} className="text-sm text-muted-foreground cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-4 border border-coral/20">
              <p className="text-foreground font-medium text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-coral" /> ¿Cómo perciben su marca en el mercado?
              </p>
              <RadioGroup value={perception} onValueChange={setPerception} className="space-y-2">
                {pymePerceptionOptions.map((opt) => (
                  <div key={opt} className="flex items-center space-x-3">
                    <RadioGroupItem value={opt} id={`pperc-${opt}`} />
                    <Label htmlFor={`pperc-${opt}`} className="text-sm text-muted-foreground cursor-pointer">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-4 border border-coral/20">
              <p className="text-foreground font-medium text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-coral" /> ¿Cuál es el objetivo principal de la empresa en los próximos 90 días?
              </p>
              <RadioGroup value={goal} onValueChange={setGoal} className="space-y-2">
                {pymeGoalOptions.map((opt) => (
                  <div key={opt} className="flex items-center space-x-3">
                    <RadioGroupItem value={opt} id={`pgoal-${opt}`} />
                    <Label htmlFor={`pgoal-${opt}`} className="text-sm text-muted-foreground cursor-pointer">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>
          </div>

          <Button onClick={() => setShowResult(true)} disabled={!canProceed}
            className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6 mt-6">
            Ver resultado
          </Button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="bg-card rounded-2xl p-8 border border-border mb-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className={`w-20 h-20 rounded-full ${result.color} mx-auto mb-4 flex items-center justify-center`}>
              <span className="text-white font-display font-bold text-2xl">{totalScore}</span>
            </motion.div>
            <h3 className="font-display text-lg font-bold text-foreground mb-1">{result.label}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{result.message}</p>
          </div>
          <Button onClick={() => onNext(totalScore, result.level, { frequency, perception, goal })}
            className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6">
            Análisis competitivo <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
