import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, ArrowRight, Plus, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { spokespersonTones, generateSpokespersonGuide } from "@/data/liderazgosData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SpokespersonStepProps {
  onNext: (data: {
    phrase: string;
    tone: string;
    quarterlyTopics: string[];
    sensitiveTopics: string[];
    guide: ReturnType<typeof generateSpokespersonGuide>;
  }) => void;
}

export function SpokespersonStep({ onNext }: SpokespersonStepProps) {
  const [phrase, setPhrase] = useState("");
  const [tone, setTone] = useState("");
  const [topics, setTopics] = useState<string[]>([""]);
  const [sensitive, setSensitive] = useState<string[]>([""]);
  const [enhancing, setEnhancing] = useState(false);

  const addTopic = () => { if (topics.length < 5) setTopics([...topics, ""]); };
  const addSensitive = () => { if (sensitive.length < 5) setSensitive([...sensitive, ""]); };

  const updateArr = (arr: string[], i: number, val: string, setter: (v: string[]) => void) => {
    const u = [...arr]; u[i] = val; setter(u);
  };
  const removeArr = (arr: string[], i: number, setter: (v: string[]) => void) => {
    setter(arr.filter((_, idx) => idx !== i));
  };

  const validTopics = topics.filter((t) => t.trim());
  const validSensitive = sensitive.filter((t) => t.trim());
  const canSubmit = phrase.trim() && tone && validTopics.length > 0;

  const handleEnhance = async () => {
    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-text", {
        body: { text: phrase, type: "spokesperson" },
      });
      if (error) throw error;
      if (data?.enhanced) setPhrase(data.enhanced);
    } catch {
      toast({ title: "No se pudo mejorar", variant: "destructive" });
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = () => {
    const guide = generateSpokespersonGuide(phrase, tone, validTopics, validSensitive);
    onNext({ phrase, tone, quarterlyTopics: validTopics, sensitiveTopics: validSensitive, guide });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <Mic className="w-7 h-7 text-coral" />
        </div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">
          Mensaje institucional y vocería
        </h2>
        <p className="text-muted-foreground text-sm">Define tu estrategia de comunicación</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm text-muted-foreground">Frase eje institucional</Label>
          <Input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Ej: Gobernar es servir con transparencia"
            className="bg-card border-border mt-1"
            maxLength={150}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEnhance}
            disabled={enhancing || !phrase.trim()}
            className="text-coral text-xs mt-1"
          >
            {enhancing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
            Mejorar con IA
          </Button>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Tono predominante</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {spokespersonTones.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`rounded-xl p-3 text-left transition-all border ${
                  tone === t.value
                    ? "border-coral bg-coral/10 text-coral"
                    : "border-border bg-card text-muted-foreground hover:border-coral/30"
                }`}
              >
                <span className="block text-sm font-bold">{t.label}</span>
                <span className="block text-[10px] mt-0.5">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Temas prioritarios del trimestre</Label>
          <div className="space-y-2 mt-1">
            {topics.map((t, i) => (
              <div key={i} className="flex gap-2">
                <Input value={t} onChange={(e) => updateArr(topics, i, e.target.value, setTopics)}
                  placeholder={`Tema ${i + 1}`} className="bg-card border-border flex-1" maxLength={80} />
                {topics.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeArr(topics, i, setTopics)} className="shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {topics.length < 5 && (
              <Button variant="ghost" size="sm" onClick={addTopic} className="text-coral text-xs">
                <Plus className="w-3 h-3 mr-1" /> Agregar tema
              </Button>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Temas sensibles a evitar (opcional)</Label>
          <div className="space-y-2 mt-1">
            {sensitive.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input value={s} onChange={(e) => updateArr(sensitive, i, e.target.value, setSensitive)}
                  placeholder={`Tema sensible ${i + 1}`} className="bg-card border-border flex-1" maxLength={80} />
                {sensitive.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeArr(sensitive, i, setSensitive)} className="shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {sensitive.length < 5 && (
              <Button variant="ghost" size="sm" onClick={addSensitive} className="text-muted-foreground text-xs">
                <Plus className="w-3 h-3 mr-1" /> Agregar tema sensible
              </Button>
            )}
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full mt-6 bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6"
      >
        Generar guía de vocería <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}
