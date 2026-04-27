export const HERRAMIENTAS_IA = [
  {
    id: "chatgpt",
    nombre: "ChatGPT (Plus / Team)",
    icon: "💬",
    instrucciones: [
      "Entra a chatgpt.com y abre la sección 'Mis GPTs' (menú lateral izquierdo).",
      "Click en 'Crear un GPT'. Ponle nombre: 'Asistente [Nombre Dependencia]'.",
      "En la pestaña 'Configurar' → 'Conocimiento', sube todos los documentos del corpus.",
      "En 'Instrucciones', pega el prompt de sistema que generamos en este curso.",
      "Guárdalo como 'Solo para mí' o 'Solo para mi organización'. Listo.",
    ],
  },
  {
    id: "claude",
    nombre: "Claude (Pro / Team)",
    icon: "🤖",
    instrucciones: [
      "Entra a claude.ai y abre la sección 'Projects' en el menú lateral.",
      "Crea un nuevo proyecto: 'Comunicación [Dependencia]'.",
      "En 'Project Knowledge', sube todos los documentos del corpus.",
      "En 'Custom instructions for this project', pega el prompt de sistema.",
      "Cada conversación dentro del proyecto usará automáticamente el contexto.",
    ],
  },
  {
    id: "copilot",
    nombre: "Microsoft Copilot",
    icon: "🪟",
    instrucciones: [
      "Entra a Copilot Studio (copilotstudio.microsoft.com) con tu cuenta institucional.",
      "Crea un nuevo agente: 'Asistente [Dependencia]'.",
      "En 'Knowledge', agrega los documentos como fuente (puedes apuntar a SharePoint o subir archivos).",
      "En 'Instructions' del sistema, pega el prompt de sistema generado.",
      "Publica el agente para tu equipo de comunicación.",
    ],
  },
  {
    id: "gemini",
    nombre: "Gemini (Google Workspace)",
    icon: "✨",
    instrucciones: [
      "Coloca todos los documentos del corpus en una carpeta de Google Drive compartida con el equipo.",
      "Si tienes acceso a Gems (gemini.google.com/gems), crea uno nuevo: 'Comunicación [Dependencia]'.",
      "En las instrucciones del Gem, pega el prompt de sistema generado.",
      "Activa la extensión de Drive y referencia la carpeta del corpus al inicio de cada conversación.",
      "Si no tienes Gems, pega el prompt como primer mensaje en cada conversación nueva.",
    ],
  },
] as const;

export const CORPUS_DOCUMENTOS = [
  {
    id: "plan_trabajo",
    nombre: "Plan de trabajo o programa de gobierno",
    razon: "Define los ejes, metas y lenguaje oficial de la dependencia.",
    prioridad: "esencial" as const,
  },
  {
    id: "informe",
    nombre: "Informe de actividades reciente",
    razon: "Datos duros, logros verificados, cifras oficiales.",
    prioridad: "esencial" as const,
  },
  {
    id: "discursos",
    nombre: "2 a 3 discursos del titular",
    razon: "Tono, estructura y vocabulario real del comunicador principal.",
    prioridad: "esencial" as const,
  },
  {
    id: "boletines",
    nombre: "Boletines de prensa recientes",
    razon: "Formato, registro periodístico y terminología técnica.",
    prioridad: "recomendado" as const,
  },
  {
    id: "glosario",
    nombre: "Glosario o términos técnicos del sector",
    razon: "Evita errores de interpretación en temas especializados.",
    prioridad: "recomendado" as const,
  },
  {
    id: "marco",
    nombre: "Marco normativo relevante (leyes, reglamentos)",
    razon: "Para dependencias que generan contenido normativo o jurídico.",
    prioridad: "opcional" as const,
  },
] as const;

export const ERRORES_CATALOGO: Record<
  string,
  { nombre: string; descripcion: string; color: string }
> = {
  PROMPTS_SIN_ESTRATEGIA: {
    nombre: "Prompts sin estrategia",
    descripcion: "El texto no sabe a quién le habla ni para qué fue escrito.",
    color: "bg-coral/15 text-coral border-coral/30",
  },
  LENGUAJE_IA_NO_DEPURADO: {
    nombre: "Lenguaje de IA no depurado",
    descripcion: "Frases reveladoras de modelo: 'no solo, sino también', 'dejar huella', muletillas grandilocuentes.",
    color: "bg-magenta/15 text-magenta border-magenta/30",
  },
  REGISTRO_UNIFORME: {
    nombre: "Registro uniforme sin distinción de audiencia",
    descripcion: "Mismo tono para ciudadanía, medios y público técnico.",
    color: "bg-electric/15 text-electric border-electric/30",
  },
  SIN_ESTRUCTURA: {
    nombre: "Ausencia de estructura solicitada",
    descripcion: "No hay apertura, cuerpo y cierre claros. El texto crece sin orden.",
    color: "bg-cyan/15 text-cyan border-cyan/30",
  },
  DATOS_SIN_VERIFICAR: {
    nombre: "Datos sin verificar",
    descripcion: "Cifras o nombres dichos con autoridad pero sin fuente clara.",
    color: "bg-lime/15 text-lime border-lime/30",
  },
};

export type ErrorTipo = keyof typeof ERRORES_CATALOGO;