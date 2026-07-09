# Plan: Portal Actinver (subdominio privado, solo lectura)

Arrancamos por Actinver. Los otros dos (rankings competencia, tendencias) quedan como proyectos separados a futuro con el mismo patrón.

## Arquitectura

- **Proyecto Lovable nuevo**, independiente de este. Se publica y se conecta el subdominio `actinver.kimedia.mx` desde Project Settings → Domains.
- Backend propio (Lovable Cloud nuevo). No comparte DB con kimedia.mx — así el acceso queda aislado y no arrastramos las 40+ tablas actuales.
- Branding independiente (podemos alinearlo a Actinver o mantener KiMedia como proveedor).

## Acceso privado

- Auth por email + password, con **allowlist de dominios/emails de Actinver** (tabla `allowed_emails`). Signup abierto solo si el email está en la lista; el resto ve "solicita acceso a hola@kimedia.mx".
- Rol `admin` (tú y Ana Sofía) para subir contenido. Rol `viewer` (Actinver) solo lectura.

## Modelo de datos mínimo

- `reports`: id, fecha (date), titulo, resumen_ejecutivo (text), tipo (`benchmark_diario` | `analisis_semanal` | `otro`), created_by.
- `report_attachments`: id, report_id, file_name, storage_path, mime_type, size. Bucket privado `actinver-reports`, URLs firmadas al servir.
- `report_metrics` (opcional fase 2): id, report_id, marca, red, metrica, valor. Para graficar evolución cuando ya tengamos volumen.
- Tablas con RLS: viewers leen todo; solo admin escribe.

## Funcionalidad fase 1 (MVP)

1. **Home**: lista cronológica invertida de reportes con fecha, título, snippet del resumen, tags.
2. **Detalle de reporte**: resumen ejecutivo en markdown + attachments descargables (imágenes del análisis WhatsApp, PDFs, capturas de benchmark).
3. **Admin**: formulario para crear reporte (fecha + título + resumen + drag&drop de archivos). Sin editor complicado — pegas texto y subes imágenes.
4. **Búsqueda simple** por fecha y texto en título/resumen.
5. **Timeline lateral** por mes para navegar el histórico.

## Fuera de alcance fase 1

- No generación automática de análisis (tú los sigues creando, aquí solo se suben).
- No dashboards de métricas ni gráficas — se agregan cuando `report_metrics` tenga datos.
- No ingesta de Fanpage Karma todavía (eso vive en el proyecto de "rankings" cuando lo armemos).

## DNS / subdominio

- Requiere que el nuevo proyecto esté publicado primero (crea el `.lovable.app`), luego conectas `actinver.kimedia.mx` desde Domains. Necesitarás agregar el registro CNAME/A en el DNS de kimedia.mx.

## Siguientes proyectos (referencia, no se construyen ahora)

- `rankings.kimedia.mx`: uploader CSV/Excel de exports Fanpage Karma → parser → tablas `industries`, `profiles`, `metrics_snapshots` → vistas públicas de ranking por industria.
- `tendencias.kimedia.mx`: extender la lógica de `research-trends` que ya tienes, vista pública navegable.

## Detalles técnicos

- Stack idéntico al proyecto actual (React + Vite + Tailwind + Lovable Cloud/Supabase).
- Storage: bucket privado `actinver-reports` con RLS por rol.
- Signed URLs con expiración de 1h para descargas.
- Edge function `create-report` para validar rol admin antes de insertar.
- SEO: `noindex` en el subdominio entero (es contenido privado de cliente).

## Decisiones pendientes antes de construir

1. ¿Quieres que yo cree el proyecto Lovable nuevo, o lo creas tú desde el dashboard y me pasas acceso? (Yo no puedo crear proyectos desde aquí — solo puedo trabajar en este).
2. ¿Emails/dominios permitidos para Actinver? (ej. `@actinver.com` completo, o lista específica).
3. ¿El branding del portal es KiMedia, Actinver, o co-branded?
