# Rediseño del Portal Cliente

Los 10 puntos se agrupan en 4 frentes: **arquitectura de información**, **inteligencia de datos**, **branding/UX**, y **nuevas capacidades (benchmark)**. Propongo hacerlo en 3 fases para no romper nada y validar contigo la dirección antes de la fase pesada.

---

## Fase 1 — Reestructura de IA + jerarquía semanal (puntos 1, 2, 3, 4, 5, 6, 9)

**Nueva estructura de navegación** (reemplaza las 4 pestañas actuales):

```text
┌────────────────────────────────────────────────────┐
│ [Logo cliente]  Actinver              [PDF] [Salir]│
├────────────────────────────────────────────────────┤
│  Semana actual: 4 – 10 nov 2026    [< sem previa] │
│  ─────────────────────────────────────────────────│
│  [ Resumen ] [ Análisis ] [ Recomendaciones ] [ Histórico ]
└────────────────────────────────────────────────────┘
```

- **Semana actual como default** (no rango arbitrario). Selector de cohorte semanal en el header (semana previa, hace 2, hace 3…) y un botón "Comparar rango" para agrupar N semanas.
- **Resumen** → Executive summary + alertas + KPIs clave de esa semana (una sola vista de aterrizaje).
- **Análisis** → Todas las gráficas, tablas y datos derivados **de listening + benchmark** para la semana/cohorte elegida.
- **Recomendaciones** → Solo las de la semana seleccionada (nunca lista larga).
- **Histórico** → Timeline navegable de semanas anteriores + descarga de reportes PDF publicados. Aquí vive lo que hoy es "Reportes".

Se elimina la pestaña "Listening" como bloque de texto. Los reportes diarios se procesan (fase 2) y alimentan Análisis.

**Logo del cliente**: agregar `logo_url` en `CLIENT_PORTALS` (ya existe `clients.logo_url` en BD) y renderizarlo en el header.

**PDF**: nueva plantilla que renderiza el mismo contenido de la semana visible (Resumen + gráficas como imágenes + Recomendaciones), no bloques crudos. Se accede solo desde Histórico (un botón por semana) + botón contextual "Descargar esta semana". Se elimina el botón global superior confuso.

---

## Fase 2 — Convertir listening crudo en datos (puntos 6, 7)

Los `content_md` diarios son texto libre que hoy solo se muestra. Extenderemos el pipeline existente `analyze-listening-entries` para que cada entrada devuelva JSON estructurado que ya alimenta a `client_portal_listening_entries` (sentiment/topics/mentions). Adicionalmente:

- Nueva edge function `extract-listening-metrics` (o extender la existente) que también extraiga: **volumen de menciones por canal**, **share of voice vs competidores nombrados**, **eventos/hitos detectados**, **entidades citadas** (personas, medios, políticos), **claims/frases textuales**.
- Nuevas columnas o JSONB en `client_portal_listening_entries`: `channels jsonb`, `entities jsonb`, `events jsonb`, `key_quotes jsonb`.
- Reproceso batch para entradas ya cargadas (botón en admin: "Reprocesar semana X").
- `PortalAnalysis` gana secciones nuevas: **Menciones por canal**, **Share of voice**, **Actores/entidades más citados**, **Frases textuales destacadas**, **Timeline de eventos**.

El bloque de texto crudo ya no se muestra al cliente; queda accesible solo en el admin como fuente.

---

## Fase 3 — Módulo Benchmark FanpageKarma (punto 8)

Nueva pestaña dentro de **Análisis** (sub-tab) llamada **Performance & Benchmark**:

- Tabla `client_portal_benchmark_datasets` (fuente=fanpagekarma, semana, competidor, métricas jsonb: fans, engagement, posts, interactions_avg, growth, top_post).
- Ingesta: primero **carga manual CSV/XLSX** desde admin (`ClientPortalAdmin`). Luego, cuando esté claro el formato, evaluamos automatización.
- Vistas: crecimiento vs competidores, engagement rate comparado, posts top del período, matriz de posicionamiento.

---

## Fase 4 — Elevar UI/UX (puntos 1, 10)

- Tema light propio para el portal (superficies cálidas, densidad tipo dashboard financiero — coherente con que Actinver es finanzas).
- Header con logo cliente + logo KiMedia pequeño.
- Cards de KPI con jerarquía tipográfica clara (número grande, delta vs semana previa, sparkline).
- Paleta: mantener acento coral KiMedia pero suavizar fondos (crema/off-white) y usar acentos data (verde/rojo/azul) neutros para métricas.
- Micro-interacciones: transiciones al cambiar de semana, skeletons en lugar de "Cargando...".
- Tipografía: Space Grotesk para números/headers, Inter para texto.

---

## Detalles técnicos

**Archivos a tocar:**
- `src/lib/clientPortal.ts` — agregar `logoUrl` opcional
- `src/pages/portal/PortalHome.tsx` — reescritura completa (nueva IA de navegación)
- `src/pages/portal/PortalAnalysis.tsx` — reescritura, se vuelve el core; recibe `weekStart`/`weekEnd` (no rangos arbitrarios)
- Nuevos: `PortalWeekSelector.tsx`, `PortalKpiCards.tsx`, `PortalBenchmark.tsx`, `PortalPdfTemplate.tsx`
- `PortalReport.tsx` — sigue existiendo para reportes históricos individuales
- **Supabase**:
  - Migración: columnas `channels/entities/events/key_quotes jsonb` en `client_portal_listening_entries`
  - Migración: tabla `client_portal_benchmark_datasets`
  - Edge function: extender `analyze-listening-entries` para extracción estructurada
  - Edge function nueva: `import-benchmark-csv`
- `src/pages/admin/ClientPortalAdmin.tsx` — agregar sección upload benchmark + botón reprocesar listening

---

## Preguntas antes de arrancar

1. **¿Arranco por la Fase 1 (reestructura IA + logo + PDF decente) para que la veas viva rápido, y luego iteramos las fases 2–4?** Es la que resuelve 7 de los 10 puntos sin tocar backend, y me deja validar contigo la dirección de diseño antes de invertir en el pipeline pesado de listening y benchmark.

2. **¿Tienes ya un archivo de ejemplo de export de FanpageKarma?** Si me pasas uno, en Fase 3 puedo modelar los campos exactos en vez de suponer.

3. **¿El logo de Actinver lo subo yo desde la web pública o me lo pasas?**
