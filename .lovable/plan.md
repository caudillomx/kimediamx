# Fase 3 — Benchmark de performance (FanpageKarma)

Módulo comparativo dentro del portal del cliente para responder: *"¿cómo va Actinver vs sus competidores en redes, semana a semana?"*.

## Alcance funcional

1. **Universo de competidores editable por cliente** — lista base (ej. GBM, Kuspit, Bursanet, Vector, CI Banco), con marcar/desmarcar por semana desde el admin.
2. **Carga de datos vía XLSX/CSV desde admin** — parser del export de FanpageKarma. Se sube un archivo por semana; el sistema deduplica por (cliente, semana, competidor).
3. **Cuatro vistas en la pestaña Análisis → sub-tab "Benchmark":**
   - **Ranking por métrica** (barras horizontales): fans, engagement rate, posts, interacciones. Cliente resaltado.
   - **Evolución semanal** (líneas): N semanas de tendencia por marca en la métrica seleccionada.
   - **Share of voice / engagement** (donut): % del total del sector.
   - **Tabla detallada exportable** (CSV): todas las métricas por competidor y semana.

## Diseño técnico

### Base de datos (una sola migración)

```text
client_portal_benchmark_competitors      -- catálogo por cliente
  client_id, name, handle, platform, brand_color, is_default, active

client_portal_benchmark_weeks            -- una fila por semana cargada
  client_id, week_start, week_end, uploaded_file_name

client_portal_benchmark_metrics          -- datos crudos por marca y semana
  week_id, competitor_id (nullable → NULL = el propio cliente),
  fans, followers, posts, interactions,
  engagement_rate, reach, video_views,
  raw jsonb  -- todo lo demás del export intacto
```

RLS: solo `admin` puede insertar/editar; el portal (con `portal_token`) puede leer los datos del cliente al que pertenece la sesión.

### Edge function `benchmark-import`

- Recibe XLSX/CSV + `client_id` + `week_start`.
- Parsea con `xlsx` (npm). Detecta columnas de FanpageKarma (Fans, Fan Change, Post Interactions, Engagement Rate, Number of Posts, Reach…).
- Mapea filas a competidores del catálogo (fuzzy por nombre/handle); las que no matchean se devuelven al admin para que las asigne o cree.
- Inserta en `benchmark_weeks` + `benchmark_metrics` con `raw` completo por trazabilidad.

### Admin (`/admin/cliente/:id/portal` → nueva pestaña "Benchmark")

- Gestor de competidores (tabla editable: nombre, handle, color, activo).
- Uploader semanal (drag-drop XLSX). Preview de matches antes de confirmar.
- Historial de semanas cargadas (borrar / re-subir).

### Portal (`PortalHome` → tab Análisis)

- Nuevo componente `PortalBenchmark.tsx` con las 4 vistas + selector de métrica y de rango (1, 4, 12 semanas).
- El cliente ya está resaltado con acento visual; competidores usan el `brand_color` del catálogo.
- Botón "Exportar CSV" reutiliza el patrón del buscador de menciones.

## Entregable de Fase 3

- Migración con las 3 tablas + RLS + grants.
- Edge function `benchmark-import` desplegada.
- Admin: pestaña Benchmark con gestor + uploader.
- Portal: sub-tab Benchmark con las 4 vistas.
- Pre-carga del catálogo de competidores para Actinver (GBM, Kuspit, Bursanet, Vector, CI Banco — ajustable).

**Pendiente antes de empezar:** necesito un XLSX real de FanpageKarma (idealmente de Actinver + al menos 2 competidores) para modelar el parser con nombres de columna exactos. Sin él arranco con un mapeo estándar y afinamos al probar.

---

# Roadmap después de Fase 3

## Fase 4 — UI/UX polish
- Tema light dedicado tipo dashboard financiero para el portal externo (hoy hereda dark del admin).
- Gradientes de datos, micro-interacciones, tipografía display en KPIs.
- Onboarding visual del portal la primera vez que entra el cliente.

## Fase 5 — Automatización e inteligencia
- **Auto-síntesis semanal**: edge function que corre cada lunes, cruza listening + benchmark de la semana anterior y genera el `weekly_recommendations` sin intervención manual.
- **Alertas proactivas por email/WhatsApp** cuando: (a) sentimiento cae >X%, (b) competidor supera al cliente en engagement, (c) crisis detectada en la bitácora.
- **Comparador multi-cliente** interno (solo admin KiMedia): ver desempeño agregado de toda la cartera.
- **Auto-ingest de FanpageKarma** vía su API (si Actinver tiene contrato con acceso), reemplaza la subida manual.

¿Arranco con Fase 3 tal cual, o quieres ajustar competidores base / métricas antes?
