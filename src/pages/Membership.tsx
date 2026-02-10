import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Crown, Sparkles, ArrowRight, Zap, RefreshCw, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import kimediaLogo from "@/assets/kimedia-logo.png";

const plans = [
  {
    id: "kit",
    name: "Kit Digital",
    price: "$199",
    currency: "MXN",
    period: "pago único",
    description: "Todo lo que necesitas para arrancar tu presencia digital",
    icon: <Zap className="w-6 h-6" />,
    features: [
      "Diagnóstico de presencia digital",
      "Identidad de marca personalizada",
      "Bio profesional optimizada",
      "Tu primer post estratégico",
      "Mejora de textos con IA",
      "Perfil privado con tus resultados",
      "1 parrilla de contenido semanal",
    ],
    cta: "Obtener mi Kit",
    popular: false,
  },
  {
    id: "membership",
    name: "Membresía Pro",
    price: "$99",
    currency: "MXN",
    period: "/mes",
    description: "Contenido fresco cada semana para mantener tu marca activa",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "Todo lo del Kit Digital incluido",
      "Parrillas de contenido ilimitadas",
      "Regeneración semanal automática",
      "Análisis de tendencias de tu industria",
      "Calendario editorial mensual",
      "Soporte prioritario por email",
      "Acceso anticipado a nuevas herramientas",
    ],
    cta: "Suscribirme",
    popular: true,
  },
];

export default function Membership() {
  const handleSelectPlan = (planId: string) => {
    // Placeholder - Stripe integration pending
    alert("La integración de pagos estará disponible próximamente. ¡Gracias por tu interés!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={kimediaLogo} alt="KiMedia" className="h-6 w-auto" />
          </Link>
          <span className="text-xs text-muted-foreground font-medium">Planes y precios</span>
        </div>
      </div>

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-coral flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Impulsa tu presencia digital
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Elige el plan que mejor se adapte a tus necesidades. Sin contratos, cancela cuando quieras.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className={`relative rounded-2xl p-6 border ${
                  plan.popular
                    ? "border-coral bg-card shadow-lg shadow-coral/10"
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-coral text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow-glow">
                      Más popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? "bg-coral/10 text-coral" : "bg-secondary text-muted-foreground"}`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.currency}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-coral" : "text-muted-foreground"}`} />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full font-bold py-6 ${
                    plan.popular
                      ? "bg-gradient-coral hover:opacity-90 text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {plan.cta} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Features comparison */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-16 text-center">
            <h2 className="font-display text-xl font-bold text-foreground mb-8">¿Qué incluye la membresía?</h2>
            <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              {[
                { icon: <RefreshCw className="w-6 h-6" />, title: "Contenido ilimitado", desc: "Genera parrillas de contenido cada semana, sin límites" },
                { icon: <BarChart3 className="w-6 h-6" />, title: "Análisis de tendencias", desc: "Recibe insights de tu industria para contenido relevante" },
                { icon: <Calendar className="w-6 h-6" />, title: "Calendario editorial", desc: "Planifica tu mes completo con IA" },
              ].map((item) => (
                <div key={item.title} className="bg-card rounded-xl p-5 border border-border text-center">
                  <div className="w-12 h-12 rounded-xl bg-coral/10 text-coral flex items-center justify-center mx-auto mb-3">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ / Trust */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-12 text-center">
            <p className="text-muted-foreground text-xs">
              ¿Tienes dudas? Escríbenos a{" "}
              <a href="mailto:hola@kimedia.mx" className="text-coral hover:underline">hola@kimedia.mx</a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
