import { motion } from "framer-motion";
import { Clock, Target, FileText, Sparkles, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  dependenciaNombre: string;
  dependenciaSiglas: string;
  onContinue: () => void;
}

const ETAPAS = [
  {
    n: "1",
    titulo: "Brief institucional",
    desc: "Construimos el perfil de tu dependencia: misión, audiencias, tono, términos prohibidos y mensajes clave.",
    icon: Target,
    minutos: "10 min",
  },
  {
    n: "2",
    titulo: "Corpus de referencia",
    desc: "Defines qué documentos sube tu equipo a la herramienta de IA y dónde vive cada uno.",
    icon: FileText,
    minutos: "8 min",
  },
  {
    n: "3",
    titulo: "Reglas de generación",
    desc: "La IA compone tu prompt de sistema personalizado, listo para copiar y pegar hoy mismo.",
    icon: Sparkles,
    minutos: "8 min",
  },
];

export const StepWelcome = ({ dependenciaNombre, dependenciaSiglas, onContinue }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14"
    >
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-electric/40 bg-electric/10 px-3 py-1">
        <Building2 className="h-3 w-3 text-electric" />
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-electric">
          {dependenciaSiglas} · {dependenciaNombre}
        </span>
      </div>

      <h1 className="mb-4 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
        Bienvenido. <span className="text-gradient-sunset">En 30 minutos</span> tu IA queda configurada.
      </h1>
      <p className="mb-10 max-w-3xl text-base leading-relaxed text-foreground/85 md:text-lg">
        Esta no es una capacitación abstracta. Al terminar este flujo te llevas un archivo concreto: el
        <strong className="text-primary"> prompt de sistema</strong> de tu dependencia y la lista de documentos
        que tu equipo debe cargar en la herramienta de IA.
      </p>

      <div className="mb-10 grid gap-4 md:grid-cols-3">
        {ETAPAS.map((e, i) => (
          <motion.div
            key={e.n}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <Card className="h-full border-border bg-card/70 p-5 backdrop-blur">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-coral text-base font-bold text-primary-foreground shadow-glow">
                  {e.n}
                </div>
                <Badge variant="outline" className="border-electric/40 bg-electric/10 text-[10px] text-electric">
                  <Clock className="mr-1 h-3 w-3" />
                  {e.minutos}
                </Badge>
              </div>
              <h3 className="mb-1.5 font-display text-lg font-bold">{e.titulo}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{e.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="mb-8 border-primary/30 bg-primary/5 p-5 md:p-6">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
          Antes de empezar — ten a la mano
        </div>
        <ul className="space-y-1.5 text-sm text-foreground/85">
          <li>• 2 o 3 textos recientes producidos por tu dependencia (boletín, post, discurso).</li>
          <li>• Nombre exacto del titular y su cargo.</li>
          <li>• La herramienta de IA que usa tu equipo (ChatGPT, Claude, Copilot o Gemini).</li>
          <li>• Un documento institucional clave: plan de trabajo, informe o ejes estratégicos.</li>
        </ul>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          size="lg"
          className="rounded-xl bg-gradient-coral px-8 font-semibold shadow-glow"
        >
          Empezar el curso
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};