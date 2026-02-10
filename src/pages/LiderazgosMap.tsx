import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MexicoMap } from "@/components/liderazgos/MexicoMap";
import { Button } from "@/components/ui/button";
import kimediaLogo from "@/assets/kimedia-logo.png";

interface MapParticipant {
  full_name: string;
  state: string;
  cause: string | null;
  social_handle: string;
}

export default function LiderazgosMap() {
  const [participants, setParticipants] = useState<MapParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("participants")
        .select("full_name, state, cause, social_handle")
        .eq("show_on_map", true);
      setParticipants(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  // Aggregate by state
  const stateData = Object.entries(
    participants.reduce((acc, p) => {
      acc[p.state] = (acc[p.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([state, count]) => ({ state, count }));

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={kimediaLogo} alt="KiMedia" className="h-6 w-auto" />
          </Link>
          <span className="text-xs text-muted-foreground font-medium">Mapa de Liderazgos</span>
        </div>
      </div>

      <div className="pt-20 pb-12 px-4 container mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-coral flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Mapa de Liderazgos Digitales
          </h1>
          <p className="text-muted-foreground text-sm">
            {participants.length} liderazgo{participants.length !== 1 ? "s" : ""} activo{participants.length !== 1 ? "s" : ""} en el país
          </p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Cargando mapa...</div>
        ) : (
          <>
            <MexicoMap stateData={stateData} />

            {participants.length > 0 && (
              <div className="mt-12 max-w-2xl mx-auto">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Participantes</h3>
                <div className="grid gap-3">
                  {participants.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-card rounded-xl p-4 border border-border flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-coral flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                        {p.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground font-medium text-sm truncate">{p.full_name}</p>
                        <p className="text-muted-foreground text-xs">{p.state} · {p.cause || "—"}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-center mt-12">
          <Link to="/">
            <Button variant="outline" className="border-border text-muted-foreground">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
