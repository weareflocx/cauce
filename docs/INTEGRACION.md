# CAZ · Guía de integración

Para quien integre CAZ en el ecosistema de herramientas CAUCE, junto a
Cauce System y Guilloché. Resume la arquitectura, el contrato de datos y,
sobre todo, las decisiones que hay que tomar **antes** de unificar.

CAZ es una web app estática: Vite + TypeScript, sin dependencias de
runtime, sin backend, con el motor desacoplado de la interfaz. Se puede
integrar como página propia (como hoy en el hub) o importando el motor
como módulo.

## Estado

| | |
|---|---|
| Repo | `weareflocx/cauce`, rama `main` |
| Versión | 1.1.0 |
| Solo CAZ | `npm run build` → `dist/` |
| Hub + CAZ | `npm run build:site` → `site/` (~86 KB) |

Verificado el 24/09/2026: typecheck limpio, build reproducible (los
mismos hashes de assets que el build anterior), los cuatro modos
renderizan sin errores de consola y RETRATO procesa una foto de prueba.

## Arquitectura

```
src/
  main.ts            interfaz: panel, historial (deshacer), recetas guardadas
  prng.ts            splitmix32, el PRNG sembrado
  engine/            el motor — no importa nada de la interfaz
    params.ts        tipos, DEFAULTS, PRESETS, GAMAS, RANGES y coerceParams()
    field.ts         FlowEngine: campo de flujo y trama de PATRÓN
    noise.ts         simplex sembrado
    shape.ts         contenedores de FORMA (círculo, píldora, letra, path…)
    symbol.ts        arquetipos de SÍMBOLO, Möbius Flow incluido
    portrait.ts      RETRATO: foto → grabado de línea (canvas 2D)
    render-canvas.ts rasterizado
    export.ts        SVG, PNG, WebM, GIF y receta JSON
    gif.ts           encoder GIF89a propio
```

La dependencia va en un solo sentido: `main.ts` → `engine/`. Ningún
módulo del motor importa la interfaz.

### API pública del motor

| Módulo | Exporta |
|---|---|
| `params.ts` | `TornoParams`, `Mode`, `DEFAULTS`, `PRESETS`, `GAMAS`, `RANGES`, `coerceParams`, `lienzoDims` |
| `field.ts` | `FlowEngine`, `segmentLine`, `lineToPath`, `FADE_WIDTHS` |
| `symbol.ts` | `buildSymbol`, `drawSymbolFrame` |
| `portrait.ts` | `renderPortrait`, `renderPortraitTo`, `portraitLayout`, `portraitInk` |
| `shape.ts` | `shapePath` |
| `export.ts` | `svgString`, `exportSVG`, `exportPNG`, `exportWebM`, `exportGIF`, `presetJSON` |

`TornoParams` es un nombre heredado de cuando la herramienta se llamaba
TORNO; es el tipo de la receta.

### Acoplamiento con el DOM

- **Canvas offscreen.** `render-canvas`, `portrait` y `export` crean
  canvas con `document.createElement('canvas')`. Inocuo en el navegador;
  para moverlo a un Web Worker habría que pasar a `OffscreenCanvas`.
- **Las exportaciones descargan solas.** `exportSVG`, `exportPNG`,
  `exportWebM` y `exportGIF` crean un `<a>` y lo pulsan, y `exportWebM`
  añade un canvas a `document.body`. En un ecosistema conviene que
  devuelvan un `Blob` y que el anfitrión decida qué hacer (descargar,
  guardarlo en una biblioteca compartida…). `svgString()` ya devuelve el
  SVG como texto: es el patrón a extender al resto.

## La receta JSON: el contrato de datos

La receta es el estado completo de una pieza. Es lo que hay que conservar
en cualquier biblioteca o API común.

- **Plana y completa**, unas 70 claves: modo, colores, lienzo y los
  parámetros de *todos* los modos. Una receta de SÍMBOLO lleva también los
  de RETRATO (`retrato*`), los de la segunda capa (`symB*`), etc.
- **Determinista**: misma receta, misma pieza, siempre (splitmix32 +
  simplex sembrado con `semilla`).
- **`coerceParams()` normaliza y valida** cualquier receta de entrada,
  rellenando lo que falte con `DEFAULTS`. Úsala en toda frontera: importar,
  API, biblioteca compartida.
- **Lleva la marca de esquema `"_caz": "v0"`** (ver decisiones pendientes).

```json
{
  "_caz": "v0",
  "mode": "symbol",
  "caudal": 120, "cauce": 55, "corriente": 28, "semilla": 2049,
  "symTipo": "espira", "symLineas": 11, "symFade": 34,
  "symCirculacion": 1, "symRespiracion": 6,
  "colorFondo": "#F0F6F5", "colorTinta": "#262929", "colorDeriva": "#FBFD9D",
  "lienzo": "1080x1080"
}
```
*(Extracto del preset Torrente, la receta base del logo.)*

## El hub actual

- `hub/index.html` es la portada. Añadir una herramienta es añadir una
  entrada al array `TOOLS` (`name`, `url`, `desc`, `tags`, `external`).
