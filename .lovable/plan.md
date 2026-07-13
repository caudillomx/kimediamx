
# Rediseño del panel de Benchmark (portal cliente)

## Orden acordado

1. **Primero** cargas los meses faltantes (feb, mar, abr, may, jun, jul) con el uploader actual de `BenchmarkAdmin`. Sin tocar código.
2. **Después**, ya con histórico real, implemento este rediseño. Los insights (evolución, tendencias, deltas) solo tienen sentido con varios periodos cargados.

Este plan describe el paso 2. La única acción tuya ahora es cargar los meses.

## Qué cambia en `PortalBenchmark.tsx`

Reemplazo el layout actual (todo en una sola columna, 6 tarjetas apiladas) por una estructura de **sub-tabs** con un **resumen ejecutivo** siempre visible arriba.

### Estructura nueva

```text
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Periodo · Red · [Exportar CSV]                     │
├─────────────────────────────────────────────────────────────┤
│  RESUMEN EJECUTIVO (siempre visible)                        │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │ Posición │ Δ vs mes │ vs prom. │ Mejor    │             │
│  │ #2 de 8  │ +12%     │ +34%     │ post     │             │
│  │ engag.   │ seguid.  │ engag.   │ del mes  │             │
│  └──────────┴──────────┴──────────┴──────────┘             │
│  Headline insight: "Actinver creció 12% en seguidores      │
│  mientras el sector promedió 4%."                           │
├─────────────────────────────────────────────────────────────┤
│  [Resumen] [Actinver] [Competidores] [Contenido] [Datos]   │
├─────────────────────────────────────────────────────────────┤
│  Contenido del tab seleccionado                             │
└─────────────────────────────────────────────────────────────┘
```

### Sub-tabs

- **Resumen** — 3-5 insights en tarjetas narrativas (una frase + una gráfica pequeña que la prueba). Foco: qué le pasó a Actinver este mes vs sí misma, vs promedio del sector, y vs el líder.
- **Actinver** — Vista dedicada al cliente: evolución mes a mes de sus métricas clave (seguidores, engagement, posts/día, crecimiento), con deltas % y racha (mejorando/empeorando). Sin ruido de competidores aquí.
- **Competidores** — Ranking + share del sector + tabla comparativa. Es lo que hoy ocupa las primeras 2 tarjetas, pero con Actinver siempre resaltado y con la columna "vs Actinver" (±%).
- **Contenido** — Top posts del periodo, separando "top propios" y "top del sector", con lectura del patrón (formato, hora, tema si se puede inferir del texto).
- **Datos** — Tabla detallada actual + evolución diaria de seguidores. Es el "modo raw" para quien quiera bucear.

## Capa de insights (la parte inteligente)

Todos los insights se calculan **en el cliente** a partir de los datos que ya tiene el componente (`metrics`, `daily`, `posts`, `periods`, `competitors`). No requiere edge function ni cambios de esquema.

Cálculos que se agregan en un helper `computeInsights()`:

- **Posición competitiva** por métrica: rank de Actinver dentro del periodo actual (`#N de M`).
- **Evolución propia**: delta % de cada métrica de Actinver vs periodo anterior + racha de N meses consecutivos.
- **vs promedio sector**: `(actinver_metric − avg(competidores_metric)) / avg(competidores_metric)`.
- **Mejor/peor métrica del mes**: en qué métrica Actinver ganó más terreno y en cuál perdió más.
- **Contenido ganador**: top 3 posts propios del periodo por interacciones + comparativa con la mediana del sector.
- **Alerta**: si alguna métrica cae >15% MoM o Actinver sale del top 3 en engagement.

Los headlines se generan con plantillas deterministas (no LLM), en español, tono directo. Ejemplo:

> "Actinver subió al #2 en engagement (venía del #4). El promedio del sector cayó 3%, ustedes subieron 11%."

## Detalles técnicos

- Un solo archivo tocado: `src/components/portal/PortalBenchmark.tsx`.
- Sub-tabs con `@/components/ui/tabs` (shadcn, ya en el proyecto).
- Se preserva toda la lógica de fetch actual — solo se reorganiza la presentación y se agrega un `useMemo` con el objeto `insights`.
- Se preserva el filtro por Red y el export CSV en el header global.
- Semantic tokens del design system (respetando dark theme del portal).
- Sin cambios en `BenchmarkAdmin.tsx`, edge functions, migraciones ni esquema.

## Fuera de alcance

- No se cambia el uploader ni el parser de FanpageKarma.
- No se agregan métricas nuevas al esquema — solo se reinterpreta lo existente.
- No hay generación con IA en esta iteración (los insights son plantillas deterministas). Si más adelante quieres narrativa generada por Claude, se agrega como paso posterior.

## Siguiente acción

Sube los meses faltantes en `/admin/cliente/actinver/portal` → **Admin Benchmark** → uploader. Cuando termines, dime "listo" y arranco la implementación.
