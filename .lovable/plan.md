# Portal Guanajuato: briefing, fichas 360 y consulta con IA

El portal hoy tiene cinco pestañas (Panorama, Benchmark, Estrategia, Histórico, Descargas) y todas parten de un tablero general: quien entra ve el gabinete completo y tiene que armar por su cuenta la lectura de su dependencia. Para un público de servidores públicos —incluida la Gobernadora— eso es demasiado trabajo de interpretación.

Tres entregas, en este orden.

## 1. Inicio: briefing del día

Nueva pestaña inicial (antes de Panorama) que responde "¿qué pasó y qué hago hoy?" en una sola pantalla:

- **Titular del día**: 2–3 líneas generadas a partir de las entradas de prensa del último día con datos, no adjetivos (volumen vs. promedio, sentimiento, tema dominante).
- **Semáforo de alertas**: picos de prensa negativa, caídas de desempeño en redes y dependencias sin cobertura, cada una con el dato que la disparó y un enlace directo al panel donde se ve.
- **Movimientos**: quién subió y quién bajó frente al corte anterior (posición en el gabinete, no solo el porcentaje).
- **3 acciones sugeridas** con la evidencia que las respalda, reusando la lógica de recomendaciones que ya existe en Estrategia.
- **Selector de "estoy viendo como…"**: gabinete completo o una dependencia concreta. Es una preferencia de vista, no un permiso; se guarda por usuario y define el arranque del portal.

## 2. Ficha 360 por dependencia

Una vista dedicada por cada una de las 40 dependencias registradas, accesible desde el briefing, desde el buscador y desde cualquier tabla (clic en el nombre lleva a su ficha):

- Encabezado con dependencia, titular y cargo, más las cuentas asociadas (institucional y titular).
- Pulso de prensa: menciones, sentimiento y evolución en el periodo elegido.
- Desempeño en redes: seguidores, engagement, mejor publicación, comparación contra el promedio del gabinete y su posición en el ranking.
- Narrativas dominantes de esa dependencia (usa el análisis de narrativas ya existente).
- Fortalezas y brechas frente a sus pares, con el número que sostiene cada afirmación.
- Botón de descarga que reutiliza el reporte por dependencia ya implementado.

Un buscador global con atajo de teclado permite saltar a cualquier dependencia, titular o tema desde cualquier pestaña.

## 3. Pregúntale a los datos

Chat dentro del portal que responde con la información real del cliente, no con conocimiento general:

- Responde a preguntas como "¿cómo le fue a Salud esta semana?", "¿quién creció más en Facebook en julio?", "¿qué temas de prensa dominaron el mes?".
- Cada respuesta cita de dónde salió el dato (periodo, red, dependencia) y ofrece un enlace al panel correspondiente.
- Sugerencias de preguntas iniciales para que nadie se enfrente a un cuadro de texto vacío.
- Si no hay datos suficientes para responder, lo dice explícitamente en vez de inventar.

## Presentación y navegación

- Tema institucional claro por defecto (fondo claro, tipografía seria, gráficas limpias) con interruptor claro/oscuro guardado por usuario.
- Barra de contexto persistente ya existente, ampliada con el "viendo como" activo.
- Estados vacíos que explican qué falta y a quién pedirlo, en lugar de tarjetas en blanco.
- Transiciones y microinteracciones contenidas: el portal debe leerse serio, no llamativo.

## Detalles técnicos

- Nueva pestaña `briefing` en `src/pages/portal/PortalHome.tsx` como valor inicial de `Tabs`, con `src/components/portal/PortalBriefing.tsx`.
- `src/components/portal/PortalDependenciaFicha.tsx` como vista de detalle, alimentada por `client_portal_dependencias`, `client_portal_benchmark_metrics/posts` y `client_portal_listening_entries`; reutiliza `DependenciaPdfTemplate.tsx` para la descarga.
- Preferencia de vista ("viendo como" y tema) persistida por usuario; se guarda en una tabla nueva de preferencias de portal con RLS por `auth.uid()` y GRANTs explícitos, con respaldo en localStorage.
- Chat: nueva Edge Function que consulta la base con herramientas acotadas (métricas por dependencia/periodo/red, menciones de prensa, top publicaciones) y responde con la IA de Lovable; UI construida con AI Elements, sin historial persistente por ahora.
- Los insights del briefing se calculan de forma determinista sobre el mismo universo filtrado que usa `PortalBenchmark.tsx`; la IA solo redacta, no genera cifras.
- El acceso se mantiene igual: todos los usuarios del portal siguen viendo la misma información.
