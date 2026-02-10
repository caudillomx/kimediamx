import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

      if (error || data === false) {
        toast({
          title: "Código inválido",
          description: "Este acceso es exclusivo para participantes autorizadas. Si necesitas ingresar, solicita tu código al equipo organizador.",
          variant: "destructive",
        });
      } else {
        onValidCode(trimmed);
      }
    } catch {
      toast({ title: "Error de conexión", description: "Intenta de nuevo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-coral flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
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
