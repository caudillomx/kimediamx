import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Briefcase, Lightbulb, AtSign, FileText, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import kimediaLogo from "@/assets/kimedia-logo.png";

export default function BrandKitProfile() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id || !token) { setError("Acceso no autorizado"); setLoading(false); return; }

      const { data } = await supabase
        .from("brand_kit_profiles")
        .select("*")
        .eq("id", id)
        .eq("profile_token", token)
        .maybeSingle();

      if (!data) { setError("Perfil no encontrado o token inválido"); setLoading(false); return; }
      setProfile(data);
      setLoading(false);
    };
    load();
  }, [id, token]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Cargando...</div>;
  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-foreground font-bold">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <img src={kimediaLogo} alt="KiMedia" className="h-6 w-auto" />
          <span className="text-xs text-muted-foreground">Mi Kit de Marca Personal</span>
        </div>
      </div>

      <div className="pt-20 pb-12 px-4 container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-coral mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold text-xl">
            {profile.full_name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">{profile.full_name}</h1>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-1">
            <Briefcase className="w-3 h-3" /> {profile.profession} · {profile.industry}
          </p>
        </motion.div>

        {/* Diagnostic */}
        {profile.diagnostic_score !== null && (
          <Section icon={<Shield className="w-5 h-5" />} title="Diagnóstico de presencia digital">
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-3 h-3 rounded-full ${
                profile.diagnostic_level === "rojo" ? "bg-red-500" :
                profile.diagnostic_level === "amarillo" ? "bg-yellow-500" : "bg-green-500"
              }`} />
              <span className="text-foreground text-sm font-medium capitalize">{profile.diagnostic_level}</span>
              <span className="text-muted-foreground text-xs">· Score: {profile.diagnostic_score}/12</span>
            </div>
            {profile.goal_90_days && (
              <p className="text-muted-foreground text-xs mt-2">Meta a 90 días: {profile.goal_90_days}</p>
            )}
          </Section>
        )}

        {/* Identity */}
        {profile.value_proposition && (
          <Section icon={<Lightbulb className="w-5 h-5" />} title="Identidad de marca">
            <div className="space-y-3">
              <InfoBlock label="Propuesta de valor" text={profile.value_proposition} />
              {profile.target_audience && <InfoBlock label="Audiencia objetivo" text={profile.target_audience} />}
              {profile.differentiator && <InfoBlock label="Diferenciador" text={profile.differentiator} />}
              {profile.brand_tone && <InfoBlock label="Tono de marca" text={profile.brand_tone} />}
            </div>
          </Section>
        )}

        {/* Bio */}
        {profile.bio_text && (
          <Section icon={<FileText className="w-5 h-5" />} title="Bio optimizada">
            <div className="bg-background rounded-lg p-3 border border-border">
              <p className="text-foreground text-sm whitespace-pre-wrap">{profile.bio_text}</p>
            </div>
          </Section>
        )}

        {/* Post */}
        {profile.post_text && (
          <Section icon={<Sparkles className="w-5 h-5" />} title="Post estratégico">
            <div className="bg-background rounded-lg p-3 border border-border">
              <p className="text-[10px] text-coral font-bold uppercase mb-1">{profile.post_type}</p>
              <p className="text-foreground text-sm whitespace-pre-wrap">{profile.post_text}</p>
            </div>
          </Section>
        )}

        {/* Social */}
        {profile.social_handle && (
          <Section icon={<AtSign className="w-5 h-5" />} title="Redes sociales">
            <p className="text-foreground text-sm">{profile.social_handle}</p>
            {profile.main_channel && <p className="text-muted-foreground text-xs mt-1">Canal principal: {profile.main_channel}</p>}
          </Section>
        )}

        <div className="mt-8 pt-4 border-t border-border text-center">
          <p className="text-muted-foreground text-xs">Generado por KiMedia · {new Date().toLocaleDateString("es-MX")}</p>
        </div>
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

function InfoBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[10px] text-coral font-bold uppercase mb-0.5">{label}</p>
      <p className="text-foreground text-sm">{text}</p>
    </div>
  );
}
