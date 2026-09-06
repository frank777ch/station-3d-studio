import * as THREE from 'three';
import { roundedPrism } from '../utils/roundedBox.js';
import { makeBodyMaterial } from '../materials.js';

export function buildBody(cfg, L) {
  const b = cfg.body;
  const geo = roundedPrism({
    width: b.width,
    depth: b.depth,
    height: b.height,
    cornerRadius: b.cornerRadius,
    edgeRadius: b.edgeRadius,
  });
  const mesh = new THREE.Mesh(geo, makeBodyMaterial(b));
  mesh.name = 'body';
  mesh.position.y = L.bodyY;
  return mesh;
}
