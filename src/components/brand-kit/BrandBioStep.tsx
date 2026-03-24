import { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, Copy, ArrowRight, Sparkles, Loader2, Check, Instagram, Globe, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface BrandBioStepProps {
  initialBio: string;
  onNext: (bio: string) => void;
}

const PLATFORMS = [
  { key: "ig", label: "Instagram", icon: "📸", limit: 150 },
  { key: "x", label: "X", icon: "𝕏", limit: 160 },
  { key: "li", label: "LinkedIn", icon: "💼", limit: 300 },
  { key: "fb", label: "Facebook", icon: "📘", limit: 255 },
];

export function BrandBioStep({ initialBio, onNext }: BrandBioStepProps) {
  const [bio, setBio] = useState(initialBio);
  const [enhancing, setEnhancing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (platform: typeof PLATFORMS[0]) => {
    const text = bio.substring(0, platform.limit);
    await navigator.clipboard.writeText(text);
    setCopied(platform.key);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: `Bio copiada para ${platform.label}` });
  };

  const handleEnhance = async () => {
    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-text", {
        body: { text: bio, type: "bio" },
      });
      if (error) throw error;
      if (data?.enhanced) setBio(data.enhanced);
    } catch {
      toast({ title: "No se pudo mejorar el texto", variant: "destructive" });
    } finally {
      setEnhancing(false);
    }
  };

  const charCount = bio.length;

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
          <UserCircle className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          Tu <span className="text-gradient">bio profesional</span>
        </h2>
        <p className="text-muted-foreground text-sm">Edítala, mejórala con IA y cópiala para cada red</p>
      </div>

      {/* Bio editor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative bg-secondary rounded-2xl p-5 border border-border mb-4 group focus-within:border-primary/30 transition-colors"
      >
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={6}
          className="w-full bg-transparent text-foreground text-sm resize-none focus:outline-none leading-relaxed whitespace-pre-wrap placeholder:text-muted-foreground/50"
          maxLength={300}
          placeholder="Tu bio profesional aparecerá aquí..."
        />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <span className={`text-xs ${charCount > 250 ? "text-destructive" : "text-muted-foreground"}`}>
            {charCount}/300
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEnhance}
            disabled={enhancing}
            className="text-primary hover:bg-primary/10 rounded-lg h-8 px-3 text-xs"
          >
            {enhancing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
            Mejorar con IA
          </Button>
        </div>
      </motion.div>

      {/* Copy buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-4 gap-2 mb-8"
      >
        {PLATFORMS.map(p => (
          <motion.button
            key={p.key}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCopy(p)}
            className={`flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 border transition-all ${
              copied === p.key
                ? "border-green-500/50 bg-green-500/10 text-green-400"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/30"
            }`}
          >
            <span className="text-base">{copied === p.key ? "✓" : p.icon}</span>
            <span className="text-[10px] font-medium">{p.label}</span>
          </motion.button>
        ))}
      </motion.div>

      <Button
        onClick={() => onNext(bio)}
        className="w-full bg-gradient-coral text-primary-foreground font-bold rounded-xl h-12 shadow-glow hover:shadow-glow-lg transition-all"
      >
        Crear mi primer post <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}
