import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BarChart3, Target, Megaphone, Video, ArrowRight, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: BarChart3,
    title: "Análisis Digital",
    subtitle: "Social Listening & Reputación",
    color: "coral",
    description:
      "Utilizamos Wizr, nuestra herramienta propietaria de inteligencia digital, para analizar conversaciones, detectar oportunidades y entender el ecosistema de tu marca en tiempo real.",
    features: ["Social Listening", "Análisis Reputacional", "Benchmarking", "Insights"],
    gradient: "from-coral to-coral-light",
  },
  {
    number: "02",
    icon: Target,
    title: "Estrategia Digital",
    subtitle: "Planificación & Contenidos",
    color: "electric",
    description:
      "Diseñamos estrategias basadas en datos. Desde el briefing hasta la parrilla de contenidos, cada pieza está pensada para resonar con tu audiencia.",
    features: ["Briefing", "Content Strategy", "Community", "Parrillas"],
    gradient: "from-electric to-coral",
  },
  {
    number: "03",
    icon: Megaphone,
    title: "Performance Ads",
    subtitle: "Campañas de Alto Impacto",
    color: "magenta",
    description:
      "Nuestro equipo experto maximiza tu inversión con campañas en Google, Meta, TikTok y X. Hipersegmentación y retargeting inteligente.",
    features: ["Google Ads", "Meta Ads", "TikTok", "Retargeting"],
    gradient: "from-magenta to-coral",
  },
  {
    number: "04",
    icon: Video,
    title: "Producción Audiovisual",
    subtitle: "Contenido Profesional",
    color: "cyan",
    description:
      "Equipo profesional para crear contenido audiovisual de alto impacto: videos, podcasts, sesiones fotográficas, todo alineado con tu marca.",
    features: ["Video", "Podcasts", "Fotografía", "Motion"],
    gradient: "from-cyan to-coral",
  },
];

function MethodologyCard({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = step.icon;

  const colorClasses: Record<string, string> = {
    coral: "text-coral bg-coral/10 border-coral/30",
    electric: "text-electric bg-electric/10 border-electric/30",
    magenta: "text-magenta bg-magenta/10 border-magenta/30",
    cyan: "text-cyan bg-cyan/10 border-cyan/30",
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group relative"
    >
      {/* Card */}
      <div className="relative bg-card rounded-3xl p-8 border border-border overflow-hidden h-full transition-all duration-500 hover:border-coral/50 hover:shadow-glow/30">
        {/* Gradient accent top */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient}`} />
        
        {/* Background glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-coral/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Number watermark */}
        <div className="absolute -right-4 -top-4 font-display text-[120px] font-bold text-foreground/[0.03] leading-none pointer-events-none">
          {step.number}
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${colorClasses[step.color]}`}>
              <Icon className="w-7 h-7" />
            </div>
            <span className={`font-display text-5xl font-bold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
              {step.number}
            </span>
          </div>

          {/* Content */}
          <div className="mb-6">
            <span className={`text-sm font-bold uppercase tracking-wider text-${step.color} mb-2 block`}>
              {step.subtitle}
            </span>
            <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-3">
              {step.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {step.features.map((feature) => (
              <span
                key={feature}
                className="px-3 py-1.5 bg-secondary rounded-full text-xs font-medium text-muted-foreground border border-border"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Connector arrow (except last) */}
      {index < steps.length - 1 && (
        <div className="hidden lg:flex absolute -right-8 top-1/2 -translate-y-1/2 z-20">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 + index * 0.15 }}
          >
            <ArrowRight className="w-6 h-6 text-coral" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export function Methodology() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <section id="metodologia" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-mesh opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isHeaderInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral/10 border border-coral/30 text-coral text-sm font-bold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Nuestra Metodología
          </motion.div>
          
          <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Un proceso creativo basado en{" "}
            <span className="text-gradient-sunset">datos y resultados</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cuatro pilares que transforman insights en impacto real para tu marca.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <MethodologyCard key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <a
            href="#servicios"
            className="inline-flex items-center gap-2 text-coral font-semibold hover:gap-4 transition-all duration-300"
          >
            Ver todos nuestros servicios
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
