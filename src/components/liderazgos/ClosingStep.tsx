import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, AtSign, Heart, ArrowRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ClosingStepProps {
  participantId: string | null;
  name: string;
  state: string;
  cause: string;
  socialHandle: string;
  onNext: () => void;
}

export function ClosingStep({ participantId, name, state, cause, socialHandle, onNext }: ClosingStepProps) {
  const [consentEmail, setConsentEmail] = useState(false);
  const [consentWhatsapp, setConsentWhatsapp] = useState(false);

  const handleNext = async () => {
    if (participantId) {
      await supabase.from("participants").update({
        consent_email: consentEmail,
        consent_whatsapp: consentWhatsapp,
      }).eq("id", participantId);
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-gradient-coral mx-auto mb-6 flex items-center justify-center shadow-glow"
      >
        <Star className="w-10 h-10 text-primary-foreground" />
      </motion.div>

      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
        Tu liderazgo ya es visible
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
        Hoy diste el primer paso para que más personas conozcan tu causa. ¡Sigue construyendo tu presencia digital!
      </p>

      <div className="bg-card rounded-2xl p-6 border border-border mb-6 text-left">
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

      {/* Contact consent */}
      <div className="bg-card rounded-2xl p-5 border border-border mb-8 text-left space-y-4">
        <p className="text-foreground text-sm font-medium">
          ¿Nos permites estar en contacto contigo?
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Selecciona los canales por los que podemos enviarte recursos, invitaciones y seguimiento de tu proceso.
        </p>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="consent-email"
              checked={consentEmail}
              onCheckedChange={(checked) => setConsentEmail(checked === true)}
            />
            <Label htmlFor="consent-email" className="text-sm cursor-pointer flex items-center gap-2">
              <Mail className="w-4 h-4 text-coral" />
              Autorizo contacto por correo electrónico
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="consent-whatsapp"
              checked={consentWhatsapp}
              onCheckedChange={(checked) => setConsentWhatsapp(checked === true)}
            />
            <Label htmlFor="consent-whatsapp" className="text-sm cursor-pointer flex items-center gap-2">
              <Phone className="w-4 h-4 text-coral" />
              Autorizo contacto por WhatsApp
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleNext}
          className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6"
        >
          Recibir mi kit <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
