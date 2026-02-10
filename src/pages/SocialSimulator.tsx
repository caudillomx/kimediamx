import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { SimulatorIntro } from "@/components/simulator/SimulatorIntro";
import { SimulatorGame } from "@/components/simulator/SimulatorGame";
import { SimulatorResult } from "@/components/simulator/SimulatorResult";
import {
  personalChallenges,
  pymeChallenges,
  shuffleChallenges,
  type SimMode,
  type SimChallenge,
  type SimRoundResult,
  type SimUserProfile,
} from "@/data/simulatorData";
import kimediaLogo from "@/assets/kimedia-logo.png";

type Phase = "intro" | "playing" | "result";

const ROUNDS_PER_SESSION = 5;

export default function SocialSimulator() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [mode, setMode] = useState<SimMode>("personal");
  const [challenges, setChallenges] = useState<SimChallenge[]>([]);
  const [results, setResults] = useState<SimRoundResult[]>([]);
  const [userProfile, setUserProfile] = useState<SimUserProfile>({
    industry: "",
    audience: "",
    tone: "",
    experience: "beginner",
  });

  const handleStart = (selectedMode: SimMode, profile: SimUserProfile) => {
    setMode(selectedMode);
    setUserProfile(profile);
    const pool = selectedMode === "personal" ? personalChallenges : pymeChallenges;
    setChallenges(shuffleChallenges(pool).slice(0, ROUNDS_PER_SESSION));
    setPhase("playing");
  };

  const handleGameEnd = (roundResults: SimRoundResult[]) => {
    setResults(roundResults);
    setPhase("result");
  };

  const handleReplay = () => {
    setPhase("intro");
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-background bg-mesh relative">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={kimediaLogo} alt="KiMedia" className="h-6 w-auto" />
          </Link>
          <span className="text-xs text-muted-foreground font-medium">📱 Simulador de Redes</span>
        </div>
      </div>

      <div className="pt-20 pb-12 px-4 min-h-screen flex items-center">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {phase === "intro" && <SimulatorIntro key="intro" onStart={handleStart} />}
            {phase === "playing" && (
              <SimulatorGame key="playing" challenges={challenges} userProfile={userProfile} onEnd={handleGameEnd} />
            )}
            {phase === "result" && (
              <SimulatorResult key="result" results={results} mode={mode} onReplay={handleReplay} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
