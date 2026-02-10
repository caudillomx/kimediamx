import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { PostComposer } from "./PostComposer";
import { FeedResult } from "./FeedResult";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { SimChallenge, SimMetrics, SimRoundResult, SimUserProfile } from "@/data/simulatorData";

interface Props {
  challenges: SimChallenge[];
  userProfile: SimUserProfile;
  onEnd: (results: SimRoundResult[]) => void;
}

type SubPhase = "compose" | "result";

export function SimulatorGame({ challenges, userProfile, onEnd }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [subPhase, setSubPhase] = useState<SubPhase>("compose");
  const [isLoading, setIsLoading] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<SimMetrics | null>(null);
  const [currentPost, setCurrentPost] = useState("");
  const [currentVisualDesc, setCurrentVisualDesc] = useState<string | undefined>();
  const [results, setResults] = useState<SimRoundResult[]>([]);

  const challenge = challenges[currentIndex];

  const handleSubmit = useCallback(
    async (post: string, visualDescription?: string) => {
      setIsLoading(true);
      setCurrentPost(post);
      setCurrentVisualDesc(visualDescription);

      try {
        const { data, error } = await supabase.functions.invoke("simulate-engagement", {
          body: {
            post,
            scenario: challenge.scenario,
            objective: challenge.objective,
            platform: challenge.platform,
            mode: challenge.mode,
            visualDescription,
            userProfile,
          },
        });

        if (error) throw error;

        const metrics: SimMetrics = data;
        setCurrentMetrics(metrics);
        setSubPhase("result");
      } catch (err) {
        console.error("Error simulating engagement:", err);
        toast({
          title: "Error al analizar",
          description: "Hubo un problema con el análisis. Usando métricas de respaldo.",
          variant: "destructive",
        });
        const fallback: SimMetrics = {
          likes: Math.floor(Math.random() * 200) + 30,
          comments: Math.floor(Math.random() * 30) + 3,
          shares: Math.floor(Math.random() * 15) + 1,
          reach: Math.floor(Math.random() * 3000) + 500,
          engagement: Math.floor(Math.random() * 40) + 30,
          feedback: "No pudimos analizar tu post con IA, pero aquí tienes un estimado general. Intenta de nuevo en el siguiente reto.",
          suggestions: ["Sé más específico", "Añade un gancho", "Incluye un CTA"],
          tone: "neutral",
        };
        setCurrentMetrics(fallback);
        setSubPhase("result");
      } finally {
        setIsLoading(false);
      }
    },
    [challenge, userProfile]
  );

  const handleNext = useCallback(() => {
    if (!currentMetrics) return;

    const roundResult: SimRoundResult = {
      challenge,
      userPost: currentPost,
      visualDescription: currentVisualDesc,
      metrics: currentMetrics,
    };

    const newResults = [...results, roundResult];
    setResults(newResults);

    if (currentIndex >= challenges.length - 1) {
      onEnd(newResults);
    } else {
      setCurrentIndex((i) => i + 1);
      setSubPhase("compose");
      setCurrentMetrics(null);
      setCurrentPost("");
      setCurrentVisualDesc(undefined);
    }
  }, [currentMetrics, challenge, currentPost, currentVisualDesc, results, currentIndex, challenges.length, onEnd]);

  return (
    <AnimatePresence mode="wait">
      {subPhase === "compose" && (
        <PostComposer
          key={`compose-${currentIndex}`}
          challenge={challenge}
          round={currentIndex + 1}
          totalRounds={challenges.length}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      )}
      {subPhase === "result" && currentMetrics && (
        <FeedResult
          key={`result-${currentIndex}`}
          challenge={challenge}
          userPost={currentPost}
          visualDescription={currentVisualDesc}
          metrics={currentMetrics}
          round={currentIndex + 1}
          totalRounds={challenges.length}
          onNext={handleNext}
          isLast={currentIndex >= challenges.length - 1}
        />
      )}
    </AnimatePresence>
  );
}
