import { motion } from "framer-motion";
import { User, Building2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const quizzes = [
  {
    id: "personal_brand",
    title: "Marca Personal",
    subtitle: "Para emprendedores y profesionistas",
    description: "¿Quieres una marca personal fuerte en redes sociales? Descubre dónde estás y hacia dónde debes ir.",
    icon: User,
    gradient: "from-magenta to-coral",
    href: "/diagnostico/marca-personal",
    stats: "10 preguntas · 5 min",
  },
  {
    id: "pyme",
    title: "Diagnóstico PyME",
    subtitle: "Para micro, pequeñas y medianas empresas",
    description: "¿Quieres más clientes y conversiones? Conoce el estado de tu presencia digital y el camino a seguir.",
    icon: Building2,
    gradient: "from-cyan to-electric",
    href: "/diagnostico/pyme",
    stats: "12 preguntas · 6 min",
  },
];

export function DiagnosticCTA() {
  return (
    <section id="diagnostico" className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-mesh opacity-50" />
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
            <span className="text-sm font-medium text-coral">Diagnóstico gratuito</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-foreground">¿Dónde estás en tu </span>
            <span className="text-gradient">presencia digital</span>
            <span className="text-foreground">?</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Haz tu propio diagnóstico y recibe un análisis personalizado con recomendaciones específicas para tu situación.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Link to={quiz.href} className="block group">
                <div className="relative p-8 rounded-2xl bg-card border border-border hover:border-coral/50 transition-all duration-300 h-full overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${quiz.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${quiz.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <quiz.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <p className="text-sm text-muted-foreground mb-2">{quiz.subtitle}</p>
                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-coral transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">{quiz.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{quiz.stats}</span>
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
