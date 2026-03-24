import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BrandWelcomeStep, type BrandParticipantInfo } from "@/components/brand-kit/BrandWelcomeStep";
import { BrandDiagnosticStep } from "@/components/brand-kit/BrandDiagnosticStep";
import { BrandIdentityStep } from "@/components/brand-kit/BrandIdentityStep";
import { BrandBioStep } from "@/components/brand-kit/BrandBioStep";
import { BrandPostStep } from "@/components/brand-kit/BrandPostStep";
import { BrandClosingStep } from "@/components/brand-kit/BrandClosingStep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import kimediaLogo from "@/assets/kimedia-logo.png";
import { generateBrandBio } from "@/data/brandKitData";
import { Activity, Lightbulb, UserCircle, PenTool, Star, Sparkles } from "lucide-react";

type Step = "welcome" | "diagnostic" | "identity" | "bio" | "post" | "closing";
const stepOrder: Step[] = ["welcome", "diagnostic", "identity", "bio", "post", "closing"];
const STEP_ICONS = [Sparkles, Activity, Lightbulb, UserCircle, PenTool, Star];
const STEP_LABELS = ["Datos", "Diagnóstico", "Identidad", "Bio", "Post", "Kit"];

export default function KitMarcaPersonal() {
  const [step, setStep] = useState<Step>("welcome");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileToken, setProfileToken] = useState("");
  const [participantInfo, setParticipantInfo] = useState<BrandParticipantInfo | null>(null);
  const [identityData, setIdentityData] = useState<{
    valueProposition: string; targetAudience: string; differentiator: string; brandTone: string;
  } | null>(null);

  const currentIdx = stepOrder.indexOf(step);
  const progress = (currentIdx / (stepOrder.length - 1)) * 100;

  const handleWelcome = async (info: BrandParticipantInfo) => {
    setParticipantInfo(info);
    try {
      const { data, error } = await supabase.from("brand_kit_profiles").insert({
        full_name: info.fullName, email: info.email, profession: info.profession,
        industry: info.industry, social_handle: info.socialHandle,
        main_channel: info.mainChannel, approx_followers: info.approxFollowers, has_website: info.hasWebsite,
      }).select("id, profile_token").single();
      if (error) throw error;
      setProfileId(data.id);
      setProfileToken(data.profile_token || "");
    } catch {
      toast({ title: "Error guardando datos", variant: "destructive" });
    }
    setStep("diagnostic");
  };

  const handleDiagnostic = async (score: number, level: string, extras: { frequency: string; perception: string; goal: string }) => {
    if (profileId) {
      await supabase.from("brand_kit_profiles").update({
        diagnostic_score: score, diagnostic_level: level,
        publication_frequency: extras.frequency, self_perception: extras.perception, goal_90_days: extras.goal,
      }).eq("id", profileId);
    }
    setStep("identity");
  };

  const handleIdentity = async (data: typeof identityData) => {
    setIdentityData(data);
    if (profileId && data) {
      await supabase.from("brand_kit_profiles").update({
        value_proposition: data.valueProposition, target_audience: data.targetAudience,
        differentiator: data.differentiator, brand_tone: data.brandTone,
      }).eq("id", profileId);
    }
    setStep("bio");
  };

  const handleBio = async (bio: string) => {
    if (profileId) await supabase.from("brand_kit_profiles").update({ bio_text: bio }).eq("id", profileId);
    setStep("post");
  };

  const handlePost = async (postType: string, postText: string, published: boolean) => {
    if (profileId) await supabase.from("brand_kit_profiles").update({ post_type: postType, post_text: postText, post_published: published }).eq("id", profileId);
    setStep("closing");
  };

  const generatedBio = participantInfo && identityData
    ? generateBrandBio(participantInfo.fullName, participantInfo.profession, participantInfo.industry,
        identityData.valueProposition, identityData.targetAudience, identityData.brandTone)
    : "";

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background mesh */}
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={kimediaLogo} alt="KiMedia" className="h-5 w-auto opacity-70 hover:opacity-100 transition-opacity" />
          </Link>

          {/* Step indicators */}
          <div className="flex items-center gap-1">
            {stepOrder.map((s, i) => {
              const Icon = STEP_ICONS[i];
              const isActive = i === currentIdx;
              const isDone = i < currentIdx;
              return (
                <div key={s} className="flex items-center">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      opacity: isActive ? 1 : isDone ? 0.7 : 0.3,
                    }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" :
                      isDone ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </motion.div>
                  {i < stepOrder.length - 1 && (
                    <div className={`w-3 h-0.5 mx-0.5 rounded-full transition-colors ${
                      isDone ? "bg-primary/40" : "bg-border"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-border">
          <motion.div
            className="h-full bg-gradient-coral"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-20 pb-16 px-4 min-h-screen flex items-center">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {step === "welcome" && <BrandWelcomeStep key="welcome" onNext={handleWelcome} />}
            {step === "diagnostic" && <BrandDiagnosticStep key="diagnostic" onNext={handleDiagnostic} />}
            {step === "identity" && <BrandIdentityStep key="identity" onNext={handleIdentity} />}
            {step === "bio" && participantInfo && identityData && (
              <BrandBioStep key="bio" initialBio={generatedBio} onNext={handleBio} />
            )}
            {step === "post" && participantInfo && identityData && (
              <BrandPostStep key="post" profession={participantInfo.profession} industry={participantInfo.industry}
                valueProposition={identityData.valueProposition} targetAudience={identityData.targetAudience}
                differentiator={identityData.differentiator} onNext={handlePost} />
            )}
            {step === "closing" && participantInfo && (
              <BrandClosingStep key="closing" profileId={profileId} profileToken={profileToken}
                name={participantInfo.fullName} profession={participantInfo.profession}
                industry={participantInfo.industry} socialHandle={participantInfo.socialHandle} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
