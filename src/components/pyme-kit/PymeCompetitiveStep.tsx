import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  onNext: (data: { competitors: string; marketPosition: string }) => void;
}

const positionOptions = [
  { value: "lider", label: "Líder del mercado", desc: "Somos los más conocidos en nuestra zona o nicho" },
  { value: "retador", label: "Retador", desc: "Competimos fuerte con los líderes" },
  { value: "seguidor", label: "Seguidor", desc: "Seguimos tendencias del mercado" },
  { value: "nicho", label: "Especialista de nicho", desc: "Atendemos un segmento muy específico" },
  { value: "nuevo", label: "Nuevo entrante", desc: "Estamos empezando en el mercado" },
];

export function PymeCompetitiveStep({ onNext }: Props) {
  const [competitors, setCompetitors] = useState("");
  const [marketPosition, setMarketPosition] = useState("");

  const canProceed = competitors.trim().length > 3 && marketPosition;

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="w-full max-w-lg mx-auto">
      <div className="text-center mb-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <Search className="w-7 h-7 text-coral" />
        </motion.div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">Análisis competitivo</h2>
        <p className="text-muted-foreground text-sm">Conoce tu posición en el mercado para diferenciarte</p>
      </div>

      <TooltipProvider delayDuration={300}>
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <Label className="flex items-center gap-2 text-sm">
              ¿Quiénes son tus principales competidores?
              <Tooltip><TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                <TooltipContent><p className="max-w-[220px] text-xs">Menciona 2-3 empresas o negocios que ofrecen algo similar al tuyo en tu zona o mercado</p></TooltipContent>
              </Tooltip>
            </Label>
            <Input value={competitors} onChange={(e) => setCompetitors(e.target.value)}
              placeholder="Ej: Panadería Don Juan, La Hogaza, Pan Artesanal MX" className="bg-card border-border" maxLength={200} />
            <p className="text-xs text-muted-foreground">Puedes separar con comas. No te preocupes si no conoces el nombre exacto.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
            <Label className="text-sm">¿Cómo describes la posición de tu empresa en el mercado?</Label>
            <div className="space-y-2">
              {positionOptions.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setMarketPosition(opt.value)}
                  className={`w-full rounded-xl p-4 text-left transition-all border ${marketPosition === opt.value ? "border-coral bg-coral/10" : "border-border bg-card hover:border-coral/30"}`}>
                  <span className={`block text-sm font-bold ${marketPosition === opt.value ? "text-coral" : "text-foreground"}`}>{opt.label}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <Button onClick={() => onNext({ competitors, marketPosition })} disabled={!canProceed}
          className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6 mt-6">
          Construir identidad de marca <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </TooltipProvider>
    </motion.div>
  );
}
