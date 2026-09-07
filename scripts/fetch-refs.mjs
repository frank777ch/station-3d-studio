// Descarga imágenes de referencia a products/<producto>/references/
// Uso: node scripts/fetch-refs.mjs <carpeta-destino> <url> [url...]
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const [dest, ...urls] = process.argv.slice(2);
if (!dest || !urls.length) { console.error('uso: fetch-refs.mjs <destino> <url...>'); process.exit(1); }
await mkdir(dest, { recursive: true });
for (const url of urls) {
  const name = path.basename(new URL(url).pathname).toLowerCase();
  const res = await fetch(url);
  if (!res.ok) { console.error('fallo', res.status, url); continue; }
  await writeFile(path.join(dest, name), Buffer.from(await res.arrayBuffer()));
  console.log('ok', name);
}
