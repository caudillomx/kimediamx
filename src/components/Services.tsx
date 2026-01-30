import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { 
  Search, 
  PenTool, 
  Target, 
  Camera,
  Zap,
  TrendingUp,
  Users,
  Palette,
  Mic,
  Play,
  BarChart,
  Eye
} from "lucide-react";

const services = [
  {
    category: "Inteligencia Digital",
    icon: Search,
    color: "coral",
    items: [
      { name: "Social Listening", icon: Eye },
      { name: "Análisis Reputacional", icon: BarChart },
      { name: "Wizr Analytics", icon: TrendingUp },
    ],
  },
  {
    category: "Estrategia & Contenidos",
    icon: PenTool,
    color: "electric",
    items: [
      { name: "Estrategia Digital", icon: Target },
      { name: "Content Strategy", icon: Palette },
      { name: "Community Management", icon: Users },
    ],
  },
  {
    category: "Performance Marketing",
    icon: Target,
    color: "magenta",
    items: [
      { name: "Google Ads", icon: Search },
      { name: "Meta Ads", icon: Users },
      { name: "TikTok & X Ads", icon: Zap },
    ],
  },
  {
    category: "Producción Audiovisual",
    icon: Camera,
    color: "cyan",
    items: [
      { name: "Video Producción", icon: Play },
      { name: "Podcasts", icon: Mic },
      { name: "Fotografía", icon: Camera },
    ],
  },
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = service.icon;

  const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    coral: { 
      bg: "bg-coral/10", 
      text: "text-coral", 
      border: "border-coral/30",
      gradient: "from-coral to-coral-light"
    },
    electric: { 
      bg: "bg-electric/10", 
      text: "text-electric", 
      border: "border-electric/30",
      gradient: "from-electric to-coral"
    },
    magenta: { 
      bg: "bg-magenta/10", 
      text: "text-magenta", 
      border: "border-magenta/30",
      gradient: "from-magenta to-coral"
    },
    cyan: { 
      bg: "bg-cyan/10", 
      text: "text-cyan", 
      border: "border-cyan/30",
      gradient: "from-cyan to-coral"
    },
  };

  const colors = colorMap[service.color];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group h-full"
    >
      <div className="relative bg-card rounded-3xl p-8 border border-border h-full overflow-hidden transition-all duration-500 hover:border-coral/50 hover:shadow-glow/20">
        {/* Gradient line top */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} border ${colors.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">
            {service.category}
          </h3>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {service.items.map((item, i) => {
            const ItemIcon = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group/item cursor-default"
              >
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <ItemIcon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <span className="font-medium text-foreground group-hover/item:text-coral transition-colors">
                  {item.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export function Services() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <section id="servicios" className="py-24 lg:py-32 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-electric/10 border border-electric/30 text-electric text-sm font-bold mb-6">
            🚀 Servicios
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
            Todo lo que necesitas para{" "}
            <span className="text-gradient-electric">destacar</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Desde el análisis inicial hasta la ejecución final, un ecosistema completo de servicios creativos.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.category} service={service} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-20"
        >
          <div className="inline-block p-8 rounded-3xl bg-gradient-to-r from-coral/10 via-magenta/10 to-cyan/10 border border-border">
            <p className="text-lg text-foreground mb-6 font-medium">
              ¿Buscas una solución a medida para tu marca?
            </p>
            <a
              href="#contacto"
              className="inline-flex items-center gap-3 bg-gradient-coral text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-glow transition-all duration-300"
            >
              <Zap className="w-5 h-5" />
              Solicita una propuesta creativa
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
