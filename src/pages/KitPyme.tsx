import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { PymeWelcomeStep, type PymeParticipantInfo } from "@/components/pyme-kit/PymeWelcomeStep";
import { PymeDiagnosticStep } from "@/components/pyme-kit/PymeDiagnosticStep";
import { PymeCompetitiveStep } from "@/components/pyme-kit/PymeCompetitiveStep";
import { PymeIdentityStep } from "@/components/pyme-kit/PymeIdentityStep";
import { PymeBioStep } from "@/components/pyme-kit/PymeBioStep";
import { PymePostStep } from "@/components/pyme-kit/PymePostStep";
import { PymeClosingStep } from "@/components/pyme-kit/PymeClosingStep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import kimediaLogo from "@/assets/kimedia-logo.png";
import { generatePymeBio } from "@/data/pymeKitData";

type Step = "welcome" | "diagnostic" | "competitive" | "identity" | "bio" | "post" | "closing";
const stepOrder: Step[] = ["welcome", "diagnostic", "competitive", "identity", "bio", "post", "closing"];

export default function KitPyme() {
  const [step, setStep] = useState<Step>("welcome");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileToken, setProfileToken] = useState("");
  const [participantInfo, setParticipantInfo] = useState<PymeParticipantInfo | null>(null);
  const [identityData, setIdentityData] = useState<{
    valueProposition: string; targetAudience: string; differentiator: string; brandTone: string;
  } | null>(null);

  const progress = (stepOrder.indexOf(step) / (stepOrder.length - 1)) * 100;

  const handleWelcome = async (info: PymeParticipantInfo) => {
    setParticipantInfo(info);
    try {
      const { data, error } = await supabase
        .from("brand_kit_profiles")
        .insert({
          full_name: info.fullName,
          email: info.email,
          profession: "Empresa",
          social_handle: info.socialHandle,
          industry: info.industry,
          main_channel: info.mainChannel,
          approx_followers: info.approxFollowers,
          has_website: info.hasWebsite,
          kit_type: "pyme",
          company_name: info.companyName,
          company_size: info.companySize,
          years_in_business: info.yearsInBusiness,
        })
        .select("id, profile_token")
        .single();
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
    setStep("competitive");
  };

  const handleCompetitive = async (data: { competitors: string; marketPosition: string }) => {
    if (profileId) {
      await supabase.from("brand_kit_profiles").update({
        competitors: data.competitors, market_position: data.marketPosition,
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
    ? generatePymeBio(participantInfo.companyName, participantInfo.industry, identityData.valueProposition, identityData.targetAudience, identityData.brandTone)
    : "";

  return (
    <div className="min-h-screen bg-background bg-mesh relative">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center"><img src={kimediaLogo} alt="KiMedia" className="h-6 w-auto" /></Link>
          <span className="text-xs text-muted-foreground">Kit PyME</span>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      <div className="pt-20 pb-12 px-4 min-h-screen flex items-center">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {step === "welcome" && <PymeWelcomeStep key="welcome" onNext={handleWelcome} />}
            {step === "diagnostic" && <PymeDiagnosticStep key="diagnostic" onNext={handleDiagnostic} />}
            {step === "competitive" && <PymeCompetitiveStep key="competitive" onNext={handleCompetitive} />}
            {step === "identity" && <PymeIdentityStep key="identity" onNext={handleIdentity} />}
            {step === "bio" && participantInfo && identityData && <PymeBioStep key="bio" initialBio={generatedBio} onNext={handleBio} />}
            {step === "post" && participantInfo && identityData && (
              <PymePostStep key="post" companyName={participantInfo.companyName} industry={participantInfo.industry}
                valueProposition={identityData.valueProposition} targetAudience={identityData.targetAudience} differentiator={identityData.differentiator} onNext={handlePost} />
            )}
            {step === "closing" && participantInfo && (
              <PymeClosingStep key="closing" profileId={profileId} profileToken={profileToken}
                companyName={participantInfo.companyName} industry={participantInfo.industry} socialHandle={participantInfo.socialHandle} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
