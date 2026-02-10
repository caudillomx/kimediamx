import { motion } from "framer-motion";
import { CheckCircle2, Lightbulb, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface ResultPanelProps {
  result: string | null;
  isLoading: boolean;
  mode: "review" | "generate";
}

const ResultPanel = ({ result, isLoading, mode }: ResultPanelProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading && !result) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20" />
          <Loader2 className="w-12 h-12 text-primary animate-spin absolute inset-0" />
        </div>
        <p className="text-sm text-muted-foreground">
          {mode === "review" ? "Analizando tu copy..." : "Generando copy..."}
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <Lightbulb className="w-7 h-7 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1">
            {mode === "review" ? "Listo para revisar" : "Listo para crear"}
          </p>
          <p className="text-xs text-muted-foreground max-w-[240px]">
            {mode === "review"
              ? "Pega tu copy y recibe sugerencias alineadas con los guidelines de KiMedia"
              : "Describe lo que necesitas y generaré copy en el tono de KiMedia"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {mode === "review" ? "Análisis completado" : "Copy generado"}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Copy className="w-3 h-3" />
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>

      <div className="p-4 rounded-lg bg-muted/50 border border-border prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-lg font-bold text-foreground mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-semibold text-foreground mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-semibold text-foreground mb-1">{children}</h3>,
            p: ({ children }) => <p className="text-sm text-foreground/80 mb-3 leading-relaxed">{children}</p>,
            li: ({ children }) => <li className="text-sm text-foreground/80 mb-1">{children}</li>,
            strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
          }}
        >
          {result}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};

export default ResultPanel;
