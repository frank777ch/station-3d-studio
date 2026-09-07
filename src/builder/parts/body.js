import * as THREE from 'three';
import { roundedPrism, hollowPrism } from '../utils/roundedBox.js';
import { makeBodyMaterial, makeDarkPlasticMaterial } from '../materials.js';

export function buildBody(cfg, L) {
  const b = cfg.body;
  if (cfg.cavity.enabled) return buildHollowBody(cfg, L);
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

/** Cuerpo hueco (carcasa de batería): pared, boca inclinada y fondo interior. */
function buildHollowBody(cfg, L) {
  const b = cfg.body;
  const cv = cfg.cavity;
  const group = new THREE.Group();
  group.name = 'body';

  const shell = new THREE.Mesh(
    hollowPrism({ width: b.width, depth: b.depth, height: b.height, cornerRadius: b.cornerRadius, wall: cv.wall, topSlope: b.topSlope }),
    makeBodyMaterial(b),
  );
  shell.material.side = THREE.DoubleSide;
  shell.name = 'shell';
  shell.position.y = L.bodyY;
  group.add(shell);

  const floor = new THREE.Mesh(
    roundedPrism({
      width: b.width - 2 * cv.wall + 0.2,
      depth: b.depth - 2 * cv.wall + 0.2,
      height: Math.max(0.5, cv.floorY),
      cornerRadius: Math.max(0.5, b.cornerRadius - cv.wall),
      edgeRadius: 0,
    }),
    makeDarkPlasticMaterial(cv.color),
  );
  floor.name = 'cavityFloor';
  floor.position.y = L.bodyY;
  group.add(floor);
  return group;
}
