import { motion } from "framer-motion";
import { User, Building2, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const guides = [
  {
    id: "personal_brand",
    title: "Guía para Marca Personal",
    subtitle: "Emprendedores y profesionistas",
    description: "Domina las redes sociales y construye una marca personal que atraiga clientes y oportunidades.",
    icon: User,
    gradient: "from-magenta to-coral",
    href: "/guias/marca-personal",
    chapters: "8 capítulos",
  },
  {
    id: "pyme",
    title: "Guía para PyMEs",
    subtitle: "Micro, pequeñas y medianas empresas",
    description: "Estrategias probadas para hacer crecer tu negocio en el mundo digital y generar más clientes.",
    icon: Building2,
    gradient: "from-cyan to-electric",
    href: "/guias/pyme",
    chapters: "10 capítulos",
  },
];

export function GuidesCTA() {
  return (
    <section id="guias" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric/10 border border-electric/20 mb-6">
            <BookOpen className="w-4 h-4 text-electric" />
            <span className="text-sm font-medium text-electric">Recursos gratuitos</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-foreground">Guías de </span>
            <span className="text-gradient-electric">Redes Sociales</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Descarga nuestras guías completas con estrategias, plantillas y ejemplos reales para dominar las redes sociales.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {guides.map((guide, index) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Link to={guide.href} className="block group">
                <div className="relative p-8 rounded-2xl bg-card border border-border hover:border-electric/50 transition-all duration-300 h-full overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${guide.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${guide.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <guide.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <p className="text-sm text-muted-foreground mb-2">{guide.subtitle}</p>
                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-electric transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">{guide.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">📖 {guide.chapters}</span>
                      <Button 
                        variant="ghost" 
                        className="text-electric hover:text-electric hover:bg-electric/10 group-hover:translate-x-1 transition-transform"
                      >
                        Ver guía
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
