import * as THREE from 'three';

const MM = 0.001; // el grupo se escala a metros; los parámetros en unidades de mundo van en m

const FINISH = {
  glossy: { roughness: 0.18, clearcoat: 1.0, clearcoatRoughness: 0.08 },
  mate: { roughness: 0.65, clearcoat: 0.0, clearcoatRoughness: 0.5 },
};

export function finishPreset(finish) {
  return FINISH[finish] ?? FINISH.glossy;
}

export function makeBodyMaterial(body) {
  return new THREE.MeshPhysicalMaterial({
    color: body.color,
    metalness: 0.0,
    envMapIntensity: 1.0,
    ...finishPreset(body.finish),
  });
}

export function makeChromeMaterial(ring) {
  return new THREE.MeshPhysicalMaterial({
    color: ring.color,
    metalness: ring.metalness,
    roughness: ring.roughness,
    envMapIntensity: 1.2,
  });
}

export function makeMouthpieceMaterial(mp) {
  if (!mp.translucent) {
    return new THREE.MeshPhysicalMaterial({ color: mp.color, roughness: 0.35, clearcoat: 0.6 });
  }
  return new THREE.MeshPhysicalMaterial({
    color: mp.color,
    roughness: 0.22,
    metalness: 0,
    transmission: mp.transmission,
    thickness: mp.thickness * MM,
    ior: 1.45,
    transparent: true,
    opacity: mp.opacity,
    attenuationColor: new THREE.Color(mp.color),
    attenuationDistance: 4 * MM,
    clearcoat: 0.4,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.0,
  });
}

/** Pantalla emisiva: la textura de canvas se usa como emissiveMap. */
export function makeScreenMaterial(screen, texture) {
  return new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.25,
    metalness: 0,
    emissive: 0xffffff,
    emissiveMap: texture,
    emissiveIntensity: screen.emissiveIntensity,
  });
}

export function makeBandMaterial(band) {
  return new THREE.MeshPhysicalMaterial({
    color: band.color,
    roughness: band.roughness,
    clearcoat: 0.3,
  });
}

/** La etiqueta hereda el acabado del cuerpo para que la capa se sienta impresa. */
export function makeLabelMaterial(body, texture, { metallic = false } = {}) {
  const preset = finishPreset(body.finish);
  return new THREE.MeshPhysicalMaterial({
    map: texture,
    color: 0xffffff,
    metalness: metallic ? 0.55 : 0,
    roughness: metallic ? Math.min(preset.roughness, 0.3) : preset.roughness,
    clearcoat: preset.clearcoat,
    clearcoatRoughness: preset.clearcoatRoughness,
    envMapIntensity: metallic ? 1.3 : 1.0,
  });
}

export function makeDarkPlasticMaterial(color = '#111111') {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.5, clearcoat: 0.2 });
}

/**
 * Material para piezas extra: material = 'plastic' | 'glossy' | 'mate' | 'metal' | 'chrome' | 'translucent' | 'rubber'.
 * emissive / emissiveIntensity opcionales (LEDs).
 */
export function makePartMaterial(p) {
  const color = p.color ?? '#111111';
  let m;
  switch (p.material) {
    case 'glossy':
    case 'mate':
      m = makeBodyMaterial({ color, finish: p.material });
      break;
    case 'metal':
      m = new THREE.MeshPhysicalMaterial({ color, metalness: p.metalness ?? 1, roughness: p.roughness ?? 0.35, envMapIntensity: 1.1 });
      break;
    case 'chrome':
      m = makeChromeMaterial({ color, metalness: 1, roughness: p.roughness ?? 0.08 });
      break;
    case 'translucent':
      m = makeMouthpieceMaterial({ color, translucent: true, transmission: p.transmission ?? 0.7, opacity: p.opacity ?? 0.9, thickness: p.thickness ?? 2 });
      break;
    case 'rubber':
      m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.85 });
      break;
    default:
      m = new THREE.MeshPhysicalMaterial({ color, roughness: p.roughness ?? 0.45, clearcoat: p.clearcoat ?? 0.3, metalness: p.metalness ?? 0 });
  }
  if (p.emissive) {
    m.emissive = new THREE.Color(p.emissive);
    m.emissiveIntensity = p.emissiveIntensity ?? 1.5;
  }
  return m;
}
