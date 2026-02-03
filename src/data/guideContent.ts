export interface GuideChapter {
  id: string;
  title: string;
  description: string;
  content: string[];
  isPremium: boolean;
}

export interface Guide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  chapters: GuideChapter[];
}

// Guía de Marca Personal
export const personalBrandGuide: Guide = {
  id: "personal_brand",
  title: "Guía de Redes Sociales para Marca Personal",
  subtitle: "Construye una presencia digital que atraiga clientes",
  description: "Aprende a posicionarte como experto en tu industria, crear contenido que conecte y convertir seguidores en clientes.",
  chapters: [
    {
      id: "pb-ch1",
      title: "1. Fundamentos de Marca Personal Digital",
      description: "Entiende qué es una marca personal y por qué es crucial en la era digital",
      isPremium: false,
      content: [
        "**¿Qué es una marca personal?**\nTu marca personal es la percepción que otros tienen de ti basada en tu presencia online y offline. En el mundo digital, es cómo te presentas, qué comunicas y qué valor aportas.",
        "**Por qué necesitas una marca personal fuerte:**\n• El 70% de empleadores revisan redes sociales antes de contratar\n• Los profesionales con marca personal fuerte cobran hasta 3x más\n• Te diferencia en un mercado saturado\n• Genera confianza antes del primer contacto",
        "**Los 3 pilares de una marca personal efectiva:**\n1. **Autenticidad**: Sé genuino, no copies a otros\n2. **Consistencia**: Mismo mensaje en todos los canales\n3. **Valor**: Siempre aporta algo útil a tu audiencia",
        "**Ejercicio práctico:**\nResponde estas 3 preguntas:\n• ¿Qué problema específico resuelves?\n• ¿Para quién lo resuelves?\n• ¿Qué te hace diferente de otros que hacen lo mismo?",
      ],
    },
    {
      id: "pb-ch2",
      title: "2. Define tu Propuesta de Valor Única",
      description: "Crea un mensaje claro que comunique por qué deberían elegirte",
      isPremium: false,
      content: [
        "**Tu propuesta de valor en una frase**\nDebe responder: \"Ayudo a [AUDIENCIA] a lograr [RESULTADO] mediante [MÉTODO/ENFOQUE]\"",
        "**Ejemplos de propuestas de valor:**\n• \"Ayudo a emprendedores a conseguir sus primeros 10 clientes con estrategias de contenido orgánico\"\n• \"Transformo la comunicación de equipos remotos para aumentar productividad un 40%\"\n• \"Enseño a freelancers a cobrar lo que valen con técnicas de negociación probadas\"",
        "**Identifica tu diferenciador:**\n• Tu metodología única\n• Tu experiencia específica\n• Tu perspectiva o enfoque\n• Tu nicho de especialización",
        "**Plantilla para tu bio:**\n[Tu rol] | Ayudo a [audiencia] a [resultado] | [Credencial o prueba social] | [CTA o contacto]",
      ],
    },
    {
      id: "pb-ch3",
      title: "3. Optimiza tus Perfiles Profesionales",
      description: "Configura tus redes para atraer las oportunidades correctas",
      isPremium: true,
      content: [
        "**Checklist de perfil optimizado:**\n✅ Foto profesional (cara visible, buena iluminación)\n✅ Banner personalizado con tu propuesta de valor\n✅ Bio clara con keywords de tu industria\n✅ Enlace a tu sitio web o portafolio\n✅ Información de contacto visible",
        "**Optimización por plataforma:**\n\n**LinkedIn:**\n• Titular: No solo tu cargo, incluye el valor que aportas\n• Acerca de: Historia + logros + llamado a la acción\n• Experiencia: Logros con números, no solo responsabilidades\n• Recomendaciones: Pide al menos 5 de clientes/colegas",
        "**Instagram:**\n• Username profesional y memorable\n• Bio con emojis estratégicos y CTA\n• Highlights organizados por temas\n• Link en bio optimizado (Linktree, etc.)\n\n**Twitter/X:**\n• Bio concisa y memorable\n• Pinea tu mejor tweet o hilo\n• Header que comunique tu expertise",
        "**Herramientas recomendadas:**\n• Canva para banners y diseños\n• Calendly para agendar llamadas\n• Notion para portafolio\n• Linktree o Beacons para link en bio",
      ],
    },
    {
      id: "pb-ch4",
      title: "4. Estrategia de Contenido que Convierte",
      description: "Crea contenido que atraiga, eduque y convierta a tu audiencia ideal",
      isPremium: true,
      content: [
        "**Los 4 pilares de contenido:**\n1. **Educativo** (40%): Enseña algo útil\n2. **Inspiracional** (25%): Motiva y conecta emocionalmente\n3. **Entretenimiento** (20%): Humaniza tu marca\n4. **Promocional** (15%): Ofertas y CTAs directos",
        "**Formatos que funcionan:**\n• Carruseles educativos (alto guardado)\n• Videos cortos con tips rápidos\n• Historias de fracaso → aprendizaje\n• Opiniones controversiales de tu industria\n• Behind the scenes de tu trabajo\n• Testimonios y casos de éxito",
        "**Calendario de contenido semanal:**\nLunes: Tip educativo\nMiércoles: Historia personal o caso de éxito\nViernes: Contenido de valor + CTA suave\n+ Stories diarias para mantener presencia",
        "**Fórmula para posts que enganchan:**\n1. Hook poderoso (primera línea)\n2. Contexto del problema\n3. Solución o insight\n4. Ejemplo o prueba\n5. CTA claro",
      ],
    },
    {
      id: "pb-ch5",
      title: "5. Construye tu Red Estratégicamente",
      description: "Networking digital efectivo para crecer tu influencia",
      isPremium: true,
      content: [
        "**La regla del 5-3-1:**\nCada día dedica tiempo a:\n• 5 comentarios valiosos en posts de otros\n• 3 conexiones nuevas con mensaje personalizado\n• 1 publicación propia de valor",
        "**Cómo comentar para ser notado:**\n• Agrega perspectiva, no solo \"Gran post!\"\n• Haz preguntas inteligentes\n• Comparte experiencia relacionada\n• Sé de los primeros en comentar",
        "**Mensajes de conexión que funcionan:**\n\"Hola [Nombre], vi tu post sobre [tema] y me resonó porque [razón personal]. Me encantaría conectar y seguir aprendiendo de tu contenido sobre [tema específico].\"",
        "**Colaboraciones estratégicas:**\n• Lives conjuntos\n• Entrevistas cruzadas\n• Guest posts\n• Menciones mutuas\n• Proyectos colaborativos",
      ],
    },
    {
      id: "pb-ch6",
      title: "6. Monetiza tu Marca Personal",
      description: "Convierte tu autoridad en ingresos",
      isPremium: true,
      content: [
        "**Escalera de valor:**\n1. Contenido gratuito (atrae)\n2. Lead magnet (captura emails)\n3. Producto de entrada (ebook, curso corto)\n4. Servicio premium (consultoría, mentoría)\n5. Programa de alto valor (mastermind)",
        "**Formas de monetizar:**\n• Consultoría 1:1\n• Cursos online\n• Workshops y talleres\n• Speaking\n• Patrocinios y colaboraciones\n• Productos digitales",
        "**Cómo vender sin ser \"vendedor\":**\n• El 80% de tu contenido es puro valor\n• Comparte resultados de clientes\n• Usa testimonios estratégicamente\n• Ofrece antes de pedir\n• CTAs naturales, no agresivos",
        "**Precios y posicionamiento:**\n• No compitas por precio, compite por valor\n• Posiciona como experto, no como opción barata\n• Muestra resultados y ROI\n• Ofrece garantías que eliminen riesgo",
      ],
    },
    {
      id: "pb-ch7",
      title: "7. Métricas y Análisis",
      description: "Mide lo que importa para mejorar constantemente",
      isPremium: true,
      content: [
        "**Métricas que importan vs. vanidad:**\n\n**Métricas de vanidad (no te enfoques):**\n• Número de seguidores\n• Likes totales\n\n**Métricas que importan:**\n• Tasa de engagement\n• Guardados y compartidos\n• Clics en enlaces\n• Mensajes directos\n• Leads generados\n• Conversiones a cliente",
        "**KPIs semanales recomendados:**\n• Nuevos seguidores relevantes\n• Engagement rate promedio\n• Alcance de contenido\n• Leads capturados\n• Reuniones agendadas",
        "**Herramientas de análisis:**\n• Analytics nativas de cada plataforma\n• Metricool o Hootsuite para reportes\n• Google Analytics para tráfico web\n• Notion o Airtable para tracking manual",
        "**Proceso de mejora continua:**\n1. Revisa métricas semanalmente\n2. Identifica top 3 posts del mes\n3. Analiza qué tienen en común\n4. Replica y mejora\n5. Experimenta con nuevos formatos",
      ],
    },
    {
      id: "pb-ch8",
      title: "8. Plan de Acción de 30 Días",
      description: "Implementa todo lo aprendido con un plan paso a paso",
      isPremium: true,
      content: [
        "**Semana 1: Fundamentos**\n• Día 1-2: Define tu propuesta de valor\n• Día 3-4: Optimiza todos tus perfiles\n• Día 5-7: Crea tu calendario de contenido",
        "**Semana 2: Contenido**\n• Día 8-10: Crea batch de 10 posts\n• Día 11-12: Programa contenido de 2 semanas\n• Día 13-14: Empieza rutina de engagement",
        "**Semana 3: Networking**\n• Día 15-17: Identifica 50 cuentas para interactuar\n• Día 18-19: Envía 20 conexiones personalizadas\n• Día 20-21: Propón 2 colaboraciones",
        "**Semana 4: Monetización**\n• Día 22-24: Crea tu lead magnet\n• Día 25-26: Configura captura de emails\n• Día 27-28: Diseña tu oferta de servicios\n• Día 29-30: Lanza tu primera campaña",
      ],
    },
  ],
};

