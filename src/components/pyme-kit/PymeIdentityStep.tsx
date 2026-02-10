import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { pymeToneOptions } from "@/data/pymeKitData";

interface Props {
  onNext: (data: { valueProposition: string; targetAudience: string; differentiator: string; brandTone: string }) => void;
}

export function PymeIdentityStep({ onNext }: Props) {
  const [wizardStep, setWizardStep] = useState(0);
  const [valueProposition, setValueProposition] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [differentiator, setDifferentiator] = useState("");
  const [brandTone, setBrandTone] = useState("");

  const steps = [
    { title: "Propuesta de valor", subtitle: "¿Qué ofrece tu empresa?", hint: "Describe qué problema resuelve tu empresa. Ej: 'Ofrecemos pan artesanal libre de conservadores'" },
    { title: "Cliente ideal", subtitle: "¿A quién le vendes?", hint: "¿Quién es tu cliente principal? Ej: 'Familias que buscan alimentos saludables en la zona norte'" },
    { title: "Diferenciador", subtitle: "¿Qué los hace únicos?", hint: "¿Qué los distingue de la competencia? Su calidad, servicio, precio, experiencia..." },
    { title: "Tono de comunicación", subtitle: "¿Cómo quieren sonar?", hint: "El tono define cómo se percibe su marca en redes y comunicaciones." },
  ];

  const canAdvance = () => {
    if (wizardStep === 0) return valueProposition.trim().length > 5;
    if (wizardStep === 1) return targetAudience.trim().length > 5;
    if (wizardStep === 2) return differentiator.trim().length > 5;
    return brandTone !== "";
  };

  const handleNext = () => {
    if (wizardStep < 3) setWizardStep(wizardStep + 1);
    else onNext({ valueProposition, targetAudience, differentiator, brandTone });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="w-full max-w-lg mx-auto">
      <div className="text-center mb-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="w-7 h-7 text-coral" />
        </motion.div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">Identidad de marca empresarial</h2>
        <TooltipProvider delayDuration={300}>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
            Paso {wizardStep + 1} de 4 — {steps[wizardStep].subtitle}
            <Tooltip><TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 cursor-help" /></TooltipTrigger>
              <TooltipContent><p className="max-w-[220px] text-xs">{steps[wizardStep].hint}</p></TooltipContent>
            </Tooltip>
          </p>
        </TooltipProvider>
      </div>

      <div className="flex gap-2 justify-center mb-6">
        {steps.map((_, i) => (
          <motion.div key={i} layout className={`h-2 rounded-full transition-colors ${i === wizardStep ? "w-8 bg-coral" : i < wizardStep ? "w-2 bg-coral/50" : "w-2 bg-border"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {wizardStep === 0 && (
          <motion.div key="value" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            <Label className="text-sm text-muted-foreground">¿Qué problema resuelve tu empresa o qué valor ofrece?</Label>
            <Input value={valueProposition} onChange={(e) => setValueProposition(e.target.value)}
              placeholder="Ej: Ofrecemos pan artesanal libre de conservadores" className="bg-card border-border" maxLength={200} />
          </motion.div>
        )}
        {wizardStep === 1 && (
          <motion.div key="audience" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            <Label className="text-sm text-muted-foreground">¿Quién es tu cliente principal?</Label>
            <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Ej: Familias jóvenes de la zona norte de la ciudad" className="bg-card border-border" maxLength={200} />
          </motion.div>
        )}
        {wizardStep === 2 && (
          <motion.div key="diff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            <Label className="text-sm text-muted-foreground">¿Qué hace diferente a tu empresa?</Label>
            <Input value={differentiator} onChange={(e) => setDifferentiator(e.target.value)}
              placeholder="Ej: 20 años de tradición familiar con recetas originales" className="bg-card border-border" maxLength={200} />
          </motion.div>
        )}
        {wizardStep === 3 && (
          <motion.div key="tone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-2 gap-3">
              {pymeToneOptions.map((t, i) => (
                <motion.button key={t.value} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  type="button" onClick={() => setBrandTone(t.value)}
                  className={`rounded-xl p-4 text-left transition-all border ${brandTone === t.value ? "border-coral bg-coral/10" : "border-border bg-card hover:border-coral/30"}`}>
                  <span className={`block text-sm font-bold ${brandTone === t.value ? "text-coral" : "text-foreground"}`}>{t.label}</span>
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
        <Button onClick={handleNext} disabled={!canAdvance()}
          className="flex-1 bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6">
          {wizardStep === 3 ? "Generar descripción" : "Siguiente"} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
