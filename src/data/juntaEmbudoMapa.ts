// Datos de la junta de embudo KiMedia (uso interno, sección privada de Operaciones).
export type FunnelKey = "reconocimiento" | "trafico" | "interaccion" | "leads" | "conversion" | "retarget";

export type JuntaCliente = {
  id: string;
  nombre: string;
  estado: string;
  dueno: string;
  stakeholders?: string;
  que_hacemos: string;
  canales?: string[];
  lovable?: string;
  accion_final: string;
  funnel_hoy: Partial<Record<FunnelKey, string>>;
  hueco_tipico?: string;
  hint_deberiamos?: string;
};

export type JuntaEtapa = { id: FunnelKey; nombre: string; metricas: string; nota: string };

export type JuntaMapa = {
  titulo: string;
  fecha_objetivo: string;
  doctrina: string;
  doctrina_puntos: string[];
  reglas: string[];
  equipo: { nombre: string; rol: string }[];
  funnel: JuntaEtapa[];
  clientes: JuntaCliente[];
  filtros_estado: string[];
  secundarios_nota: string;
};

export const JUNTA_EMBUDO_MAPA: JuntaMapa = {
  "titulo": "KiMedia — Junta embudo",
  "fecha_objetivo": "2026-09-18",
  "doctrina": "Publicamos para abrir conversación, no para llenar parrilla. Embudo: saber dónde está la audiencia, quién es, con qué la captamos y para qué. Métrica distinta por etapa.",
  "doctrina_puntos": [
    "Brief de conversación antes de la pieza",
    "Reconocimiento → Tráfico → Interacción → Leads → Conversión + Retarget",
    "Métrica distinta por etapa",
    "Coherencia objetivo Meta ↔ creativo",
    "Barato arriba / caro abajo; retarget sin intereses encima"
  ],
  "reglas": [
    "Coherencia objetivo Meta ↔ creativo",
    "Barato arriba / caro abajo",
    "CTR alto ≠ campaña buena",
    "Brief de conversación antes de pieza",
    "Engagement bueno empieza ~3–5%",
    "No juzgar toda la pauta solo por alcance"
  ],
  "equipo": [
    {
      "nombre": "Jesús Caudillo",
      "rol": "Dirección, cliente AAA, estrategia, Lovable visión"
    },
    {
      "nombre": "Sandra Nieves",
      "rol": "Hub creativo, Notion/parrillas, filtro conversación"
    },
    {
      "nombre": "Ulises Jurado",
      "rol": "Ads, leads, funnels, WP/Lovable; dueño Mario Doria"
    },
    {
      "nombre": "David Pantoja",
      "rol": "Lead AV foto/video"
    },
    {
      "nombre": "Daniel Pantoja",
      "rol": "Reels/motion/cara; Diluvio/Fimeme"
    },
    {
      "nombre": "Yair Castaldi",
      "rol": "Diseño estático"
    },
    {
      "nombre": "Mitch Mireles",
      "rol": "Parrillas Falcon / mid-clients"
    },
    {
      "nombre": "Ana Sofía Roces",
      "rol": "Reportes Actinver/Gto"
    },
    {
      "nombre": "Román y Pablo",
      "rol": "Monitoreo/análisis Gto (unidad aparte)"
    }
  ],
  "funnel": [
    {
      "id": "reconocimiento",
      "nombre": "Reconocimiento",
      "metricas": "Alcance, frecuencia",
      "nota": "Parte alta; barato; pocos intereses (~máx 3)"
    },
    {
      "id": "trafico",
      "nombre": "Tráfico",
      "metricas": "Clics, CTR",
      "nota": "Llevar a destino (web, registro); CTR alto ≠ éxito solo"
    },
    {
      "id": "interaccion",
      "nombre": "Interacción",
      "metricas": "Engagement; tasa ~3–5%+",
      "nota": "Sin botón CTA si el objetivo es like"
    },
    {
      "id": "leads",
      "nombre": "Leads",
      "metricas": "Leads, CPL",
      "nota": "Formulario, WhatsApp, registro"
    },
    {
      "id": "conversion",
      "nombre": "Conversión",
      "metricas": "Conversiones, CPA",
      "nota": "Acción final del cliente"
    },
    {
      "id": "retarget",
      "nombre": "Retargeting",
      "metricas": "Misma de conversión en caliente",
      "nota": "Personalizados/lookalike; sin intereses encima"
    }
  ],
  "clientes": [
    {
      "id": "falcon",
      "nombre": "Falcon",
      "estado": "activo",
      "dueno": "Mitch (+ Sandra filtro; Daniel cara; Yair; David foto)",
      "stakeholders": "Paco (CEO), Yerye; Lilay (Strategos en juntas)",
      "que_hacemos": "Parrilla redes, piezas, reels/AV obras/ingeniería, landing Lovable + portal hub, fotos/brandbook; riesgo de catálogo de servicios",
      "canales": [
        "Instagram/FB",
        "Landing",
        "Portal KiMedia"
      ],
      "lovable": "falcondesignbuild + portal falcon en kimediamx",
      "accion_final": "Lead / cotización / relación con dueño de obra",
      "funnel_hoy": {
        "reconocimiento": "Contenido/obras/showcase (volumen OK; poca tesis)",
        "trafico": "Landing a veces; tracking débil",
        "interaccion": "Bajo si es brochure; falta cara",
        "leads": "Débil / no sistemático",
        "conversion": "No clara con el cliente",
        "retarget": "Casi no"
      },
      "hueco_tipico": "Catálogo vs conversación; leads no sistemáticos; sin retarget web/video",
      "hint_deberiamos": "Máx 2 conversaciones/semana con brief; Sandra rechaza catálogo; Uli opina si acerca a lead"
    },
    {
      "id": "diluvio",
      "nombre": "El Diluvio",
      "estado": "activo",
      "dueno": "Sandra (+ Daniel/David AV; Ana Sofía brochure; Uli pagos/tech)",
      "stakeholders": "Mauricio Merino, Coco (Jorge Javier Romero), Wendy/Gwen, Asmara",
      "que_hacemos": "Revista/contenido, reels, entrevistas, comunidad, newsletter, brochure inversores, pauta puntual, portal hub; pendiente pagos/tarjetas",
      "canales": [
        "Redes",
        "Web/newsletter",
        "YouTube",
        "Portal"
      ],
      "lovable": "portal eldiluvio; Content Hub dormido",
      "accion_final": "Suscripción / membresía / financiamiento / comunidad activa",
      "funnel_hoy": {
        "reconocimiento": "Contenido coyuntural fuerte",
        "trafico": "Web/newsletter irregular",
        "interaccion": "Comunidad (meta no siempre cumplida)",
        "leads": "Base suscriptores poco activada",
        "conversion": "Monetización frágil",
        "retarget": "Poco (quien leyó/vió)"
      },
      "hueco_tipico": "Alcance de temas sin conversión a pago; pagos/tech frágiles",
      "hint_deberiamos": "Separar alcance vs suscripción/pago; retarget a quien leyó/abrió"
    },
    {
      "id": "padre_sada",
      "nombre": "Padre Sada",
      "estado": "activo",
      "dueno": "Sandra/Yair/Daniel contenido; Ulises ads",
      "stakeholders": "Equipo parroquial / Norma / Malena (gaceta)",
      "que_hacemos": "Parrilla, ecom libros Lovable (SEO), pauta Meta, WhatsApp ventas, kits, gaceta digital/impresa",
      "canales": [
        "IG/FB",
        "Ecom",
        "WhatsApp",
        "Gaceta"
      ],
      "lovable": "padre-sada-libros (~160 vis/30d) + portal",
      "accion_final": "Venta de libro/kit por WhatsApp o web",
      "funnel_hoy": {
        "reconocimiento": "Pauta + contenido",
        "trafico": "Catálogo/web SEO",
        "interaccion": "Reels",
        "leads": "WhatsApp",
        "conversion": "Pocas ventas vs clics (envíos/costos)",
        "retarget": "Mejorable (quién vio libro)"
      },
      "hueco_tipico": "Clics sin venta; retarget de catálogo débil",
      "hint_deberiamos": "Descubrimiento kits → tráfico catálogo → retarget WhatsApp caliente"
    },
    {
      "id": "actinver",
      "nombre": "Actinver (+ Foro)",
      "estado": "activo",
      "dueno": "Ana Sofía reportes; Jesús/Strategos Foro",
      "stakeholders": "Lilay, Ricardo (vía Strategos)",
      "que_hacemos": "Reportes/cortes, portal hub, Foro Actinver×Strategos (no en Lovable), presencia/eventos",
      "canales": [
        "Reportes",
        "Portal",
        "Foro/eventos"
      ],
      "lovable": "portal actinver en kimediamx; Foro fuera de Lovable",
      "accion_final": "Asistencia / engagement institucional / renovación relación",
      "funnel_hoy": {
        "reconocimiento": "Foro + reportes",
        "trafico": "Portal",
        "interaccion": "Evento",
        "leads": "N/A típico institucional",
        "conversion": "Relación / renovación",
        "retarget": "Asistentes foro"
      },
      "hueco_tipico": "Reportes = PDF sin tensión/hook; embudo de asistencia poco explícito",
      "hint_deberiamos": "Traducir reportes en tensiones/hooks; medir asistencia/valor, no likes"
    },
    {
      "id": "guanajuato",
      "nombre": "Guanajuato / Mike",
      "estado": "activo",
      "dueno": "Ana Sofía reportes; Román/Pablo monitoreo; Jesús caps",
      "stakeholders": "Mike Mendiola / enlaces gobierno",
      "que_hacemos": "Portal muy vivo, reporte diario, monitoreo narrativa, capacitaciones, glosa, curso IA",
      "canales": [
        "Portal",
        "Reportes",
        "Caps"
      ],
      "lovable": "portal Gto + /curso/ia-gobierno-gto; Pulse absorbido",
      "accion_final": "Informe útil / alineación narrativa / entrega contractual",
      "funnel_hoy": {
        "reconocimiento": "N/A público Meta",
        "trafico": "Portal interno",
        "interaccion": "Caps",
        "leads": "N/A",
        "conversion": "Entregable / pago",
        "retarget": "N/A"
      },
      "hueco_tipico": "Forzar embudo Ads/parrilla como cliente comercial",
      "hint_deberiamos": "Embudo insight → decisión del cliente; no forzar Meta Ads"
    },
    {
      "id": "strategos",
      "nombre": "Strategos Lat",
      "estado": "hermana",
      "dueno": "Jesús + Nury/equipo creativo; Yair brand",
      "stakeholders": "Lilay, Ricardo, Nury",
      "que_hacemos": "Agencia hermana (~20 años): marca, brandbook, redes, metodología 360, NeoMx formación, trainings, decks/offsite",
      "canales": [
        "Redes Strategos",
        "NeoMx",
        "Caps"
      ],
      "lovable": "Strategos Lat PUB + NeoMx",
      "accion_final": "Inbound consultoría / cultura / formación",
      "funnel_hoy": {
        "reconocimiento": "Relanzamiento redes",
        "trafico": "Web/NeoMx",
        "interaccion": "Microcontenido/podcast",
        "leads": "Consultoría",
        "conversion": "Proyecto",
        "retarget": "Asistentes caps"
      },
      "hueco_tipico": "Likes ≠ inbound; dependencia vs autonomía KiMedia",
      "hint_deberiamos": "Reconocimiento+interacción primero; conversión = inbound, no likes"
    },
    {
      "id": "kimedia",
      "nombre": "KiMedia (marca propia)",
      "estado": "activo",
      "dueno": "Jesús + Sandra; Daniel cara; Yair apoyo",
      "stakeholders": "Interno",
      "que_hacemos": "Redes propias, podcast/entrevistas, merch, motor de contenido, sitio/hub kimediamx (ops + portales)",
      "canales": [
        "Redes KiMedia",
        "Podcast",
        "Hub"
      ],
      "lovable": "kimediamx hub",
      "accion_final": "Prospecto agencia / talento / reputación",
      "funnel_hoy": {
        "reconocimiento": "Contenido irregular",
        "trafico": "Hub",
        "interaccion": "Podcast",
        "leads": "Débil",
        "conversion": "Cliente nuevo",
        "retarget": "No"
      },
      "hueco_tipico": "Marca propia sin dueño semanal de conversación",
      "hint_deberiamos": "Tratarla como cliente en el mapa semanal; 1 conversación propia/semana"
    },
    {
      "id": "mario_doria",
      "nombre": "Mario Doria",
      "estado": "activo",
      "dueno": "Ulises",
      "stakeholders": "Dr. Mario Doria",
      "que_hacemos": "Ads/leads, seguimiento de leads, portal hub, performance; creativo puntual",
      "canales": [
        "Meta/Google Ads",
        "Portal"
      ],
      "lovable": "portal mariodoria",
      "accion_final": "Lead calificado / cita",
      "funnel_hoy": {
        "reconocimiento": "Ads",
        "trafico": "Landing/portal",
        "interaccion": "Según creativo",
        "leads": "Core Uli (fechas en leads a mejorar)",
        "conversion": "Cierre cliente",
        "retarget": "Debe existir / revisar"
      },
      "hueco_tipico": "Etapas no explicitadas; métrica mezclada entre campañas",
      "hint_deberiamos": "Mapear reconocimiento→lead→cierre; métrica distinta por campaña"
    },
    {
      "id": "fimeme",
      "nombre": "FIMEME / Memeverso / AyNoMemes",
      "estado": "activo",
      "dueno": "David / Daniel (cara); Sandra chase; Mitch apoyo",
      "stakeholders": "Comunidad meme / eventos / sponsors",
      "que_hacemos": "Eventos, podcast, memes, redes stack meme (AyNoMemes/Memeverso/FIMEME), cara de marca",
      "canales": [
        "TikTok/IG/YT",
        "Eventos",
        "Web meme"
      ],
      "lovable": "AyNoMemes (~204 vis), Memeverso, FIMEME",
      "accion_final": "Asistencia evento / comunidad / sponsor",
      "funnel_hoy": {
        "reconocimiento": "Fuerte en memes/virales",
        "trafico": "Evento / sites",
        "interaccion": "Alto potencial",
        "leads": "Sponsors",
        "conversion": "Ticket/sponsor",
        "retarget": "Asistentes previos"
      },
      "hueco_tipico": "Viral ≠ embudo de evento; scope AV concentrado en David",
      "hint_deberiamos": "Dar scope a Daniel; embudo evento ≠ solo virales"
    },
    {
      "id": "marilu",
      "nombre": "Marilú Esponda",
      "estado": "bajo",
      "dueno": "Sandra (aprobaciones); Jesús (web/GHL)",
      "stakeholders": "Marilú",
      "que_hacemos": "Sitio/migración Cloudflare, Go High Level, high-ticket, pauta parroquia puntual; cuello de botella de aprobaciones Strategos/Diluvio",
      "canales": [
        "Web",
        "GHL",
        "Ads puntuales"
      ],
      "lovable": "Marilú Brand (PUB → Cloudflare; riesgo zombi)",
      "accion_final": "Lead → webinar → high ticket",
      "funnel_hoy": {
        "reconocimiento": "Ads/contenido",
        "trafico": "Web diagnóstico",
        "interaccion": "Webinar",
        "leads": "GHL",
        "conversion": "High ticket",
        "retarget": "Diseñado en GHL"
      },
      "hueco_tipico": "Mezclar embudo high-ticket con parrilla agencia; sitio zombi",
      "hint_deberiamos": "Embudo clásico digital aparte; ritual de aprobaciones semanal"
    },
    {
      "id": "wizr",
      "nombre": "Wizr",
      "estado": "producto",
      "dueno": "Jesús / producto; Uli técnico posible",
      "stakeholders": "Interno + clientes listening (enlace Diluvio/Merino)",
      "que_hacemos": "Listening / inteligencia reputacional (Apify, menciones, smart reports); no publicado activo",
      "canales": [
        "Producto"
      ],
      "lovable": "Wizr NO pub",
      "accion_final": "Usuario producto / piloto cliente",
      "funnel_hoy": {
        "reconocimiento": "Bajo",
        "trafico": "Demo",
        "interaccion": "—",
        "leads": "Pilotos",
        "conversion": "Adopción",
        "retarget": "—"
      },
      "hueco_tipico": "Tratar producto como parrilla de cliente",
      "hint_deberiamos": "Carril producto, no parrilla semanal"
    },
    {
      "id": "yo_creo",
      "nombre": "Yo Creo un México Mejor",
      "estado": "activo",
      "dueno": "Jesús + Gaby + Sandra",
      "stakeholders": "Gaby Delgado + aliados",
      "que_hacemos": "Historias, sitio/CMS, podcast, campañas metro/aeropuerto (OOH), redes",
      "canales": [
        "Web",
        "Redes",
        "OOH"
      ],
      "lovable": "YoCreo (prioridad variable / dormido a ratos)",
      "accion_final": "Tráfico a historias / patrocinio",
      "funnel_hoy": {
        "reconocimiento": "OOH + redes",
        "trafico": "Sitio historias",
        "interaccion": "Storytelling",
        "leads": "Patrocinios",
        "conversion": "Sponsor/apoyo",
        "retarget": "Quien leyó historia"
      },
      "hueco_tipico": "OOH sin CTA digital claro",
      "hint_deberiamos": "OOH → CTA digital; ranking historias = embudo editorial"
    },
    {
      "id": "nimo",
      "nombre": "Nimo's World",
      "estado": "bajo",
      "dueno": "Jesús (IP); Yair layouts; Mitch quiere entrar; Uli estructura",
      "stakeholders": "Jesús (IP personal, no cliente formal)",
      "que_hacemos": "Proyecto personal / diario digital PUB reciente; guiones/redes en prep",
      "canales": [
        "Web",
        "Redes (en prep)"
      ],
      "lovable": "nimodo-vibes PUB reciente",
      "accion_final": "Comunidad / marca personal",
      "funnel_hoy": {
        "reconocimiento": "Bajo",
        "trafico": "Site",
        "interaccion": "—",
        "leads": "—",
        "conversion": "—",
        "retarget": "—"
      },
      "hueco_tipico": "Mezclar IP personal con chase de clientes",
      "hint_deberiamos": "No mezclar con chase diario de clientes formales"
    },
    {
      "id": "neomx",
      "nombre": "NeoMx (formación)",
      "estado": "hermana",
      "dueno": "Strategos–KiMedia",
      "stakeholders": "Strategos / formaciones",
      "que_hacemos": "Portal formación; #1 tráfico Lovable del workspace (~266 vis/30d)",
      "canales": [
        "Web NeoMx"
      ],
      "lovable": "neo-mx-leaders-forge",
      "accion_final": "Inscripción curso / lead formación",
      "funnel_hoy": {
        "reconocimiento": "Tráfico orgánico alto",
        "trafico": "Portal",
        "interaccion": "Contenido formación",
        "leads": "Inscripciones (a confirmar medición)",
        "conversion": "Curso pago",
        "retarget": "Visitantes portal"
      },
      "hueco_tipico": "Visitas sin medición de inscripción",
      "hint_deberiamos": "Medir inscripción no solo visitas"
    },
    {
      "id": "campeche",
      "nombre": "Campeche (Informe de Gobierno)",
      "estado": "secundario",
      "dueno": "Jesús",
      "stakeholders": "Gobierno Campeche / enlaces informe",
      "que_hacemos": "12 juntas abr–jun 2026: Quinto Informe (misiones, PPAs, línea discursiva, dashboard). Hoy fuera del chase creativo semanal.",
      "canales": [
        "Entregables narrativos",
        "Dashboard"
      ],
      "lovable": "—",
      "accion_final": "Narrativa / entregable de informe aprobado",
      "funnel_hoy": {
        "reconocimiento": "N/A Meta",
        "trafico": "N/A",
        "interaccion": "Revisiones con cliente",
        "leads": "N/A",
        "conversion": "Entregable / cierre de fase",
        "retarget": "N/A"
      },
      "hueco_tipico": "Forzar embudo de likes; invisibilidad en semanales KiMedia",
      "hint_deberiamos": "Si revive: insight → aprobación narrativa; no Meta Ads por default"
    },
    {
      "id": "liderate",
      "nombre": "Ricardo Robles / Lidérate",
      "estado": "secundario",
      "dueno": "Jesús (+ Mitch interés)",
      "stakeholders": "Ricardo Robles",
      "que_hacemos": "Marca personal + Lidérate; vínculo Strategos/formación; Lovable Lidérate dormido",
      "canales": [
        "Redes",
        "Cursos",
        "Web dormida"
      ],
      "lovable": "Lidérate dormido",
      "accion_final": "Inbound curso / consultoría liderazgo",
      "funnel_hoy": {
        "reconocimiento": "Marca personal",
        "trafico": "Web/cursos",
        "interaccion": "Contenido liderazgo",
        "leads": "Registros curso",
        "conversion": "Curso/consultoría",
        "retarget": "Por definir"
      },
      "hueco_tipico": "Partner sin dueño de embudo semanal",
      "hint_deberiamos": "Tratar como partner Strategos; no saturar parrilla core"
    },
    {
      "id": "nosotrxs",
      "nombre": "Nosotrxs",
      "estado": "secundario",
      "dueno": "Jesús / Uli pauta",
      "stakeholders": "Nosotrxs",
      "que_hacemos": "Podcast + pauta Facebook/Instagram (cursos) — 2 juntas Fireflies 2026",
      "canales": [
        "Podcast",
        "Meta Ads"
      ],
      "accion_final": "Registro curso / escucha podcast",
      "funnel_hoy": {
        "reconocimiento": "Pauta",
        "trafico": "Landing/curso",
        "interaccion": "Podcast",
        "leads": "Registros",
        "conversion": "Curso",
        "retarget": "Por confirmar"
      },
      "hueco_tipico": "Cola baja; no diluir junta core",
      "hint_deberiamos": "Solo si hay brief vivo; si no, archivar en secundarios"
    },
    {
      "id": "tded",
      "nombre": "TdeD / Todxs de Derechos",
      "estado": "secundario",
      "dueno": "Jesús",
      "stakeholders": "Fundación TdeD",
      "que_hacemos": "Comunicación / donativo / propuesta digital (Proyecto Nix) — 2 juntas mar 2026",
      "canales": [
        "Digital / propuesta"
      ],
      "accion_final": "Donativo / apoyo campaña",
      "funnel_hoy": {
        "reconocimiento": "Campaña derechos",
        "trafico": "Propuesta digital",
        "interaccion": "—",
        "leads": "Donantes",
        "conversion": "Donativo",
        "retarget": "—"
      },
      "hueco_tipico": "Sin chase semanal actual",
      "hint_deberiamos": "Secundario; reactivar solo con brief"
    },
    {
      "id": "sol_melendez",
      "nombre": "Sol Meléndez Psychology",
      "estado": "secundario",
      "dueno": "Jesús / web",
      "stakeholders": "Sol Meléndez",
      "que_hacemos": "Landing Lovable PUB reciente (salud/psicología); fuera del núcleo de junta",
      "canales": [
        "Web"
      ],
      "lovable": "Sol Meléndez Psychology PUB",
      "accion_final": "Cita / consulta",
      "funnel_hoy": {
        "reconocimiento": "Bajo",
        "trafico": "Landing",
        "interaccion": "—",
        "leads": "Contacto web",
        "conversion": "Cita",
        "retarget": "—"
      },
      "hueco_tipico": "Landing sin embudo ads activo en mapa KiMedia",
      "hint_deberiamos": "Mantener en cola Lovable; no priorizar mañana"
    }
  ],
  "filtros_estado": [
    "activo",
    "bajo",
    "producto",
    "hermana",
    "secundario"
  ],
  "secundarios_nota": "Campeche y cola Fireflies/Lovable: visibles en mapa con filtro secundario; no diluir reflexión core."
} as JuntaMapa;

export const ESTADO_LABEL: Record<string, string> = {
  activo: "Activo",
  bajo: "Bajo perfil",
  producto: "Producto",
  hermana: "Agencia hermana",
  secundario: "Secundario",
};
