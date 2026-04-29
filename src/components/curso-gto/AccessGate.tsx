import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Sparkles, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ParticipantData {
  nombre: string;
  cargo: string;
  email: string;
}

interface Props {
  onValidate: (
    code: string,
    participant: ParticipantData,
  ) => Promise<{ ok: boolean; error?: string }>;
  onCheckCode?: (code: string) => Promise<{ ok: boolean; dependenciaNombre?: string; error?: string }>;
}

export const AccessGate = ({ onValidate, onCheckCode }: Props) => {
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"code" | "identify">("code");
  const [dependenciaNombre, setDependenciaNombre] = useState<string>("");
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    const upper = code.trim().toUpperCase();
    if (onCheckCode) {
      const r = await onCheckCode(upper);
      if (!r.ok) {
        setError(r.error || "Código no válido");
        setLoading(false);
        return;
      }
      setDependenciaNombre(r.dependenciaNombre || "");
      setCode(upper);
      setStage("identify");
      setLoading(false);
    } else {
      // fallback: try direct validation with empty participant (legacy)
      const r = await onValidate(upper, { nombre: "", cargo: "", email: "" });
      if (!r.ok) setError(r.error || "Código no válido");
      setLoading(false);
    }
  };

  const handleIdentifySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("Tu nombre es obligatorio.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresa un email válido para enviarte el prompt.");
      return;
    }
    setLoading(true);
    setError("");
    const r = await onValidate(code, {
      nombre: nombre.trim(),
      cargo: cargo.trim(),
      email: email.trim().toLowerCase(),
    });
    if (!r.ok) {
      setError(r.error || "No se pudo iniciar la sesión.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-35" />
      <div className="pointer-events-none absolute inset-0 bg-glow opacity-40" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[640px]"
      >
        <AnimatePresence mode="wait">
        {stage === "code" ? (
        <motion.form
          key="code"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          onSubmit={handleCodeSubmit}
          className="relative overflow-hidden rounded-[28px] border border-border bg-card px-7 py-8 shadow-glow-lg backdrop-blur md:px-10 md:py-10"
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/10 to-transparent" />
          <div className="relative">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-coral shadow-glow">
                <Lock className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[2px] text-primary">
                KiMedia · Curso interno
              </div>
            </div>

            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-electric/40 bg-electric/10 px-3 py-1">
              <Sparkles className="h-3 w-3 text-electric" />
              <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-electric">
                Gobierno de Guanajuato · 20 dependencias
              </span>
            </div>

            <h1 className="mb-3 font-display text-3xl font-bold leading-[1.05] tracking-tight md:text-4xl">
              Cómo configurar la <span className="text-gradient-sunset">IA de tu dependencia</span> en 30 minutos
            </h1>
            <p className="mb-7 text-sm leading-relaxed text-muted-foreground md:text-base">
              Vas a salir con tu prompt de sistema personalizado y la lista exacta de documentos que necesita
              tu IA. Listo para pegarlo hoy mismo en ChatGPT, Claude, Copilot o Gemini.
            </p>

            <div className="space-y-3">
              <div>
                <Label htmlFor="code" className="text-xs font-semibold uppercase tracking-wider">
                  Código de acceso de tu dependencia
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ej. SSG-2026"
                  autoFocus
                  className="mt-1.5 h-12 rounded-xl bg-background/60 text-base uppercase tracking-wider"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Enviado por KiMedia al enlace de comunicación de cada dependencia.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !code.trim()}
                className="h-12 w-full rounded-xl bg-gradient-coral text-base font-semibold shadow-glow"
              >
                {loading ? "Validando…" : "Continuar"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.form>
        ) : (
        <motion.form
          key="identify"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          onSubmit={handleIdentifySubmit}
          className="relative overflow-hidden rounded-[28px] border border-border bg-card px-7 py-8 shadow-glow-lg backdrop-blur md:px-10 md:py-10"
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/10 to-transparent" />
          <div className="relative">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-coral shadow-glow">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[2px] text-primary">
                Paso 2 · Identifícate
              </div>
            </div>

            {dependenciaNombre && (
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-electric/40 bg-electric/10 px-3 py-1">
                <Sparkles className="h-3 w-3 text-electric" />
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-electric">
                  {dependenciaNombre}
                </span>
              </div>
            )}

            <h2 className="mb-3 font-display text-2xl font-bold leading-[1.1] md:text-3xl">
              ¿Quién va a tomar <span className="text-gradient-sunset">esta sesión?</span>
            </h2>
            <p className="mb-7 text-sm text-muted-foreground">
              Si en tu equipo entran varias personas con el mismo código, cada una se identifica aquí.
              Compartes el brief y el prompt de tu dependencia, pero practicas con tus propios textos.
            </p>

            <div className="space-y-3">
              <div>
                <Label htmlFor="nombre" className="text-xs font-semibold uppercase tracking-wider">
                  Tu nombre completo *
                </Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. María Hernández"
                  autoFocus
                  maxLength={120}
                  className="mt-1.5 h-11 rounded-xl bg-background/60"
                />
              </div>
              <div>
                <Label htmlFor="cargo" className="text-xs font-semibold uppercase tracking-wider">
                  Tu cargo
                </Label>
                <Input
                  id="cargo"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ej. Coordinadora de Comunicación"
                  maxLength={120}
                  className="mt-1.5 h-11 rounded-xl bg-background/60"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider">
                  Tu email institucional *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@guanajuato.gob.mx"
                  maxLength={200}
                  className="mt-1.5 h-11 rounded-xl bg-background/60"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Te enviaremos el prompt final por correo al terminar.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setStage("code"); setError(""); }}
                  className="h-12 rounded-xl"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Atrás
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 flex-1 rounded-xl bg-gradient-coral text-base font-semibold shadow-glow"
                >
                  {loading ? "Iniciando…" : "Entrar al curso"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.form>
        )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};