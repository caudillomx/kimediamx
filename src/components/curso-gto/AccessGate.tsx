import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  onValidate: (code: string) => Promise<{ ok: boolean; error?: string }>;
}

export const AccessGate = ({ onValidate }: Props) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    const r = await onValidate(code.trim().toUpperCase());
    if (!r.ok) setError(r.error || "Código no válido");
    setLoading(false);
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
        <form
          onSubmit={handleSubmit}
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
                {loading ? "Validando…" : "Comenzar"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};