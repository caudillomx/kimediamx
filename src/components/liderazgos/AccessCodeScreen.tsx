import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import kimediaLogo from "@/assets/kimedia-logo.png";

interface AccessCodeScreenProps {
  onValidCode: (code: string) => void;
}

export function AccessCodeScreen({ onValidCode }: AccessCodeScreenProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("increment_code_usage", { code_text: trimmed });
      const success = !error && data === true;

      // Log every attempt (fire-and-forget so it never blocks the user)
      supabase.from("access_logs").insert({
        code_entered: trimmed,
        success,
        user_agent: navigator.userAgent?.slice(0, 300) ?? null,
      }).then(() => {});

      if (!success) {
        toast({
          title: "Código inválido",
          description: "Este acceso es exclusivo para participantes autorizadas. Si necesitas ingresar, solicita tu código al equipo organizador.",
          variant: "destructive",
        });
      } else {
        onValidCode(trimmed);
      }
    } catch {
      // Still log failures
      supabase.from("access_logs").insert({
        code_entered: trimmed,
        success: false,
        user_agent: navigator.userAgent?.slice(0, 300) ?? null,
      }).then(() => {});
      toast({ title: "Error de conexión", description: "Intenta de nuevo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-mesh flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-glow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.img
            src={kimediaLogo}
            alt="KiMedia"
            className="h-8 w-auto mx-auto mb-6 opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.3 }}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-gradient-coral flex items-center justify-center mx-auto mb-6 shadow-glow"
          >
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Plataforma de Liderazgos
          </h1>
          <p className="text-muted-foreground text-sm">
            Ingresa tu código de acceso para comenzar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CÓDIGO DE ACCESO"
              className="pl-10 text-center tracking-widest font-mono text-lg bg-card border-border"
              maxLength={20}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            disabled={!code.trim() || loading}
            className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6"
          >
            {loading ? "Verificando..." : "Ingresar"}
          </Button>
        </form>

        <p className="text-muted-foreground text-xs text-center mt-6 leading-relaxed">
          Este acceso es exclusivo para participantes autorizadas.
          <br />
          Si necesitas ingresar, solicita tu código al equipo organizador.
        </p>
      </motion.div>
    </div>
  );
}
