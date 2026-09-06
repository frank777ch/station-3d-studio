import * as THREE from 'three';
import { sleeveGeometry } from '../utils/roundedBox.js';
import { makeLabelMaterial } from '../materials.js';
import { makeLabelTexture } from '../textures/makeLabel.js';

export function buildLabel(cfg, L, { anisotropy } = {}) {
  const b = cfg.body;
  const geo = sleeveGeometry({
    width: b.width,
    depth: b.depth,
    cornerRadius: b.cornerRadius,
    y0: L.labelY0,
    y1: L.labelY1,
    offset: 0.2,
  });
  const aspect = (L.labelY1 - L.labelY0) / geo.userData.perimeter;
  const { texture, ready } = makeLabelTexture(cfg.label, {
    aspect,
    frontFraction: geo.userData.frontFraction,
    sideFraction: geo.userData.sideFraction,
    anisotropy,
  });
  const metallic = cfg.label.template === 'wave' && cfg.label.metallic;
  const mesh = new THREE.Mesh(geo, makeLabelMaterial(b, texture, { metallic }));
  mesh.name = 'label';
  mesh.userData.ready = ready;
  return mesh;
}
