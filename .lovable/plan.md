# Portal Guanajuato: lógica dependencia–titular

## Recomendación de navegación

Vista única por **dependencia** con filtro de tipo de cuenta (Institucional / Titular / Ambas sumadas). Es lo que mejor encaja con la lógica secretaría–funcionario: cada tarjeta es una Secretaría con su cuenta oficial y la de su titular juntas, y el filtro permite responder tanto "¿qué dependencia comunica mejor?" como "¿el titular carga o no la comunicación de su área?". Las sub-pestañas Funcionarios / Instituciones dejan de ser eje de navegación y pasan a ser ese filtro.

Comparación entre pares: no hay marca "propia". Todo se compara contra el promedio del gabinete y contra el propio historial de cada dependencia.

## Qué se construye

### 1. Catálogo de dependencias (normalización)

Nueva tabla de gabinete con: nombre oficial, nombre corto, tipo (Secretaría / Subsecretaría / Instituto / Organismo), titular, cargo y orden. Se siembra con el directorio que enviaste, de Secretaría de Gobierno (Jorge Daniel Jiménez Lona) hasta Procuraduría Ambiental y de Ordenamiento Territorial (Karina Padilla Ávila).

### 2. Vinculación de los perfiles existentes

Hoy hay 216 perfiles de benchmark de Guanajuato (101 funcionarios, 115 instituciones), repetidos por red y con nombres inconsistentes ("Agua Gto", "Agua y Medio Ambiente", "aguagente"). Se agrega a cada perfil un vínculo a su dependencia y un tipo de cuenta (institucional / titular), con mapeo automático por nombre y alias; lo que no haga match se resuelve a mano.

Pantalla nueva en el admin: **Directorio**, con las dependencias, sus titulares y los perfiles de redes asignados. Permite reasignar perfiles sin match y actualizar titulares cuando cambie el gabinete.

### 3. Benchmark rediseñado

- **Ranking por dependencia**: una fila por dependencia con métricas sumadas de todos sus perfiles (todas las redes o la red seleccionada), no una fila por perfil suelto.
- Filtro de tipo de cuenta: Institucional / Titular / Ambas.
- **Ficha de dependencia**: titular, cuentas por red, evolución mes a mes, posición frente al promedio del gabinete, mejores publicaciones y narrativas detectadas.
- **Insights de gabinete**: quién sube y quién baja, dependencias sin presencia en alguna red, y brecha institucional vs. titular (dónde el titular concentra la conversación y dónde la cuenta oficial va sola).

### 4. Prensa por dependencia

Las menciones de prensa se agrupan con el mismo catálogo: una mención al titular suma a su dependencia. En la ficha se ven prensa y redes juntas, y en Panorama se agrega un ranking de dependencias por menciones con tono.

## Detalles técnicos

- Migración: tabla de catálogo de gabinete (con GRANTs y RLS: admin gestiona, usuarios con acceso al cliente leen) + columnas `dependencia_id` y `account_type` en `client_portal_benchmark_competitors`.
- Mapeo automático por normalización de texto reutilizando el enfoque de `src/lib/entityNames.ts` (sin acentos, tokens, alias por handle).
- `PortalBenchmark.tsx` deja de usar `scope` como eje y agrupa por dependencia; el `scope` actual se conserva en datos.
- `PortalHome.tsx`: sub-pestañas de Benchmark reemplazadas por la vista única con filtros.
- Prensa: resolución entidad → dependencia en la agregación de `PortalAnalysis` usando el catálogo.

## Orden de trabajo

1. Catálogo + migración + siembra del directorio.
2. Mapeo automático de los 216 perfiles y pantalla de Directorio en el admin.
3. Rediseño de Benchmark por dependencia.
4. Cruce con prensa.