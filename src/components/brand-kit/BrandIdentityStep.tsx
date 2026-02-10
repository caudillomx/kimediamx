import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toneOptions } from "@/data/brandKitData";

interface BrandIdentityStepProps {
  onNext: (data: {
    valueProposition: string;
    targetAudience: string;
    differentiator: string;
    brandTone: string;
  }) => void;
}

export function BrandIdentityStep({ onNext }: BrandIdentityStepProps) {
  const [wizardStep, setWizardStep] = useState(0);
  const [valueProposition, setValueProposition] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [differentiator, setDifferentiator] = useState("");
  const [brandTone, setBrandTone] = useState("");

  const steps = [
    {
      title: "Propuesta de valor",
      subtitle: "¿Qué ofreces?",
      hint: "Describe en una frase qué problema resuelves o qué valor aportas. Ej: 'Ayudo a emprendedores a organizar sus finanzas'",
    },
    {
      title: "Audiencia objetivo",
      subtitle: "¿A quién le hablas?",
      hint: "¿Quién es tu cliente o seguidor ideal? Ej: 'Emprendedores que están empezando su primer negocio'",
    },
    {
      title: "Diferenciador",
      subtitle: "¿Qué te hace único?",
      hint: "¿Qué te distingue de otros profesionales similares? Tu experiencia, método, enfoque...",
    },
    {
      title: "Tono de comunicación",
      subtitle: "¿Cómo quieres sonar?",
      hint: "Elige el tono que mejor represente cómo quieres que te perciban en redes.",
    },
  ];

  const canAdvance = () => {
    if (wizardStep === 0) return valueProposition.trim().length > 5;
    if (wizardStep === 1) return targetAudience.trim().length > 5;
    if (wizardStep === 2) return differentiator.trim().length > 5;
    return brandTone !== "";
  };

  const handleNext = () => {
    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1);
    } else {
      onNext({ valueProposition, targetAudience, differentiator, brandTone });
    }
  };

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
          <Lightbulb className="w-7 h-7 text-coral" />
        </motion.div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">
          Identidad de marca
        </h2>
        <TooltipProvider delayDuration={300}>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
            Paso {wizardStep + 1} de 4 — {steps[wizardStep].subtitle}
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[220px] text-xs">{steps[wizardStep].hint}</p>
              </TooltipContent>
            </Tooltip>
          </p>
        </TooltipProvider>
      </div>

      <div className="flex gap-2 justify-center mb-6">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            layout
            className={`h-2 rounded-full transition-colors ${
              i === wizardStep ? "w-8 bg-coral" : i < wizardStep ? "w-2 bg-coral/50" : "w-2 bg-border"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {wizardStep === 0 && (
          <motion.div key="value" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            <Label className="text-sm text-muted-foreground">¿Qué problema resuelves o qué valor aportas?</Label>
            <Input
              value={valueProposition}
              onChange={(e) => setValueProposition(e.target.value)}
              placeholder="Ej: Ayudo a emprendedores a organizar sus finanzas personales"
              className="bg-card border-border"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">Piensa en lo que tus clientes o seguidores obtienen de ti.</p>
          </motion.div>
        )}

        {wizardStep === 1 && (
          <motion.div key="audience" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            <Label className="text-sm text-muted-foreground">¿Quién es tu cliente o seguidor ideal?</Label>
            <Input
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Ej: Mujeres emprendedoras de 25-40 años"
              className="bg-card border-border"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">Sé específico: edad, perfil, situación. Mientras más claro, mejor tu contenido.</p>
          </motion.div>
        )}

        {wizardStep === 2 && (
          <motion.div key="diff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            <Label className="text-sm text-muted-foreground">¿Qué te hace diferente?</Label>
            <Input
              value={differentiator}
              onChange={(e) => setDifferentiator(e.target.value)}
              placeholder="Ej: Mi método combina finanzas con bienestar emocional"
              className="bg-card border-border"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">Tu experiencia, tu método, tu historia... lo que te hace memorable.</p>
          </motion.div>
        )}

        {wizardStep === 3 && (
          <motion.div key="tone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-2 gap-3">
              {toneOptions.map((t, i) => (
                <motion.button
                  key={t.value}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  type="button"
                  onClick={() => setBrandTone(t.value)}
                  className={`rounded-xl p-4 text-left transition-all border ${
                    brandTone === t.value
                      ? "border-coral bg-coral/10"
                      : "border-border bg-card hover:border-coral/30"
                  }`}
                >
                  <span className={`block text-sm font-bold ${brandTone === t.value ? "text-coral" : "text-foreground"}`}>
                    {t.label}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-1">{t.desc}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 mt-6">
        {wizardStep > 0 && (
          <Button variant="outline" onClick={() => setWizardStep(wizardStep - 1)} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canAdvance()}
          className="flex-1 bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6"
        >
          {wizardStep === 3 ? "Generar mi bio" : "Siguiente"} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
