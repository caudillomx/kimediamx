import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowDown, Zap } from "lucide-react";

const digitalFacts = [
  {
    stat: "93%",
    fact: "de consumidores leen reseñas online antes de comprar",
    color: "coral",
    illustration: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <circle cx="60" cy="60" r="15" fill="currentColor" opacity="0.4" />
        <motion.circle 
          cx="60" cy="60" r="8" 
          fill="currentColor"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
          <circle cx="60" cy="10" r="3" fill="currentColor" opacity="0.6" />
          <circle cx="100" cy="40" r="2" fill="currentColor" opacity="0.4" />
          <circle cx="95" cy="90" r="2.5" fill="currentColor" opacity="0.5" />
          <circle cx="25" cy="85" r="2" fill="currentColor" opacity="0.4" />
          <circle cx="20" cy="35" r="3" fill="currentColor" opacity="0.6" />
        </motion.g>
      </svg>
    )
  },
  {
    stat: "1 crisis",
    fact: "mal manejada puede destruir años de reputación en horas",
    color: "magenta",
    illustration: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <motion.path 
          d="M60 15 L95 35 L95 65 C95 85 60 105 60 105 C60 105 25 85 25 65 L25 35 Z"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.text 
          x="60" y="68" 
          textAnchor="middle" 
          fontSize="30" 
          fill="currentColor"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          !
        </motion.text>
      </svg>
    )
  },
  {
    stat: "70%",
    fact: "de las decisiones de compra inician en redes sociales",
    color: "electric",
    illustration: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <motion.path 
          d="M15 90 L40 60 L60 75 L85 30 L105 45"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.circle 
          cx="105" cy="45" r="8" 
          fill="currentColor"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <circle cx="15" cy="90" r="4" fill="currentColor" opacity="0.6" />
        <circle cx="40" cy="60" r="4" fill="currentColor" opacity="0.6" />
        <circle cx="60" cy="75" r="4" fill="currentColor" opacity="0.6" />
        <circle cx="85" cy="30" r="4" fill="currentColor" opacity="0.6" />
      </svg>
    )
  },
  {
    stat: "4.9B",
    fact: "personas activas en redes sociales en el mundo",
    color: "cyan",
    illustration: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <circle cx="60" cy="40" r="12" fill="currentColor" opacity="0.8" />
        <path d="M40 75 Q40 55 60 55 Q80 55 80 75" fill="currentColor" opacity="0.6" />
        <motion.g animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }}>
          <circle cx="25" cy="35" r="8" fill="currentColor" opacity="0.5" />
          <line x1="35" y1="40" x2="48" y2="42" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        </motion.g>
        <motion.g animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
          <circle cx="95" cy="35" r="8" fill="currentColor" opacity="0.5" />
          <line x1="85" y1="40" x2="72" y2="42" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        </motion.g>
        <motion.g animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
          <circle cx="30" cy="95" r="8" fill="currentColor" opacity="0.5" />
          <line x1="38" y1="90" x2="50" y2="78" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        </motion.g>
        <motion.g animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}>
          <circle cx="90" cy="95" r="8" fill="currentColor" opacity="0.5" />
          <line x1="82" y1="90" x2="70" y2="78" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        </motion.g>
      </svg>
    )
  },
  {
    stat: "64%",
    fact: "esperan respuesta de marcas en menos de 24 hrs",
    color: "lime",
    illustration: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <motion.path 
          d="M20 50 C20 30 40 15 60 15 C80 15 100 30 100 50 C100 70 80 85 60 85 L45 85 L30 100 L35 85 C25 80 20 65 20 50"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
        />
        <motion.g animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}>
          <circle cx="45" cy="50" r="4" fill="currentColor" />
          <circle cx="60" cy="50" r="4" fill="currentColor" />
          <circle cx="75" cy="50" r="4" fill="currentColor" />
        </motion.g>
      </svg>
    )
  },
  {
    stat: "3x",
    fact: "más conversiones con estrategia digital vs. sin ella",
    color: "coral",
    illustration: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <motion.rect 
          x="20" y="70" width="20" height="35" rx="4"
          fill="currentColor" opacity="0.4"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, delay: 0 }}
          style={{ originY: 1 }}
        />
        <motion.rect 
          x="50" y="45" width="20" height="60" rx="4"
          fill="currentColor" opacity="0.6"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ originY: 1 }}
        />
        <motion.rect 
          x="80" y="20" width="20" height="85" rx="4"
          fill="currentColor" opacity="0.9"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ originY: 1 }}
        />
        <motion.path 
          d="M25 65 L60 40 L90 15"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="5,5"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    )
  }
];

const colorClasses: Record<string, string> = {
  coral: "text-coral",
  magenta: "text-magenta", 
  electric: "text-electric",
  cyan: "text-cyan",
  lime: "text-lime"
};

const bgColorClasses: Record<string, string> = {
  coral: "bg-coral",
  magenta: "bg-magenta", 
  electric: "bg-electric",
  cyan: "bg-cyan",
  lime: "bg-lime"
};

export function Hero() {
  const [currentFact, setCurrentFact] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % digitalFacts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fact = digitalFacts[currentFact];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise">
      {/* Rich mesh gradient background */}
      <div className="absolute inset-0 bg-mesh" />
      
      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[15%] w-24 h-24 bg-gradient-coral rounded-3xl opacity-80 blur-sm"
        />
        
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[25%] left-[10%] w-16 h-16 bg-gradient-sunset rounded-2xl opacity-60 blur-sm"
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

            {/* Right column - Single rotating fact with illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-coral/10 via-transparent to-magenta/10 rounded-3xl blur-3xl" />
              
              <div className="relative bg-card/60 backdrop-blur-xl rounded-3xl border border-border/50 p-8 md:p-10 overflow-hidden min-h-[380px] flex flex-col">
                {/* Progress dots */}
                <div className="flex gap-2 mb-6">
                  {digitalFacts.map((f, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFact(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentFact 
                          ? `w-8 ${bgColorClasses[f.color]}` 
                          : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFact}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 flex flex-col"
                  >
                    {/* Illustration */}
                    <div className={`w-28 h-28 md:w-36 md:h-36 mx-auto mb-6 ${colorClasses[fact.color]}`}>
                      {fact.illustration}
                    </div>

                    {/* Stat */}
                    <div className={`font-display text-5xl md:text-6xl font-bold text-center mb-3 ${colorClasses[fact.color]}`}>
                      {fact.stat}
                    </div>

                    {/* Fact text */}
                    <p className="text-lg md:text-xl text-center text-muted-foreground leading-relaxed">
                      {fact.fact}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Decorative corner glow */}
                <motion.div 
                  key={`glow-${currentFact}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${bgColorClasses[fact.color]} blur-2xl`}
                />
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
