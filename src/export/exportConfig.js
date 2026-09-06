import { downloadBlob } from './download.js';

/** Descarga el config actual como JSON, listo para copiarlo a src/models/. */
export function exportConfigJSON(config, filename = `${config.id}.json`) {
  const json = JSON.stringify(config, null, 2);
  downloadBlob(new Blob([json], { type: 'application/json' }), filename);
}

/** Abre un selector de archivo y devuelve el JSON parseado. */
export function importConfigJSON() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      try {
        resolve(JSON.parse(await file.text()));
      } catch (err) {
        reject(err);
      }
    };
    input.click();
  });
}
