## Portal Guanajuato (cliente institucional)

Mismo patrón que Actinver: subdominio propio, login, y módulos de análisis. Los módulos se **añaden como pestañas nuevas al portal existente** para que Guanajuato (y a futuro otros clientes tipo gobierno) los tengan disponibles.

### 1. Alta del cliente y del portal

- Crear el cliente **Gobierno de Guanajuato** en `clients` desde el admin (o script) y registrarlo en `src/lib/clientPortal.ts` bajo el slug `guanajuato` con su `clientId`, `displayName` y `tagline` ("Portal privado de análisis diario").
- Crear las credenciales portal (email + password) desde `/admin/cliente/:id/portal` usando el flujo `manage-portal-user` que ya existe.
- Documentar en el chat los DNS records para `guanajuato.kimedia.mx` (A `185.158.133.1` + TXT `_lovable`) como se hizo con Actinver.

### 2. Nuevas pestañas en el portal (`PortalHome`)

El portal Actinver hoy tiene: Estrategia, Benchmark, Reportes. Añadimos, disponibles solo para clientes que las tengan activas:

1. **Prensa diaria** — ingesta manual (pegar/upload de columnas y notas), condensado IA y bandeja de envío por WhatsApp.
2. **Benchmark Funcionarios** — vista independiente de perfiles personales del gabinete.
3. **Benchmark Instituciones** — vista independiente de cuentas oficiales de dependencias.
4. **Datasets Fanpage Karma** — carga de exports y despliegue como tabla/panel.

Un flag por cliente (`clients.portal_modules jsonb`) decide qué pestañas se muestran, para no exponer módulos GTO al portal Actinver.

### 3. Base de datos (migración)

Reusamos infraestructura existente donde aplique:

- **Benchmark funcionarios vs instituciones**: añadir columna `scope text` (`funcionarios` | `instituciones`) a `client_portal_benchmark_periods` y filtrar las vistas por scope. Sin tablas nuevas.
- **Datasets Fanpage Karma**: ya existe `client_portal_datasets` y bucket `client-datasets`. Añadir parser específico y una vista tabular en el portal.
- **Prensa diaria** (nuevas tablas):
  - `press_daily_batches` — un lote por día por cliente (`date`, `client_id`, `status`, `whatsapp_sent_at`).
  - `press_daily_entries` — cada nota/columna pegada (`batch_id`, `medium`, `author`, `title`, `url`, `raw_text`, `tone`, `topic`).
  - `press_daily_digests` — condensado generado por IA (`batch_id`, `summary_md`, `whatsapp_text`, `alerts jsonb`, `generated_at`).
  - Todas con RLS: admin full access + `has_client_access(auth.uid(), client_id)` para SELECT desde el portal. `GRANT` explícitos a `authenticated` y `service_role`.

### 4. Edge functions

- `press-daily-generate` — recibe `batch_id`, lee entries, llama a Lovable AI (Gemini 2.5 Flash) con prompt que produce: (a) resumen markdown para el portal, (b) versión WhatsApp ≤ 900 chars, (c) alertas destacadas. Persiste en `press_daily_digests`. **Sin alucinación**: solo puede citar contenido presente en las entries.
- `press-daily-send-whatsapp` — envía el `whatsapp_text` del digest a un número/grupo. Twilio requiere secret nuevo → lo pedimos con `add_secret` en fase de implementación cuando el usuario confirme número destino. Por ahora dejamos el botón "Copiar para WhatsApp" funcional para no bloquear.
- `parse-fanpage-dataset` — normaliza el XLSX/CSV subido a `client-datasets` y guarda filas en `client_portal_datasets`.

### 5. Admin de Guanajuato

Añadir a `/admin/cliente/:clientId` una sección "Portal Gobierno" con:
- Editor de lote diario de prensa (pegar notas, botón "Generar condensado", vista previa, botón "Enviar WhatsApp"/"Copiar").
- Uploader de datasets Fanpage Karma (para funcionarios y para instituciones, marcando `scope`).
- Editor de periodos y competidores del benchmark con selector `scope`.

### 6. Fuera de alcance de esta iteración

- Scraping automático de medios (queda como fase 2, ya cubierto por Firecrawl cuando lo aprueben).
- WhatsApp automático (queda dependiente de que el usuario confirme integrar Twilio y comparta destino).
- Portal público SEO / metadatos (el portal es privado).

### Detalles técnicos

- Frontend: React + Tailwind + Framer Motion, tema oscuro (regla del proyecto), reusando `glass-strong`, `bg-mesh`.
- Routing: sin cambios en `App.tsx`; `PortalRouter` gana rutas `/prensa`, `/benchmark/funcionarios`, `/benchmark/instituciones`, `/datasets`.
- IA: Lovable AI Gateway, modelo `google/gemini-2.5-flash` para condensado; sin nuevas API keys.
- Storage: buckets ya existentes (`client-datasets` privado, `client-corpus-files` privado). No creamos buckets nuevos.
- Seguridad: RLS estricta por `has_client_access`, GRANTs a `authenticated`/`service_role`, sin exposición a `anon`.
