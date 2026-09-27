import * as THREE from 'three';
import { roundedPrism, roundedPlane, loftGeometry, shapeSection, chamferRectShape, shapePlane } from '../utils/roundedBox.js';
import { makePartMaterial, makeScreenMaterial } from '../materials.js';
import { makeScreenTexture } from '../textures/makeScreen.js';

const DEG = Math.PI / 180;

/**
 * Piezas extra de un modelo (módulos, diales, perillas, botones, puertos, contactos, pantallas...).
 * Cada pieza: { type, x, y, z, rotation: [rx, ry, rz] (grados), material, color, ... }
 *   y se mide desde la base del cuerpo; x, y, z son el CENTRO de la pieza (mm).
 *   type 'box':      width, height, depth, cornerRadius, edgeRadius (+ profile / topRound... como el cuerpo)
 *   type 'cylinder': radius, length, axis ('x' | 'y' | 'z'), edgeRadius
 *   type 'screen':   width, height, cornerRadius | chamfer, screen: { template, data, emissiveIntensity }
 *                    (plano mirando a +z; se orienta con rotation)
 */
export function buildExtras(cfg, L, opts = {}) {
  const group = new THREE.Group();
  group.name = 'extras';
  const pending = [];
  cfg.extras.forEach((p, i) => {
    const mesh = buildPart(p, opts);
    if (!mesh) return;
    mesh.name = p.name ?? `extra-${i}`;
    mesh.position.set(p.x ?? 0, L.bodyY + (p.y ?? 0), p.z ?? 0);
    const [rx = 0, ry = 0, rz = 0] = p.rotation ?? [];
    mesh.rotation.set(rx * DEG, ry * DEG, rz * DEG);
    if (mesh.userData.ready) pending.push(mesh.userData.ready);
    group.add(mesh);
  });
  group.userData.ready = Promise.all(pending);
  return group;
}

function buildPart(p) {
  if (p.type === 'screen') return buildScreen(p);
  let geo;
  if (p.type === 'cylinder') {
    const r = p.radius ?? 3;
    const len = p.length ?? 2;
    geo = roundedPrism({ width: 2 * r, depth: 2 * r, height: len, cornerRadius: r, edgeRadius: p.edgeRadius ?? Math.min(0.5, len / 3), curveSegments: 32 });
    geo.translate(0, -len / 2, 0);
    if (p.axis === 'z') geo.rotateX(Math.PI / 2);
    else if (p.axis === 'x') geo.rotateZ(Math.PI / 2);
  } else {
    const w = p.width ?? 5;
    const h = p.height ?? 5;
    const d = p.depth ?? 5;
    const cr = p.cornerRadius ?? Math.min(1, w / 2, d / 2);
    if (p.profile || p.topRound || p.topChamfer || p.bottomRound || p.bottomChamfer) {
      const shape = shapeSection({ ...p, width: w, depth: d, height: h, cornerRadius: cr });
      geo = loftGeometry({ height: h, section: shape.section, samples: shape.samples, rings: 16, edgeTop: p.edgeRadius ?? 0.4, edgeBottom: p.edgeRadius ?? 0.4 });
    } else {
      geo = roundedPrism({ width: w, depth: d, height: h, cornerRadius: cr, edgeRadius: p.edgeRadius ?? Math.min(0.4, h / 3) });
    }
    geo.translate(0, -h / 2, 0);
  }
  return new THREE.Mesh(geo, makePartMaterial(p));
}

function buildScreen(p) {
  const s = { mode: 'procedural', image: null, emissiveIntensity: 1.5, template: 'percent', data: {}, ...(p.screen ?? {}) };
  s.data = { battery: 99, liquid: 99, level: 3, boost: false, iceBoost: false, accent: '#37d67a', flavor: '', ...(s.data ?? {}) };
  const w = p.width ?? 10;
  const h = p.height ?? 10;
  const { texture, ready } = makeScreenTexture(s, { aspect: h / w });
  const geo = p.chamfer > 0 ? shapePlane(chamferRectShape(w, h, p.chamfer), w, h) : roundedPlane(w, h, p.cornerRadius ?? 0.5, 32);
  const mat = makeScreenMaterial(s, texture);
  if (s.transparent) {
    mat.transparent = true;
    mat.alphaMap = texture;
    mat.depthWrite = false;
  }
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.ready = ready;
  return mesh;
}
