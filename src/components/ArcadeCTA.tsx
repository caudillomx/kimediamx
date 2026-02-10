import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Puzzle, Gamepad2, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ArcadeCTA() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-coral mb-2 inline-block">
            🎮 Zona interactiva
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Aprende jugando
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Herramientas gamificadas para entender y construir tu presencia digital
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Puzzle,
              emoji: "🧩",
              title: "Construye tu Marca",
              description: "Puzzle arcade de 4 niveles. Arrastra las piezas y arma tu marca contra el reloj.",
              link: "/arcade",
              cta: "Jugar ahora",
              delay: 0,
            },
            {
              icon: Brain,
              emoji: "🧠",
              title: "Trivia de Marca",
              description: "15 preguntas con cronómetro y vidas. ¿Cuánto sabes de branding digital?",
              link: "/trivia",
              cta: "Poner a prueba",
              delay: 0.1,
            },
            {
              icon: Gamepad2,
              emoji: "📱",
              title: "Simulador Social",
              description: "Publica contenido virtual y recibe engagement simulado por IA.",
              link: "/simulador",
              cta: "Simular posts",
              delay: 0.2,
            },
          ].map(({ icon: Icon, emoji, title, description, link, cta, delay }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay }}
            >
              <Link to={link} className="block group">
                <div className="bg-card border border-border rounded-2xl p-6 h-full hover:border-coral/40 transition-all hover:shadow-lg hover:shadow-coral/5">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">{emoji}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{description}</p>
                  <span className="text-sm font-bold text-coral group-hover:underline">{cta} →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
