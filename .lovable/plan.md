## Objetivo
1. Que la IA calcule las **calificaciones MCN** por dependencia a partir de evidencia real (sesiones Fireflies + bitácoras de uso).
2. Sumar las **bitácoras de uso de las sesiones del curso** (lo que cada dependencia trabajó en su panel) como insumo, tanto para las MCN como para los entregables.

## Fuentes de datos que se van a juntar por dependencia y mes

- **Sesiones Fireflies** del mes (consultorías/entrenamientos/simulacros) con sus extracciones (temas, decisiones, pendientes, asistentes).
- **Bitácoras del curso** (`gto_sesiones` + `gto_participantes` + `gto_corpus_uploads` + `gto_diagnostico_textos`):
  - Brief del titular (misión, tono, audiencias, términos preferidos/prohibidos).
  - Documentos de corpus subidos (tipo, cantidad, fechas).
  - Diagnósticos de textos hechos (cuántos, score, errores detectados).
  - Compromisos cumplidos (corpus subido, prompt probado, resultado compartido).
  - Herramienta de IA elegida y prompt generado.

## Cambios

### 1. Edge function nueva: `gto-compute-mcn`
- Entrada: `dependenciaId`, `year`, `month`.
- Reúne en paralelo: sesiones Fireflies del mes, bitácoras del curso de esa dependencia, calificaciones MCN previas (para tendencia).
- Llama a Lovable AI (Gemini 3 Flash) con un prompt estricto:
  - Rúbrica clara 1–5 por cada eje: coordinación, tiempo de respuesta, trazabilidad, análisis de riesgos, detección temprana.
  - Cada score debe citar evidencia (frase de transcripción, documento subido, fecha). Si no hay evidencia → `null` y se reporta como "pendiente", **nunca inventa**.
  - Devuelve también `fortalezas`, `areas_mejora` y un `observaciones.evidencias` con las citas.
- Hace `upsert` en `gto_mcn_scores` (`computed_by = 'ai'`).

### 2. UI tab "Calificaciones MCN" (`CursoGtoEntregables.tsx`)
- Botón nuevo **"Calcular con IA"** por dependencia (o "Calcular todas").
- Los campos pasan a ser **editables sobre el resultado de la IA** (revisión humana).
- Muestra la sección de evidencias citadas debajo de cada score para auditoría.
- Badge "Calculado por IA" / "Manual" / "Editado".

### 3. Entregables: inyectar bitácoras de uso
En `gto-generate-deliverable` agregamos al contexto:
- Resumen por dependencia: # participantes activos, # documentos en corpus, # diagnósticos hechos, compromisos cumplidos, herramientas IA usadas, brief.
- Se renderiza como nueva sección **"Evidencia de adopción"** dentro del registro de consultorías y el reporte mensual.

### 4. Migración mínima
- Agregar columnas opcionales en `gto_mcn_scores`: `computed_at timestamptz`, `evidence jsonb` (para guardar citas).
- No se borra nada; el modo manual sigue funcionando.

## Detalles técnicos
- Modelo IA: `google/gemini-3-flash-preview` con `tool_choice` para forzar el JSON de la rúbrica.
- Validación con Zod en el edge function; si falta evidencia para un eje, ese eje queda `null` y se reporta como pendiente en `areas_mejora`.
- Todas las llamadas siguen el patrón actual de RBAC admin.

## Lo que NO cambia
- El flujo manual de captura MCN sigue disponible como fallback/edición.
- No tocamos auth ni la estructura del curso público.
