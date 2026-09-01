# Portales de cliente: capa de datos y panel resumen

Objetivo: que cada portal (Falcon, Padre Ricardo Sada, El Diluvio, Dr. Mario Doria, Strategos) tenga el mismo "cascarón": se suben bases de performance, el cliente entra, ve un panel resumen y descarga reportes. Si un cliente no tiene datos de alguna fuente, ese bloque simplemente no aparece.

## Qué datos vamos a cargar

Cuatro familias, todas con periodo (inicio–fin) y cliente:

**1. Redes orgánicas (FanpageKarma + LinkedIn)**
Por cuenta y red, por periodo: seguidores, crecimiento de seguidores, publicaciones, interacciones, tasa de interacción, impresiones/alcance, índice de rendimiento. FanpageKarma cubre IG/FB/X/TikTok/YouTube; LinkedIn se sube aparte con su propio export (seguidores, impresiones, reacciones, clics, tasa de interacción).

**2. Sitio web (Google Analytics 4)**
Por periodo: usuarios, usuarios nuevos, sesiones, vistas, duración media, tasa de rebote, conversiones, y desglose por canal de adquisición (orgánico, social, pagado, directo, referido).

**3. Publicidad (Google, Meta, X, TikTok)**
Por plataforma y campaña, por periodo: inversión, impresiones, alcance, clics, CTR, CPC, CPM, resultados/conversiones, costo por resultado.

**4. Contexto**
Notas del corte y capturas/archivos fuente, para que quede rastro de de dónde salió cada número.

## Cómo se cargan

En el admin de cada cliente (`/admin/cliente/:id/portal`) una pestaña **Datos** con tres cargadores:

- **Redes**: reutiliza el importador de FanpageKarma que ya funciona en Guanajuato/Actinver, más una variante para el CSV de LinkedIn.
- **Web (GA4)**: pegar el export CSV de GA4 o capturar a mano los ~8 indicadores del periodo.
- **Ads**: pegar el export por campaña de cada plataforma; se detecta la plataforma y se mapean columnas.

Toda carga es idempotente (mismo cliente + periodo + cuenta/campaña se actualiza, no se duplica) y queda registrada con fecha y quién la subió.

## Qué ve el cliente

Nueva pestaña **Resumen** como pantalla de entrada del portal:

- Selector de periodo (mes, quincena, semana o rango libre).
- Fila de indicadores clave: alcance total, interacciones, crecimiento de comunidad, tráfico web, inversión publicitaria y costo por resultado.
- Un bloque por familia de datos, cada uno con su comparativo contra el corte anterior (subió/bajó/igual) y una lectura en lenguaje claro.
- Bloque de ads con desglose por plataforma y las campañas de mejor rendimiento.
- Botón de **Descargar reporte** en PDF con el look and feel de KiMedia (sin logo en reportes de gobierno, con logo en los comerciales).

Los bloques sin datos no se muestran; en su lugar aparece un estado vacío discreto.

## Alcance de esta entrega

1. Tablas nuevas para redes (incluye LinkedIn), analítica web y ads de portal, con permisos por cliente.
2. Pestaña **Datos** en el admin con los tres cargadores.
3. Pestaña **Resumen** en el portal de cliente, con comparativos y descarga en PDF.
4. Alta de los cinco portales: Falcon, Padre Sada, El Diluvio, Mario Doria y Strategos (hoy Strategos no tiene servicios ni subdominio configurado).

## Notas técnicas

- Tablas nuevas: `client_portal_social_metrics`, `client_portal_web_analytics`, `client_portal_ads_metrics`, todas con `client_id`, `period_start`, `period_end`, clave única para upsert y RLS vía `has_client_access` / rol de operaciones.
- El módulo de benchmark existente (`client_portal_benchmark_*`) se queda para clientes con servicio de análisis; el nuevo resumen lee de las tablas nuevas y, si existe, también del benchmark.
- El PDF reutiliza el patrón de `DependenciaPdfTemplate` (html2pdf, tipografía Space Grotesk, paleta coral/tinta).
- Hay dos clientes duplicados: "Mario Doria" y "Mario Doria - Urólogo". Se consolidan en uno antes de conectar el portal.
