import { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, Copy, ArrowRight, Sparkles, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface BrandBioStepProps {
  initialBio: string;
  onNext: (bio: string) => void;
}

export function BrandBioStep({ initialBio, onNext }: BrandBioStepProps) {
  const [bio, setBio] = useState(initialBio);
  const [enhancing, setEnhancing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (platform: string) => {
    let text = bio;
    if (platform === "x") text = bio.substring(0, 160);
    await navigator.clipboard.writeText(text);
    setCopied(platform);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: `Bio copiada para ${platform === "x" ? "X" : platform === "ig" ? "Instagram" : platform === "li" ? "LinkedIn" : "Facebook"}` });
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <UserCircle className="w-7 h-7 text-coral" />
        </div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">
          Tu bio profesional
        </h2>
        <p className="text-muted-foreground text-sm">Edítala, mejórala con IA y cópiala para tus redes</p>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border mb-4">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={6}
          className="w-full bg-transparent text-foreground text-sm resize-none focus:outline-none leading-relaxed whitespace-pre-wrap"
          maxLength={300}
        />
      </div>

      <Button
        variant="outline"
        onClick={handleEnhance}
        disabled={enhancing}
        className="w-full border-coral/30 text-coral hover:bg-coral/10 mb-4"
      >
        {enhancing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
        Mejorar con IA
      </Button>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { key: "ig", label: "Instagram" },
          { key: "x", label: "X" },
          { key: "li", label: "LinkedIn" },
          { key: "fb", label: "Facebook" },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant="outline"
            onClick={() => handleCopy(key)}
            className="text-xs border-border"
          >
            {copied === key ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            {label}
          </Button>
        ))}
      </div>

      <Button
        onClick={() => onNext(bio)}
        className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6"
      >
        Crear mi primer post <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}
