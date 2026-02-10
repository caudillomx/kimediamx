import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AccessCodeScreen } from "@/components/liderazgos/AccessCodeScreen";
import { WelcomeStep, type ParticipantInfo } from "@/components/liderazgos/WelcomeStep";
import { DiagnosticStep } from "@/components/liderazgos/DiagnosticStep";
import { MessageBuilderStep } from "@/components/liderazgos/MessageBuilderStep";
import { BioGeneratorStep } from "@/components/liderazgos/BioGeneratorStep";
import { PostGeneratorStep } from "@/components/liderazgos/PostGeneratorStep";
import { ClosingStep } from "@/components/liderazgos/ClosingStep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import kimediaLogo from "@/assets/kimedia-logo.png";

type Step = "code" | "welcome" | "diagnostic" | "message" | "bio" | "post" | "closing";

const stepOrder: Step[] = ["code", "welcome", "diagnostic", "message", "bio", "post", "closing"];

export default function Liderazgos() {
  const [step, setStep] = useState<Step>("code");
  const [accessCode, setAccessCode] = useState("");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo | null>(null);
  const [messageData, setMessageData] = useState<{
    cause: string;
    conviction: string;
    population: string[];
    territory: string;
    message: string;
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
        })
        .select("id")
        .single();

      if (error) throw error;
      setParticipantId(data.id);
    } catch {
      toast({ title: "Error guardando datos", variant: "destructive" });
    }
    setStep("diagnostic");
  };

  const handleDiagnostic = async (score: number, level: string) => {
    if (participantId) {
      await supabase
        .from("participants")
        .update({ diagnostic_score: score, diagnostic_level: level })
        .eq("id", participantId);
    }
    setStep("message");
  };

  const handleMessage = async (cause: string, conviction: string, population: string[], territory: string, message: string) => {
    setMessageData({ cause, conviction, population, territory, message });
    if (participantId) {
      await supabase
        .from("participants")
        .update({
          cause,
          conviction,
          target_population: population,
          territory,
          political_message: message,
        })
        .eq("id", participantId);
    }
    setStep("bio");
  };

  const handleBio = async (bio: string) => {
    if (participantId) {
      await supabase.from("participants").update({ bio_text: bio }).eq("id", participantId);
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
    setStep("closing");
  };

  if (step === "code") {
    return <AccessCodeScreen onValidCode={handleCodeValid} />;
  }

  return (
    <div className="min-h-screen bg-background">
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
            {step === "bio" && participantInfo && messageData && (
              <BioGeneratorStep
                key="bio"
                name={participantInfo.fullName}
                role={participantInfo.roleTitle}
                state={participantInfo.state}
                cause={messageData.cause}
                message={messageData.message}
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
            {step === "closing" && participantInfo && messageData && (
              <ClosingStep
                key="closing"
                name={participantInfo.fullName}
                state={participantInfo.state}
                cause={messageData.cause}
                socialHandle={participantInfo.socialHandle}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
