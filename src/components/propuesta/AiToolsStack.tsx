import { motion } from "framer-motion";
import { MessageSquare, Image as ImageIcon, Video, Mic, Search, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

const TOOLS = [
  {
    icon: MessageSquare,
    name: "ChatGPT · Claude",
    use: "Redacción de discursos, posts y respuestas a entrevistas en segundos.",
  },
  {
    icon: ImageIcon,
    name: "Midjourney · Nano Banana",
    use: "Generación de imágenes de campaña y mockups de propuestas visuales.",
  },
  {
    icon: Video,
    name: "Runway · Kling",
    use: "Spots cortos y reels generados por IA con identidad propia.",
  },
  {
    icon: Mic,
    name: "ElevenLabs",
    use: "Voz clonada para audio-mensajes y locuciones de campaña.",
  },
  {
    icon: Search,
    name: "Perplexity · Wizr",
    use: "Investigación de la opinión pública y monitoreo del adversario en tiempo real.",
  },
  {
    icon: BarChart3,
    name: "Notebook LM",
    use: "Análisis de minutas, encuestas y plataformas para resúmenes accionables.",
  },
];

export const AiToolsStack = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {TOOLS.map((t, i) => (
      <motion.div
        key={t.name}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: i * 0.05 }}
      >
        <Card className="group relative h-full overflow-hidden border-border bg-card/60 p-5 transition-all hover:border-electric/40 hover:shadow-glow">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-electric/10 blur-2xl transition-opacity group-hover:bg-electric/20" />
          <div className="relative">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-electric/15 text-electric">
              <t.icon className="h-5 w-5" />
            </div>
            <div className="mb-1.5 font-display text-base font-bold">{t.name}</div>
            <p className="text-sm leading-relaxed text-muted-foreground">{t.use}</p>
          </div>
        </Card>
      </motion.div>
    ))}
  </div>
);