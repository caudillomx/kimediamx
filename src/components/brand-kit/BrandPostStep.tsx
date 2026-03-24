import { useState } from "react";
import { motion } from "framer-motion";
import { PenTool, Copy, ArrowRight, Sparkles, Loader2, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateBrandPost } from "@/data/brandKitData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface BrandPostStepProps {
  profession: string;
  industry: string;
  valueProposition: string;
  targetAudience: string;
  differentiator: string;
  onNext: (postType: string, postText: string, published: boolean) => void;
}

const POST_TYPES = [
  { value: "expertise" as const, label: "Expertise", desc: "Demuestra conocimiento", emoji: "🧠" },
  { value: "historia" as const, label: "Historia", desc: "Conecta emocionalmente", emoji: "📖" },
  { value: "valor" as const, label: "Tips", desc: "Comparte aprendizajes", emoji: "💡" },
];

export function BrandPostStep({
  profession, industry, valueProposition, targetAudience, differentiator, onNext,
}: BrandPostStepProps) {
  const [postType, setPostType] = useState<"expertise" | "historia" | "valor">("expertise");
  const [postText, setPostText] = useState(
    generateBrandPost("expertise", profession, industry, valueProposition, targetAudience, differentiator)
  );
  const [published, setPublished] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTypeChange = (type: "expertise" | "historia" | "valor") => {
    setPostType(type);
    setPostText(generateBrandPost(type, profession, industry, valueProposition, targetAudience, differentiator));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(postText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Post copiado al portapapeles" });
  };

  const handleEnhance = async () => {
    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-text", {
        body: { text: postText, type: "post" },
      });
      if (error) throw error;
      if (data?.enhanced) setPostText(data.enhanced);
    } catch {
      toast({ title: "No se pudo mejorar el texto", variant: "destructive" });
    } finally {
      setEnhancing(false);
    }
  };

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
          <PenTool className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          Tu primer <span className="text-gradient">post de marca</span>
        </h2>
        <p className="text-muted-foreground text-sm">Elige el tipo, personalízalo y publícalo</p>
      </div>

      {/* Post type selector */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {POST_TYPES.map(t => (
          <motion.button
            key={t.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleTypeChange(t.value)}
            className={`rounded-2xl p-4 text-center transition-all border ${
              postType === t.value
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-secondary hover:border-primary/30"
            }`}
          >
            <span className="text-xl mb-1 block">{t.emoji}</span>
            <span className={`block text-sm font-bold ${postType === t.value ? "text-primary" : "text-foreground"}`}>
              {t.label}
            </span>
            <span className="block text-[10px] text-muted-foreground mt-0.5">{t.desc}</span>
          </motion.button>
        ))}
      </div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative bg-secondary rounded-2xl p-5 border border-border mb-4 focus-within:border-primary/30 transition-colors"
      >
        <textarea
          value={postText}
          onChange={e => setPostText(e.target.value)}
          rows={7}
          className="w-full bg-transparent text-foreground text-sm resize-none focus:outline-none leading-relaxed whitespace-pre-wrap"
          maxLength={500}
        />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">{postText.length}/500</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleEnhance} disabled={enhancing}
              className="text-primary hover:bg-primary/10 rounded-lg h-8 px-3 text-xs">
              {enhancing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
              IA
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground rounded-lg h-8 px-3 text-xs">
              {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              Copiar
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Published toggle */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setPublished(!published)}
        className={`w-full flex items-center justify-center gap-2 rounded-xl p-3.5 mb-6 text-sm font-medium transition-all border ${
          published
            ? "border-green-500/40 bg-green-500/10 text-green-400"
            : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
        {published ? "¡Marcado como publicado!" : "¿Ya lo publicaste? Márcalo aquí"}
      </motion.button>

      <Button
        onClick={() => onNext(postType, postText, published)}
        className="w-full bg-gradient-coral text-primary-foreground font-bold rounded-xl h-12 shadow-glow hover:shadow-glow-lg transition-all"
      >
        Finalizar <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}
