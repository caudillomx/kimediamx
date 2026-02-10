import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowRight, ArrowLeft, Sparkles, Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { causes, convictions, populations, generateMessage } from "@/data/liderazgosData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MessageBuilderStepProps {
  participantState: string;
  onNext: (cause: string, conviction: string, population: string[], territory: string, message: string) => void;
}

export function MessageBuilderStep({ participantState, onNext }: MessageBuilderStepProps) {
  const [wizardStep, setWizardStep] = useState(0);
  const [cause, setCause] = useState("");
  const [causeCustom, setCauseCustom] = useState("");
  const [conviction, setConviction] = useState("");
  const [selectedPop, setSelectedPop] = useState<string[]>([]);
  const [territory, setTerritory] = useState(participantState);
  const [message, setMessage] = useState("");
  const [enhancing, setEnhancing] = useState(false);

  const finalCause = cause === "Otro" ? causeCustom : cause;

  const steps = [
    { title: "Causa principal", subtitle: "¿Qué tema te mueve?", hint: "Elige la causa que más te representa. Si no encuentras la tuya, selecciona 'Otro'." },
    { title: "Convicción", subtitle: "¿Por qué luchas?", hint: "Selecciona la frase que mejor refleje tu motivación personal." },
    { title: "Población", subtitle: "¿Para quién trabajas?", hint: "Puedes seleccionar más de una opción. Estas son las personas a las que diriges tu mensaje." },
    { title: "Tu mensaje", subtitle: "Revisa y personaliza", hint: "Edita el texto generado. Puedes mejorarlo con IA o escribir el tuyo desde cero." },
  ];

  const canAdvance = () => {
    if (wizardStep === 0) return cause && (cause !== "Otro" || causeCustom.trim());
    if (wizardStep === 1) return conviction;
    if (wizardStep === 2) return selectedPop.length > 0;
    return message.trim();
  };

  const handleNext = () => {
    if (wizardStep === 2) {
      const generated = generateMessage(finalCause, conviction, selectedPop, territory);
      setMessage(generated);
      setWizardStep(3);
    } else if (wizardStep === 3) {
      onNext(finalCause, conviction, selectedPop, territory, message);
    } else {
      setWizardStep(wizardStep + 1);
    }
  };

  const handleEnhance = async () => {
    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-text", {
        body: { text: message, type: "message" },
      });
      if (error) throw error;
      if (data?.enhanced) setMessage(data.enhanced);
    } catch {
      toast({ title: "No se pudo mejorar el texto", variant: "destructive" });
    } finally {
      setEnhancing(false);
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
          <MessageSquare className="w-7 h-7 text-coral" />
        </motion.div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">
          Constructor de mensaje
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

      {/* Progress dots */}
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
          <motion.div key="cause" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <RadioGroup value={cause} onValueChange={setCause} className="space-y-2">
              {[...causes, "Otro"].map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center space-x-3 bg-card rounded-xl p-4 border border-border hover:border-coral/30 transition-colors"
                >
                  <RadioGroupItem value={c} id={`cause-${c}`} />
                  <Label htmlFor={`cause-${c}`} className="text-sm cursor-pointer flex-1">{c}</Label>
                </motion.div>
              ))}
            </RadioGroup>
            {cause === "Otro" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <Input
                  value={causeCustom}
                  onChange={(e) => setCauseCustom(e.target.value)}
                  placeholder="Escribe tu causa..."
                  className="mt-3 bg-card border-border"
                  maxLength={100}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {wizardStep === 1 && (
          <motion.div key="conviction" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <RadioGroup value={conviction} onValueChange={setConviction} className="space-y-2">
              {convictions.map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center space-x-3 bg-card rounded-xl p-4 border border-border hover:border-coral/30 transition-colors"
                >
                  <RadioGroupItem value={c} id={`conv-${c}`} />
                  <Label htmlFor={`conv-${c}`} className="text-sm cursor-pointer flex-1">{c}</Label>
                </motion.div>
              ))}
            </RadioGroup>
          </motion.div>
        )}

        {wizardStep === 2 && (
          <motion.div key="population" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="space-y-2">
              {populations.map((p, i) => (
                <motion.div
                  key={p}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center space-x-3 bg-card rounded-xl p-4 border border-border hover:border-coral/30 transition-colors"
                >
                  <Checkbox
                    id={`pop-${p}`}
                    checked={selectedPop.includes(p)}
                    onCheckedChange={(checked) =>
                      setSelectedPop(checked ? [...selectedPop, p] : selectedPop.filter((x) => x !== p))
                    }
                  />
                  <Label htmlFor={`pop-${p}`} className="text-sm cursor-pointer flex-1">{p}</Label>
                </motion.div>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Territorio</Label>
              <Input
                value={territory}
                onChange={(e) => setTerritory(e.target.value)}
                className="bg-card border-border"
                maxLength={100}
              />
            </div>
          </motion.div>
        )}

        {wizardStep === 3 && (
          <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full bg-transparent text-foreground text-sm resize-none focus:outline-none leading-relaxed"
                maxLength={500}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleEnhance}
              disabled={enhancing}
              className="w-full border-coral/30 text-coral hover:bg-coral/10"
            >
              {enhancing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Mejorar con IA
            </Button>
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
          {wizardStep === 3 ? "Continuar a mi bio" : "Siguiente"} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
