import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, MapPin, Heart, Building2, Mic, FileText, Calendar, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { route30DaysContent } from "@/data/liderazgosData";
import { toast } from "@/hooks/use-toast";
import kimediaLogo from "@/assets/kimedia-logo.png";

interface RouteWeek {
  id: string;
  week_number: number;
  completed: boolean;
  post_text: string | null;
}

export default function ParticipantProfile() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const isPrint = searchParams.get("print") === "true";

  const [participant, setParticipant] = useState<any>(null);
  const [routeWeeks, setRouteWeeks] = useState<RouteWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingWeek, setGeneratingWeek] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [id, token]);

  const loadData = async () => {
    if (!id || !token) { setError("Acceso no autorizado"); setLoading(false); return; }

    const { data: p } = await supabase
      .from("participants")
      .select("*")
      .eq("id", id)
      .eq("profile_token", token)
      .single();

    if (!p) { setError("Perfil no encontrado o token inválido"); setLoading(false); return; }
    setParticipant(p);

    const { data: weeks } = await supabase
      .from("route_progress")
      .select("*")
      .eq("participant_id", id)
      .order("week_number");

    setRouteWeeks(weeks || []);
    setLoading(false);
  };

  const handleGenerateWeekPost = async (weekNum: number) => {
    setGeneratingWeek(weekNum);
    const weekContent = route30DaysContent[weekNum - 1];
    try {
      const { data, error } = await supabase.functions.invoke("enhance-text", {
        body: {
          text: weekContent.postExample
            .replace("[tiempo]", "un tiempo")
            .replace("[causa]", participant.cause || "mi causa")
            .replace("[convicción]", participant.conviction || "mi compromiso")
            .replace("[dato sobre causa]", `la realidad de ${participant.cause || "esta causa"}`)
            .replace("[territorio]", participant.territory || participant.state)
            .replace("[lugar]", participant.territory || participant.state)
            .replace("[población]", participant.strategic_audience || "la ciudadanía")
            .replace("[organización]", participant.organization || "mi organización")
            .replace("[necesidad]", participant.cause || "atención urgente")
            .replace("[acción]", "actuar con compromiso")
            .replace("[adjetivo]", "justo"),
          type: "post",
        },
      });
      if (error) throw error;
      const postText = data?.enhanced || weekContent.postExample;

      await supabase.from("route_progress").update({ post_text: postText }).eq("participant_id", id).eq("week_number", weekNum);
      setRouteWeeks((prev) =>
        prev.map((w) => (w.week_number === weekNum ? { ...w, post_text: postText } : w))
      );
    } catch {
      toast({ title: "No se pudo generar", variant: "destructive" });
    } finally {
      setGeneratingWeek(null);
    }
  };

  const handleCompleteWeek = async (weekNum: number) => {
    await supabase.from("route_progress").update({ completed: true, completed_at: new Date().toISOString() }).eq("participant_id", id).eq("week_number", weekNum);
    setRouteWeeks((prev) =>
      prev.map((w) => (w.week_number === weekNum ? { ...w, completed: true } : w))
    );
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Cargando...</div>;
  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-foreground font-bold">{error}</p>
      </div>
    </div>
  );

  const completedWeeks = routeWeeks.filter((w) => w.completed).length;
  const routeProgress = routeWeeks.length > 0 ? (completedWeeks / 4) * 100 : 0;
  const spokeGuide = participant.spokesperson_guide as any;

  return (
    <div className={`min-h-screen bg-background ${isPrint ? "print-mode" : ""}`}>
      {!isPrint && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <img src={kimediaLogo} alt="KiMedia" className="h-6 w-auto" />
            <span className="text-xs text-muted-foreground">Micrositio Privado</span>
          </div>
        </div>
      )}

      <div className={`${isPrint ? "p-8" : "pt-20 pb-12 px-4"} container mx-auto max-w-2xl`} id="kit-content">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-coral mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold text-xl">
            {participant.full_name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">{participant.full_name}</h1>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-1">
            <MapPin className="w-3 h-3" /> {participant.state} · {participant.role_title}
          </p>
        </motion.div>

        {/* Diagnostic */}
        {participant.diagnostic_score !== null && (
          <Section icon={<Shield className="w-5 h-5" />} title="Diagnóstico de visibilidad">
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-3 h-3 rounded-full ${
                participant.diagnostic_level === "rojo" ? "bg-red-500" :
                participant.diagnostic_level === "amarillo" ? "bg-yellow-500" : "bg-green-500"
              }`} />
              <span className="text-foreground text-sm font-medium capitalize">{participant.diagnostic_level}</span>
              <span className="text-muted-foreground text-xs">· Score: {participant.diagnostic_score}/12</span>
            </div>
          </Section>
        )}

        {/* Personal Message */}
        {participant.political_message && (
          <Section icon={<Heart className="w-5 h-5" />} title="Mensaje político personal">
            <p className="text-foreground text-sm leading-relaxed">{participant.political_message}</p>
          </Section>
        )}

        {/* Institutional Card */}
        {participant.institutional_card && (
          <Section icon={<Building2 className="w-5 h-5" />} title="Ficha institucional">
            <p className="text-foreground text-sm leading-relaxed">{participant.institutional_card}</p>
            {participant.organization && (
              <p className="text-muted-foreground text-xs mt-2">
                {participant.institutional_role} · {participant.organization} · Nivel {participant.responsibility_level}
              </p>
            )}
          </Section>
        )}

        {/* Spokesperson Guide */}
        {spokeGuide && (
          <Section icon={<Mic className="w-5 h-5" />} title="Guía de vocería">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Frase eje</p>
                <p className="text-foreground text-sm font-medium italic">"{spokeGuide.phrase}"</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Palabras clave</p>
                <div className="flex flex-wrap gap-1">
                  {spokeGuide.keywords?.map((k: string) => (
                    <span key={k} className="text-xs bg-coral/10 text-coral px-2 py-0.5 rounded-full">{k}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Enfoques narrativos</p>
                <ul className="text-foreground text-xs space-y-1">
                  {spokeGuide.narratives?.map((n: string, i: number) => (
                    <li key={i}>• {n}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Consistencia</p>
                <ul className="text-foreground text-xs space-y-1">
                  {spokeGuide.consistency?.map((c: string, i: number) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>
        )}

        {/* Bios */}
        {(participant.bio_text || participant.bio_institutional || participant.bio_hybrid) && (
          <Section icon={<FileText className="w-5 h-5" />} title="Bios generadas">
            <div className="space-y-3">
              {participant.bio_text && <BioBlock label="Personal" text={participant.bio_text} />}
              {participant.bio_institutional && <BioBlock label="Institucional" text={participant.bio_institutional} />}
              {participant.bio_hybrid && <BioBlock label="Híbrida" text={participant.bio_hybrid} />}
            </div>
          </Section>
        )}

        {/* Posts */}
        {(participant.post_text || participant.institutional_post_text) && (
          <Section icon={<FileText className="w-5 h-5" />} title="Posts generados">
            {participant.post_text && <BioBlock label="Post personal" text={participant.post_text} />}
            {participant.institutional_post_text && <BioBlock label="Post institucional" text={participant.institutional_post_text} />}
          </Section>
        )}

        {/* Route 30 Days */}
        {routeWeeks.length > 0 && !isPrint && (
          <Section icon={<Calendar className="w-5 h-5" />} title="Ruta de 30 días">
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progreso</span>
                <span>{completedWeeks}/4 semanas</span>
              </div>
              <Progress value={routeProgress} className="h-2" />
            </div>
            <div className="space-y-4">
              {route30DaysContent.map((week) => {
                const weekData = routeWeeks.find((w) => w.week_number === week.week);
                const isCompleted = weekData?.completed;
                return (
                  <div key={week.week} className={`rounded-xl p-4 border ${isCompleted ? "border-green-500/30 bg-green-500/5" : "border-border bg-card"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-foreground">Semana {week.week}: {week.title}</h4>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    </div>
                    <p className="text-muted-foreground text-xs mb-2">{week.subtitle}</p>
                    <p className="text-foreground text-xs leading-relaxed mb-3">{week.guide}</p>

                    {weekData?.post_text && (
                      <div className="bg-background rounded-lg p-3 mb-3 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Tu post generado:</p>
                        <p className="text-foreground text-xs whitespace-pre-wrap">{weekData.post_text}</p>
                      </div>
                    )}

                    {!isCompleted && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateWeekPost(week.week)}
                          disabled={generatingWeek === week.week}
                          className="text-xs border-coral/30 text-coral"
                        >
                          {generatingWeek === week.week ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                          Generar contenido con IA
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompleteWeek(week.week)}
                          className="text-xs"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Completar
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {isPrint && (
          <div className="mt-8 pt-4 border-t border-border text-center">
            <p className="text-muted-foreground text-xs">Generado por KiMedia · {new Date().toLocaleDateString("es-MX")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-coral">{icon}</span>
        <h3 className="font-display text-sm font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function BioBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="bg-background rounded-lg p-3 border border-border">
      <p className="text-[10px] text-coral font-bold uppercase mb-1">{label}</p>
      <p className="text-foreground text-xs whitespace-pre-wrap">{text}</p>
    </div>
  );
}