// Guía para PyMEs
export const pymeGuide: Guide = {
  id: "pyme",
  title: "Guía de Redes Sociales para PyMEs",
  subtitle: "Estrategias digitales para hacer crecer tu negocio",
  description: "Aprende a usar las redes sociales para atraer clientes, aumentar ventas y posicionar tu empresa en el mercado digital.",
  chapters: [
    {
      id: "pyme-ch1",
      title: "1. Por qué tu PyME Necesita Redes Sociales",
      description: "El caso de negocio para invertir en presencia digital",
      isPremium: false,
      content: [
        "**El panorama digital actual:**\n• 85% de consumidores investigan online antes de comprar\n• 70% confía más en empresas con presencia activa en redes\n• Las PyMEs con marketing digital crecen 2.8x más rápido\n• El costo de adquisición digital es 62% menor que el tradicional",
        "**Beneficios tangibles para tu negocio:**\n• Visibilidad 24/7 sin costo de local físico\n• Alcance geográfico ilimitado\n• Segmentación precisa de tu cliente ideal\n• Medición exacta de resultados y ROI\n• Construcción de comunidad y lealtad",
        "**Casos de éxito de PyMEs:**\n• Panadería local: 300% más ventas con Instagram\n• Consultoría B2B: 80% de leads vienen de LinkedIn\n• Tienda de ropa: Redujo 50% costo de adquisición con Meta Ads",
        "**Mitos que frenan a las PyMEs:**\n❌ \"Es solo para empresas grandes\" → Falso, es nivelador\n❌ \"Necesito mucho presupuesto\" → Empieza con $0\n❌ \"No tengo tiempo\" → 30 min/día es suficiente\n❌ \"No sé de tecnología\" → Herramientas son intuitivas",
      ],
    },
    {
      id: "pyme-ch2",
      title: "2. Elige las Redes Correctas para tu Negocio",
      description: "No todas las redes son para todos los negocios",
      isPremium: false,
      content: [
        "**Guía por tipo de negocio:**\n\n**B2C (Vendes a consumidores):**\n• Instagram: Ideal para productos visuales\n• Facebook: Comunidad y atención al cliente\n• TikTok: Audiencia joven, contenido viral\n\n**B2B (Vendes a empresas):**\n• LinkedIn: Networking y leads corporativos\n• Twitter/X: Thought leadership\n• YouTube: Contenido educativo largo",
        "**Cuántas redes manejar:**\n• Inicio: Domina 1-2 redes máximo\n• Crecimiento: Expande a 3-4 cuando tengas sistema\n• Es mejor ser excelente en 2 que mediocre en 5",
        "**Matriz de decisión:**\n| Red | Mejor para | Esfuerzo | Resultados |\n| Instagram | Productos visuales, lifestyle | Medio | 3-6 meses |\n| Facebook | Comunidad, servicio local | Bajo | 1-3 meses |\n| LinkedIn | B2B, servicios profesionales | Alto | 6-12 meses |\n| TikTok | Audiencia joven, viralidad | Alto | 1-3 meses |",
        "**Tu primera red:**\nElige basándote en:\n1. ¿Dónde está tu cliente ideal?\n2. ¿Qué tipo de contenido puedes crear?\n3. ¿Cuánto tiempo puedes invertir?",
      ],
    },
    {
      id: "pyme-ch3",
      title: "3. Configura Perfiles Empresariales Profesionales",
      description: "Primera impresión que genera confianza",
      isPremium: true,
      content: [
        "**Elementos esenciales:**\n✅ Logo de alta calidad como foto de perfil\n✅ Banner que comunique tu propuesta de valor\n✅ Bio con qué haces, para quién y cómo contactar\n✅ Información de contacto completa\n✅ Horarios y ubicación (si aplica)\n✅ Link a sitio web o tienda",
        "**Cuenta personal vs. empresarial:**\nSIEMPRE usa cuenta empresarial porque:\n• Acceso a estadísticas detalladas\n• Botones de contacto y compra\n• Publicidad y promociones\n• Credibilidad profesional",
        "**Google My Business (CRÍTICO):**\n• Reclama y verifica tu negocio\n• Sube fotos de calidad (interior, exterior, productos)\n• Responde TODAS las reseñas\n• Publica actualizaciones semanales\n• El 46% de búsquedas en Google son locales",
        "**Consistencia de marca:**\n• Mismo logo en todas las redes\n• Paleta de colores consistente\n• Tono de voz uniforme\n• Información actualizada en todos lados",
      ],
    },
    {
      id: "pyme-ch4",
      title: "4. Estrategia de Contenido para PyMEs",
      description: "Qué publicar, cuándo y cómo para atraer clientes",
      isPremium: true,
      content: [
        "**Los 5 tipos de contenido que funcionan:**\n1. **Educativo**: Tips, tutoriales, how-to\n2. **Behind the scenes**: Muestra tu equipo y procesos\n3. **Testimonios**: Historias de clientes satisfechos\n4. **Ofertas**: Promociones y lanzamientos\n5. **Entretenimiento**: Memes, trends (con moderación)",
        "**Calendario semanal básico:**\nLunes: Tip o consejo útil\nMiércoles: Behind the scenes o equipo\nViernes: Testimonio o caso de éxito\nDomingo: Promoción o CTA\n+ Stories o posts cortos diarios",
        "**Fórmula de post efectivo:**\n1. Gancho en primera línea\n2. Problema que resuelves\n3. Tu solución\n4. Prueba o ejemplo\n5. Llamado a la acción claro",
        "**Ideas de contenido para PyMEs:**\n• Proceso de creación de tu producto\n• Día típico en tu negocio\n• Preguntas frecuentes respondidas\n• Antes/después de clientes\n• Tips de uso de tus productos\n• Historia de cómo empezaste",
      ],
    },
    {
      id: "pyme-ch5",
      title: "5. Publicidad Digital con Bajo Presupuesto",
      description: "Maximiza cada peso invertido en ads",
      isPremium: true,
      content: [
        "**Cuándo invertir en publicidad:**\n• Ya tienes contenido orgánico funcionando\n• Conoces a tu audiencia ideal\n• Tienes algo específico que promocionar\n• Puedes medir resultados (conversiones)",
        "**Presupuesto inicial recomendado:**\n• Pruebas: $500-1000 MXN/mes\n• Crecimiento: $2000-5000 MXN/mes\n• Escala: $5000+ MXN/mes\n\n**Regla: No gastes más de lo que puedes perder aprendiendo**",
        "**Estructura de campaña para PyMEs:**\n1. **Objetivo**: Tráfico, leads o ventas\n2. **Audiencia**: Segmentación por intereses, ubicación, comportamiento\n3. **Creativos**: 3-5 variaciones de anuncios\n4. **Presupuesto**: Diario, empezando bajo\n5. **Optimización**: Revisa cada 3-5 días",
        "**Errores comunes a evitar:**\n❌ Boost posts sin estrategia\n❌ Audiencias demasiado amplias\n❌ Un solo anuncio sin variaciones\n❌ No tener pixel instalado\n❌ No medir conversiones reales",
      ],
    },
    {
      id: "pyme-ch6",
      title: "6. Atención al Cliente en Redes Sociales",
      description: "Convierte comentarios y mensajes en ventas",
      isPremium: true,
      content: [
        "**Tiempo de respuesta importa:**\n• 42% espera respuesta en menos de 60 min\n• Respuesta rápida = 7x más probabilidad de conversión\n• Configura respuestas automáticas fuera de horario",
        "**Protocolo de respuesta:**\n1. Responde siempre (sí, a todos)\n2. Usa el nombre del cliente\n3. Sé empático antes de resolver\n4. Ofrece solución concreta\n5. Lleva a la venta cuando sea apropiado",
        "**Manejo de comentarios negativos:**\n• NUNCA borres o ignores (se ve peor)\n• Responde rápido y en público\n• Pide disculpas si corresponde\n• Ofrece solución por mensaje privado\n• Haz seguimiento hasta resolver",
        "**Herramientas para gestión:**\n• Meta Business Suite (gratis)\n• WhatsApp Business (gratis)\n• Hootsuite o Buffer (de pago)\n• Zendesk (empresas más grandes)",
      ],
    },
    {
      id: "pyme-ch7",
      title: "7. Email Marketing + Redes Sociales",
      description: "La combinación ganadora para ventas",
      isPremium: true,
      content: [
        "**Por qué necesitas ambos:**\n• Redes sociales: Atracción y awareness\n• Email: Conversión y retención\n• Las redes no son tuyas, tu lista de emails sí",
        "**Estrategia de captura de leads:**\n1. Crea lead magnet atractivo (descargable, descuento, acceso)\n2. Promociona en redes sociales\n3. Captura email a cambio del valor\n4. Nutre con secuencia de emails\n5. Convierte en cliente",
        "**Ideas de lead magnets:**\n• Checklist o guía PDF\n• Descuento de primer compra\n• Acceso a webinar exclusivo\n• Plantillas o recursos\n• Consulta gratuita",
        "**Herramientas recomendadas:**\n• Mailchimp (gratis hasta 500 suscriptores)\n• Brevo (antes Sendinblue)\n• ConvertKit\n• Mailerlite",
      ],
    },
    {
      id: "pyme-ch8",
      title: "8. Métricas y ROI para PyMEs",
      description: "Mide lo que importa y demuestra resultados",
      isPremium: true,
      content: [
        "**Las 5 métricas clave:**\n1. **Alcance**: Cuántas personas ven tu contenido\n2. **Engagement**: Interacciones / Alcance\n3. **Clics**: Tráfico a tu web o tienda\n4. **Leads**: Contactos capturados\n5. **Ventas**: Conversiones atribuidas",
        "**Calculando tu ROI:**\nROI = (Ingresos por redes - Inversión) / Inversión x 100\n\nEjemplo:\nInversión: $3,000 (ads + herramientas)\nVentas atribuidas: $15,000\nROI = (15,000 - 3,000) / 3,000 x 100 = 400%",
        "**Dashboard semanal simple:**\n• Nuevos seguidores\n• Engagement rate\n• Leads generados\n• Ventas cerradas\n• Costo por lead/venta",
        "**Herramientas de medición:**\n• Google Analytics 4 (obligatorio)\n• Pixel de Meta en tu web\n• UTMs en todos los links\n• CRM para seguimiento de leads",
      ],
    },
    {
      id: "pyme-ch9",
      title: "9. Automatización y Eficiencia",
      description: "Haz más con menos tiempo",
      isPremium: true,
      content: [
        "**Qué automatizar:**\n✅ Programación de posts\n✅ Respuestas frecuentes\n✅ Secuencias de email\n✅ Reportes básicos\n\n**Qué NO automatizar:**\n❌ Respuestas a comentarios personales\n❌ Manejo de crisis\n❌ Contenido (solo la publicación)",
        "**Herramientas de automatización:**\n• Meta Business Suite: Programación gratuita\n• Later/Buffer: Multi-plataforma\n• Zapier: Conecta apps\n• ManyChat: Chatbots Messenger/Instagram",
        "**Rutina de 30 min/día:**\n• 10 min: Revisar y responder mensajes\n• 10 min: Engagement (comentar, dar like)\n• 10 min: Revisar métricas y ajustar",
        "**Batch content:**\n• Dedica 2-3 horas una vez por semana\n• Crea todo el contenido de la semana\n• Programa para publicación automática\n• El resto de días solo interactúa",
      ],
    },
    {
      id: "pyme-ch10",
      title: "10. Plan de Implementación de 30 Días",
      description: "Paso a paso para lanzar tu estrategia",
      isPremium: true,
      content: [
        "**Semana 1: Fundamentos**\n• Día 1: Define objetivos y métricas\n• Día 2-3: Optimiza perfiles en 2 redes\n• Día 4-5: Configura Google My Business\n• Día 6-7: Instala pixel y analytics",
        "**Semana 2: Contenido**\n• Día 8-9: Crea calendario de contenido\n• Día 10-12: Produce contenido de 2 semanas\n• Día 13-14: Programa todo y configura herramientas",
        "**Semana 3: Crecimiento**\n• Día 15-17: Empieza rutina diaria de engagement\n• Día 18-19: Crea tu primer lead magnet\n• Día 20-21: Configura captura de emails",
        "**Semana 4: Optimización**\n• Día 22-24: Lanza primera campaña de ads pequeña\n• Día 25-27: Analiza resultados y ajusta\n• Día 28-30: Documenta procesos y escala lo que funciona",
      ],
    },
  ],
};
