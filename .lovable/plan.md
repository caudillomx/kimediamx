
# Plan: Entregables Curso GTO con transcripciones de sesión

## Visión general

Las transcripciones de Fireflies pasan a ser el **eje del sistema**: alimentan memoria por dependencia, sirven como curriculum maestro (anti-alucinación), personalizan los prompts de cada participante y permiten medir progreso. Sobre esa base generamos tres entregables en cascada.

```text
Fireflies ──► gto_sesiones_transcripciones ──┬─► [1] Memoria de Sesión (PDF ejecutivo)
                                              ├─► [2] Kit Personal (PDF por participante)
                                              └─► [3] Reporte Mensual (PDF por dependencia)
```

## 1. Modelo de datos (migración)

Tablas nuevas:

- **`gto_sesion_transcripciones`**
  - `sesion_id` (fk gto_sesiones), `fireflies_id`, `meeting_date`
  - `titulo`, `transcript_text`, `summary_overview`, `participantes_detectados` (jsonb)
  - `duracion_min`, `temas_cubiertos` (jsonb extraído por IA)
  - `processed_at`, `created_by`
  - RLS: solo admin

- **`gto_entregables_sesion`** (memoria de sesión)
  - `sesion_id`, `transcripcion_id`, `dependencia_id`
  - `contenido` (jsonb: agenda real, asistentes, conclusiones, compromisos, próximos pasos, citas textuales)
  - `pdf_url`, `status` (borrador/aprobado/entregado), `generated_at`

- **`gto_entregables_participante`** (kit personal)
  - `participante_id`, `sesion_ids` (text[] - sesiones a las que asistió)
  - `contenido` (jsonb: brief, prompt final, diagnóstico, compromisos, citas curriculares)
  - `pdf_url`, `status`, `generated_at`

- **`gto_entregables_mensuales`** (reporte mensual)
  - `dependencia_id`, `period_year`, `period_month`
  - `contenido` (jsonb: MCN scores, avance participantes, gaps detectados, recomendaciones, sesiones del mes)
  - `pdf_url`, `status`, `generated_at`
  - Unique (dependencia_id, period_year, period_month)

Reutilizamos `gto_deliverables` existente como tabla histórica (no se toca).

## 2. Ingesta desde Fireflies

Reusar infraestructura existente (`fireflies-list-meetings`, `fireflies_meetings`). Nuevo flow:

**Pantalla admin nueva: `/admin/curso-gto/transcripciones`**
- Lista de meetings de Fireflies filtrados por keyword "Guanajuato"/"GTO"/"capacitación" o por host
- Por cada meeting: botón "Vincular a sesión GTO" → selector de `gto_sesiones`
- Al vincular: edge function `gto-import-transcripcion` jala transcript completo de Fireflies, lo guarda en `gto_sesion_transcripciones`, y dispara extracción IA de temas_cubiertos + participantes_detectados (match contra `gto_participantes` por nombre/email)

**Edge function `gto-import-transcripcion`**:
- Input: `{ fireflies_id, sesion_id }`
- Llama gateway Fireflies (GraphQL) para obtener transcript con speakers
- Gemini Flash extrae: temas_cubiertos (taxonomía), participantes_detectados, agenda_real, citas_clave
- Inserta en BD

## 3. Generación de entregables

Tres edge functions paralelas con misma estructura (anti-alucinación: prompt fuerza "solo basado en transcripciones y datos del participante"):

### `gto-generar-memoria-sesion`
- Input: `sesion_id`
- Pull: transcripción + asistentes confirmados + brief de dependencia
- Claude Sonnet (vía ANTHROPIC_API_KEY, fallback Lovable AI)
- Output JSON: agenda real, asistentes, 3-5 conclusiones, compromisos por participante, próximos pasos, 2-3 citas textuales del facilitador
- Guarda en `gto_entregables_sesion`

### `gto-generar-kit-participante`
- Input: `participante_id`
- Pull: brief + corpus + prompt final + diagnóstico + compromisos + **todas las transcripciones de sesiones donde asistió**
- Modelo correlaciona: "este participante quedó en X compromiso (de sesión 2), su prompt cubre Y tema visto en sesión 3"
- Output: kit personalizado con referencias curriculares

### `gto-generar-reporte-mensual`
- Input: `dependencia_id, year, month`
- Pull: todas las sesiones del mes + todos los participantes + MCN scores + diagnósticos
- Output: resumen ejecutivo para Secretaría, MCN consolidado, avance por participante (con gaps: "quedó en sesión 2 pero no asistió a sesión 3"), recomendaciones

## 4. Generación PDF

Reutilizar patrón `html2pdf.js v0.14.0` ya establecido (memoria `pdf-generation-strategy`). Tres templates React nuevos:

- `MemoriaSesionPdfTemplate.tsx`
- `KitParticipantePdfTemplate.tsx`
- `ReporteMensualPdfTemplate.tsx`

Estilo institucional (logo Secretaría Turismo GTO + KiMedia), branded.

Upload a bucket `gto-deliverables` (ya existe), URL firmada se guarda en `pdf_url`.

## 5. UI Admin

Nueva sección en `/admin/curso-gto`:

```text
Tabs:
├─ Mirror (existente: progreso participantes)
├─ Transcripciones (NUEVA: bandeja Fireflies → vincular a sesión)
└─ Entregables (NUEVA: 3 sub-tabs)
    ├─ Memorias de sesión [generar/regenerar/ver PDF/marcar entregado]
    ├─ Kits personales    [filtro por dependencia → lista participantes → generar]
    └─ Reportes mensuales [selector año/mes/dependencia → generar]
```

Cada card muestra: estado, fecha generación, botón regenerar, descargar PDF, marcar entregado.

## 6. Orden de implementación

1. **Migración** (tablas nuevas + RLS admin)
2. **Edge `gto-import-transcripcion`** + UI bandeja Fireflies
3. **Edge `gto-generar-memoria-sesion`** + template PDF + UI listado
4. **Edge `gto-generar-kit-participante`** + template PDF + UI listado
5. **Edge `gto-generar-reporte-mensual`** + template PDF + UI listado

## Detalles técnicos

- **Anti-alucinación**: cada prompt al modelo incluye instrucción explícita "si la transcripción no menciona X, NO lo inventes; usa solo lo que aparezca textualmente o en los datos del participante". Memoria `content-philosophy` aplica.
- **Matching participantes**: usar fuzzy match (nombre + email) entre `participants` de Fireflies y `gto_participantes`. Si no hay match claro, marcar `needs_review`.
- **Costos**: transcripciones largas → usar `google/gemini-2.5-pro` (1M context) para sesiones de 90+ min; `claude-sonnet` para entregables finales.
- **Storage**: PDFs en `gto-deliverables/sesion/{id}.pdf`, `gto-deliverables/participante/{id}.pdf`, `gto-deliverables/mensual/{dep}/{year}-{month}.pdf`.
- **Fireflies connector**: ya hay `FIREFLIES_API_KEY` y edge functions existentes — reutilizar gateway pattern.
- **Verify JWT**: las 4 nuevas edge functions requieren `verify_jwt = true` (solo admin).

## Fuera de alcance (siguiente iteración)

- Generación automática batch (cron mensual)
- Envío automático por correo a Secretaría
- Firma electrónica
- Comparativos inter-dependencia

¿Procedo con el paso 1 (migración) o quieres ajustar algo antes?
