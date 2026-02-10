import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlatformFeed } from "./PlatformFeed";

type Step = "contact" | "context" | "write" | "feedback";

interface CopyContext {
  name: string;
  email: string;
  copyType: string;
  industry: string;
  audience: string;
  goal: string;
  platform: "instagram" | "linkedin" | "twitter" | "tiktok";
  tone: string;
}

interface CopyFeedback {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  rewrite: string;
  platformTips: string[];
}

const copyTypes = [
  { value: "caption", label: "Caption / Post", emoji: "📝" },
  { value: "bio", label: "Bio / Perfil", emoji: "👤" },
  { value: "ad", label: "Anuncio / Ad", emoji: "📢" },
  { value: "story", label: "Story / Reel", emoji: "🎬" },
];

const platforms = [
  { value: "instagram" as const, label: "Instagram", emoji: "📸" },
  { value: "linkedin" as const, label: "LinkedIn", emoji: "💼" },
  { value: "twitter" as const, label: "X (Twitter)", emoji: "🐦" },
  { value: "tiktok" as const, label: "TikTok", emoji: "🎵" },
];

const toneOptions = [
  { value: "profesional", label: "Profesional", emoji: "👔" },
  { value: "cercano", label: "Cercano", emoji: "🤝" },
  { value: "divertido", label: "Divertido", emoji: "😄" },
  { value: "inspirador", label: "Inspirador", emoji: "✨" },
];

