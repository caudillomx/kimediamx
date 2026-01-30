import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { 
  Search, 
  LineChart, 
  Users, 
  PenTool, 
  Target, 
  Zap,
  Camera,
  Mic,
  Play
} from "lucide-react";

const services = [
  {
    category: "Inteligencia Digital",
    icon: Search,
    items: [
      { name: "Social Listening", description: "Monitoreo de conversaciones en tiempo real" },
      { name: "Análisis Reputacional", description: "Gestión de percepción de marca" },
      { name: "Wizr Analytics", description: "Nuestra plataforma propietaria de insights" },
    ],
  },
  {
    category: "Estrategia & Contenidos",
    icon: PenTool,
    items: [
      { name: "Estrategia Digital", description: "Planificación integral de presencia digital" },
      { name: "Content Strategy", description: "Parrillas y calendarios de contenido" },
      { name: "Community Management", description: "Gestión activa de comunidades" },
    ],
  },
  {
    category: "Performance Marketing",
    icon: Target,
    items: [
      { name: "Google Ads", description: "Search, Display, YouTube, Shopping" },
      { name: "Meta Ads", description: "Facebook e Instagram advertising" },
      { name: "TikTok & X Ads", description: "Alcance en plataformas emergentes" },
    ],
  },
  {
    category: "Producción Audiovisual",
    icon: Camera,
    items: [
      { name: "Video Producción", description: "Contenido audiovisual profesional" },
      { name: "Podcasts", description: "Producción y distribución de audio" },
      { name: "Fotografía", description: "Sesiones y bancos de imagen" },
    ],
  },
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = service.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="bg-card rounded-2xl p-8 border border-border h-full hover:border-coral/30 transition-all duration-500 hover:shadow-glow/20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-coral flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">
            {service.category}
          </h3>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {service.items.map((item) => (
            <div key={item.name} className="group/item">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-coral mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground group-hover/item:text-coral transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function Services() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <section id="servicios" className="py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-coral text-sm font-medium uppercase tracking-wider mb-4 block">
            Servicios
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Todo lo que necesitas para{" "}
            <span className="text-gradient">destacar digitalmente</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Desde el análisis inicial hasta la ejecución final, ofrecemos un ecosistema 
            completo de servicios digitales integrados.
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
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-6">
            ¿Necesitas un servicio específico o una solución integral?
          </p>
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 bg-gradient-coral text-primary-foreground px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            <Zap className="w-5 h-5" />
            Solicita una propuesta
          </a>
        </motion.div>
      </div>
    </section>
  );
}
