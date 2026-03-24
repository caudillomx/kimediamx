import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ArrowRight, ArrowLeft, Sparkles, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toneOptions } from "@/data/brandKitData";

interface BrandIdentityStepProps {
  onNext: (data: {
    valueProposition: string;
    targetAudience: string;
    differentiator: string;
    brandTone: string;
  }) => void;
}

const STEPS = [
  {
    title: "Propuesta de valor",
    subtitle: "El corazón de tu marca",
    prompt: "¿Qué problema resuelves o qué valor aportas?",
    placeholder: "Ayudo a emprendedores a organizar sus finanzas personales",
    tip: "Piensa en lo que tus clientes obtienen al trabajar contigo.",
  },
  {
    title: "Audiencia objetivo",
    subtitle: "A quién le hablas",
    prompt: "¿Quién es tu cliente o seguidor ideal?",
    placeholder: "Mujeres emprendedoras de 25-40 años que buscan independencia financiera",
    tip: "Sé específico: mientras más claro, mejor será tu contenido.",
  },
  {
    title: "Diferenciador",
    subtitle: "Tu factor único",
    prompt: "¿Qué te hace diferente de los demás?",
    placeholder: "Mi método combina finanzas con bienestar emocional",
    tip: "Tu experiencia, método o historia — lo que te hace memorable.",
  },
  {
    title: "Tono de marca",
    subtitle: "Tu voz en el mundo",
    prompt: "¿Cómo quieres que suene tu comunicación?",
    placeholder: "",
    tip: "El tono define la personalidad de todo tu contenido.",
  },
];

export function BrandIdentityStep({ onNext }: BrandIdentityStepProps) {
  const [step, setStep] = useState(0);
  const [valueProposition, setValueProposition] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [differentiator, setDifferentiator] = useState("");
  const [brandTone, setBrandTone] = useState("");

  const values = [valueProposition, targetAudience, differentiator, brandTone];
  const setters = [setValueProposition, setTargetAudience, setDifferentiator, setBrandTone];

  const canAdvance = () => {
    if (step === 3) return brandTone !== "";
    return values[step].trim().length > 5;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onNext({ valueProposition, targetAudience, differentiator, brandTone });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-5"
        >
          <Lightbulb className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          Identidad de <span className="text-gradient">marca</span>
        </h2>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1.5 justify-center mb-8">
        {STEPS.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => i < step && setStep(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === step ? "w-10 bg-primary" : i < step ? "w-3 bg-primary/40 cursor-pointer" : "w-3 bg-border"
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step label */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
              {step + 1}
            </span>
            <div>
              <p className="text-foreground font-semibold text-sm">{STEPS[step].title}</p>
              <p className="text-muted-foreground text-xs">{STEPS[step].subtitle}</p>
            </div>
          </div>

          {step < 3 ? (
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">{STEPS[step].prompt}</Label>
              <Textarea
                value={values[step]}
                onChange={e => setters[step](e.target.value)}
                placeholder={STEPS[step].placeholder}
                className="bg-secondary border-border rounded-xl min-h-[100px] text-foreground resize-none placeholder:text-muted-foreground/50"
                maxLength={250}
              />
              <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {STEPS[step].tip}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {toneOptions.map((t, i) => (
                <motion.button
                  key={t.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  type="button"
                  onClick={() => setBrandTone(t.value)}
                  className={`rounded-2xl p-5 text-left transition-all border group ${
                    brandTone === t.value
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border bg-secondary hover:border-primary/30 hover:bg-secondary/80"
                  }`}
                >
                  <span className={`block text-sm font-bold mb-1 ${
                    brandTone === t.value ? "text-primary" : "text-foreground"
                  }`}>
                    {t.label}
                  </span>
                  <span className="block text-xs text-muted-foreground leading-relaxed">{t.desc}</span>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}
            className="rounded-xl h-12 border-border">
            <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canAdvance()}
          className="flex-1 bg-gradient-coral text-primary-foreground font-bold rounded-xl h-12 shadow-glow hover:shadow-glow-lg transition-all"
        >
          {step === 3 ? "Generar mi bio" : "Siguiente"} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
