import { motion } from "framer-motion";
import { User, Building2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const kits = [
  {
    id: "personal_brand",
    title: "Marca Personal",
    subtitle: "Para emprendedores y profesionistas",
    description: "Completa tu brief estratégico y recibe un diagnóstico personalizado con recomendaciones para tu presencia digital.",
    icon: User,
    gradient: "from-magenta to-coral",
    href: "/kit/marca-personal",
    stats: "4 pasos · 5 min",
  },
  {
    id: "pyme",
    title: "MiPyME",
    subtitle: "Para micro, pequeñas y medianas empresas",
    description: "Diagnóstico, análisis competitivo e identidad de marca: todo lo que necesitamos para diseñar tu estrategia digital.",
    icon: Building2,
    gradient: "from-cyan to-electric",
    href: "/kit/pyme",
    stats: "5 pasos · 7 min",
  },
];

export function DiagnosticCTA() {
  return (
    <section id="diagnostico" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[hsl(var(--surface-warm))]" />
      <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh-light)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-coral/10 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral/10 border border-coral/20 mb-6">
            <Sparkles className="w-4 h-4 text-coral" />
            <span className="text-sm font-medium text-coral">Brief estratégico gratuito</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-[hsl(var(--surface-warm-foreground))]">Cuéntanos sobre tu </span>
            <span className="text-gradient">marca</span>
          </h2>
          
          <p className="text-lg md:text-xl text-[hsl(240_10%_35%)] max-w-2xl mx-auto">
            Completa un brief rápido y recibe un diagnóstico personalizado con recomendaciones específicas para tu situación.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {kits.map((kit, index) => (
            <motion.div
              key={kit.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Link to={kit.href} className="block group">
                <div className="relative p-8 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(240_8%_30%)] hover:border-coral/50 transition-all duration-300 h-full overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${kit.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${kit.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <kit.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="relative z-10">
                    <p className="text-sm text-muted-foreground mb-2">{kit.subtitle}</p>
                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-coral transition-colors">
                      {kit.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">{kit.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{kit.stats}</span>
                      <Button 
                        variant="ghost" 
                        className="text-coral hover:text-coral hover:bg-coral/10 group-hover:translate-x-1 transition-transform"
                      >
                        Comenzar
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
