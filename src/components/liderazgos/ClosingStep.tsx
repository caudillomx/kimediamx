import { motion } from "framer-motion";
import { Star, MapPin, AtSign, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ClosingStepProps {
  name: string;
  state: string;
  cause: string;
  socialHandle: string;
  onNext: () => void;
}

export function ClosingStep({ name, state, cause, socialHandle, onNext }: ClosingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-coral mx-auto mb-6 flex items-center justify-center">
        <Star className="w-10 h-10 text-primary-foreground" />
      </div>

      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
        Tu liderazgo ya es visible
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
        Hoy diste el primer paso para que más personas conozcan tu causa. ¡Sigue construyendo tu presencia digital!
      </p>

      <div className="bg-card rounded-2xl p-6 border border-border mb-8 text-left">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-coral flex items-center justify-center text-primary-foreground font-bold text-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-foreground font-bold text-sm">{name}</p>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <MapPin className="w-3 h-3" /> {state}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Heart className="w-4 h-4 text-coral" />
            <span className="text-muted-foreground">{cause}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AtSign className="w-4 h-4 text-coral" />
            <span className="text-muted-foreground">{socialHandle}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onNext}
          className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6"
        >
          Recibir mi kit <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Link to="/liderazgos/mapa">
          <Button variant="outline" className="w-full border-border text-muted-foreground">
            Ver mapa completo en KiMedia
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
