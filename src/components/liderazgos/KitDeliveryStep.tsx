import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Download, Globe, Calendar, Users, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface KitDeliveryStepProps {
  participantId: string;
  profileToken: string;
  name: string;
  onActivateRoute: () => void;
}

export function KitDeliveryStep({ participantId, profileToken, name, onActivateRoute }: KitDeliveryStepProps) {
  const [downloading, setDownloading] = useState(false);
  const [routeActivated, setRouteActivated] = useState(false);
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

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      // Open the profile page content for PDF
      const profileUrl = `${window.location.origin}/liderazgos/perfil/${participantId}?token=${profileToken}&print=true`;
      const resp = await fetch(profileUrl);
      const html = await resp.text();

      const container = document.createElement("div");
      container.innerHTML = html;
      // Extract the main content
      const body = container.querySelector("#kit-content") || container.querySelector("body") || container;

      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `Kit_Liderazgo_${name.replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(body).save();

      // Mark as downloaded
      await supabase.from("participants").update({ kit_downloaded: true }).eq("id", participantId);
    } catch (err) {
      console.error("PDF error:", err);
      // Fallback: open print view
      window.open(`/liderazgos/perfil/${participantId}?token=${profileToken}&print=true`, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const handleActivateRoute = async () => {
    await supabase.from("participants").update({ route_activated: true }).eq("id", participantId);
    // Create 4 weeks of progress entries
    for (let week = 1; week <= 4; week++) {
      await supabase.from("route_progress").upsert(
        { participant_id: participantId, week_number: week, completed: false },
        { onConflict: "participant_id,week_number" }
      );
    }
    setRouteActivated(true);
    onActivateRoute();
  };

  const profileUrl = `/liderazgos/perfil/${participantId}?token=${profileToken}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-coral mx-auto mb-6 flex items-center justify-center">
        <Gift className="w-10 h-10 text-primary-foreground" />
      </div>

      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
        Tu Kit de Liderazgo Digital está listo
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
        Descarga tu kit personalizado, activa tu ruta de 30 días y únete a la comunidad.
      </p>

      <div className="space-y-3">
        <Button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6"
        >
          {downloading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Download className="w-5 h-5 mr-2" />
          )}
          Descargar PDF personalizado
        </Button>

        <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="outline" className="w-full border-coral/30 text-coral hover:bg-coral/10 py-6">
            <Globe className="w-5 h-5 mr-2" />
            Abrir mi micrositio privado
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </a>

        <Button
          onClick={handleActivateRoute}
          disabled={routeActivated}
          variant="outline"
          className={`w-full py-6 ${
            routeActivated
              ? "border-green-500/30 text-green-400 bg-green-500/10"
              : "border-coral/30 text-coral hover:bg-coral/10"
          }`}
        >
          <Calendar className="w-5 h-5 mr-2" />
          {routeActivated ? "✓ Ruta de 30 días activada" : "Activar mi ruta de 30 días"}
        </Button>

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
