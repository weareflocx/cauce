# Despliegue · CAUCE Herramientas

Sitio estático que agrupa las herramientas del sistema CAUCE en una sola URL:

| Ruta | Qué es |
|---|---|
| `/` | Portada con las herramientas (`hub/index.html`) |
| `/caz/` | CAZ, el motor generativo (este repo) |
| enlace externo | Cauce System (`https://caucesuystem.netlify.app/`) |

No hay backend, base de datos ni variables de entorno. Todo el sitio pesa menos de 100 KB.

## Opción A (recomendada): Netlify conectado al repo

Cada push a `main` se publica solo.

1. Netlify → **Add new site → Import an existing project → GitHub** → `weareflocx/cauce`.
2. Netlify lee `netlify.toml` del repo: build `npm run build:site`, carpeta `site`. No hay que tocar nada.
3. **Deploy**. Para el dominio propio: *Domain management → Add a domain*
   (por ejemplo `herramientas.cauce.xxx`) y un registro CNAME a `<sitio>.netlify.app`.

## Opción B: subir el zip a mano

1. Descomprime `cauce-herramientas.zip`.
2. Arrastra la carpeta a <https://app.netlify.com/drop>, o súbela a cualquier hosting estático
   (Vercel, Cloudflare Pages, S3, un servidor propio…). Tiene que servirse tal cual, con
   `index.html` en la raíz.

Con esta opción cada actualización es un zip nuevo; por eso recomiendo la A.

## Por qué Cauce System va enlazado y no dentro

Cauce System usa funciones de servidor de Netlify (su biblioteca de proyectos guarda datos
con Netlify Blobs) y sus rutas son absolutas desde la raíz. Meterlo en una subcarpeta rompería
las dos cosas. Sigue desplegado en su propio sitio de Netlify y la portada lo enlaza. Si más
adelante se quiere todo bajo el mismo dominio, lo limpio es darle un subdominio
(`system.<dominio>`) desde ese mismo sitio de Netlify.

## Añadir otra herramienta

En `hub/index.html`, añade una entrada al array `TOOLS`
(`name`, `url`, `desc`, `tags` y `external: true` si vive fuera de este sitio).

## Privacidad

El sitio lleva `noindex` (meta y cabecera `X-Robots-Tag`): no aparece en buscadores, pero
quien tenga la URL puede entrar. Si hay que cerrarlo, Netlify ofrece protección por contraseña
en *Site configuration → Access control* (según el plan).

## Local

```bash
npm install
npm run dev          # sólo CAZ, en http://localhost:5173
npm run build:site   # genera site/ (portada + CAZ) tal como se publica
```
