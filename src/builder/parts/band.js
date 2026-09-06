import * as THREE from 'three';
import { sleeveGeometry } from '../utils/roundedBox.js';
import { makeBandMaterial } from '../materials.js';

export function buildBand(cfg, L) {
  const b = cfg.body;
  const geo = sleeveGeometry({
    width: b.width,
    depth: b.depth,
    cornerRadius: b.cornerRadius,
    y0: L.bodyY + Math.max(b.edgeRadius, 0.3),
    y1: L.bodyY + cfg.band.height,
    offset: 0.35,
  });
  const mesh = new THREE.Mesh(geo, makeBandMaterial(cfg.band));
  mesh.name = 'band';
  return mesh;
}
