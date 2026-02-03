import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { QuizResult } from "@/data/quizQuestions";

interface QuizResultsProps {
  result: QuizResult;
  score: number;
  maxScore: number;
  percentage: number;
  userName: string;
}

export function QuizResults({ result, score, maxScore, percentage, userName }: QuizResultsProps) {
  const whatsappMessage = encodeURIComponent(
    `Hola, acabo de hacer el diagnóstico de ${result.level === "beginner" ? "Marca Personal" : "PyME"} en su sitio web y me gustaría saber más sobre cómo pueden ayudarme. Mi resultado fue: ${result.title}`
  );
  const whatsappLink = `https://wa.me/525512345678?text=${whatsappMessage}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-coral flex items-center justify-center"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          ¡Gracias, {userName}!
        </h1>
        <p className="text-muted-foreground">
          Hemos enviado tu diagnóstico completo a tu correo electrónico.
        </p>
      </div>

      {/* Score Card */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score circle */}
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="hsl(var(--secondary))"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 352" }}
                animate={{ strokeDasharray: `${(percentage / 100) * 352} 352` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--coral))" />
                  <stop offset="100%" stopColor="hsl(var(--magenta))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-3xl font-bold text-foreground"
              >
                {percentage}%
              </motion.span>
            </div>
          </div>

          {/* Result info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {result.title}
            </h2>
            <p className="text-muted-foreground mb-4">
              {result.description}
            </p>
            <p className="text-sm text-muted-foreground">
              Puntuación: {score} de {maxScore} puntos posibles
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8">
        <h3 className="text-xl font-bold text-foreground mb-6">
          📋 Recomendaciones para ti
        </h3>
        <div className="space-y-4">
          {result.recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-coral mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{rec}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-br from-coral/10 to-magenta/10 border border-coral/20 rounded-2xl p-8 mb-8">
        <h3 className="text-xl font-bold text-foreground mb-6">
          🚀 Siguientes pasos
        </h3>
        <div className="space-y-4">
          {result.nextSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + 0.1 * index }}
              className="flex items-start gap-3"
            >
              <ArrowRight className="w-5 h-5 text-coral mt-0.5 flex-shrink-0" />
              <span className="text-foreground">{step}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          ¿Listo para dar el siguiente paso? Platiquemos sobre cómo podemos ayudarte.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-gradient-coral hover:opacity-90 text-white font-semibold py-6 px-8"
          >
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 mr-2" />
              Contactar por WhatsApp
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="py-6 px-8"
          >
            <Link to="/#contacto">
              Agendar llamada
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
