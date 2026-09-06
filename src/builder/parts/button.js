import * as THREE from 'three';
import { roundedPrism } from '../utils/roundedBox.js';
import { makeDarkPlasticMaterial } from '../materials.js';

export function buildButton(cfg, L) {
  const bt = cfg.button;
  const b = cfg.body;
  const thickness = 1.2;
  const protrude = 0.6;
  const isSide = bt.side === 'left' || bt.side === 'right';

  const geo = roundedPrism({
    width: isSide ? thickness + protrude : bt.width,
    depth: isSide ? bt.width : thickness + protrude,
    height: bt.height,
    cornerRadius: Math.min(bt.width / 2, 2),
    edgeRadius: 0.4,
  });
  const mesh = new THREE.Mesh(geo, makeDarkPlasticMaterial(bt.color));
  mesh.name = 'button';
  mesh.position.y = L.bodyY + bt.offsetY;
  if (bt.side === 'right') mesh.position.x = b.width / 2 - thickness / 2;
  else if (bt.side === 'left') mesh.position.x = -(b.width / 2 - thickness / 2);
  else mesh.position.z = b.depth / 2 - thickness / 2;
  return mesh;
}
