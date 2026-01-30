import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
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
  Eye,
  X,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

type ServiceItem = {
  name: string;
  icon: typeof Eye;
  tagline: string;
  description: string;
  benefits: string[];
  example: string;
};

type ServiceCategory = {
  category: string;
  icon: typeof Search;
  color: string;
  items: ServiceItem[];
};

const services: ServiceCategory[] = [
  {
    category: "Inteligencia Digital",
    icon: Search,
    color: "coral",
    items: [
      { 
        name: "Social Listening", 
        icon: Eye,
        tagline: "Escucha lo que el mundo dice de ti",
        description: "Imagina tener un radar que detecta cada vez que alguien menciona tu marca, tu competencia, o temas relevantes para tu industria. Eso es Social Listening: la capacidad de escuchar conversaciones en redes sociales, foros, blogs y medios digitales en tiempo real.",
        benefits: [
          "Detecta crisis antes de que exploten",
          "Identifica oportunidades de conversación",
          "Entiende el sentimiento real hacia tu marca",
          "Descubre qué dice tu competencia y sus clientes"
        ],
        example: "Una marca de comida rápida detectó a tiempo quejas sobre un producto específico en Twitter, lo retiró antes de que se viralizara y convirtió la crisis en una campaña de transparencia."
      },
      { 
        name: "Análisis Reputacional", 
        icon: BarChart,
        tagline: "Tu reputación en números claros",
        description: "¿Cómo te perciben realmente? El Análisis Reputacional va más allá de contar likes. Mide la salud de tu marca a través de sentiment analysis, share of voice, y mapeo de influenciadores. Es como un check-up médico para tu presencia digital.",
        benefits: [
          "Mide tu posicionamiento vs. competidores",
          "Identifica embajadores y detractores de tu marca",
          "Rastrea la evolución de tu percepción en el tiempo",
          "Obtén insights accionables para mejorar tu imagen"
        ],
        example: "Un banco descubrió que el 60% de las menciones negativas venían de un solo tema: tiempos de espera. Al solucionarlo, su sentiment score subió 40% en 3 meses."
      },
      { 
        name: "Wizr Analytics", 
        icon: TrendingUp,
        tagline: "Nuestra herramienta propietaria de análisis",
        description: "Wizr es la herramienta que desarrollamos internamente para darte superpoderes analíticos. Combina múltiples fuentes de datos, aplica inteligencia artificial, y te entrega dashboards visuales que cualquiera puede entender. Sin complicaciones técnicas.",
        benefits: [
          "Dashboards personalizados en tiempo real",
          "Alertas automáticas de tendencias y crisis",
          "Reportes ejecutivos listos para presentar",
          "Integración con todas tus fuentes de datos"
        ],
        example: "Una marca de retail usa Wizr para monitorear 50+ tiendas simultáneamente, detectando en minutos cualquier mención negativa local."
      },
    ],
  },
  {
    category: "Estrategia & Contenidos",
    icon: PenTool,
    color: "electric",
    items: [
      { 
        name: "Estrategia Digital", 
        icon: Target,
        tagline: "El mapa antes del viaje",
        description: "Publicar sin estrategia es como disparar con los ojos cerrados. Diseñamos el plan maestro que conecta tus objetivos de negocio con acciones digitales concretas. Definimos audiencias, canales, mensajes clave, y KPIs que realmente importan.",
        benefits: [
          "Objetivos claros y medibles (no vanity metrics)",
          "Audiencias definidas con precisión quirúrgica",
          "Calendario editorial alineado a tu negocio",
          "Framework de medición y optimización continua"
        ],
        example: "Una startup B2B duplicó sus leads calificados en 4 meses al enfocarse en LinkedIn con contenido educativo, abandonando Facebook donde no estaba su audiencia."
      },
      { 
        name: "Content Strategy", 
        icon: Palette,
        tagline: "Historias que conectan y convierten",
        description: "El contenido es el rey, pero solo si es relevante. Diseñamos parrillas de contenido que equilibran entretenimiento, educación y conversión. Cada post tiene un propósito, cada historia mueve a tu audiencia hacia la acción.",
        benefits: [
          "Parrillas mensuales listas para ejecutar",
          "Mix de formatos optimizado por plataforma",
          "Pilares de contenido alineados a tu marca",
          "Copywriting que engancha y convierte"
        ],
        example: "Una marca de moda aumentó su engagement 300% al cambiar de posts de producto a storytelling sobre sustentabilidad y proceso creativo."
      },
      { 
        name: "Community Management", 
        icon: Users,
        tagline: "Convierte seguidores en comunidad",
        description: "Tus redes no son un megáfono, son una conversación. Gestionamos tu comunidad con la voz de tu marca: respondemos comentarios, moderamos crisis, identificamos oportunidades y construimos relaciones reales con tu audiencia.",
        benefits: [
          "Respuesta oportuna y on-brand 24/7",
          "Gestión proactiva de crisis y comentarios negativos",
          "Identificación de fans para convertirlos en embajadores",
          "Reportes de sentiment y temas de conversación"
        ],
        example: "Una aerolínea redujo 70% sus quejas públicas al implementar respuesta en menos de 30 minutos con soluciones reales, no respuestas genéricas."
      },
    ],
  },
  {
    category: "Performance Marketing",
    icon: Target,
    color: "magenta",
    items: [
      { 
        name: "Google Ads", 
        icon: Search,
        tagline: "Aparece cuando te buscan",
        description: "Cuando alguien busca lo que vendes, ¿apareces tú o tu competencia? Google Ads te pone frente a personas con intención de compra. Manejamos Search, Display, YouTube y Shopping con optimización constante basada en datos.",
        benefits: [
          "Campañas de búsqueda que capturan intención",
          "Remarketing que recupera carritos abandonados",
          "Optimización de CPC y Quality Score",
          "Reportes claros de ROI y conversiones"
        ],
        example: "Un e-commerce de muebles redujo su costo por venta 45% al reestructurar campañas por intención de búsqueda y mejorar landing pages."
      },
      { 
        name: "Meta Ads", 
        icon: Users,
        tagline: "Hipersegmentación en Facebook e Instagram",
        description: "3 mil millones de usuarios, y puedes hablarle exactamente a los que te importan. Creamos campañas que combinan creativos impactantes con segmentación precisa: intereses, comportamientos, lookalikes, y retargeting inteligente.",
        benefits: [
          "Creativos diseñados para scroll-stopping",
          "Audiencias personalizadas y lookalikes optimizados",
          "Funnel completo: awareness → consideración → conversión",
          "A/B testing constante de creativos y copies"
        ],
        example: "Una marca de skincare logró 8x ROAS al segmentar por comportamiento de compra y crear creativos específicos para cada etapa del funnel."
      },
      { 
        name: "TikTok & X Ads", 
        icon: Zap,
        tagline: "Donde están las nuevas audiencias",
        description: "TikTok no es solo para Gen Z, y X (Twitter) sigue siendo el pulso de la conversación. Dominamos los formatos nativos de cada plataforma para que tu marca no se sienta como publicidad, sino como contenido que la gente quiere ver.",
        benefits: [
          "Creativos nativos que no parecen ads",
          "Spark Ads y formatos de alto engagement",
          "Campañas de awareness viral con creators",
          "Targeting por conversación y tendencias"
        ],
        example: "Una app de finanzas personales adquirió 50,000 usuarios en 2 meses con una campaña de TikTok que usó humor y creators relevantes."
      },
    ],
  },
  {
    category: "Producción Audiovisual",
    icon: Camera,
    color: "cyan",
    items: [
      { 
        name: "Video Producción", 
        icon: Play,
        tagline: "Videos que cuentan tu historia",
        description: "Desde un reel de 15 segundos hasta un documental de marca, producimos video con calidad cinematográfica. Tenemos equipo propio, lo que significa agilidad, consistencia visual y costos optimizados.",
        benefits: [
          "Producción end-to-end: concepto → post-producción",
          "Equipo propio: cámaras 4K, drones, iluminación pro",
          "Formatos optimizados para cada plataforma",
          "Animación y motion graphics incluidos"
        ],
        example: "Una universidad produjo con nosotros 12 testimoniales de alumnos que aumentaron 35% las solicitudes de informes en su siguiente campaña."
      },
      { 
        name: "Podcasts", 
        icon: Mic,
        tagline: "Tu voz, amplificada",
        description: "Los podcasts son el nuevo blog: contenido profundo que construye autoridad. Te ayudamos a conceptualizar, producir y distribuir tu podcast. Desde grabación en estudio hasta edición profesional y estrategia de lanzamiento.",
        benefits: [
          "Estudio de grabación equipado",
          "Edición profesional con intro/outro branded",
          "Distribución en Spotify, Apple, YouTube",
          "Clips optimizados para redes sociales"
        ],
        example: "Un despacho de abogados lanzó un podcast de derecho empresarial que genera 20% de sus leads actuales, posicionándolos como expertos en su nicho."
      },
      { 
        name: "Fotografía", 
        icon: Camera,
        tagline: "Imágenes que venden",
        description: "Una buena foto vale más que mil palabras... y más que mil pesos en ventas. Hacemos sesiones de producto, lifestyle, retratos ejecutivos y cobertura de eventos con el estilo visual que tu marca necesita.",
        benefits: [
          "Sesiones de producto para e-commerce",
          "Fotografía lifestyle para redes sociales",
          "Retratos ejecutivos para LinkedIn y web",
          "Cobertura de eventos corporativos"
        ],
        example: "Una marca de joyería aumentó 60% sus ventas online al renovar todas sus fotos de producto con estilo lifestyle en lugar de fondo blanco."
      },
    ],
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string; bgSolid: string }> = {
  coral: { 
    bg: "bg-coral/10", 
    text: "text-coral", 
    border: "border-coral/30",
    gradient: "from-coral to-coral-light",
    bgSolid: "bg-coral"
  },
  electric: { 
    bg: "bg-electric/10", 
    text: "text-electric", 
    border: "border-electric/30",
    gradient: "from-electric to-coral",
    bgSolid: "bg-electric"
  },
  magenta: { 
    bg: "bg-magenta/10", 
    text: "text-magenta", 
    border: "border-magenta/30",
    gradient: "from-magenta to-coral",
    bgSolid: "bg-magenta"
  },
  cyan: { 
    bg: "bg-cyan/10", 
    text: "text-cyan", 
    border: "border-cyan/30",
    gradient: "from-cyan to-coral",
    bgSolid: "bg-cyan"
  },
};

function ServiceDetailModal({ 
  item, 
  color, 
  onClose 
}: { 
  item: ServiceItem; 
  color: string; 
  onClose: () => void;
}) {
  const colors = colorMap[color];
  const Icon = item.icon;

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
        <div className={`h-2 bg-gradient-to-r ${colors.gradient}`} />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-secondary hover:bg-muted flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Icon and title */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                {item.name}
              </h3>
              <p className={`${colors.text} font-medium text-lg`}>
                {item.tagline}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            {item.description}
          </p>

          {/* Benefits */}
          <div className="mb-8">
            <h4 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className={`w-8 h-1 rounded-full ${colors.bgSolid}`} />
              ¿Qué ganas con esto?
            </h4>
            <div className="grid gap-3">
              {item.benefits.map((benefit, i) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                  <span className="text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Example */}
          <div className={`p-5 rounded-2xl ${colors.bg} border ${colors.border}`}>
            <h4 className="font-display text-sm font-bold text-foreground mb-2 uppercase tracking-wider">
              💡 Caso real
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              {item.example}
            </p>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="#contacto"
              onClick={onClose}
              className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r ${colors.gradient} text-primary-foreground px-6 py-4 rounded-xl font-bold hover:shadow-glow transition-all`}
            >
              Quiero esto para mi marca
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

function ServiceCard({ 
  service, 
  index,
  onItemClick 
}: { 
  service: ServiceCategory; 
  index: number;
  onItemClick: (item: ServiceItem, color: string) => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = service.icon;
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
              <motion.button
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => onItemClick(item, service.color)}
                className="w-full flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group/item text-left"
              >
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <ItemIcon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <span className="font-medium text-foreground group-hover/item:text-coral transition-colors flex-1">
                  {item.name}
                </span>
                <ArrowRight className={`w-4 h-4 ${colors.text} opacity-0 group-hover/item:opacity-100 transform translate-x-0 group-hover/item:translate-x-1 transition-all`} />
              </motion.button>
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
  const [selectedItem, setSelectedItem] = useState<{ item: ServiceItem; color: string } | null>(null);

  return (
    <>
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
              Haz clic en cualquier servicio para descubrir cómo puede ayudar a tu marca.
            </p>
          </motion.div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <ServiceCard 
                key={service.category} 
                service={service} 
                index={index}
                onItemClick={(item, color) => setSelectedItem({ item, color })}
              />
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

      {/* Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ServiceDetailModal
            item={selectedItem.item}
            color={selectedItem.color}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
