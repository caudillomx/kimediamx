import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, HelpCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  diagnosticQuestions,
  getDiagnosticLevel,
  frequencyOptions,
  perceptionOptions,
  goalOptions,
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

  const allAnswered = diagnosticQuestions.every((q) => answers[q.id] !== undefined);
  const allExtras = frequency && perception && goal;
  const canProceed = allAnswered && allExtras;
  const totalScore = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const result = getDiagnosticLevel(totalScore);
  const totalFields = diagnosticQuestions.length + 3;
  const filledFields =
    Object.keys(answers).length + (frequency ? 1 : 0) + (perception ? 1 : 0) + (goal ? 1 : 0);
  const progress = (filledFields / totalFields) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4"
        >
          <Activity className="w-7 h-7 text-coral" />
        </motion.div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">
          Diagnóstico de marca personal
        </h2>
        <TooltipProvider delayDuration={300}>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
            Responde honestamente para conocer tu nivel
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[220px] text-xs">
                  Selecciona la opción que mejor describe tu situación actual. No hay respuestas correctas ni incorrectas.
                </p>
              </TooltipContent>
            </Tooltip>
          </p>
        </TooltipProvider>
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
                transition={{ delay: idx * 0.04 }}
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
                      <RadioGroupItem value={opt.value.toString()} id={`bq${q.id}-${opt.value}`} />
                      <Label htmlFor={`bq${q.id}-${opt.value}`} className="text-sm text-muted-foreground cursor-pointer">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: diagnosticQuestions.length * 0.04 }}
              className="bg-card rounded-xl p-4 border border-coral/20"
            >
              <p className="text-foreground font-medium text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-coral" />
                ¿Con qué frecuencia publicas contenido?
              </p>
              <RadioGroup value={frequency} onValueChange={setFrequency} className="space-y-2">
                {frequencyOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={opt.value} id={`bfreq-${opt.value}`} />
                    <Label htmlFor={`bfreq-${opt.value}`} className="text-sm text-muted-foreground cursor-pointer">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (diagnosticQuestions.length + 1) * 0.04 }}
              className="bg-card rounded-xl p-4 border border-coral/20"
            >
              <p className="text-foreground font-medium text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-coral" />
                ¿Cómo crees que te percibe tu audiencia?
              </p>
              <RadioGroup value={perception} onValueChange={setPerception} className="space-y-2">
                {perceptionOptions.map((opt) => (
                  <div key={opt} className="flex items-center space-x-3">
                    <RadioGroupItem value={opt} id={`bperc-${opt}`} />
                    <Label htmlFor={`bperc-${opt}`} className="text-sm text-muted-foreground cursor-pointer">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (diagnosticQuestions.length + 2) * 0.04 }}
              className="bg-card rounded-xl p-4 border border-coral/20"
            >
              <p className="text-foreground font-medium text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-coral" />
                ¿Cuál es tu objetivo principal en los próximos 90 días?
              </p>
              <RadioGroup value={goal} onValueChange={setGoal} className="space-y-2">
                {goalOptions.map((opt) => (
                  <div key={opt} className="flex items-center space-x-3">
                    <RadioGroupItem value={opt} id={`bgoal-${opt}`} />
                    <Label htmlFor={`bgoal-${opt}`} className="text-sm text-muted-foreground cursor-pointer">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>
          </div>

          <Button
            onClick={() => setShowResult(true)}
            disabled={!canProceed}
            className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6 mt-6"
          >
            Ver mi resultado
          </Button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="bg-card rounded-2xl p-8 border border-border mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className={`w-20 h-20 rounded-full ${result.color} mx-auto mb-4 flex items-center justify-center`}
            >
              <span className="text-white font-display font-bold text-2xl">{totalScore}</span>
            </motion.div>
            <h3 className="font-display text-lg font-bold text-foreground mb-1">{result.label}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{result.message}</p>
          </div>

          <Button
            onClick={() => onNext(totalScore, result.level, { frequency, perception, goal })}
            className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6"
          >
            Construir mi identidad <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
