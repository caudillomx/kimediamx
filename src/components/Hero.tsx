import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Zap, Play } from "lucide-react";

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

        {/* Decorative lines */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-20" viewBox="0 0 1000 1000">
          <motion.path
            d="M0,500 Q250,300 500,500 T1000,500"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(15, 95%, 55%)" />
              <stop offset="100%" stopColor="hsl(320, 90%, 55%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Tagline with icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-coral text-primary-foreground text-sm font-bold tracking-wider uppercase shadow-glow">
              <Sparkles className="w-4 h-4" />
              To be known
              <Sparkles className="w-4 h-4" />
            </span>
          </motion.div>

          {/* Main headline - More dramatic */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tight"
            >
              <span className="text-foreground">Creamos</span>
            </motion.h1>
            
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-display text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tight my-2"
            >
              <span className="text-gradient-sunset animate-gradient bg-gradient-to-r from-coral via-magenta to-coral bg-[length:200%_auto]">
                Conectamos
              </span>
            </motion.h1>
            
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="font-display text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tight"
            >
              <span className="text-foreground">Convertimos</span>
            </motion.h1>
          </div>

          {/* Subtitle - More punchy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 text-center leading-relaxed"
          >
            Agencia digital que{" "}
            <span className="text-coral font-semibold">transforma datos en historias</span>,{" "}
            historias en estrategias, y estrategias en{" "}
            <span className="text-electric font-semibold">resultados que impactan</span>.
          </motion.p>

          {/* CTA Buttons - More creative */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="#metodologia"
              className="group relative bg-gradient-coral text-primary-foreground px-10 py-5 rounded-2xl font-bold text-lg overflow-hidden shadow-glow-lg hover:shadow-glow transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Descubre nuestra magia
              </span>
              <div className="absolute inset-0 bg-gradient-sunset opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
            
            <a
              href="#contacto"
              className="group flex items-center gap-3 border-2 border-border text-foreground px-10 py-5 rounded-2xl font-bold text-lg hover:border-coral hover:bg-coral/5 transition-all duration-300"
            >
              <Play className="w-5 h-5 text-coral" />
              Ver showreel
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { number: "50+", label: "Proyectos creativos" },
              { number: "10M+", label: "Alcance mensual" },
              { number: "300%", label: "ROI promedio" },
              { number: "6", label: "Creativos expertos" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="text-center p-4 rounded-2xl bg-card/50 border border-border/50 hover:border-coral/30 transition-colors"
              >
                <div className="font-display text-3xl md:text-4xl font-bold text-gradient mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
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
