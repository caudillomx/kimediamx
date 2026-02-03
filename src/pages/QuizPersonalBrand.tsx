import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizForm } from "@/components/quiz/QuizForm";
import { QuizResults } from "@/components/quiz/QuizResults";
import {
  personalBrandQuestions,
  personalBrandResults,
  calculateResult,
} from "@/data/quizQuestions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type QuizState = "intro" | "questions" | "form" | "results";

export default function QuizPersonalBrand() {
  const [state, setState] = useState<QuizState>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculateResult> | null>(null);

  const currentQuestion = personalBrandQuestions[currentQuestionIndex];
  const totalQuestions = personalBrandQuestions.length;

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setState("form");
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleFormSubmit = async (data: { name: string; email: string; phone?: string }) => {
    setIsSubmitting(true);
    setUserData({ name: data.name, email: data.email, phone: data.phone || "" });

    const calculatedResult = calculateResult(answers, totalQuestions);
    setResult(calculatedResult);

    try {
      // Save to database
      const { error } = await supabase.from("quiz_submissions").insert({
        quiz_type: "personal_brand",
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        answers: answers,
        total_score: calculatedResult.score,
        result_level: calculatedResult.level,
      });

      if (error) throw error;

      // Send email with results
      const { error: emailError } = await supabase.functions.invoke("send-quiz-results", {
        body: {
          email: data.email,
          name: data.name,
          quizType: "personal_brand",
          resultLevel: calculatedResult.level,
          score: calculatedResult.score,
          maxScore: totalQuestions * 3,
          percentage: calculatedResult.percentage,
        },
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        // Don't throw - still show results even if email fails
      }

      setState("results");
      toast.success("¡Diagnóstico completado! Revisa tu correo para ver el análisis completo.");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Hubo un error al procesar tu diagnóstico. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = answers[currentQuestion?.id] !== undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-magenta to-coral flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">Diagnóstico Marca Personal</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Intro */}
          {state === "intro" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-magenta to-coral flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Diagnóstico de Marca Personal
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
                Descubre el estado actual de tu presencia digital profesional y recibe recomendaciones personalizadas para destacar en tu industria.
              </p>

              <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-foreground mb-4">¿Qué incluye este diagnóstico?</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-coral/20 text-coral text-sm flex items-center justify-center">✓</span>
                    Análisis de tu presencia en redes profesionales
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-coral/20 text-coral text-sm flex items-center justify-center">✓</span>
                    Evaluación de tu propuesta de valor y posicionamiento
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-coral/20 text-coral text-sm flex items-center justify-center">✓</span>
                    Recomendaciones personalizadas según tu nivel
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-coral/20 text-coral text-sm flex items-center justify-center">✓</span>
                    Plan de acción para los próximos 30 días
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-8">
                <span>🕐 10 preguntas</span>
                <span>·</span>
                <span>⏱️ 5 minutos</span>
                <span>·</span>
                <span>📧 Resultados por email</span>
              </div>

              <Button
                onClick={() => setState("questions")}
                className="bg-gradient-coral hover:opacity-90 text-white font-semibold py-6 px-8"
              >
                Comenzar diagnóstico
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Questions */}
          {state === "questions" && currentQuestion && (
            <div>
              <QuizCard
                question={currentQuestion}
                currentAnswer={answers[currentQuestion.id] ?? null}
                onAnswer={handleAnswer}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
              />

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="bg-gradient-coral hover:opacity-90 text-white"
                >
                  {currentQuestionIndex === totalQuestions - 1 ? "Ver resultados" : "Siguiente"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Form */}
          {state === "form" && (
            <QuizForm
              quizType="personal_brand"
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Results */}
          {state === "results" && result && (
            <QuizResults
              result={personalBrandResults[result.level]}
              score={result.score}
              maxScore={totalQuestions * 3}
              percentage={result.percentage}
              userName={userData.name.split(" ")[0]}
            />
          )}
        </div>
      </main>
    </div>
  );
}
