import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { BarChart3, Target, Megaphone, Video } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: BarChart3,
    title: "Análisis Digital",
    subtitle: "Social Listening & Reputación",
    description:
      "Utilizamos Wizr, nuestra herramienta propietaria de inteligencia digital, para analizar conversaciones, detectar oportunidades y entender el ecosistema de tu marca en tiempo real.",
    features: ["Social Listening", "Análisis Reputacional", "Benchmarking Competitivo", "Insights Accionables"],
  },
  {
    number: "02",
    icon: Target,
    title: "Estrategia Digital",
    subtitle: "Planificación & Contenidos",
    description:
      "Diseñamos estrategias basadas en datos. Desde el briefing hasta la parrilla de contenidos, cada pieza está pensada para resonar con tu audiencia y cumplir objetivos específicos.",
    features: ["Briefing Estratégico", "Parrillas de Contenido", "Gestión de Comunidades", "Content Strategy"],
  },
  {
    number: "03",
    icon: Megaphone,
    title: "Performance & Ads",
    subtitle: "Campañas de Alto Impacto",
    description:
      "Nuestro equipo experto en publicidad digital maximiza tu inversión con campañas en Google, Meta, TikTok y X. Hipersegmentación, públicos lookalike y retargeting inteligente.",
    features: ["Google Ads", "Meta Ads", "TikTok Ads", "Retargeting Avanzado"],
  },
  {
    number: "04",
    icon: Video,
    title: "Producción Audiovisual",
    subtitle: "Contenido Profesional",
    description:
      "Contamos con equipo profesional para crear contenido audiovisual de alto impacto: videos, podcasts, sesiones fotográficas y más, todo alineado con tu identidad de marca.",
    features: ["Video Producción", "Podcasts", "Fotografía", "Motion Graphics"],
  },
];

function MethodologyStep({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative"
    >
      <div
        className={`flex flex-col lg:flex-row gap-8 items-start ${
          index % 2 === 1 ? "lg:flex-row-reverse" : ""
        }`}
      >
        {/* Content */}
        <div className="flex-1">
          <div className="bg-card rounded-2xl p-8 lg:p-10 border border-border hover:border-coral/30 transition-colors duration-500">
            <div className="flex items-start gap-6">
              {/* Number & Icon */}
              <div className="flex-shrink-0">
                <span className="text-gradient font-display text-5xl font-bold">{step.number}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-coral" />
                  </div>
                  <span className="text-coral text-sm font-medium uppercase tracking-wider">
                    {step.subtitle}
                  </span>
                </div>

                <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">
                  {step.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {step.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1.5 bg-secondary rounded-full text-sm text-muted-foreground"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connector line for desktop */}
        <div className="hidden lg:flex flex-shrink-0 w-20 items-center justify-center">
          {index < steps.length - 1 && (
            <div className="w-px h-full bg-gradient-to-b from-coral/50 to-transparent min-h-[100px]" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function Methodology() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <section id="metodologia" className="py-24 lg:py-32 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <span className="text-coral text-sm font-medium uppercase tracking-wider mb-4 block">
            Nuestra Metodología
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Un proceso basado en{" "}
            <span className="text-gradient">datos y resultados</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Cada proyecto pasa por nuestro framework probado: analizamos, 
            estrategizamos, ejecutamos y optimizamos continuamente.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-8 lg:space-y-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <MethodologyStep key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
