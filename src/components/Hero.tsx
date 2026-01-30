import { motion } from "framer-motion";
import { ArrowDown, Zap, TrendingUp, Users, Eye, MessageCircle, ShieldAlert, BarChart3 } from "lucide-react";

const digitalFacts = [
  {
    icon: Eye,
    stat: "93%",
    fact: "de consumidores leen reseñas online antes de comprar",
    color: "coral"
  },
  {
    icon: ShieldAlert,
    stat: "1 crisis",
    fact: "mal manejada puede destruir años de reputación en horas",
    color: "magenta"
  },
  {
    icon: TrendingUp,
    stat: "70%",
    fact: "de las decisiones de compra inician en redes sociales",
    color: "electric"
  },
  {
    icon: Users,
    stat: "4.9B",
    fact: "personas activas en redes sociales en el mundo",
    color: "cyan"
  },
  {
    icon: MessageCircle,
    stat: "64%",
    fact: "esperan respuesta de marcas en menos de 24 hrs",
    color: "lime"
  },
  {
    icon: BarChart3,
    stat: "3x",
    fact: "más conversiones con estrategia digital vs. sin ella",
    color: "coral"
  }
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise">
      {/* Rich mesh gradient background */}
      <div className="absolute inset-0 bg-mesh" />
      
      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large rotating circles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px]"
        >
          <div className="w-full h-full rounded-full border-2 border-coral/20" />
          <div className="absolute inset-8 rounded-full border border-magenta/10" />
          <div className="absolute inset-16 rounded-full border border-cyan/10" />
        </motion.div>

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[30%] -left-[20%] w-[700px] h-[700px]"
        >
          <div className="w-full h-full rounded-full border-2 border-electric/15" />
          <div className="absolute inset-12 rounded-full border border-coral/10" />
        </motion.div>

        {/* Floating accent shapes */}
        <motion.div
          animate={{ 
            y: [-20, 20, -20],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[15%] w-24 h-24 bg-gradient-coral rounded-3xl opacity-80 blur-sm"
        />
        
        <motion.div
          animate={{ 
            y: [20, -20, 20],
            rotate: [0, -15, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[25%] left-[10%] w-16 h-16 bg-gradient-sunset rounded-2xl opacity-60 blur-sm"
        />

        <motion.div
          animate={{ 
            y: [-15, 25, -15],
            x: [-10, 10, -10]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[8%] w-12 h-12 bg-electric rounded-xl opacity-50 blur-sm"
        />

        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[60%] left-[20%] w-8 h-8 bg-cyan rounded-full"
        />
      </div>

      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Content - Two columns on desktop */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
            {/* Left column - Main message */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-coral text-primary-foreground text-sm font-bold tracking-wider uppercase mb-6"
              >
                <Zap className="w-4 h-4" />
                Agencia Digital
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
              >
                <span className="text-foreground">Tu reputación digital </span>
                <span className="text-gradient-sunset">es tu activo más valioso</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed"
              >
                Analizamos, diseñamos y ejecutamos estrategias digitales que 
                <span className="text-coral font-medium"> protegen tu marca</span>, 
                <span className="text-electric font-medium"> conectan con tu audiencia</span> y 
                <span className="text-magenta font-medium"> generan resultados medibles</span>.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <a
                  href="#metodologia"
                  className="group relative bg-gradient-coral text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden shadow-glow-lg hover:shadow-glow transition-all duration-300 text-center"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    Conoce nuestra metodología
                  </span>
                  <div className="absolute inset-0 bg-gradient-sunset opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
                
                <a
                  href="#contacto"
                  className="group flex items-center justify-center gap-3 border-2 border-border text-foreground px-8 py-4 rounded-2xl font-bold text-lg hover:border-coral hover:bg-coral/5 transition-all duration-300"
                >
                  Hablemos de tu proyecto
                </a>
              </motion.div>
            </div>

            {/* Right column - Animated facts */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-coral/10 via-transparent to-magenta/10 rounded-3xl blur-3xl" />
              
              <div className="relative grid grid-cols-2 gap-4">
                {digitalFacts.map((fact, index) => (
                  <motion.div
                    key={fact.stat}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className={`p-4 rounded-2xl bg-card/80 border border-border/50 hover:border-${fact.color}/40 transition-all duration-300 backdrop-blur-sm group`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-${fact.color}/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <fact.icon className={`w-5 h-5 text-${fact.color}`} />
                    </div>
                    <div className={`font-display text-2xl font-bold text-${fact.color} mb-1`}>
                      {fact.stat}
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {fact.fact}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <p className="text-muted-foreground text-sm md:text-base">
              En un mundo donde <span className="text-foreground font-medium">todo se mide</span>, 
              nosotros te ayudamos a <span className="text-coral font-medium">destacar</span>.
            </p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.a
            href="#metodologia"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-coral transition-colors"
          >
            <span className="text-sm font-medium">Explora</span>
            <ArrowDown size={24} className="text-coral" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
