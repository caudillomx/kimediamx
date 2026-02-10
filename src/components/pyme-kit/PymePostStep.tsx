import { useState } from "react";
import { motion } from "framer-motion";
import { PenTool, Copy, ArrowRight, Sparkles, Loader2, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePymePost } from "@/data/pymeKitData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  companyName: string;
  industry: string;
  valueProposition: string;
  targetAudience: string;
  differentiator: string;
  onNext: (postType: string, postText: string, published: boolean) => void;
}

export function PymePostStep({ companyName, industry, valueProposition, targetAudience, differentiator, onNext }: Props) {
  const [postType, setPostType] = useState<"producto" | "caso" | "tips">("producto");
  const [postText, setPostText] = useState(generatePymePost("producto", companyName, industry, valueProposition, targetAudience, differentiator));
  const [published, setPublished] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTypeChange = (type: "producto" | "caso" | "tips") => {
    setPostType(type);
    setPostText(generatePymePost(type, companyName, industry, valueProposition, targetAudience, differentiator));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(postText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Texto copiado" });
  };

  const handleEnhance = async () => {
    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-text", { body: { text: postText, type: "post" } });
      if (error) throw error;
      if (data?.enhanced) setPostText(data.enhanced);
    } catch {
      toast({ title: "No se pudo mejorar el texto", variant: "destructive" });
    } finally {
      setEnhancing(false);
    }
  };

  const postTypes = [
    { value: "producto" as const, label: "Producto", desc: "Presenta tu oferta" },
    { value: "caso" as const, label: "Caso de éxito", desc: "Cuenta una historia" },
    { value: "tips" as const, label: "Tips", desc: "Comparte consejos" },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="w-full max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <PenTool className="w-7 h-7 text-coral" />
        </div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">Post de tu empresa</h2>
        <p className="text-muted-foreground text-sm">Elige el tipo y personalízalo</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {postTypes.map((t) => (
          <button key={t.value} onClick={() => handleTypeChange(t.value)}
            className={`rounded-xl p-3 text-center transition-all border ${postType === t.value ? "border-coral bg-coral/10 text-coral" : "border-border bg-card text-muted-foreground hover:border-coral/30"}`}>
            <span className="block text-sm font-bold">{t.label}</span>
            <span className="block text-[10px] mt-0.5">{t.desc}</span>
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border mb-4">
        <textarea value={postText} onChange={(e) => setPostText(e.target.value)} rows={6}
          className="w-full bg-transparent text-foreground text-sm resize-none focus:outline-none leading-relaxed whitespace-pre-wrap" maxLength={500} />
      </div>

      <div className="flex gap-2 mb-4">
        <Button variant="outline" onClick={handleEnhance} disabled={enhancing} className="flex-1 border-coral/30 text-coral hover:bg-coral/10">
          {enhancing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Mejorar con IA
        </Button>
        <Button variant="outline" onClick={handleCopy} className="border-border">
          {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          Copiar
        </Button>
      </div>

      <button onClick={() => setPublished(!published)}
        className={`w-full flex items-center justify-center gap-2 rounded-xl p-3 mb-6 text-sm font-medium transition-all border ${published ? "border-green-500 bg-green-500/10 text-green-400" : "border-border bg-card text-muted-foreground hover:border-coral/30"}`}>
        <CheckCircle2 className={`w-4 h-4 ${published ? "text-green-400" : ""}`} />
        {published ? "¡Marcado como publicado!" : "Marcar como 'Ya publicado'"}
      </button>

      <Button onClick={() => onNext(postType, postText, published)}
        className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6">
        Finalizar <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}
