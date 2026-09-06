// Descarga un HDR de estudio (CC0, Poly Haven) a public/hdr/studio.hdr
import { writeFile, mkdir } from 'node:fs/promises';

const HDR_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr';
const OUT = new URL('../public/hdr/studio.hdr', import.meta.url);

const res = await fetch(HDR_URL);
if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${HDR_URL}`);
await mkdir(new URL('../public/hdr/', import.meta.url), { recursive: true });
await writeFile(OUT, Buffer.from(await res.arrayBuffer()));
console.log('HDR guardado en public/hdr/studio.hdr');
