import { useState } from "react";
import { Send, Instagram, Mail, Megaphone, FileText } from "lucide-react";
import { motion } from "framer-motion";

type Mode = "review" | "generate";
type CopyType = "social" | "email" | "ad" | "blog";

interface CopyInputProps {
  mode: Mode;
  onSubmit: (text: string, copyType: CopyType) => void;
  isLoading: boolean;
}

const copyTypes: { value: CopyType; label: string; icon: React.ReactNode }[] = [
  { value: "social", label: "Redes Sociales", icon: <Instagram className="w-3.5 h-3.5" /> },
  { value: "email", label: "Email", icon: <Mail className="w-3.5 h-3.5" /> },
  { value: "ad", label: "Ads", icon: <Megaphone className="w-3.5 h-3.5" /> },
  { value: "blog", label: "Blog / Web", icon: <FileText className="w-3.5 h-3.5" /> },
];

const CopyInput = ({ mode, onSubmit, isLoading }: CopyInputProps) => {
  const [text, setText] = useState("");
  const [copyType, setCopyType] = useState<CopyType>("social");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text, copyType);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {copyTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setCopyType(type.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              copyType === type.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {type.icon}
            {type.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            mode === "review"
              ? "Pega aquí tu copy para recibir feedback..."
              : "Describe qué tipo de copy necesitas, el objetivo, audiencia, tono..."
          }
          className="w-full min-h-[200px] p-4 pb-14 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {text.length} caracteres
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            {mode === "review" ? "Analizar" : "Generar"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CopyInput;
