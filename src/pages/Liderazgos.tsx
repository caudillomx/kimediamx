import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { AccessCodeScreen } from "@/components/liderazgos/AccessCodeScreen";
import { WelcomeStep, type ParticipantInfo } from "@/components/liderazgos/WelcomeStep";
import { DiagnosticStep } from "@/components/liderazgos/DiagnosticStep";
import { MessageBuilderStep } from "@/components/liderazgos/MessageBuilderStep";
import { InstitutionalIdentityStep } from "@/components/liderazgos/InstitutionalIdentityStep";
import { SpokespersonStep } from "@/components/liderazgos/SpokespersonStep";
import { BioGeneratorStep } from "@/components/liderazgos/BioGeneratorStep";
import { PostGeneratorStep } from "@/components/liderazgos/PostGeneratorStep";
import { InstitutionalPostStep } from "@/components/liderazgos/InstitutionalPostStep";
import { ClosingStep } from "@/components/liderazgos/ClosingStep";
import { KitDeliveryStep } from "@/components/liderazgos/KitDeliveryStep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import kimediaLogo from "@/assets/kimedia-logo.png";
import { generateSpokespersonGuide } from "@/data/liderazgosData";

type Step =
  | "code" | "welcome" | "diagnostic" | "message"
  | "institutional" | "spokesperson"
  | "bio" | "post" | "institutional_post"
  | "closing" | "kit";

const stepOrder: Step[] = [
  "code", "welcome", "diagnostic", "message",
  "institutional", "spokesperson",
  "bio", "post", "institutional_post",
  "closing", "kit",
];

