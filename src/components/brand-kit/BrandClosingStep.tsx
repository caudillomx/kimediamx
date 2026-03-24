import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Briefcase, AtSign, Lightbulb, ArrowRight, Mail, Phone, Gift, Globe, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface BrandClosingStepProps {
  profileId: string | null;
  profileToken: string;
  name: string;
  profession: string;
  industry: string;
  socialHandle: string;
}

export function BrandClosingStep({
  profileId, profileToken, name, profession, industry, socialHandle,
}: BrandClosingStepProps) {
  const [consentEmail, setConsentEmail] = useState(false);
  const [consentWhatsapp, setConsentWhatsapp] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveConsent = async () => {
    if (profileId) {
      await supabase.from("brand_kit_profiles").update({
        consent_email: consentEmail, consent_whatsapp: consentWhatsapp,
      }).eq("id", profileId);
    }
    setSaved(true);
  };

  const profileUrl = `/kit/marca-personal/perfil/${profileId}?token=${profileToken}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-gradient-coral mx-auto mb-6 flex items-center justify-center shadow-glow"
      >
        {saved ? <Gift className="w-10 h-10 text-primary-foreground" /> : <Star className="w-10 h-10 text-primary-foreground" />}
      </motion.div>

      {!saved ? (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            ¡Tu Kit está <span className="text-gradient">listo</span>!
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Has construido tu diagnóstico, identidad, bio y primer post. ¡Gran paso para tu marca personal!
          </p>

          {/* Profile summary card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-secondary rounded-2xl p-5 border border-border mb-6 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-gradient-coral flex items-center justify-center text-primary-foreground font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-foreground font-bold text-sm">{name}</p>
                <p className="text-muted-foreground text-xs flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> {profession} · {industry}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AtSign className="w-3.5 h-3.5 text-primary" /> {socialHandle}
            </div>
          </motion.div>

          {/* Consent */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-secondary rounded-2xl p-5 border border-border mb-8 text-left space-y-4"
          >
            <p className="text-foreground text-sm font-medium">¿Te gustaría recibir seguimiento?</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Recursos, plantillas y tips para potenciar tu marca.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox id="brand-consent-email" checked={consentEmail}
                  onCheckedChange={c => setConsentEmail(c === true)} />
                <Label htmlFor="brand-consent-email" className="text-sm cursor-pointer flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> Contacto por correo
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox id="brand-consent-whatsapp" checked={consentWhatsapp}
                  onCheckedChange={c => setConsentWhatsapp(c === true)} />
                <Label htmlFor="brand-consent-whatsapp" className="text-sm cursor-pointer flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" /> Contacto por WhatsApp
                </Label>
              </div>
            </div>
          </motion.div>

          <Button
            onClick={handleSaveConsent}
            className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold rounded-xl h-12 shadow-glow"
          >
            Recibir mi kit <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Tu Kit de Marca Personal está listo
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Accede a tu perfil privado con todo tu contenido personalizado.
          </p>

          <div className="space-y-3">
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold rounded-xl h-12 shadow-glow">
                <Globe className="w-5 h-5 mr-2" /> Abrir mi perfil de marca <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>

            {/* CTA to content engine */}
            <div className="bg-secondary rounded-2xl p-5 border border-primary/20 text-left">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground font-semibold text-sm mb-1">¿Quieres una estrategia completa?</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Con el Motor de Contenido de KiMedia, tu kit se convierte en la base para generar parrillas de contenido profesionales, evaluar rendimiento y escalar tu marca.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
