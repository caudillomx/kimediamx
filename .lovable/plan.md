# Portal Guanajuato: descargas para dependencias y funcionarios

Acceso único compartido (sin usuarios por dependencia). Todo se descarga bajo demanda desde el portal.

## 1. PDF ejecutivo por dependencia

Nueva acción **Descargar reporte** en la ficha de cada dependencia dentro de Benchmark. Genera un PDF con la marca de KiMedia que incluye:

- Portada: dependencia, titular, periodo y redes con presencia.
- Sus cuentas (institucional y titular) con seguidores, crecimiento, publicaciones e interacciones.
- Posición frente al promedio del gabinete y frente al mes anterior (sube/baja).
- Sus mejores publicaciones del periodo.
- Menciones de prensa de la dependencia y su titular en el periodo, con tono.
- Narrativas detectadas y recomendaciones cuando existan para el periodo.

Además, un botón **Descargar todo el gabinete** que arma un PDF panorámico con el ranking completo, quién sube y quién baja, y una página resumen por dependencia.

## 2. Menciones de prensa descargables

En el módulo de prensa, un panel de descarga con filtros: rango de fechas, dependencia/titular, medio y tono.

- Exporta a Excel/CSV la lista filtrada: fecha, medio, titular de la nota, enlace, dependencia, tono y extracto.
- Exporta también a PDF cuando la dependencia quiera circular la síntesis, no la base.
- Contador visible de cuántas menciones se van a exportar antes de descargar.

## 3. Centro de descargas

Una sección **Descargas** en el portal que reúne en un solo lugar:

- Selector de dependencia y de periodo (semana, quincena, mes o rango personalizado).
- Botones de los tres entregables: PDF de dependencia, PDF de gabinete, Excel de menciones.
- Historial de los reportes que el equipo de KiMedia ya publicó, para volver a bajarlos.

## Detalles técnicos

- Reutilizar `html2pdf.js` y el patrón de `PortalPdfTemplate.tsx`; nueva plantilla `DependenciaPdfTemplate.tsx` con las mismas reglas de salto de página y wordmark tipográfico ya corregidas para Actinver.
- Los datos por dependencia salen de la agregación que ya existe en `PortalBenchmark.tsx`; se extrae a un hook reutilizable para que la plantilla PDF y la vista compartan cálculo.
- Prensa: la exportación amplía `exportSearchCsv` de `PortalAnalysis.tsx` a un exportador con filtros y resolución entidad → dependencia usando el catálogo `client_portal_dependencias`.
- Todo se genera en el navegador; no hace falta nueva tabla ni edge function.

## Orden de trabajo

1. Hook de agregación por dependencia compartido.
2. PDF ejecutivo por dependencia y PDF de gabinete.
3. Exportador de menciones de prensa con filtros.
4. Sección Descargas que agrupa todo.