export default function Liderazgos() {
  const [step, setStep] = useState<Step>("code");
  const [accessCode, setAccessCode] = useState("");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [profileToken, setProfileToken] = useState<string>("");
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo | null>(null);
  const [messageData, setMessageData] = useState<{
    cause: string;
    conviction: string;
    population: string[];
    territory: string;
    message: string;
  } | null>(null);
  const [institutionalData, setInstitutionalData] = useState<{
    institutionalRole: string;
    responsibilityLevel: string;
    organization: string;
    orgCauses: string[];
    strategicAudience: string;
    institutionalCard: string;
    commBudget: string;
  } | null>(null);
  const [spokespersonData, setSpokespersonData] = useState<{
    phrase: string;
    tone: string;
    quarterlyTopics: string[];
    sensitiveTopics: string[];
    guide: ReturnType<typeof generateSpokespersonGuide>;
  } | null>(null);

  const progress = (stepOrder.indexOf(step) / (stepOrder.length - 1)) * 100;

  const handleCodeValid = (code: string) => {
    setAccessCode(code);
    setStep("welcome");
  };

  const handleWelcome = async (info: ParticipantInfo) => {
    setParticipantInfo(info);
    try {
      const { data, error } = await supabase
        .from("participants")
        .insert({
          full_name: info.fullName,
          state: info.state,
          role_title: info.roleTitle,
          social_handle: info.socialHandle,
          access_code_used: accessCode,
          approx_followers: info.approxFollowers,
          main_channel: info.mainChannel,
          has_comm_team: info.hasCommTeam,
        })
        .select("id, profile_token")
        .single();

      if (error) throw error;
      setParticipantId(data.id);
      setProfileToken(data.profile_token || "");
    } catch {
      toast({ title: "Error guardando datos", variant: "destructive" });
    }
    setStep("diagnostic");
  };

  const handleDiagnostic = async (score: number, level: string, extras: { frequency: string; perception: string; goal: string }) => {
    if (participantId) {
      await supabase
        .from("participants")
        .update({
          diagnostic_score: score,
          diagnostic_level: level,
          publication_frequency: extras.frequency,
          self_perception: extras.perception,
          goal_90_days: extras.goal,
        })
        .eq("id", participantId);
    }
    setStep("message");
  };

  const handleMessage = async (cause: string, conviction: string, population: string[], territory: string, message: string) => {
    setMessageData({ cause, conviction, population, territory, message });
    if (participantId) {
      await supabase
        .from("participants")
        .update({ cause, conviction, target_population: population, territory, political_message: message })
        .eq("id", participantId);
    }
    setStep("institutional");
  };

  const handleInstitutional = async (data: typeof institutionalData) => {
    setInstitutionalData(data);
    if (participantId && data) {
      await supabase
        .from("participants")
        .update({
          institutional_role: data.institutionalRole,
          responsibility_level: data.responsibilityLevel,
          organization: data.organization,
          org_causes: data.orgCauses,
          strategic_audience: data.strategicAudience,
          institutional_card: data.institutionalCard,
          comm_budget: data.commBudget,
        })
        .eq("id", participantId);
    }
    setStep("spokesperson");
  };

  const handleSpokesperson = async (data: typeof spokespersonData) => {
    setSpokespersonData(data);
    if (participantId && data) {
      await supabase
        .from("participants")
        .update({
          spokesperson_phrase: data.phrase,
          spokesperson_tone: data.tone,
          quarterly_topics: data.quarterlyTopics,
          sensitive_topics: data.sensitiveTopics,
          spokesperson_guide: data.guide as any,
        })
        .eq("id", participantId);
    }
    setStep("bio");
  };

  const handleBio = async (bioPersonal: string, bioInstitutional: string, bioHybrid: string) => {
    if (participantId) {
      await supabase.from("participants").update({
        bio_text: bioPersonal,
        bio_institutional: bioInstitutional,
        bio_hybrid: bioHybrid,
      }).eq("id", participantId);
    }
    setStep("post");
  };

  const handlePost = async (postType: string, postText: string, published: boolean) => {
    if (participantId) {
      await supabase
        .from("participants")
        .update({ post_type: postType, post_text: postText, post_published: published })
        .eq("id", participantId);
    }
    setStep("institutional_post");
  };

  const handleInstitutionalPost = async (postType: string, postText: string, published: boolean) => {
    if (participantId) {
      await supabase
        .from("participants")
        .update({
          institutional_post_type: postType,
          institutional_post_text: postText,
          institutional_post_published: published,
        })
        .eq("id", participantId);
    }
    setStep("closing");
  };

  const handleClosing = () => {
    setStep("kit");
  };

  if (step === "code") {
    return <AccessCodeScreen onValidCode={handleCodeValid} />;
  }

  return (
    <div className="min-h-screen bg-background bg-mesh relative">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={kimediaLogo} alt="KiMedia" className="h-6 w-auto" />
          </Link>
          <span className="text-xs text-muted-foreground font-medium">Liderazgos Digitales</span>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Content */}
      <div className="pt-20 pb-12 px-4 min-h-screen flex items-center">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {step === "welcome" && <WelcomeStep key="welcome" onNext={handleWelcome} />}
            {step === "diagnostic" && <DiagnosticStep key="diagnostic" onNext={handleDiagnostic} />}
            {step === "message" && participantInfo && (
              <MessageBuilderStep
                key="message"
                participantState={participantInfo.state}
                onNext={handleMessage}
              />
            )}
            {step === "institutional" && participantInfo && (
              <InstitutionalIdentityStep
                key="institutional"
                participantState={participantInfo.state}
                onNext={handleInstitutional}
              />
            )}
            {step === "spokesperson" && (
              <SpokespersonStep key="spokesperson" onNext={handleSpokesperson} />
            )}
            {step === "bio" && participantInfo && messageData && (
              <BioGeneratorStep
                key="bio"
                name={participantInfo.fullName}
                role={participantInfo.roleTitle}
                state={participantInfo.state}
                cause={messageData.cause}
                message={messageData.message}
                institutionalRole={institutionalData?.institutionalRole}
                organization={institutionalData?.organization}
                orgCauses={institutionalData?.orgCauses}
                audience={institutionalData?.strategicAudience}
                onNext={handleBio}
              />
            )}
            {step === "post" && messageData && (
              <PostGeneratorStep
                key="post"
                cause={messageData.cause}
                population={messageData.population}
                territory={messageData.territory}
                onNext={handlePost}
              />
            )}
            {step === "institutional_post" && messageData && institutionalData && (
              <InstitutionalPostStep
                key="institutional_post"
                cause={messageData.cause}
                organization={institutionalData.organization}
                audience={institutionalData.strategicAudience}
                territory={messageData.territory}
                role={institutionalData.institutionalRole}
                orgCauses={institutionalData.orgCauses}
                onNext={handleInstitutionalPost}
              />
            )}
            {step === "closing" && participantInfo && messageData && (
              <ClosingStep
                key="closing"
                participantId={participantId}
                name={participantInfo.fullName}
                state={participantInfo.state}
                cause={messageData.cause}
                socialHandle={participantInfo.socialHandle}
                onNext={handleClosing}
              />
            )}
            {step === "kit" && participantId && participantInfo && (
              <KitDeliveryStep
                key="kit"
                participantId={participantId}
                profileToken={profileToken}
                name={participantInfo.fullName}
                onActivateRoute={() => {}}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
