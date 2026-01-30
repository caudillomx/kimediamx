import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { BarChart3, Target, Megaphone, Video, ArrowRight, Sparkles, X, CheckCircle2, Lightbulb } from "lucide-react";

type Step = {
  number: string;
  icon: typeof BarChart3;
  title: string;
  subtitle: string;
  color: string;
  description: string;
  features: string[];
  gradient: string;
  fullDescription: string;
  whyItMatters: string;
  whatWeDeliver: string[];
  tools: string[];
};

const steps: Step[] = [
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
    fullDescription: "Antes de hacer cualquier cosa, necesitamos entender el terreno. El Análisis Digital es como tener rayos X para ver lo que realmente pasa en el mundo digital: qué dicen de ti, qué dicen de tu competencia, qué temas importan a tu audiencia, y dónde están las oportunidades que nadie más está viendo.",
    whyItMatters: "Tomar decisiones sin datos es como navegar sin brújula. El 90% de las marcas publican contenido basándose en intuición, no en insights reales. Con análisis digital, cada peso que inviertas estará respaldado por evidencia de lo que realmente funciona.",
    whatWeDeliver: [
      "Diagnóstico completo de tu presencia digital actual",
      "Mapeo de conversaciones y sentiment de tu marca",
      "Análisis de competidores: qué hacen bien y mal",
      "Identificación de oportunidades de contenido y posicionamiento",
      "Dashboard en tiempo real con Wizr para monitoreo continuo"
    ],
    tools: ["Wizr Analytics", "Brandwatch", "Sprout Social", "Google Analytics"]
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
    fullDescription: "Aquí es donde los insights se convierten en un plan de acción. Diseñamos la estrategia que conectará tu marca con las personas correctas, en los momentos correctos, con los mensajes correctos. No es solo hacer posts bonitos: es crear un sistema que genere resultados predecibles.",
    whyItMatters: "Sin estrategia, las redes sociales son un pozo sin fondo donde desaparece tiempo, dinero y energía. Con una estrategia clara, cada publicación tiene un propósito, cada campaña construye sobre la anterior, y puedes medir exactamente qué está funcionando.",
    whatWeDeliver: [
      "Documento estratégico completo con objetivos y KPIs",
      "Definición de audiencias y buyer personas detallados",
      "Pilares de contenido alineados a tu marca y negocio",
      "Parrilla de contenidos mensual lista para ejecutar",
      "Guía de tono y voz para comunicación consistente"
    ],
    tools: ["Notion", "Asana", "Figma", "Content Calendar"]
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
    fullDescription: "El contenido orgánico construye marca, pero los ads aceleran resultados. Nuestro equipo de performance marketing diseña, ejecuta y optimiza campañas publicitarias que convierten. No se trata de gastar más, sino de gastar inteligente: cada peso invertido debe regresar multiplicado.",
    whyItMatters: "El alcance orgánico en redes sociales ha caído a niveles mínimos. Sin inversión publicitaria estratégica, tu contenido solo llega al 2-5% de tus seguidores. Con ads bien ejecutados, puedes llegar exactamente a quien necesitas, cuando está listo para actuar.",
    whatWeDeliver: [
      "Auditoría de cuentas publicitarias existentes",
      "Estructura de campañas optimizada por objetivo",
      "Creativos diseñados para cada plataforma y etapa del funnel",
      "Configuración de píxeles, audiencias y conversiones",
      "Reportes semanales con métricas claras y recomendaciones"
    ],
    tools: ["Meta Business Suite", "Google Ads", "TikTok Ads Manager", "Supermetrics"]
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
    fullDescription: "El video ya no es opcional: es el formato que domina todas las plataformas. Nuestro equipo de producción crea contenido audiovisual que no solo se ve profesional, sino que está diseñado para generar engagement y conversiones. Desde un reel de 15 segundos hasta un documental de marca.",
    whyItMatters: "El contenido de video genera 1200% más compartidos que texto e imágenes combinados. Pero no cualquier video: necesitas calidad profesional que refleje el valor de tu marca. El contenido casero tiene su lugar, pero cuando quieres impactar, necesitas producción real.",
    whatWeDeliver: [
      "Producción de video completa: concepto, rodaje, edición",
      "Fotografía profesional para producto y lifestyle",
      "Podcasts con grabación en estudio y edición profesional",
      "Motion graphics y animación para redes sociales",
      "Adaptaciones de formato para cada plataforma"
    ],
    tools: ["Adobe Premiere", "DaVinci Resolve", "After Effects", "Canon/Sony Pro"]
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; bgSolid: string }> = {
  coral: { 
    bg: "bg-coral/10", 
    text: "text-coral", 
    border: "border-coral/30",
    bgSolid: "bg-coral"
  },
  electric: { 
    bg: "bg-electric/10", 
    text: "text-electric", 
    border: "border-electric/30",
    bgSolid: "bg-electric"
  },
  magenta: { 
    bg: "bg-magenta/10", 
    text: "text-magenta", 
    border: "border-magenta/30",
    bgSolid: "bg-magenta"
  },
  cyan: { 
    bg: "bg-cyan/10", 
    text: "text-cyan", 
    border: "border-cyan/30",
    bgSolid: "bg-cyan"
  },
};

