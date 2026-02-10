import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check admin role
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .limit(1);

      if (roleError || !roles?.length || roles[0].role !== "admin") {
        await supabase.auth.signOut();
        toast({ title: "Acceso denegado", description: "No tienes permisos de administrador.", variant: "destructive" });
        return;
      }

      onLogin();
    } catch (err: any) {
      toast({ title: "Error de autenticación", description: err.message || "Credenciales inválidas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-coral" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">Panel Admin</h1>
          <p className="text-muted-foreground text-sm">Liderazgos Digitales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Contraseña</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-card border-border"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold py-6"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
