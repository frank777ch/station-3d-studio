import * as THREE from 'three';
import { roundedPrism } from '../utils/roundedBox.js';
import { makeDarkPlasticMaterial } from '../materials.js';

/** Placa inferior (base del refill / conector). */
export function buildBase(cfg) {
  const b = cfg.body;
  const base = cfg.base;
  const geo = roundedPrism({
    width: b.width - 2 * base.inset,
    depth: b.depth - 2 * base.inset,
    height: base.height,
    cornerRadius: Math.max(0.5, b.cornerRadius - base.inset),
    edgeRadius: Math.min(0.5, base.height / 3),
  });
  const mesh = new THREE.Mesh(geo, makeDarkPlasticMaterial(base.color));
  mesh.name = 'base';
  mesh.position.y = 0;
  return mesh;
}
