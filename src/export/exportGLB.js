import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { downloadBlob } from './download.js';

/** Exporta un objeto a .glb (binario) y lo descarga. Escala: metros. */
export function exportGLB(object, filename = 'vape.glb') {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      object,
      (result) => {
        downloadBlob(new Blob([result], { type: 'model/gltf-binary' }), filename);
        resolve();
      },
      (err) => {
        console.error('[exportGLB]', err);
        reject(err);
      },
      { binary: true, onlyVisible: true },
    );
  });
}
