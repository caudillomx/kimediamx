# Reportes de Guanajuato: cambios del periodo y recomendaciones

Hoy el PDF por dependencia muestra la foto del corte (cuentas, ranking, mejores publicaciones, narrativas, prensa) y solo un dato comparativo suelto: la variación de seguidores. Se agregan dos bloques nuevos.

## 1. "Lo que cambió" (determinista, sin IA)

Un bloque en la primera cuartilla, arriba de las tablas, con 4 a 6 frases cortas comparando el corte contra el periodo inmediato anterior. Cada frase lleva la cifra y la flecha (sube/baja/estable):

- Seguidores: variación total y por red.
- Interacción (engagement ponderado): variación y si se acercó o alejó del promedio del gabinete.
- Ritmo de publicación: publicaciones y posts/día vs periodo previo.
- Posición en el ranking del gabinete: subió o bajó lugares.
- Prensa: total de menciones vs periodo previo y cómo se movió el tono (más/menos negativas).
- Cuando aplique: la red que más creció y la que se cayó.

Las frases se ordenan por relevancia (mayor cambio porcentual primero) y solo aparecen las que tienen dato en ambos periodos; si no hay periodo previo, el bloque dice "primer corte con datos comparables".

Se calcula el mismo bloque para comunicación institucional y para la del titular, respetando el enfoque elegido.

## 2. "Qué hacer ahora" (recomendaciones con IA)

Un bloque al final del PDF con 3 a 5 recomendaciones accionables, cada una en una línea de acción y una de sustento ("porque…"), redactadas para servidores públicos, sin tecnicismos.

La IA recibe únicamente datos reales del corte: los cambios del bloque anterior, las mejores publicaciones, los ejes narrativos detectados, el desempeño frente al gabinete y las menciones de prensa del periodo (medio, titular, tono, extracto). Reglas: nada de inventar cifras ni eventos; no usar lenguaje de crisis salvo que haya menciones negativas concretas; toda recomendación cita el dato que la origina.

En el Centro de Descargas se agrega un interruptor **Incluir recomendaciones** (encendido por defecto) para poder bajar el reporte sin esperar a la IA.

## Longitud

El reporte sigue en dos cuartillas: "Lo que cambió" es un bloque compacto de viñetas y las recomendaciones sustituyen el espacio hoy ocupado por el listado largo de prensa, que se recorta a las 5 menciones más relevantes por tono.

## Detalles técnicos

- Nuevo `src/lib/dependenciaDeltas.ts`: recibe bloques actual/previo (ya se calculan en `buildDependenciaReport` vía `rankingDe`) y devuelve las frases tipadas. Se extiende la agregación para traer también engagement, publicaciones y ranking del periodo previo, no solo seguidores.
- Prensa del periodo previo: segunda llamada a `fetchMentions` con la ventana anterior en `PortalDescargas.tsx`.
- Nueva edge function `generate-dependencia-recommendations`: modelo `google/gemini-3.7-flash`, `response_format: json_object`, cachea por `client_id + dependencia + rango + enfoque` en una tabla nueva `client_portal_dep_recommendations` (con RLS y GRANTs), y se regenera con `force`.
- `DependenciaPdfTemplate.tsx` recibe dos props nuevas (`cambios`, `recomendaciones`) y las pinta con el mismo estilo de tarjetas ya existente; si vienen vacías, no se renderiza el bloque.
