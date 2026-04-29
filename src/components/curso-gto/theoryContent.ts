import { BookOpen, Search, Target, FolderOpen, Sparkles, Trophy, type LucideIcon } from "lucide-react";

export interface StepTheory {
  icon: LucideIcon;
  badge: string;
  titulo: string;
  definicion: string;
  principios: { titulo: string; detalle: string }[];
  analogia: { titulo: string; texto: string };
  accion: string;
}

export const THEORY_BY_STEP: Record<number, StepTheory> = {
  0: {
    icon: BookOpen,
    badge: "Marco general",
    titulo: "Por qué este curso (y por qué hoy)",
    definicion:
      "La IA generativa no escribe por ti: amplifica lo que ya sabes de tu dependencia. Si le das contexto institucional, te devuelve textos alineados; si no, te devuelve genéricos que hay que reescribir.",
    principios: [
      {
        titulo: "Garbage in, garbage out",
        detalle: "La calidad del output depende del contexto que tú le das. No es la herramienta, es el insumo.",
      },
      {
        titulo: "Brief + corpus + reglas",
        detalle: "Toda configuración seria de IA institucional necesita los tres: quién eres, qué documentos vives, cómo escribes.",
      },
      {
        titulo: "Resultado tangible",
        detalle: "Sales con un prompt de sistema listo para pegar en ChatGPT/Claude/Copilot/Gemini el lunes.",
      },
    ],
    analogia: {
      titulo: "Como un nuevo redactor",
      texto:
        "Imagina que llega un redactor freelance que nunca ha escrito para tu dependencia. Lo primero que haces es darle un brief, mostrarle los documentos clave y enseñarle el tono. Eso exactamente es lo que vas a hacer hoy, pero con la IA.",
    },
    accion: "En las próximas etapas vamos a construir, juntos, ese brief institucional para tu IA.",
  },
  1: {
    icon: Search,
    badge: "Etapa 1 · Diagnóstico",
    titulo: "Antes de configurar, hay que ver qué está pasando",
    definicion:
      "El diagnóstico te muestra los patrones reales de tu dependencia: tics de redacción, errores frecuentes, palabras prohibidas que se siguen colando. La IA detecta lo que tú ya intuyes pero no habías sistematizado.",
    principios: [
      {
        titulo: "Lo que mides, lo mejoras",
        detalle: "Un score numérico hace visible la calidad. Sin medir, todo texto se siente 'bien' o 'mal' sin criterio.",
      },
      {
        titulo: "Los errores son insumos",
        detalle: "Cada error detectado se convierte en una regla del prompt. El diagnóstico alimenta directamente la configuración final.",
      },
      {
        titulo: "Patrones, no anécdotas",
        detalle: "Con 2-3 textos reales ya empiezan a verse patrones: muletillas, párrafos largos, frases vacías de poder.",
      },
    ],
    analogia: {
      titulo: "Como un check-up médico",
      texto:
        "No tomas medicina antes de que el doctor revise síntomas. Aquí pasa igual: antes de definir reglas, vemos qué está produciendo realmente tu dependencia hoy.",
    },
    accion: "Pega 1, 2 o 3 textos publicados recientemente. La IA te dice qué patrones detecta y qué corregir.",
  },
  2: {
    icon: Target,
    badge: "Etapa 2 · Brief institucional",
    titulo: "Quién eres tú como dependencia, en datos",
    definicion:
      "El brief es el ADN de tu comunicación: misión, audiencias, tono, mensajes clave, palabras que sí y palabras que no. Es lo que un nuevo integrante del equipo debería leer en sus primeras 2 horas.",
    principios: [
      {
        titulo: "Específico vence a aspiracional",
        detalle: "'Cercano y técnico' no dice nada. 'Tuteo, frases cortas, sin gerundios' sí.",
      },
      {
        titulo: "Audiencias concretas, no genéricas",
        detalle: "'La ciudadanía' es nadie. 'Mamás de niños en primaria pública del estado' es alguien con expectativas claras.",
      },
      {
        titulo: "Lo prohibido es tan importante como lo preferido",
        detalle: "Listar las 5 palabras que jamás deben aparecer evita el 90% de los textos que terminan reescritos.",
      },
    ],
    analogia: {
      titulo: "Como un brief de campaña",
      texto:
        "En publicidad nadie empieza a escribir sin brief. La IA es igual: si le entregas un brief sólido, el primer borrador ya está al 70%. Si no, te va a regresar texto plano que revisas tres veces.",
    },
    accion: "Llena los 6 campos del brief. Sé específico. Lo que escribas aquí define el 70% de la calidad final.",
  },
  3: {
    icon: FolderOpen,
    badge: "Etapa 3 · Corpus de referencia",
    titulo: "Los documentos que tu IA debe 'haber leído'",
    definicion:
      "El corpus es el archivo institucional que la IA consulta para no inventar. Plan de trabajo, informes, discursos del titular, boletines recientes: todo lo que define qué es verdad para tu dependencia.",
    principios: [
      {
        titulo: "Sin corpus, la IA alucina",
        detalle: "Si no le das fuentes, inventa cifras y atribuciones. Con corpus, cita lo que tú ya tienes documentado.",
      },
      {
        titulo: "Calidad sobre cantidad",
        detalle: "5 documentos clave bien elegidos rinden más que 50 archivos sueltos sin curaduría.",
      },
      {
        titulo: "Vivo, no histórico",
        detalle: "El corpus se actualiza cada trimestre. Lo que era cierto hace 6 meses puede ya no serlo.",
      },
    ],
    analogia: {
      titulo: "Como la biblioteca del equipo",
      texto:
        "Cuando llega alguien nuevo, no le das todos los archivos: le das la carpeta esencial. Eso es el corpus para la IA: la carpeta esencial que define el 'mundo verdadero' de tu dependencia.",
    },
    accion: "Marca qué documentos sube tu equipo a la herramienta de IA. Anota dónde vive cada uno hoy.",
  },
  4: {
    icon: Sparkles,
    badge: "Etapa 4 · Prompt de sistema",
    titulo: "Las instrucciones permanentes de tu IA",
    definicion:
      "El prompt de sistema es el conjunto de reglas que la IA aplica en cada conversación, sin que tengas que repetirlas. Es la diferencia entre escribir 'redacta como mi dependencia' cada vez, vs. tenerlo configurado de fábrica.",
    principios: [
      {
        titulo: "Una vez, para siempre",
        detalle: "Lo configuras hoy, lo usa todo el equipo de comunicación a partir de mañana, sin curva de aprendizaje.",
      },
      {
        titulo: "Combina brief + corpus + diagnóstico",
        detalle: "Un buen prompt no se inventa: integra los 3 insumos previos en instrucciones operativas.",
      },
      {
        titulo: "Iterable",
        detalle: "El primer prompt nunca es el definitivo. En 14 días lo afinas con base en los textos reales que generaste.",
      },
    ],
    analogia: {
      titulo: "Como el manual de estilo",
      texto:
        "Las grandes redacciones tienen un manual de estilo que todos siguen sin pensarlo. El prompt de sistema es ese manual, pero ejecutado automáticamente por la IA cada vez que escribes.",
    },
    accion: "La IA va a generar tu prompt personalizado con todo lo anterior. Cópialo y pégalo en tu herramienta.",
  },
  5: {
    icon: Trophy,
    badge: "Etapa 5 · Compromisos",
    titulo: "Lo que sale de aquí, no se queda en la sesión",
    definicion:
      "Una capacitación sin compromisos es entretenimiento. Aquí cierras con 3 acciones concretas en 14 días, para que el prompt deje de ser un archivo guardado y se convierta en práctica diaria del equipo.",
    principios: [
      {
        titulo: "Compromiso temporal específico",
        detalle: "'En 14 días' obliga a calendarizar. 'Pronto' nunca llega.",
      },
      {
        titulo: "Evidencia, no intención",
        detalle: "Compartir un ejemplo antes/después con KiMedia hace visible que sí se aplicó.",
      },
      {
        titulo: "Iteración acompañada",
        detalle: "El prompt mejora cuando hay un segundo par de ojos. KiMedia te da retroalimentación a las 2 semanas.",
      },
    ],
    analogia: {
      titulo: "Como un entrenamiento físico",
      texto:
        "Salir del gym sintiéndose bien no sirve si no vuelves. Estos compromisos son tu plan de los siguientes 14 días para que el músculo de la IA institucional realmente se entrene.",
    },
    accion: "Marca los compromisos que sí vas a ejecutar. Solo cuentan los que de verdad asumes.",
  },
};
