# Portal Guanajuato: cierre semanal, entregables y uso interno

La reunión cambia dos supuestos con los que se construyó el portal: **el cliente no entra** (salvo un acceso ejecutivo) y **la información se organiza por semana cerrada**, no en continuo. Sobre eso se ajustan los entregables.

## 1. Acceso: portal interno + vista ejecutiva

- El portal deja de ser "portal del cliente": es la herramienta de trabajo del equipo KiMedia. Se retira la narrativa de autoservicio por dependencia y se quitan los accesos por dependencia.
- Se añade un **rol de vista ejecutiva** para Mike: entra y ve únicamente el Big Picture del gabinete (semáforo, quién sube y quién baja, alertas), sin tablas de detalle ni descargas masivas y sin poder husmear el detalle de cada dependencia como si fuera un expediente.
- El equipo KiMedia conserva el portal completo.

## 2. Semana oficial: corte domingo, publicación lunes 12:00

- Todo el portal se lee sobre una **semana cerrada (lunes a domingo)** en vez de rangos sueltos. El selector de periodo arranca siempre en "Semana actual" con la etiqueta del rango.
- Barra de estado permanente: **"Datos al domingo DD/MM · publicado lunes 12:00"**, con indicador de si la carga de esa semana está completa (prensa, redes, narrativas) o pendiente.
- El admin marca la semana como **publicada**; mientras no lo esté, el portal muestra la última semana publicada y avisa que la nueva está en preparación.
- Se mantiene el rango personalizado para análisis, pero como opción secundaria.

## 3. Briefing del lunes

El Inicio se reorienta a responder "¿qué pasó el fin de semana y qué le digo hoy a mi dependencia?":

- Titular de la semana con datos, no adjetivos.
- **Temas calientes de prensa sin respuesta del gabinete**: cuando un tema domina la prensa y ninguna dependencia se pronunció, se señala explícitamente. Es la unión prensa–redes que faltaba, planteada como aviso ("por aquí te va a llegar"), no como orden de responder.
- Semáforo de dependencias en foco rojo de la semana.
- Recomendaciones etiquetadas como **sugerencias**, con la evidencia que las respalda y una nota visible de que requieren criterio humano.
- Bloque **copiar resumen**: texto breve por dependencia, listo para enviarle a cada equipo el lunes.

## 4. Entregables

Tres salidas distintas, con propósitos distintos:

**a) PDF genérico por dependencia** — el que ya existe, ajustado al corte semanal: portada con dependencia, titular y semana; prensa, redes, mejores publicaciones y temas. Sin el análisis profundo, que es lo contractual.

**b) Reporte profundo** — quincenal para dependencias y mensual para titulares. Agrega al genérico: evolución contra los cortes previos, narrativas dominantes, brechas contra el promedio del gabinete y recomendaciones argumentadas. Selector de periodicidad y de alcance (dependencia / titular) en el Centro de Descargas.

**c) Big Picture ejecutivo** — una sola página, quincenal, para Mike: semáforo de las 40 dependencias en una vista, top 5 que suben y top 5 que bajan, tres alertas de prensa y una línea de conclusión. Visual y corto; se descarga en PDF y también existe como pantalla dentro del portal (la que ve el rol ejecutivo).

## 5. Detalle de tendencias

En la ficha de dependencia, un bloque **¿funcionó?**: para las publicaciones marcadas como "montadas en tendencia", compara su desempeño contra el promedio de esa cuenta y el promedio del gabinete en la semana, y devuelve un veredicto simple (jaló / no jaló) con el número que lo sostiene. No se agrega escucha del entorno: sigue fuera de alcance.

## Detalles técnicos

- Nueva tabla de semanas del portal (`period_start`, `period_end`, `published_at`, estado de carga por fuente) con RLS y GRANTs explícitos; el admin publica la semana desde `ClientPortalAdmin.tsx`.
- `useGabineteData.ts` gana una noción de semana activa y de "última semana publicada"; los componentes (`PortalBriefing`, `PortalBenchmark`, `PortalDependenciaFicha`, `PortalDescargas`) consumen ese periodo en lugar de calcular rangos por su cuenta.
- Rol ejecutivo mediante `user_roles` + una ruta/pestaña única que renderiza el Big Picture; el resto de pestañas no se montan para ese rol.
- El Big Picture y el reporte profundo reutilizan `DependenciaPdfTemplate.tsx` y `html2pdf.js`, con dos plantillas nuevas: una de una página (semáforo) y otra extendida.
- El cruce prensa sin respuesta se calcula de forma determinista sobre `client_portal_listening_entries` y las publicaciones de la semana; la IA solo redacta.

## Orden de trabajo

1. Semana oficial (tabla, publicación, barra de estado) — es la base de todo lo demás.
2. Briefing del lunes con temas sin respuesta y resúmenes copiables.
3. Entregables: genérico ajustado, reporte profundo, Big Picture.
4. Rol ejecutivo y retiro de accesos por dependencia.
5. Bloque de tendencias en la ficha.
