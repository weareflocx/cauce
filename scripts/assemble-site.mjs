// Ensambla el sitio agregador: portada (hub/) en la raíz y CAZ en /caz/.
// Salida: site/ — lista para Netlify, Vercel o cualquier hosting estático.
import { cp, readdir, stat } from 'node:fs/promises';

await cp('hub', 'site', { recursive: true });

const caz = await readdir('site/caz');
if (!caz.includes('index.html')) throw new Error('Falta site/caz/index.html — ¿falló el build de CAZ?');

let bytes = 0;
const walk = async (dir) => {
  for (const f of await readdir(dir)) {
    const p = `${dir}/${f}`;
    const s = await stat(p);
    if (s.isDirectory()) await walk(p); else bytes += s.size;
  }
};
await walk('site');
console.log(`site/ listo · ${(bytes / 1024).toFixed(0)} KB`);