- `npm run build:site` compila CAZ en `site/caz/` y copia la portada a
  `site/`. `netlify.toml` publica `site/` con `noindex`.
- **Cauce System va enlazado fuera**: usa Netlify Functions + Blobs y
  rutas absolutas desde la raíz, así que no puede vivir en una subcarpeta.
- **Guilloché todavía no está en el hub.**

Detalle de despliegue en [`DESPLIEGUE.md`](DESPLIEGUE.md).

## Las tres herramientas

| | CAZ | Cauce System | Guilloché |
|---|---|---|---|
| Repo | `weareflocx/cauce` | `weareflocx/coucesystem` | `weareflocx/guilloche` |
| Qué hace | Genera el lenguaje de línea: patrón, retrato, forma y símbolo | Estudio de campos de flujo y Möbius Flow 3D, con vídeo | Aplica grabado guilloché a fotos y vídeos existentes |
| Stack | Vite + TS, sin dependencias | Canvas 2D, Three.js y WebGPU | Vite + JS, Canvas 2D (guía propia en su `docs/INTEGRACION.md`) |
| Backend | Ninguno | Netlify Functions + Blobs | Ninguno |
| Despliegue | Hub en Netlify, `/caz/` | Netlify propio | Artifact de claude.ai |
| Guardado | Recetas en `localStorage` | Biblioteca en Netlify Blobs | Presets compartidos en el artifact; `localStorage` fuera |
| Formato | Receta JSON (`_caz: v0`) | Proyectos de su biblioteca | Preset `{name, patternId, params, colors}` |
| Paleta | Tinta `#262929`, papel `#F0F6F5`, lima `#FBFD9D`, bruma `#C2CFCF` | Crema `#F4F3EE`, `#11110F`, `#8ECFC2`… | La de CAZ, con sus 14 gamas (desde la v0.2) |

## Decisiones pendientes antes de integrar

Ninguna es técnica en sentido estricto: requieren una decisión de marca o
de producto, así que conviene cerrarlas con Sergio antes de escribir
código común.

1. **Paleta canónica.** Guilloché adoptó la paleta y el sistema visual de
   CAZ el 24/09/2026; Cauce System sigue con la suya, sin colores en
   común. Las gamas de CAZ ya están duplicadas en Guilloché: lo natural
   es extraerlas a un paquete compartido de tokens que consuman las tres.
   Queda por confirmar qué papel juegan las variables del archivo de
   Figma CAUCE — WORK, que definen otra paleta.
2. **Versión del esquema de receta.** La receta dice `"_caz": "v0"`
   mientras la app va por la 1.1.0. Hay recetas guardadas en el brandbook,
   así que no se debe cambiar a la ligera: o se documenta como versión de
   esquema independiente (y se deja en v0), o se sube con una migración
   dentro de `coerceParams()`.
3. **Möbius Flow está duplicado.** CAZ lo portó de Cauce System (commit
   `d3e6a53`) y desde entonces son dos copias del mismo modelo que pueden
   divergir. Es el primer candidato a módulo compartido.
4. **Guilloché dentro o fuera del hub.** Sus presets compartidos dependen
   de que el artifact se republique a sí mismo; fuera del artifact caen a
   `localStorage`. Meterlo en el hub obliga a decidir dónde viven esos
   presets (Netlify Blobs, como Cauce System, sería lo coherente).
5. **Subdominio de Cauce System.** El sitio real es
   `caucesuystem.netlify.app`, con errata en el nombre. El enlace funciona;
   renombrarlo obliga a actualizar `hub/index.html` y `DESPLIEGUE.md`.

## Problemas conocidos

1. **Puntos oscuros en el Möbius (preset Torrente, base del logo).** Con
   PROFUNDIDAD > 0, cada línea se trocea en rachas por nivel de
   profundidad (hasta 23 por línea) y cada racha tiene su propia
   transparencia. En cada transición, los remates redondos de dos rachas
   se solapan y el alfa se duplica: aparece un punto. El commit `3c9adf1`
   redujo las transiciones pero no las eliminó, y Möbius Flow 1.1 las
   multiplicó. Con PROFUNDIDAD 0 desaparecen (un solo trazo opaco).
   Arreglos posibles en `symbol.ts`:
   - remate plano (`butt`) en las juntas internas y redondo solo en los
     extremos reales de la banda — conserva la transparencia del export;
   - colores ya mezclados sobre el fondo en vez de alfa — elimina los
     puntos del todo, pero el export deja de ser transparente.
2. **El WebM se alarga si la pestaña pasa a segundo plano** durante la
   grabación: `MediaRecorder` graba en tiempo real y el navegador ralentiza
   el reloj. En primer plano es exacto.
3. **RETRATO muestrea a 2000 px como máximo.** WebGL levantaría el límite.

## Arrancar

```bash
git clone https://github.com/weareflocx/cauce.git
cd cauce
npm install
npm run dev          # CAZ en http://localhost:5173
npm run build:site   # site/ tal como se publica
```
