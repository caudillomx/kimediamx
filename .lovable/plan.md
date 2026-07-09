# Portal Actinver — subdominio virtual sobre KiMedia

Montamos `actinver.kimedia.mx` apuntando a **este mismo proyecto**. El hostname decide qué UI se renderiza, y el backend (auth, DB, storage, edge functions) es 100% compartido con KiMedia.

## Arquitectura

```text
kimedia.mx / www.kimedia.mx   →  App KiMedia (todo lo actual, sin cambios)
actinver.kimedia.mx           →  Portal cliente (login + reportes)
        ↓
   mismo Supabase / mismo auth / mismas tablas
```

Un wrapper en `App.tsx` lee `window.location.hostname`. Si es el subdominio de Actinver, monta solo `<ClientPortalRoutes />` (login, home, detalle de reporte). En cualquier otro hostname, todo sigue igual.

## Modelo de datos (genérico, reutilizable para futuros clientes)

- `client_reports`: `client_id → clients.id`, `report_date`, `title`, `summary_md`, `type` (daily / weekly / benchmark / other), `created_by`.
- `client_report_attachments`: `report_id`, `file_name`, `storage_path`, `mime_type`, `size_bytes`.
- `client_access`: `user_id`, `client_id` — define qué cliente puede ver cada viewer.
- Bucket privado `client-reports` con RLS por `client_id`.
- Nuevo rol en enum `app_role`: `client_viewer`.

**RLS**:
- `client_reports` / `client_report_attachments`: viewer solo ve filas cuyo `client_id` esté en su `client_access`; `admin` ve todo.
- `client_access`: solo `admin` lee/escribe.
- Bucket: policies equivalentes leyendo `client_access`.

## Fases

**Fase 1 — Portal Actinver funcional**
1. Migración: tablas nuevas, enum, bucket, RLS, GRANTs.
2. Seed: mi email y el de Ana Sofía como `admin`; grant de `client_access` al `client_id` de Actinver para los viewers que me pases.
3. Detector de hostname + `<ClientPortalRoutes />` (login, lista cronológica de reportes con filtros por fecha/tipo, vista de detalle con markdown + adjuntos descargables).
4. UI admin en `/admin/clientes/:id/reportes` (dentro de KiMedia, no en el subdominio) para crear reportes: fecha, título, resumen markdown, drag&drop de adjuntos, dropdown de tipo.
5. Branding co-marca sobrio (Actinver + "powered by KiMedia" en footer).

**Fase 2 — Importador del histórico**
Cuando me pegues el .txt: edge function `actinver-import-history` que parsea, agrupa por fecha y crea un `client_report` por día con `type = 'daily'`, `created_by = tu usuario`. Preview antes de commit real.

**Fase 3 — Gestión de accesos (UI)**
Panel simple en `/admin/clientes/:id/accesos` para invitar/revocar viewers sin tocar SQL.

## Fuera de alcance ahora

- Rankings.kimedia.mx y tendencias.kimedia.mx (proyectos separados, después).
- Ingesta automática de Fanpage Karma o generación de análisis en el portal.
- Dashboards con métricas — Fase 1 es solo repositorio/lectura.

## Detalles técnicos

- Custom domain: `actinver.kimedia.mx` se conecta desde Project Settings → Domains como subdominio adicional; SSL auto.
- Detector: `const isActinverPortal = window.location.hostname === 'actinver.kimedia.mx'` en el root router; en dev se puede forzar con `?portal=actinver`.
- `types.ts` se regenera tras la migración; el código del portal se escribe después.
- No se toca `ObjectivesView`, `KanbanBoard`, `WeeklyHealthView`, `ClientsHub`, ni ninguna vista existente de KiMedia.

## Pendiente que me confirmes al aprobar

1. Emails viewers Actinver iniciales (o "por ahora solo admins, viewers después").
2. Cuando arranquemos Fase 2, me pegas el .txt completo aquí.