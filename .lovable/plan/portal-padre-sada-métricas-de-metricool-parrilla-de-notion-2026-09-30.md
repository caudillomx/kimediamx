# Portal Padre Sada: métricas de Metricool + parrilla de Notion

El portal de Padre Sada ya existe (pestañas Resumen y Parrilla editorial con calendario de Notion). Falta alimentar el Resumen con Metricool de forma automática y confirmar que la parrilla de Notion esté ligada.

## 1. Conexión automática con Metricool
- Te pediré en un formulario seguro tu clave de Metricool (Ajustes de cuenta → API; requiere plan Advanced o Agency) y el ID de usuario.
- En Datos del portal de Padre Sada se elige qué marca de Metricool corresponde al cliente.
- Botón "Traer datos de Metricool": jala por red (Instagram, Facebook, TikTok, X, YouTube, LinkedIn si están conectadas) seguidores, crecimiento, publicaciones, alcance/impresiones e interacciones, día por día.
- Primera carga: histórico desde el 1 de enero de 2026. Después, cada carga solo actualiza sin duplicar.
- También trae las publicaciones con su rendimiento para mostrar "lo que mejor funcionó".

## 2. Parrilla de Notion
- Verifico que la base de Padre Sada esté registrada y ligada al cliente; si no, la registro y corro la primera sincronización.
- El cliente ve el calendario de próximas publicaciones (fecha, red, formato, estatus) en la pestaña Parrilla.

## 3. Qué ve el cliente
- Resumen: selector de periodo, indicadores clave (comunidad, alcance, interacciones, publicaciones), comparativo contra el periodo anterior y top de publicaciones, todo con datos de Metricool.
- Parrilla: previsión desde Notion.
- Descarga en PDF del resumen con look KiMedia (con logo, es cliente comercial).

## Notas técnicas
- Nueva función de servidor `metricool-sync` (solo admins), guarda en `client_portal_social_metrics` y posts con upsert por cliente+red+día; clave guardada como secreto, nunca en el navegador.
- Campo de configuración por cliente para el blogId de Metricool.
- `PortalResumen` ya lee de las tablas de redes; solo se asegura que tome la fuente Metricool.
- No se tocan portales de Guanajuato/Actinver ni sus reportes.
