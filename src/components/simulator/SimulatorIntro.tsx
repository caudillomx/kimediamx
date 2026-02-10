import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, User, Building2, Sparkles, MessageSquare, TrendingUp, BarChart3, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SimMode, SimUserProfile } from "@/data/simulatorData";

interface Props {
  onStart: (mode: SimMode, profile: SimUserProfile) => void;
}

type Step = "mode" | "profile";

const toneOptions = [
  { value: "profesional", label: "Profesional", emoji: "👔" },
  { value: "cercano", label: "Cercano", emoji: "🤝" },
  { value: "divertido", label: "Divertido", emoji: "😄" },
  { value: "inspirador", label: "Inspirador", emoji: "✨" },
];

const expOptions = [
  { value: "beginner" as const, label: "Principiante", desc: "Recién empiezo en redes" },
  { value: "intermediate" as const, label: "Intermedio", desc: "Publico regularmente" },
  { value: "advanced" as const, label: "Avanzado", desc: "Tengo estrategia definida" },
];

export function SimulatorIntro({ onStart }: Props) {
  const [step, setStep] = useState<Step>("mode");
  const [mode, setMode] = useState<SimMode | null>(null);
  const [profile, setProfile] = useState<SimUserProfile>({
    industry: "",
    audience: "",
    tone: "",
    experience: "beginner",
  });

  const canContinueProfile = profile.industry.trim().length > 0 && profile.tone.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-lg mx-auto text-center"
    >
      <AnimatePresence mode="wait">
        {step === "mode" && (
          <motion.div key="mode" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 rounded-2xl bg-gradient-sunset flex items-center justify-center mx-auto mb-6 shadow-glow"
            >
              <Smartphone className="w-10 h-10 text-primary-foreground" />
            </motion.div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Simulador de Redes</h1>
            <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Practica tu copywriting en feeds realistas y recibe feedback de IA al instante.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: <MessageSquare className="w-5 h-5 text-coral" />, label: "5 retos", desc: "Escenarios reales" },
                { icon: <Sparkles className="w-5 h-5 text-magenta" />, label: "IA analiza", desc: "Feedback al instante" },
                { icon: <BarChart3 className="w-5 h-5 text-cyan" />, label: "Métricas", desc: "Likes, reach y más" },
              ].map((rule) => (
                <div key={rule.label} className="bg-card rounded-xl p-3 border border-border">
                  <div className="flex justify-center mb-2">{rule.icon}</div>
                  <p className="text-foreground text-xs font-bold">{rule.label}</p>
                  <p className="text-muted-foreground text-[10px]">{rule.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-foreground text-sm font-bold mb-3">¿Qué tipo de marca quieres simular?</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setMode("personal")}
                className={`rounded-xl p-5 text-center transition-all border ${
                  mode === "personal"
                    ? "border-coral bg-coral/10 shadow-lg shadow-coral/10"
                    : "border-border bg-card hover:border-coral/30"
                }`}
              >
                <User className={`w-8 h-8 mx-auto mb-2 ${mode === "personal" ? "text-coral" : "text-muted-foreground"}`} />
                <span className={`block text-sm font-bold ${mode === "personal" ? "text-coral" : "text-foreground"}`}>Marca Personal</span>
                <span className="block text-[10px] text-muted-foreground mt-1">Profesionales</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("pyme")}
                className={`rounded-xl p-5 text-center transition-all border ${
                  mode === "pyme"
                    ? "border-coral bg-coral/10 shadow-lg shadow-coral/10"
                    : "border-border bg-card hover:border-coral/30"
                }`}
              >
                <Building2 className={`w-8 h-8 mx-auto mb-2 ${mode === "pyme" ? "text-coral" : "text-muted-foreground"}`} />
                <span className={`block text-sm font-bold ${mode === "pyme" ? "text-coral" : "text-foreground"}`}>PyME</span>
                <span className="block text-[10px] text-muted-foreground mt-1">Empresas</span>
              </button>
            </div>

            <Button
              onClick={() => mode && setStep("profile")}
              disabled={!mode}
              className="w-full bg-gradient-sunset hover:opacity-90 text-primary-foreground font-bold py-6 text-base"
            >
              Siguiente
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {step === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Personaliza tu simulador</h2>
            <p className="text-muted-foreground text-sm mb-6">Estos datos ayudan a la IA a generar retos y feedback más relevantes para ti.</p>

            <div className="space-y-5 text-left">
              {/* Industry */}
              <div>
                <label className="text-foreground text-xs font-bold block mb-1.5">
                  {mode === "personal" ? "¿A qué te dedicas?" : "¿A qué se dedica tu negocio?"}
                </label>
                <Input
                  value={profile.industry}
                  onChange={(e) => setProfile((p) => ({ ...p, industry: e.target.value }))}
                  placeholder={mode === "personal" ? "Ej: Coach de negocios, diseñadora, abogado..." : "Ej: Cafetería artesanal, agencia digital..."}
                  className="bg-card border-border"
                />
              </div>

              {/* Audience */}
              <div>
                <label className="text-foreground text-xs font-bold block mb-1.5">
                  ¿Quién es tu audiencia ideal? <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <Input
                  value={profile.audience}
                  onChange={(e) => setProfile((p) => ({ ...p, audience: e.target.value }))}
                  placeholder="Ej: Emprendedores de 25-40 años, mamás, CEOs..."
                  className="bg-card border-border"
                />
              </div>

              {/* Tone */}
              <div>
                <label className="text-foreground text-xs font-bold block mb-2">¿Qué tono describe mejor tu marca?</label>
                <div className="grid grid-cols-2 gap-2">
                  {toneOptions.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, tone: t.value }))}
                      className={`rounded-lg p-3 text-left transition-all border ${
                        profile.tone === t.value
                          ? "border-coral bg-coral/10"
                          : "border-border bg-card hover:border-coral/30"
                      }`}
                    >
                      <span className="text-lg mr-1.5">{t.emoji}</span>
                      <span className={`text-xs font-bold ${profile.tone === t.value ? "text-coral" : "text-foreground"}`}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="text-foreground text-xs font-bold block mb-2">Nivel de experiencia en redes</label>
                <div className="grid grid-cols-3 gap-2">
                  {expOptions.map((e) => (
                    <button
                      key={e.value}
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, experience: e.value }))}
                      className={`rounded-lg p-2.5 text-center transition-all border ${
                        profile.experience === e.value
                          ? "border-coral bg-coral/10"
                          : "border-border bg-card hover:border-coral/30"
                      }`}
                    >
                      <span className={`block text-xs font-bold ${profile.experience === e.value ? "text-coral" : "text-foreground"}`}>{e.label}</span>
                      <span className="block text-[9px] text-muted-foreground mt-0.5">{e.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep("mode")} className="border-border">
                <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
              </Button>
              <Button
                onClick={() => mode && onStart(mode, profile)}
                disabled={!canContinueProfile}
                className="flex-1 bg-gradient-sunset hover:opacity-90 text-primary-foreground font-bold py-6 text-base"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                ¡Empezar a publicar!
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
