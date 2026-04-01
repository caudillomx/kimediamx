import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ArrowRight, ArrowLeft, Plus, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ContentContextData {
  contentPillars: string[];
  referenceAccounts: string;
  contentRestrictions: string;
  keyDates: string;
  preferredFormats: string[];
}

interface Props {
  onNext: (data: ContentContextData) => void;
  onBack?: () => void;
}

const FORMAT_OPTIONS = [
  { value: "carrusel", label: "Carrusel", emoji: "📑" },
  { value: "reels-tiktok", label: "Reels / TikTok", emoji: "🎬" },
  { value: "stories", label: "Stories", emoji: "📱" },
  { value: "post-imagen", label: "Post de imagen", emoji: "🖼️" },
  { value: "video-largo", label: "Video largo", emoji: "🎥" },
  { value: "texto-thread", label: "Texto / Thread", emoji: "📝" },
  { value: "podcast", label: "Podcast", emoji: "🎙️" },
  { value: "newsletter", label: "Newsletter", emoji: "📧" },
];

export function ContentContextStep({ onNext, onBack }: Props) {
  const [pillars, setPillars] = useState<string[]>(["", ""]);
  const [newPillar, setNewPillar] = useState("");
  const [referenceAccounts, setReferenceAccounts] = useState("");
  const [contentRestrictions, setContentRestrictions] = useState("");
  const [keyDates, setKeyDates] = useState("");
  const [preferredFormats, setPreferredFormats] = useState<string[]>([]);

  const validPillars = pillars.filter(p => p.trim().length > 0);
  const canProceed = validPillars.length >= 2 && preferredFormats.length >= 1;

  const updatePillar = (index: number, value: string) => {
    const updated = [...pillars];
    updated[index] = value.slice(0, 60);
    setPillars(updated);
  };

  const addPillar = () => {
    if (pillars.length < 5) {
      setPillars([...pillars, ""]);
    }
  };

  const removePillar = (index: number) => {
    if (pillars.length > 2) {
      setPillars(pillars.filter((_, i) => i !== index));
    }
  };

  const toggleFormat = (value: string) => {
    setPreferredFormats(prev =>
      prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
    );
  };

  const handleSubmit = () => {
    onNext({
      contentPillars: validPillars,
      referenceAccounts,
      contentRestrictions,
      keyDates,
      preferredFormats,
    });
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
          <Layers className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          Contexto de <span className="text-gradient">contenido</span>
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
          Esta información potenciará las recomendaciones de contenido con IA.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Pilares de contenido */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Pilares de contenido (mín. 2, máx. 5) *
          </Label>
          <p className="text-xs text-muted-foreground/70">
            Los temas principales que guiarán todo tu contenido.
          </p>
          <div className="space-y-2">
            {pillars.map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <Input
                  value={pillar}
                  onChange={e => updatePillar(i, e.target.value)}
                  placeholder={
                    i === 0 ? "Ej: Liderazgo femenino" :
                    i === 1 ? "Ej: Finanzas personales" :
                    i === 2 ? "Ej: Bienestar mental" :
                    i === 3 ? "Ej: Emprendimiento" :
                    "Ej: Innovación"
                  }
                  className="bg-secondary border-border rounded-xl h-11 text-foreground placeholder:text-muted-foreground/50"
                  maxLength={60}
                />
                {pillars.length > 2 && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => removePillar(i)}
                    className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center shrink-0 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
          {pillars.length < 5 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={addPillar}
              className="w-full rounded-xl border border-dashed border-primary/30 bg-primary/5 text-primary text-sm font-medium py-2.5 flex items-center justify-center gap-1.5 hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar pilar
            </motion.button>
          )}
        </motion.div>

        {/* 2. Cuentas de referencia */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Cuentas de referencia o inspiración
          </Label>
          <Textarea
            value={referenceAccounts}
            onChange={e => setReferenceAccounts(e.target.value)}
            placeholder="@garyvee, @paulocoelho, la cuenta de Nike en Instagram"
            className="bg-secondary border-border rounded-xl min-h-[70px] text-foreground resize-none placeholder:text-muted-foreground/50"
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground/60">
            ¿Qué cuentas o creadores te inspiran? (pueden ser de tu industria o de otra)
          </p>
        </motion.div>

        {/* 3. Restricciones de contenido */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Temas o palabras a evitar
          </Label>
          <Textarea
            value={contentRestrictions}
            onChange={e => setContentRestrictions(e.target.value)}
            placeholder="No hablar de política, evitar tecnicismos, no mencionar a competidores por nombre"
            className="bg-secondary border-border rounded-xl min-h-[70px] text-foreground resize-none placeholder:text-muted-foreground/50"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground/60">
            ¿Hay temas, palabras o enfoques que quieras evitar en tu comunicación?
          </p>
        </motion.div>

        {/* 4. Fechas clave */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Fechas o temporadas importantes
          </Label>
          <Textarea
            value={keyDates}
            onChange={e => setKeyDates(e.target.value)}
            placeholder="Temporada navideña, Día de las Madres, lanzamiento de producto en marzo"
            className="bg-secondary border-border rounded-xl min-h-[70px] text-foreground resize-none placeholder:text-muted-foreground/50"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground/60">
            ¿Tienes fechas clave, temporadas altas o eventos importantes en tu calendario?
          </p>
        </motion.div>

        {/* 5. Formatos preferidos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Formatos preferidos (mín. 1) *
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FORMAT_OPTIONS.map((fmt, i) => (
              <motion.button
                key={fmt.value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                type="button"
                onClick={() => toggleFormat(fmt.value)}
                className={`rounded-xl px-3 py-3 text-xs font-medium transition-all border flex flex-col items-center gap-1.5 ${
                  preferredFormats.includes(fmt.value)
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
                }`}
              >
                <span className="text-base">{fmt.emoji}</span>
                {fmt.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="rounded-xl h-12 border-border">
            <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!canProceed}
          className="flex-1 bg-gradient-coral text-primary-foreground font-bold rounded-xl h-12 shadow-glow hover:shadow-glow-lg transition-all"
        >
          Siguiente <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
