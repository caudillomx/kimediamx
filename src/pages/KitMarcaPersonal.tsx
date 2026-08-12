import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BrandWelcomeStep, type BrandParticipantInfo } from "@/components/brand-kit/BrandWelcomeStep";
import { BrandDiagnosticStep } from "@/components/brand-kit/BrandDiagnosticStep";
import { BrandIdentityStep } from "@/components/brand-kit/BrandIdentityStep";
import { ContentContextStep, type ContentContextData } from "@/components/brand-kit/ContentContextStep";
import { BrandClosingStep } from "@/components/brand-kit/BrandClosingStep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import kimediaLogo from "@/assets/kimedia-logo.png";
import { Activity, Lightbulb, Sparkles, Layers, Star } from "lucide-react";

type Step = "welcome" | "diagnostic" | "identity" | "context" | "closing";
const stepOrder: Step[] = ["welcome", "diagnostic", "identity", "context", "closing"];
const STEP_ICONS = [Sparkles, Activity, Lightbulb, Layers, Star];
const STEP_LABELS = ["Datos", "Diagnóstico", "Identidad", "Contexto", "Resumen"];

export default function KitMarcaPersonal() {
  const [step, setStep] = useState<Step>("welcome");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileToken, setProfileToken] = useState<string | null>(null);
  const [participantInfo, setParticipantInfo] = useState<BrandParticipantInfo | null>(null);

  const currentIdx = stepOrder.indexOf(step);
  const progress = (currentIdx / (stepOrder.length - 1)) * 100;

  // El token es la credencial del briefing: sin él nadie más puede editar la ficha.
  const patchProfile = async (patch: Record<string, unknown>) => {
    if (!profileId || !profileToken) return;
    await supabase.rpc("brand_kit_apply_patch", { _id: profileId, _token: profileToken, _patch: patch as any });
  };

  const handleWelcome = async (info: BrandParticipantInfo) => {
    setParticipantInfo(info);
    try {
      const newId = crypto.randomUUID();
      const newToken = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
      const { error } = await supabase.from("brand_kit_profiles").insert({
        id: newId, profile_token: newToken,
        full_name: info.fullName, email: info.email, profession: info.profession,
        industry: info.industry, social_handle: info.socialHandle,
        main_channel: info.mainChannel, approx_followers: info.approxFollowers, has_website: info.hasWebsite,
        competitors: info.competitors || null,
      });
      if (error) throw error;
      setProfileId(newId);
      setProfileToken(newToken);
    } catch {
      toast({ title: "Error guardando datos", variant: "destructive" });
    }
    setStep("diagnostic");
  };

  const handleDiagnostic = async (score: number, level: string, extras: { frequency: string; perception: string; goal: string }) => {
    await patchProfile({
      diagnostic_score: score, diagnostic_level: level,
      publication_frequency: extras.frequency, self_perception: extras.perception, goal_90_days: extras.goal,
    });
    setStep("identity");
  };

  const handleIdentity = async (data: { valueProposition: string; targetAudience: string; differentiator: string; brandTone: string }) => {
    await patchProfile({
      value_proposition: data.valueProposition, target_audience: data.targetAudience,
      differentiator: data.differentiator, brand_tone: data.brandTone,
    });
    setStep("context");
  };

  const handleContext = async (data: ContentContextData) => {
    await patchProfile({
      content_pillars: data.contentPillars,
      reference_accounts: data.referenceAccounts || null,
      content_restrictions: data.contentRestrictions || null,
      key_dates: data.keyDates || null,
      preferred_formats: data.preferredFormats,
    });
    setStep("closing");
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />

      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={kimediaLogo} alt="KiMedia" className="h-5 w-auto opacity-70 hover:opacity-100 transition-opacity" />
          </Link>

          <div className="flex items-center gap-1">
            {stepOrder.map((s, i) => {
              const Icon = STEP_ICONS[i];
              const isActive = i === currentIdx;
              const isDone = i < currentIdx;
              return (
                <div key={s} className="flex items-center">
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1, opacity: isActive ? 1 : isDone ? 0.7 : 0.3 }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" :
                      isDone ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </motion.div>
                  {i < stepOrder.length - 1 && (
                    <div className={`w-3 h-0.5 mx-0.5 rounded-full transition-colors ${isDone ? "bg-primary/40" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-0.5 bg-border">
          <motion.div className="h-full bg-gradient-coral" animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
        </div>
      </div>

      <div className="relative z-10 pt-20 pb-16 px-4 min-h-screen flex items-center">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {step === "welcome" && <BrandWelcomeStep key="welcome" onNext={handleWelcome} />}
            {step === "diagnostic" && <BrandDiagnosticStep key="diagnostic" onNext={handleDiagnostic} />}
            {step === "identity" && <BrandIdentityStep key="identity" onNext={handleIdentity} />}
            {step === "context" && <ContentContextStep key="context" onNext={handleContext} onBack={() => setStep("identity")} />}
            {step === "closing" && participantInfo && (
              <BrandClosingStep key="closing" profileId={profileId} profileToken={profileToken}
                name={participantInfo.fullName} profession={participantInfo.profession}
                industry={participantInfo.industry} email={participantInfo.email}
                socialHandle={participantInfo.socialHandle} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