function MethodologyModal({ 
  step, 
  onClose 
}: { 
  step: Step; 
  onClose: () => void;
}) {
  const colors = colorMap[step.color];
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl border border-border shadow-2xl"
      >
        {/* Header gradient */}
        <div className={`h-2 bg-gradient-to-r ${step.gradient}`} />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-secondary hover:bg-muted flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className={`font-display text-3xl font-bold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                  {step.number}
                </span>
                <span className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>
                  {step.subtitle}
                </span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {step.title}
              </h3>
            </div>
          </div>

          {/* Full Description */}
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            {step.fullDescription}
          </p>

          {/* Why it matters */}
          <div className={`p-5 rounded-2xl ${colors.bg} border ${colors.border} mb-8`}>
            <h4 className="font-display text-sm font-bold text-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className={`w-4 h-4 ${colors.text}`} />
              ¿Por qué importa?
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              {step.whyItMatters}
            </p>
          </div>

          {/* What we deliver */}
          <div className="mb-8">
            <h4 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className={`w-8 h-1 rounded-full ${colors.bgSolid}`} />
              Lo que entregamos
            </h4>
            <div className="grid gap-3">
              {step.whatWeDeliver.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                  <span className="text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="mb-8">
            <h4 className="font-display text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
              Herramientas que usamos
            </h4>
            <div className="flex flex-wrap gap-2">
              {step.tools.map((tool) => (
                <span
                  key={tool}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#contacto"
              onClick={onClose}
              className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r ${step.gradient} text-primary-foreground px-6 py-4 rounded-xl font-bold hover:shadow-glow transition-all`}
            >
              Quiero empezar con esto
              <ArrowRight className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="px-6 py-4 rounded-xl font-bold border border-border hover:bg-secondary transition-colors"
            >
              Seguir explorando
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MethodologyCard({
  step,
  index,
  onClick,
}: {
  step: Step;
  index: number;
  onClick: () => void;
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
      <button
        onClick={onClick}
        className="w-full text-left relative bg-card rounded-3xl p-8 border border-border overflow-hidden h-full transition-all duration-500 hover:border-coral/50 hover:shadow-glow/30 cursor-pointer"
      >
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
          <div className="flex flex-wrap gap-2 mb-4">
            {step.features.map((feature) => (
              <span
                key={feature}
                className="px-3 py-1.5 bg-secondary rounded-full text-xs font-medium text-muted-foreground border border-border"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Click hint */}
          <div className={`flex items-center gap-2 text-sm font-medium text-${step.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
            <span>Conocer más</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </button>

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
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);

  return (
    <>
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
              Haz clic en cualquier paso para descubrir qué implica y qué entregamos.
            </p>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <MethodologyCard 
                key={step.number} 
                step={step} 
                index={index}
                onClick={() => setSelectedStep(step)}
              />
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

      {/* Modal */}
      <AnimatePresence>
        {selectedStep && (
          <MethodologyModal
            step={selectedStep}
            onClose={() => setSelectedStep(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
