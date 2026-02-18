import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Globe, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { KitPDFGenerator } from "./KitPDFGenerator";

interface KitDeliveryStepProps {
  participantId: string;
  profileToken: string;
  name: string;
  onActivateRoute: () => void;
}

export function KitDeliveryStep({ participantId, profileToken, name, onActivateRoute }: KitDeliveryStepProps) {
  const [communityLink, setCommunityLink] = useState("");

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "community_link")
      .single()
      .then(({ data }) => {
        if (data?.value) setCommunityLink(data.value);
      });
  }, []);

  const profileUrl = `/liderazgos/perfil/${participantId}?token=${profileToken}`;

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
        <Gift className="w-10 h-10 text-primary-foreground" />
      </motion.div>

      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
        Tu Kit de Liderazgo Digital está listo
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
        Accede a tu micrositio privado con todo tu contenido personalizado y únete a la comunidad.
      </p>

      <div className="space-y-3">
        <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6">
            <Globe className="w-5 h-5 mr-2" />
            Abrir mi micrositio privado
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </a>

        <KitPDFGenerator participantId={participantId} />

        {communityLink && (
          <a href={communityLink} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground py-6">
              <Users className="w-5 h-5 mr-2" />
              Unirme a la comunidad de liderazgos
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        )}
      </div>
    </motion.div>
  );
}
