export interface SlideData {
  id: number;
  subtitle?: string;
  title: string;
  titleAccent?: string;
  content: SlideContent;
  footer?: string;
  footerRight?: string;
  layout: "cover" | "text-image" | "split" | "grid-3" | "comparison" | "full-text" | "search";
}

export interface SlideContent {
  intro?: string;
  points?: { icon: string; title: string; description: string }[];
  columns?: { icon: string; title: string; items?: string[]; description?: string; dark?: boolean; dimmed?: boolean; footerNote?: string }[];
  beforeAfter?: { before: { label: string; text: string }; after: { label: string; text: string } };
  searchQuery?: string;
  searchCaption?: string;
  message?: string;
  callout?: string;
}

export const presentationSlides: SlideData[] = [
  {
    id: 1,
    layout: "cover",
    subtitle: "Taller de Capacitación",
    title: "Presencia Digital y",
    titleAccent: "Liderazgo Femenino",
    content: {
      message: "Una herramienta de servicio para fortalecer el vínculo y el apoyo a la comunidad.",
      callout: "Comunicar para llegar a más mujeres.",
    },
    footer: "16 de febrero de 2026",
    footerRight: "Secretaría de Promoción Política",
  },
  {
    id: 2,
    layout: "text-image",
    title: "Lo que hoy se hace bien",
    content: {
      points: [
        { icon: "HandHelping", title: "Gestión y acompañamiento", description: "Su trabajo de gestión y acompañamiento es el pilar fundamental que sostiene a su comunidad." },
        { icon: "Wrench", title: "Complemento práctico", description: "La tecnología no busca sustituir su liderazgo, sino actuar como un complemento práctico a su esfuerzo." },
        { icon: "Megaphone", title: "Motor de servicio", description: "El compromiso con el servicio a otras mujeres sigue siendo el motor principal de su presencia pública." },
      ],
    },
    footer: "Partimos de la base de lo que ya hacen bien: servir a los demás.",
  },
  {
    id: 3,
    layout: "split",
    subtitle: "Contexto Actual",
    title: "El cambio en el",
    titleAccent: "contacto ciudadano",
    content: {
      intro: "La interacción social ha migrado de las plazas y oficinas físicas hacia el entorno digital.",
      beforeAfter: {
        before: { label: "Antes", text: "Búsqueda de ayuda presencial" },
        after: { label: "Hoy", text: "Primer contacto vía dispositivo móvil" },
      },
    },
    footer: "La presencia digital no es una opción, es el nuevo espacio público.",
  },
  {
    id: 4,
    layout: "text-image",
    subtitle: "Acceso a la información",
    title: "El celular como puerta de entrada",
    content: {
      points: [
        { icon: "Search", title: "Búsqueda de auxilio", description: "Ante una crisis, el celular es el primer recurso para buscar ayuda, líneas de apoyo o refugio." },
        { icon: "Smartphone", title: "Privacidad y seguridad", description: "El dispositivo móvil ofrece un espacio de consulta discreto para mujeres en situaciones de vulnerabilidad." },
        { icon: "Clock", title: "Inmediatez del servicio", description: "La respuesta digital permite una atención prioritaria cuando el tiempo es un factor crítico." },
      ],
    },
    footer: "No es tecnología, es la vía más rápida para encontrar una solución.",
  },
  {
    id: 5,
    layout: "grid-3",
    subtitle: "Impacto en el servicio",
    title: "Consecuencias de la",
    titleAccent: "ausencia digital",
    content: {
      intro: "Cuando el liderazgo no tiene presencia en red, se crean brechas de comunicación que afectan directamente a quienes buscan ayuda.",
      columns: [
        { icon: "EyeOff", title: "Invisibilidad en crisis", description: "Para una mujer que busca apoyo desde su celular, lo que no aparece en pantalla simplemente no existe." },
        { icon: "MapPin", title: "Dificultad de enlace", description: "La falta de canales digitales obliga a la ciudadana a un esfuerzo físico o presencial que no siempre puede realizar." },
        { icon: "UserX", title: "Respuesta tardía", description: "Sin herramientas digitales, el tiempo entre la necesidad y el contacto se extiende, limitando la efectividad del apoyo." },
      ],
    },
    footer: "La ausencia digital no es neutral; es una limitación real a nuestra capacidad de servicio.",
  },
  {
    id: 6,
    layout: "comparison",
    subtitle: "Estrategia y Propósito",
    title: "Servicio frente a vanidad",
    content: {
      columns: [
        {
          icon: "UserCircle",
          title: "Vanidad Personal",
          items: [
            "Busca la exposición personal y el protagonismo individual.",
            "Se mide por la cantidad de likes o seguidores obtenidos.",
            "El contenido se centra en la imagen privada de la líder.",
          ],
          dimmed: true,
          footerNote: "No es el objetivo de este taller.",
        },
        {
          icon: "Megaphone",
          title: "Servicio Institucional",
          items: [
            "Busca crear canales de atención y contacto para quienes necesitan ayuda.",
            "Se mide por la efectividad de la respuesta y la utilidad de la información.",
            "El contenido se centra en soluciones, trámites y acompañamiento.",
          ],
          dark: true,
          footerNote: "Enfoque central del liderazgo social moderno.",
        },
      ],
      callout: "La presencia digital es un activo institucional, no un álbum personal.",
    },
  },
  {
    id: 7,
    layout: "grid-3",
    subtitle: "Ventajas Estratégicas",
    title: "Beneficios prácticos de la presencia",
    content: {
      columns: [
        { icon: "History", title: "Optimización de respuesta", description: "Permite atender solicitudes en el momento crítico, reduciendo los tiempos de espera y facilitando la gestión inmediata." },
        { icon: "MapPin", title: "Alcance territorial", description: "Supera las barreras físicas para conectar con mujeres en zonas alejadas que difícilmente podrían acudir a una oficina." },
        { icon: "UserCheck", title: "Profesionalización", description: "Una presencia digital organizada proyecta seriedad y confianza, elevando la calidad del servicio a la ciudadanía." },
      ],
    },
    footer: "\"La tecnología no es el fin, es el medio para que el servicio sea más eficiente y accesible.\"",
  },
  {
    id: 8,
    layout: "text-image",
    subtitle: "Plataformas de Proximidad",
    title: "Facebook y WhatsApp:",
    titleAccent: "Contacto cercano",
    content: {
      points: [
        { icon: "Facebook", title: "Facebook: El Tablón Comunitario", description: "Difusión de información útil y avisos oficiales. Espacio para resolver dudas en grupos locales. Registro visual del trabajo realizado." },
        { icon: "MessageCircle", title: "WhatsApp: Atención Directa", description: "Seguimiento personalizado de casos sensibles. Canal de confianza para orientación inmediata. Comunicación rápida con redes de apoyo." },
      ],
    },
    footer: "\"Estas herramientas no son para el entretenimiento, son para la gestión y el servicio.\"",
  },
  {
    id: 9,
    layout: "text-image",
    subtitle: "Herramientas Digitales",
    title: "Instagram y TikTok:",
    titleAccent: "Visibilidad generacional",
    content: {
      intro: "Estas plataformas permiten conectar con mujeres jóvenes y mostrar el impacto real del trabajo comunitario de forma visual y directa.",
      points: [
        { icon: "Instagram", title: "Narrativa Visual", description: "Ideal para documentar casos de éxito, eventos y el día a día de la gestión mediante imágenes de alta calidad." },
        { icon: "Play", title: "Alcance Orgánico", description: "Permite que el mensaje de servicio llegue a audiencias que no conocen su labor, superando las barreras del círculo cercano." },
      ],
    },
    footer: "No se busca ser \"influencer\", sino dar testimonio de que la ayuda existe y es accesible.",
  },
  {
    id: 10,
    layout: "search",
    title: "Google: La búsqueda de ayuda urgente",
    content: {
      searchQuery: "\"Ayuda inmediata para mujeres en...\"",
      searchCaption: "El primer paso en una situación de crisis es la búsqueda digital",
      columns: [
        { icon: "Clock", title: "Respuesta Crítica", description: "En momentos de emergencia o vulnerabilidad, las mujeres buscan soluciones locales inmediatas desde su dispositivo móvil." },
        { icon: "MapPin", title: "Visibilidad de Servicio", description: "Ubicación de refugios y centros de apoyo. Horarios y teléfonos de contacto directo. Acceso a asesoría legal y acompañamiento." },
      ],
    },
    footer: "No aparecer en Google es, para una mujer en crisis, no existir como opción de ayuda.",
  },
  {
    id: 11,
    layout: "text-image",
    subtitle: "Estrategia Digital",
    title: "Desmitificando la complejidad técnica",
    content: {
      intro: "La presencia digital efectiva no depende de la sofisticación tecnológica, sino de la claridad del mensaje y la disponibilidad para ayudar.",
      points: [
        { icon: "UserX", title: "No es ser \"Influencer\"", description: "Se trata de ser encontrable y útil, no de buscar fama personal o \"likes\" masivos." },
        { icon: "Wrench", title: "No requiere expertiz técnica", description: "Las herramientas actuales son intuitivas. Lo importante es el contenido de valor que ya generan." },
        { icon: "Camera", title: "No exige estética perfecta", description: "La autenticidad y la información veraz superan a la edición profesional en el liderazgo social." },
      ],
    },
    footer: "\"La tecnología es solo el canal; la capacidad de servicio sigue siendo su mayor activo.\"",
  },
  {
    id: 12,
    layout: "text-image",
    title: "El espacio público digital",
    content: {
      intro: "Lo digital no es un mundo aparte; es la extensión actual del espacio público donde se construye la participación ciudadana y la incidencia política.",
      points: [
        { icon: "Landmark", title: "Incidencia en la agenda", description: "Estar presentes permite que las causas comunitarias locales formen parte de la conversación pública general." },
        { icon: "Users", title: "Representación efectiva", description: "Garantiza que la voz de las mujeres esté representada en los espacios donde se toman las decisiones hoy." },
        { icon: "Network", title: "Construcción colectiva", description: "Facilita la creación de redes de apoyo y alianzas estratégicas entre líderes de distintas regiones." },
      ],
    },
    footer: "La presencia digital es hoy un componente esencial del liderazgo político moderno.",
  },
  {
    id: 13,
    layout: "text-image",
    title: "El objetivo central:",
    titleAccent: "Ser encontradas",
    content: {
      intro: "La presencia digital no busca notoriedad, sino disponibilidad. Aseguramos que ninguna mujer se quede sin apoyo por falta de contacto.",
      points: [
        { icon: "MapPin", title: "Ubicación Inmediata", description: "Reducir el tiempo entre la necesidad de ayuda y el primer contacto con la líder." },
        { icon: "ShieldCheck", title: "Puente de Confianza", description: "Ser el referente seguro que aparece cuando una mujer busca orientación en su celular." },
        { icon: "Clock", title: "Respuesta Oportuna", description: "Estar presentes donde las nuevas generaciones y mujeres en crisis buscan soluciones hoy." },
      ],
    },
    footer: "\"La presencia digital no es exposición personal. Es una forma de servicio que permite que más mujeres encuentren apoyo a tiempo.\"",
  },
  {
    id: 14,
    layout: "grid-3",
    subtitle: "Conclusión del Taller",
    title: "La presencia digital como compromiso",
    content: {
      columns: [
        { icon: "Handshake", title: "Extensión del Servicio", description: "No es una tarea extra, es llevar su vocación de ayuda a los espacios donde las mujeres están hoy." },
        { icon: "Route", title: "Eliminar Distancias", description: "Lo digital permite que una mujer en una zona remota o aislada pueda contactarlas sin barreras físicas." },
        { icon: "Clock", title: "Respuesta Oportuna", description: "Estar presente significa que la ayuda llega en el momento crítico, cuando más se necesita." },
      ],
      callout: "\"La presencia digital no es exposición personal. Es una forma de servicio que permite que más mujeres encuentren apoyo a tiempo.\"",
    },
  },
  {
    id: 15,
    layout: "grid-3",
    subtitle: "Cierre de fase teórica",
    title: "Transición al ejercicio práctico",
    content: {
      columns: [
        { icon: "Smartphone", title: "Configuración", description: "Ajuste de perfiles institucionales para que la información de contacto sea clara y accesible." },
        { icon: "Wrench", title: "Herramientas", description: "Uso de mensajes automáticos y respuestas rápidas para la atención oportuna." },
        { icon: "Handshake", title: "Canales de Ayuda", description: "Vinculación de plataformas para asegurar que el puente de servicio esté siempre abierto." },
      ],
      callout: "\"La presencia digital no es exposición personal. Es una forma de servicio que permite que más mujeres encuentren apoyo a tiempo.\"",
    },
    footerRight: "MANOS A LA OBRA",
  },
];
