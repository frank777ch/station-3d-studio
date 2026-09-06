import * as THREE from 'three';
import { roundedPrism } from '../utils/roundedBox.js';
import { makeChromeMaterial } from '../materials.js';

export function buildFrameRing(cfg, L) {
  const r = cfg.frameRing;
  const b = cfg.body;
  const geo = roundedPrism({
    width: b.width + 2 * r.inset,
    depth: b.depth + 2 * r.inset,
    height: r.height,
    cornerRadius: b.cornerRadius + r.inset,
    edgeRadius: Math.min(0.5, r.height / 2),
  });
  const mesh = new THREE.Mesh(geo, makeChromeMaterial(r));
  mesh.name = 'frameRing';
  mesh.position.y = L.ringY;
  return mesh;
}