export function CopyCoach() {
  const [step, setStep] = useState<Step>("contact");
  const [context, setContext] = useState<CopyContext>({
    name: "",
    email: "",
    copyType: "",
    industry: "",
    audience: "",
    goal: "",
    platform: "instagram",
    tone: "",
  });
  const [userCopy, setUserCopy] = useState("");
  const [feedback, setFeedback] = useState<CopyFeedback | null>(null);
  const [loading, setLoading] = useState(false);

  const canContinueContact = context.name.trim().length > 0 && context.email.includes("@");
  const canContinueContext = context.copyType && context.industry.trim().length > 0 && context.goal.trim().length > 0 && context.tone;
  const canSubmitCopy = userCopy.trim().length >= 10;

  const handleSubmitCopy = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("review-copy", {
        body: {
          copy: userCopy,
          copyType: context.copyType,
          industry: context.industry,
          audience: context.audience,
          goal: context.goal,
          platform: context.platform,
          tone: context.tone,
        },
      });

      if (error) throw error;
      setFeedback(data);
      setStep("feedback");
    } catch (err) {
      console.error(err);
      toast.error("Error al analizar tu copy. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("context");
    setUserCopy("");
    setFeedback(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <AnimatePresence mode="wait">
        {/* Step 1: Contact */}
        {step === "contact" && (
          <motion.div key="contact" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-sunset flex items-center justify-center mx-auto mb-5 shadow-glow">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Copy Coach</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Escribe tu copy y recibe feedback profesional de IA con sugerencias de mejora al instante.
            </p>

            <div className="space-y-4 text-left">
              <div>
                <label className="text-foreground text-xs font-bold block mb-1.5">Tu nombre</label>
                <Input
                  value={context.name}
                  onChange={(e) => setContext((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Ej: María González"
                  className="bg-card border-border"
                />
              </div>
              <div>
                <label className="text-foreground text-xs font-bold block mb-1.5">Tu correo electrónico</label>
                <Input
                  type="email"
                  value={context.email}
                  onChange={(e) => setContext((c) => ({ ...c, email: e.target.value }))}
                  placeholder="maria@ejemplo.com"
                  className="bg-card border-border"
                />
              </div>
            </div>

            <Button
              onClick={() => setStep("context")}
              disabled={!canContinueContact}
              className="w-full mt-6 bg-gradient-sunset hover:opacity-90 text-primary-foreground font-bold py-6 text-base"
            >
              Siguiente <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Step 2: Context */}
        {step === "context" && (
          <motion.div key="context" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h2 className="font-display text-xl font-bold text-foreground mb-1 text-center">Cuéntanos sobre tu copy</h2>
            <p className="text-muted-foreground text-xs mb-5 text-center">Esto nos ayuda a darte feedback más preciso.</p>

            <div className="space-y-4 text-left">
              {/* Copy type */}
              <div>
                <label className="text-foreground text-xs font-bold block mb-2">¿Qué tipo de copy es?</label>
                <div className="grid grid-cols-2 gap-2">
                  {copyTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setContext((c) => ({ ...c, copyType: t.value }))}
                      className={`rounded-lg p-3 text-left transition-all border ${
                        context.copyType === t.value ? "border-coral bg-coral/10" : "border-border bg-card hover:border-coral/30"
                      }`}
                    >
                      <span className="text-lg mr-1.5">{t.emoji}</span>
                      <span className={`text-xs font-bold ${context.copyType === t.value ? "text-coral" : "text-foreground"}`}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="text-foreground text-xs font-bold block mb-2">¿Para qué red social?</label>
                <div className="grid grid-cols-2 gap-2">
                  {platforms.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setContext((c) => ({ ...c, platform: p.value }))}
                      className={`rounded-lg p-2.5 text-center transition-all border ${
                        context.platform === p.value ? "border-coral bg-coral/10" : "border-border bg-card hover:border-coral/30"
                      }`}
                    >
                      <span className="text-base mr-1">{p.emoji}</span>
                      <span className={`text-xs font-bold ${context.platform === p.value ? "text-coral" : "text-foreground"}`}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="text-foreground text-xs font-bold block mb-1.5">¿En qué industria o nicho?</label>
                <Input
                  value={context.industry}
                  onChange={(e) => setContext((c) => ({ ...c, industry: e.target.value }))}
                  placeholder="Ej: Coaching, gastronomía, tecnología..."
                  className="bg-card border-border"
                />
              </div>

              {/* Audience */}
              <div>
                <label className="text-foreground text-xs font-bold block mb-1.5">
                  ¿Quién es tu audiencia? <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <Input
                  value={context.audience}
                  onChange={(e) => setContext((c) => ({ ...c, audience: e.target.value }))}
                  placeholder="Ej: Emprendedores de 25-40 años..."
                  className="bg-card border-border"
                />
              </div>

              {/* Goal */}
              <div>
                <label className="text-foreground text-xs font-bold block mb-1.5">¿Qué quieres lograr con este copy?</label>
                <Input
                  value={context.goal}
                  onChange={(e) => setContext((c) => ({ ...c, goal: e.target.value }))}
                  placeholder="Ej: Generar leads, educar, vender un curso..."
                  className="bg-card border-border"
                />
              </div>

              {/* Tone */}
              <div>
                <label className="text-foreground text-xs font-bold block mb-2">Tono deseado</label>
                <div className="grid grid-cols-2 gap-2">
                  {toneOptions.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setContext((c) => ({ ...c, tone: t.value }))}
                      className={`rounded-lg p-2.5 text-left transition-all border ${
                        context.tone === t.value ? "border-coral bg-coral/10" : "border-border bg-card hover:border-coral/30"
                      }`}
                    >
                      <span className="text-lg mr-1.5">{t.emoji}</span>
                      <span className={`text-xs font-bold ${context.tone === t.value ? "text-coral" : "text-foreground"}`}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep("contact")} className="border-border">Atrás</Button>
              <Button
                onClick={() => setStep("write")}
                disabled={!canContinueContext}
                className="flex-1 bg-gradient-sunset hover:opacity-90 text-primary-foreground font-bold py-6 text-base"
              >
                Escribir mi copy <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Write */}
        {step === "write" && (
          <motion.div key="write" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h2 className="font-display text-xl font-bold text-foreground mb-1 text-center">Escribe tu copy</h2>
            <p className="text-muted-foreground text-xs mb-4 text-center">
              {context.copyType === "caption" ? "Escribe el caption/post" : context.copyType === "bio" ? "Escribe tu bio" : context.copyType === "ad" ? "Escribe tu anuncio" : "Escribe el guión de tu story/reel"}
              {" "}para {platforms.find((p) => p.value === context.platform)?.label}
            </p>

            <Textarea
              value={userCopy}
              onChange={(e) => setUserCopy(e.target.value)}
              placeholder="Escribe tu copy aquí..."
              className="bg-card border-border min-h-[180px] text-sm"
              maxLength={2200}
            />
            <div className="flex justify-between items-center mt-1.5 mb-4">
              <span className="text-[10px] text-muted-foreground">{userCopy.length}/2200</span>
              <span className="text-[10px] text-muted-foreground">Mínimo 10 caracteres</span>
            </div>

            {/* Preview */}
            {userCopy.trim().length > 0 && (
              <div className="mb-4">
                <p className="text-foreground text-xs font-bold mb-2">Vista previa:</p>
                <PlatformFeed
                  platform={context.platform}
                  userPost={userCopy}
                  metrics={{ likes: 0, comments: 0, shares: 0, reach: 0, engagement: 0, feedback: "", suggestions: [], tone: "neutral" }}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("context")} className="border-border">Atrás</Button>
              <Button
                onClick={handleSubmitCopy}
                disabled={!canSubmitCopy || loading}
                className="flex-1 bg-gradient-sunset hover:opacity-90 text-primary-foreground font-bold py-6 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analizando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" /> Analizar mi copy
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Feedback */}
        {step === "feedback" && feedback && (
          <motion.div key="feedback" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center mb-5">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                feedback.score >= 75 ? "bg-lime/20" : feedback.score >= 50 ? "bg-electric/20" : "bg-coral/20"
              }`}>
                <span className="text-3xl">{feedback.score >= 75 ? "🔥" : feedback.score >= 50 ? "👍" : "💡"}</span>
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                Puntuación: {feedback.score}/100
              </h2>
              <p className="text-muted-foreground text-sm">{feedback.summary}</p>
            </div>

            {/* Strengths */}
            {feedback.strengths.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 mb-3">
                <h3 className="text-foreground text-xs font-bold mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-lime" /> Lo que funciona bien
                </h3>
                <ul className="space-y-1.5">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="text-muted-foreground text-xs flex items-start gap-1.5">
                      <span className="text-lime mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {feedback.improvements.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 mb-3">
                <h3 className="text-foreground text-xs font-bold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-electric" /> Sugerencias de mejora
                </h3>
                <ul className="space-y-1.5">
                  {feedback.improvements.map((s, i) => (
                    <li key={i} className="text-muted-foreground text-xs flex items-start gap-1.5">
                      <span className="text-electric mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rewrite suggestion */}
            {feedback.rewrite && (
              <div className="bg-card rounded-xl border border-coral/30 p-4 mb-3">
                <h3 className="text-foreground text-xs font-bold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-coral" /> Copy mejorado sugerido
                </h3>
                <p className="text-foreground text-xs leading-relaxed whitespace-pre-wrap">{feedback.rewrite}</p>
              </div>
            )}

            {/* Platform tips */}
            {feedback.platformTips && feedback.platformTips.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 mb-4">
                <h3 className="text-foreground text-xs font-bold mb-2">
                  💡 Tips para {platforms.find((p) => p.value === context.platform)?.label}
                </h3>
                <ul className="space-y-1">
                  {feedback.platformTips.map((t, i) => (
                    <li key={i} className="text-muted-foreground text-[11px]">• {t}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={handleReset}
              className="w-full bg-gradient-sunset hover:opacity-90 text-primary-foreground font-bold py-6 text-base"
            >
              <RefreshCw className="w-5 h-5 mr-2" /> Analizar otro copy
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
