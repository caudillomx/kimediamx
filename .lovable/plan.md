# Portales de cliente — arquitectura viva

Evolucionamos el "Portal Actinver" (ya montado como subdominio virtual) a un **patrón reutilizable para cualquier cliente**: `<cliente>.kimedia.mx` → mismo backend KiMedia, UI aislada por hostname. Actinver es la primera instancia; el resto se activan agregando una fila en la config de portales.

## Cómo se accede

- **Password único por cliente (ahora)**: un solo "usuario técnico" por cliente (ej. `portal+actinver@kimedia.mx`) con password que le pasamos al cliente. Todos los del cliente entran con ese mismo login. Cero fricción, cero gestión de invitaciones.
- **Migración futura a usuarios individuales**: la tabla `client_access(user_id, client_id)` ya existe, así que cuando queramos multi-usuario solo creamos cuentas reales y les damos acceso al mismo `client_id` — sin migrar datos.
- El admin de KiMedia entra con su cuenta normal y ve **todo** + las recomendaciones internas.

## Qué ve el cliente al entrar

**Home del portal** = dashboard vivo del cliente, no lista cronológica. Tres bloques principales + filtro global de fechas arriba.

### 1. Panel de datos (Performance)
Tabs internas:
- **Redes sociales** — datos de Fanpage Karma (xlsx/csv semanal). Gráficas de evolución (seguidores, engagement, alcance, top posts) y tabla comparativa por red.
- **Ads** — xlsx/csv de Meta, X, otras plataformas. KPIs (spend, CPM, CTR, conversiones), gráficas por campaña, breakdown por plataforma.
- **Screenshots / evidencia** — galería con caption y fecha, para métricas que no vienen en export.
- **Listening (WhatsApp)** — timeline con los mensajes/análisis diarios importados desde `.txt` (lo que ya vamos a construir para Actinver), buscable y filtrable.

Todo respeta el **filtro de fechas global** (default: últimas 4 semanas). Se puede cambiar a rango custom o a "esta semana / mes / trimestre".

### 2. Recomendaciones de la semana
Dos secciones separadas en la misma pantalla:
- **Para el cliente** — visible siempre. Bullets accionables + prioridad (alta/media/baja).
- **Para el equipo KiMedia** — solo visible si el usuario logueado es admin de KiMedia. El cliente NO las ve.

Se editan desde el panel admin, no desde el portal.

### 3. Descarga de reporte en PDF
Botón "Descargar reporte" arriba a la derecha:
- Genera PDF con el rango de fechas activo.
- Incluye: portada co-branded (logo cliente + "powered by KiMedia"), resumen ejecutivo, gráficas de redes/ads, top screenshots, recomendaciones para el cliente. **No incluye** recomendaciones internas.
- Reutiliza el patrón `html2pdf.js` que ya usamos en el proyecto.

## Cómo lo alimentamos (solo KiMedia admin)

Panel admin por cliente en `/admin/cliente/:id/portal` (ya existe la ruta, la expandimos). Tabs:
- **Datasets** — subir xlsx/csv de Fanpage Karma, subir xlsx/csv de ads (Meta/X/otras), subir screenshots. Cada archivo se etiqueta con `week_start`, `source` (fanpage_karma / meta_ads / x_ads / other), `platform` opcional, y notas.
- **Listening** — pegar/importar `.txt` de WhatsApp (parser semanal → agrupa por día).
- **Recomendaciones semanales** — form por semana con dos áreas: cliente / equipo interno.
- **Reportes narrativos** — lo que ya construimos (`client_portal_reports`) sigue vivo para análisis largos tipo Actinver histórico.
- **Acceso** — muestra el email/password del "usuario portal" del cliente, permite resetear password y (a futuro) invitar usuarios individuales.

## Modelo de datos nuevo

Genérico — sirve para Actinver y para cualquier cliente futuro que enchufemos.

- `client_portal_datasets` — un registro por archivo subido. Campos: `client_id`, `source` (enum: `fanpage_karma`, `meta_ads`, `x_ads`, `tiktok_ads`, `screenshot`, `other`), `platform` (nullable: `facebook`, `instagram`, `x`, `tiktok`, ...), `period_start`, `period_end`, `storage_path`, `parsed_data` (jsonb con las métricas ya normalizadas para graficar), `notes`, `uploaded_by`.
- `client_portal_listening_entries` — un registro por día. Campos: `client_id`, `entry_date`, `content_md`, `source` (`whatsapp_txt` / `manual`), `raw_source_ref` (opcional).
- `client_portal_weekly_recommendations` — un registro por semana + cliente. Campos: `client_id`, `week_start`, `for_client_md`, `for_team_md`, `priority`.
- `client_portal_credentials` — un registro por cliente. Campos: `client_id`, `portal_user_id` (fk a auth.users del "usuario técnico"), notas. Permite mostrar en admin qué cuenta usa cada cliente.

Se conservan tal cual: `client_portal_reports`, `client_portal_attachments`, `client_access`, bucket `client-reports`, rol `client_viewer`.

Nuevo bucket privado `client-datasets` para xlsx/csv/screenshots, con RLS equivalente (viewer solo si `has_client_access`, admin todo).

## RLS (resumen en lenguaje humano)

- Cliente logueado ve **solo** las filas de las tablas nuevas cuyo `client_id` esté en su `client_access`, y **nunca** el campo `for_team_md`.
- Admin de KiMedia ve todo y edita todo.
- Los archivos en `client-datasets` siguen la misma regla vía `has_client_access`.

## Fases de entrega

**Fase A — Fundación multi-cliente (siguiente entrega)**
1. Migración: tablas nuevas + bucket `client-datasets` + RLS + GRANTs.
2. Refactor de `src/lib/clientPortal.ts` para que el mapa de portales sea la única fuente de verdad (ya lo es; solo lo dejamos listo para agregar clientes con una línea).
3. Nuevo home del portal: shell con filtro de fechas global + tabs (Performance / Recomendaciones / Reportes narrativos).
4. Recomendaciones semanales (lectura en portal, edición en admin) con separación cliente/equipo.
5. Botón "Descargar PDF" con rango activo.

**Fase B — Ingesta de datos**
6. Uploader admin de xlsx/csv de Fanpage Karma con parser → `parsed_data`.
7. Uploader de ads (Meta primero, X y otras después) con parser.
8. Uploader de screenshots con caption/fecha.
9. Importador de `.txt` WhatsApp → `client_portal_listening_entries` (aplica al histórico Actinver que me vas a pegar).

**Fase C — Multi-usuario opcional**
10. UI para invitar usuarios individuales a un cliente cuando lo pidas. La estructura ya está lista.

**Fuera de alcance ahora**: rankings públicos entre industrias, ingesta automática vía API de Fanpage Karma/Meta, generación de recomendaciones con IA (podemos agregar después como asistente al escribirlas).

## Lo que necesito de ti para arrancar Fase A

1. **Nombre del cliente Actinver** para el "usuario portal" — sugiero `portal+actinver@kimedia.mx`. ¿OK o prefieres otro?
2. Un ejemplo de export xlsx/csv de **Fanpage Karma** y uno de **Meta Ads** para diseñar el parser correcto en Fase B (no bloquea Fase A).
3. El `.txt` completo del histórico de WhatsApp de Actinver cuando quieras (tampoco bloquea Fase A).
