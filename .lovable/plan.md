# Insights inteligentes + panel Estrategia

Piloto solo con Actinver. Todo el gasto de IA usa modelos baratos de Lovable AI Gateway (`google/gemini-3.1-flash-lite` como default; `google/gemini-3.5-flash` cuando se necesite más matiz). Nada de Claude Sonnet aquí — queda reservado para operaciones internas.

## Parte 1 — Análisis de narrativas por marca / red

Nuevo bloque dentro de la pestaña **Contenido** de Benchmark: "Narrativas del periodo".

### Cómo funciona
1. Agrupa los posts del periodo/rango seleccionado por `profile_name` + `network`.
2. Para cada marca-red con ≥ 5 posts, arma un payload compacto (top 15 posts por interacciones: mensaje truncado a 400 chars, likes, comments, fecha).
3. Llama a una nueva edge function `analyze-benchmark-narratives` que corre `google/gemini-3.1-flash-lite` con `Output.object` (Zod) y devuelve, por marca-red:
   - 2–4 **ejes narrativos** (nombre + descripción de 1 línea + % aprox del contenido).
   - **Tono dominante** (etiqueta + evidencia).
   - **Formatos ganadores** (reel/carrusel/foto/texto/live, inferidos del texto).
   - **Ángulos diferenciales vs Actinver** (qué hace esa marca que Actinver no).
4. Resultado cacheado en tabla nueva `client_portal_benchmark_narratives` (client_id, period_id o rango hash, network, profile_name, narratives jsonb, model, generated_at). No se re-genera si ya existe para ese corte.
5. Botón "Regenerar análisis" fuerza nueva corrida (con confirmación por el costo).

### UI
- Grid de tarjetas: una por marca-red, con Actinver siempre primero y resaltado.
- Cada tarjeta: ejes narrativos como chips con %, tono, formatos, y una línea "Vs. Actinver".
- Vista comparativa opcional: matriz marca × eje narrativo para ver quién cubre qué territorio.

### Heurísticas complementarias (siempre visibles, sin IA)
- Nube de keywords (bigramas) por marca — ya existe parcialmente, se extiende por marca.
- Hashtags y menciones más usadas por marca.
- Reparto de horarios y días de publicación.

## Parte 2 — Panel "Estrategia" (cruce Listening ↔ Benchmark)

Nueva pestaña de portal al mismo nivel que Panorama / Histórico / Benchmark: **Estrategia**.

### Objetivo
Responder en un solo lugar: ¿la estrategia digital de Actinver es coherente con lo que dice y con lo que hace el ecosistema?

### Estructura

```text
┌──────────────────────────────────────────────────────────┐
│ HEADER: Rango [7d/14d/30d/custom] · [Regenerar]          │
├──────────────────────────────────────────────────────────┤
│ VEREDICTO DE COHERENCIA                                  │
│ Semáforo (Alta/Media/Baja) + 1 frase de por qué          │
├──────────────────────────────────────────────────────────┤
│ 3 columnas comparativas                                  │
│  ┌────────────┬────────────┬────────────┐               │
│  │ Qué DICEN  │ Qué HACE   │ Qué HACEN  │               │
│  │ de Actinver│ Actinver   │ los pares  │               │
│  │ (listening)│ (benchmark)│ (benchmark)│               │
│  │ temas top  │ ejes narr. │ ejes narr. │               │
│  │ sentimiento│ tono       │ tonos      │               │
│  └────────────┴────────────┴────────────┘               │
├──────────────────────────────────────────────────────────┤
│ BRECHAS DETECTADAS                                       │
│ - Temas que aparecen en listening pero no en el          │
│   contenido propio                                       │
│ - Territorios donde competidores dominan y Actinver no   │
│   participa                                              │
│ - Crisis/alertas de listening sin respuesta en contenido │
├──────────────────────────────────────────────────────────┤
│ RECOMENDACIONES ACCIONABLES (3–5)                        │
│ Cards estilo RecommendationsBlock, cada una con:         │
│ - Acción concreta                                        │
│ - Evidencia (qué señal de listening + qué señal de       │
│   benchmark la sustenta)                                 │
│ - Prioridad (Alta/Media)                                 │
└──────────────────────────────────────────────────────────┘
```

### Cómo funciona
1. Nueva edge function `generate-strategy-recommendations`:
   - Input: `client_id`, rango de fechas.
   - Agrega en el server: menciones y temas top de `client_portal_listening_entries` + sentimiento agregado + narrativas ya cacheadas de Actinver y competidores + métricas comparativas (posición, deltas MoM).
   - Prompt estructurado a `google/gemini-3.5-flash` (un poco más capaz que flash-lite porque este cruce sí necesita razonar) con `Output.object`:
     ```
     {
       coherence: { level: "alta"|"media"|"baja", reason: string },
       what_audience_says: { topics: [...], sentiment_summary: string },
       what_actinver_does: { narratives: [...], tone: string },
       what_peers_do: { dominant_narratives: [...], gaps_actinver_misses: [...] },
       gaps: [{ type, description, evidence }],
       recommendations: [{ title, action, evidence_listening, evidence_benchmark, priority }]
     }
     ```
   - Guarda resultado en tabla nueva `client_portal_strategy_reports` (client_id, range_start, range_end, payload jsonb, model, generated_at). Cache por rango.
2. UI consume el JSON y arma las secciones. Se reutiliza `RecommendationsBlock` para las cards de recomendaciones.

### Coherencia con lo ya construido
- Reutiliza los datos que ya viven en `client_portal_listening_entries`, `client_portal_benchmark_*` y las narrativas cacheadas de la Parte 1.
- El botón de "Regenerar" es el único gasto discrecional de IA.

## Detalles técnicos

- **Modelos**: `google/gemini-3.1-flash-lite` para narrativas (volumen alto), `google/gemini-3.5-flash` para el reporte de estrategia (razonamiento cruzado). Todo vía `createLovableAiGatewayProvider` + AI SDK con `Output.object` y guard `NoObjectGeneratedError`.
- **Nuevas tablas** (migración con GRANTs y RLS por `has_client_access`):
  - `client_portal_benchmark_narratives`
  - `client_portal_strategy_reports`
- **Nuevas edge functions**:
  - `analyze-benchmark-narratives`
  - `generate-strategy-recommendations`
- **Frontend**:
  - `src/components/portal/PortalBenchmark.tsx`: agregar sección "Narrativas" en tab Contenido con botón regenerar.
  - `src/components/portal/PortalStrategy.tsx` (nuevo): renderiza el reporte de estrategia.
  - `src/pages/portal/PortalHome.tsx`: nueva tab "Estrategia" al lado de Benchmark, oculta las barras de listening cuando está activa (como ya hicimos con Benchmark).
- **Sin cambios** en parser, uploader, ni en el resto del portal.

## Fuera de alcance

- Generalizar a otros clientes (se hace después del piloto).
- Reemplazar Sonnet en otras partes del sistema.
- Automatización semanal (por ahora regeneración manual; luego se puede meter cron).

## Siguiente acción

Confirma y paso a build para implementar en este orden: migración → edge function de narrativas → UI en Benchmark → edge function de estrategia → pestaña Estrategia.
