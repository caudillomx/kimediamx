import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Briefcase, AtSign, Lightbulb, ArrowRight, Mail, Phone, Gift, Globe, ExternalLink } from "lucide-react";
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
  profileId,
  profileToken,
  name,
  profession,
  industry,
  socialHandle,
}: BrandClosingStepProps) {
  const [consentEmail, setConsentEmail] = useState(false);
  const [consentWhatsapp, setConsentWhatsapp] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveConsent = async () => {
    if (profileId) {
      await supabase
        .from("brand_kit_profiles")
        .update({
          consent_email: consentEmail,
          consent_whatsapp: consentWhatsapp,
        })
        .eq("id", profileId);
    }
    setSaved(true);
  };

  const profileUrl = `/kit/marca-personal/perfil/${profileId}?token=${profileToken}`;

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
        {saved ? (
          <Gift className="w-10 h-10 text-primary-foreground" />
        ) : (
          <Star className="w-10 h-10 text-primary-foreground" />
        )}
      </motion.div>

      {!saved ? (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            ¡Tu Kit de Marca Personal está listo!
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Has construido tu diagnóstico, identidad, bio y primer post. ¡Gran paso!
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
                    <Briefcase className="w-3 h-3" /> {profession}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-coral" />
                <span className="text-muted-foreground">{industry}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AtSign className="w-4 h-4 text-coral" />
                <span className="text-muted-foreground">{socialHandle}</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border mb-8 text-left space-y-4">
            <p className="text-foreground text-sm font-medium">
              ¿Nos permites estar en contacto contigo?
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Para enviarte recursos, plantillas y seguimiento de tu marca personal.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="brand-consent-email"
                  checked={consentEmail}
                  onCheckedChange={(checked) => setConsentEmail(checked === true)}
                />
                <Label htmlFor="brand-consent-email" className="text-sm cursor-pointer flex items-center gap-2">
                  <Mail className="w-4 h-4 text-coral" />
                  Autorizo contacto por correo electrónico
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="brand-consent-whatsapp"
                  checked={consentWhatsapp}
                  onCheckedChange={(checked) => setConsentWhatsapp(checked === true)}
                />
                <Label htmlFor="brand-consent-whatsapp" className="text-sm cursor-pointer flex items-center gap-2">
                  <Phone className="w-4 h-4 text-coral" />
                  Autorizo contacto por WhatsApp
                </Label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSaveConsent}
            className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6"
          >
            Recibir mi kit <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </>
      ) : (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Tu Kit de Marca Personal está listo
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Accede a tu perfil con todo tu contenido personalizado.
          </p>

          <div className="space-y-3">
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6">
                <Globe className="w-5 h-5 mr-2" />
                Abrir mi perfil de marca
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </>
      )}
    </motion.div>
  );
}
