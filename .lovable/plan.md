# Portal Guanajuato: ritmo semanal, entregables y uso interno

La reunión cambia un supuesto de fondo: **el cliente no entra al portal** (salvo un acceso ejecutivo) y KiMedia se comprometió a **actualizarlo cada lunes a más tardar a las 12:00**. La información sigue organizándose en continuo; lo que se agrega es el ritmo de actualización y los entregables.

## 1. Acceso: portal interno + vista ejecutiva

- El portal deja de ser "portal del cliente": es la herramienta de trabajo del equipo KiMedia. Se retira la narrativa de autoservicio por dependencia y se quitan los accesos por dependencia.
- Se añade un **rol de vista ejecutiva** para Mike, con el Big Picture del gabinete como pantalla de entrada.
- El equipo KiMedia conserva el portal completo: tablas de detalle, descargas y la ficha de cada dependencia como expediente. Nada de eso se recorta.

## 2. Ritmo de actualización: lunes 12:00

- Los datos siguen siendo continuos y los cortes de periodo (semanal, quincenal, mensual, rango personalizado) se conservan tal como están.
- Lo nuevo es la **transparencia del ritmo**: barra de estado permanente con "Actualizado el lunes DD/MM · datos hasta DD/MM" y aviso cuando la carga de la semana viene atrasada.
- Tablero de frescura en el admin: por fuente (prensa, redes, narrativas), última fecha cargada y qué falta para cerrar la actualización del lunes.
- Recordatorio operativo dentro del admin cuando pasa el lunes 12:00 sin que la carga esté completa.

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

**c) Big Picture ejecutivo** — una sola página, **semanal**, para Mike: semáforo de las 40 dependencias en una vista, top 5 que suben y top 5 que bajan, tres alertas de prensa y una línea de conclusión. Visual y corto; se descarga en PDF y también existe como pantalla dentro del portal (la que ve el rol ejecutivo).

## 5. Detalle de tendencias

En la ficha de dependencia, un bloque **¿funcionó?**: para las publicaciones marcadas como "montadas en tendencia", compara su desempeño contra el promedio de esa cuenta y el promedio del gabinete en la semana, y devuelve un veredicto simple (jaló / no jaló) con el número que lo sostiene. No se agrega escucha del entorno: sigue fuera de alcance.

## Detalles técnicos

- Nueva tabla ligera de actualizaciones del portal (`client_id`, `updated_at`, notas, estado de carga por fuente) con RLS y GRANTs explícitos; el admin registra la actualización del lunes desde `ClientPortalAdmin.tsx`. No cambia el modelo de periodos existente.
- `useGabineteData.ts` expone la última fecha de datos por fuente para alimentar la barra de estado; los componentes actuales siguen calculando sus rangos como hoy.
- Rol ejecutivo mediante `user_roles` + una ruta/pestaña única que renderiza el Big Picture; el resto de pestañas no se montan para ese rol.
- El Big Picture y el reporte profundo reutilizan `DependenciaPdfTemplate.tsx` y `html2pdf.js`, con dos plantillas nuevas: una de una página (semáforo) y otra extendida.
- El cruce prensa sin respuesta se calcula de forma determinista sobre `client_portal_listening_entries` y las publicaciones de la semana; la IA solo redacta.

## Orden de trabajo

1. Semana oficial (tabla, publicación, barra de estado) — es la base de todo lo demás.
2. Briefing del lunes con temas sin respuesta y resúmenes copiables.
3. Entregables: genérico ajustado, reporte profundo, Big Picture.
4. Rol ejecutivo y retiro de accesos por dependencia.
5. Bloque de tendencias en la ficha.
