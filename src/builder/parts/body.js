import * as THREE from 'three';
import { roundedPrism, hollowPrism, loftGeometry, shapeSection, isLoftShape } from '../utils/roundedBox.js';
import { makeBodyMaterial, makeDarkPlasticMaterial, makeLabelMaterial } from '../materials.js';
import { makeLabelTexture } from '../textures/makeLabel.js';

export function buildBody(cfg, L, { anisotropy } = {}) {
  const b = cfg.body;
  if (cfg.cavity.enabled) return buildHollowBody(cfg, L);
  if (isLoftShape(b)) return buildLoftBody(cfg, L, { anisotropy });
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

/**
 * Cuerpo con silueta (hombros, chaflanes, perfil) y la etiqueta impresa directamente sobre él.
 * En este modo la etiqueta cubre todo el alto del cuerpo (label.coverage / offsetY no se usan).
 */
function buildLoftBody(cfg, L, { anisotropy } = {}) {
  const b = cfg.body;
  const shape = shapeSection({ ...b });
  const geo = loftGeometry({
    height: b.height,
    section: shape.section,
    samples: shape.samples,
    rings: 48,
    edgeTop: b.edgeRadius,
    edgeBottom: b.edgeRadiusBottom ?? b.edgeRadius,
  });
  let side = makeBodyMaterial(b);
  let ready = Promise.resolve();
  if (cfg.label.enabled) {
    const tex = makeLabelTexture(cfg.label, {
      aspect: b.height / shape.perimeter,
      frontFraction: shape.frontFraction,
      sideFraction: shape.sideFraction,
      anisotropy,
    });
    const metallic = ['wave', 'one'].includes(cfg.label.template) && cfg.label.metallic;
    side = makeLabelMaterial(b, tex.texture, { metallic });
    ready = tex.ready;
  }
  const bottom = makeBodyMaterial({ ...b, color: b.bottomColor ?? b.color });
  const top = makeBodyMaterial({ ...b, color: b.topColor ?? b.color });
  const mesh = new THREE.Mesh(geo, [side, bottom, top]);
  mesh.name = 'body';
  mesh.position.y = L.bodyY;
  mesh.userData.ready = ready;
  return mesh;
}
