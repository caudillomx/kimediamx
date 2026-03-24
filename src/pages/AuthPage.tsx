import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import kimediaLogo from "@/assets/kimedia-logo.png";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/mi-estrategia";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(redirectTo);
    });
  }, [navigate, redirectTo]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Revisa tu correo para restablecer tu contraseña");
        setIsForgot(false);
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}${redirectTo}`,
          },
        });
        if (error) throw error;
        toast.success("¡Cuenta creada! Revisa tu correo para confirmar");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(redirectTo);
      }
    } catch (err: any) {
      toast.error(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 space-y-6"
      >
        {/* Logo */}
        <Link to="/" className="flex justify-center">
          <img src={kimediaLogo} alt="KiMedia" className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity" />
        </Link>

        <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-gradient-coral mx-auto flex items-center justify-center mb-4"
            >
              <Zap className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {isForgot ? "Recuperar contraseña" : isSignUp ? "Crea tu cuenta" : "Inicia sesión"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isForgot
                ? "Te enviaremos un enlace para restablecer tu contraseña"
                : isSignUp
                ? "Accede a tu Kit Digital y Motor de Contenido personal"
                : "Accede a tu estrategia de contenido personalizada"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && !isForgot && (
              <div className="space-y-2">
                <Label className="text-foreground text-sm">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre"
                    className="pl-10 bg-secondary border-border rounded-xl"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-foreground text-sm">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="pl-10 bg-secondary border-border rounded-xl"
                  required
                />
              </div>
            </div>

            {!isForgot && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground text-sm">Contraseña</Label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => setIsForgot(true)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-secondary border-border rounded-xl"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground font-bold rounded-xl h-12 shadow-glow group"
            >
              {loading
                ? "Cargando..."
                : isForgot
                ? "Enviar enlace"
                : isSignUp
                ? "Crear cuenta"
                : "Entrar"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="text-center">
            {isForgot ? (
              <button
                onClick={() => setIsForgot(false)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ← Volver al inicio de sesión
              </button>
            ) : (
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp ? "¿Ya tienes cuenta? Inicia sesión" : "¿Primera vez? Crea tu cuenta"}
              </button>
            )}
          </div>
        </div>

        {/* Features hint */}
        {isSignUp && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 rounded-2xl p-5 border border-border/50 space-y-3"
          >
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">¿Qué incluye?</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Diagnóstico digital",
                "Kit de marca personal",
                "Motor de contenido",
                "Descarga de parrillas",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {feat}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;
