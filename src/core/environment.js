import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/**
 * Carga un HDR de estudio y lo convierte en envMap (PMREM).
 * Si el archivo no existe, usa RoomEnvironment para que el studio funcione igual.
 * @returns {Promise<{ source: 'hdr' | 'room' }>}
 */
export async function setupEnvironment(renderer, scene, { hdrUrl } = {}) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const url = hdrUrl ?? `${import.meta.env.BASE_URL}hdr/studio.hdr`;
  try {
    const hdr = await new RGBELoader().loadAsync(url);
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = pmrem.fromEquirectangular(hdr).texture;
    hdr.dispose();
    pmrem.dispose();
    return { source: 'hdr' };
  } catch (err) {
    console.warn(`[environment] No se pudo cargar ${url}. Usando RoomEnvironment.`, err?.message ?? err);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return { source: 'room' };
  }
}
