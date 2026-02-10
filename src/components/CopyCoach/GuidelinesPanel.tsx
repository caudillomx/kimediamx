import { BookOpen, ExternalLink } from "lucide-react";

const GuidelinesPanel = () => {
  const guidelines = [
    { title: "Tono de voz", description: "Profesional pero cercano. Evitar lenguaje corporativo frío." },
    { title: "Palabras clave", description: "Reputación digital, estrategia, resultados medibles, audiencia." },
    { title: "Estructura", description: "Hook → Problema → Solución → CTA. Frases cortas y directas." },
    { title: "Prohibido", description: "Superlativos vacíos, promesas sin respaldo, jerga técnica excesiva." },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Brand Guidelines</span>
        </div>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          <ExternalLink className="w-3 h-3" />
          Notion
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {guidelines.map((item, i) => (
          <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-semibold text-foreground mb-1">{item.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
        <p className="text-xs text-primary font-medium mb-1">💡 Conectar con Notion</p>
        <p className="text-xs text-muted-foreground">
          Vincula tu base de Notion para sincronizar guidelines automáticamente.
        </p>
      </div>
    </div>
  );
};

export default GuidelinesPanel;
