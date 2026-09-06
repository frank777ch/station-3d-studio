import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

/** Rectángulo redondeado centrado en el origen, en el plano XY del Shape. */
export function roundedRectShape(width, depth, radius) {
  const w = width / 2;
  const d = depth / 2;
  const r = Math.max(0.01, Math.min(radius, w, d));
  const s = new THREE.Shape();
  s.moveTo(-w + r, -d);
  s.lineTo(w - r, -d);
  s.absarc(w - r, -d + r, r, -Math.PI / 2, 0, false);
  s.lineTo(w, d - r);
  s.absarc(w - r, d - r, r, 0, Math.PI / 2, false);
  s.lineTo(-w + r, d);
  s.absarc(-w + r, d - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-w, -d + r);
  s.absarc(-w + r, -d + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/**
 * Prisma con sección de rectángulo redondeado (cornerRadius) y cantos
 * superior/inferior redondeados (edgeRadius). Eje vertical = Y, base en y = 0.
 * Todas las medidas en las unidades del config (mm).
 */
export function roundedPrism({
  width,
  depth,
  height,
  cornerRadius = 0,
  edgeRadius = 0,
  curveSegments = 16,
  bevelSegments = 6,
}) {
  const e = Math.max(0, Math.min(edgeRadius, height / 2 - 0.01, cornerRadius));
  const shape = roundedRectShape(width - 2 * e, depth - 2 * e, cornerRadius - e);

  let geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(height - 2 * e, 0.01),
    bevelEnabled: e > 0,
    bevelThickness: e,
    bevelSize: e,
    bevelOffset: 0,
    bevelSegments,
    curveSegments,
  });

  // Normales suaves: ExtrudeGeometry es no indexada (flat). Fusionamos vértices.
  geo.deleteAttribute('normal');
  geo.deleteAttribute('uv');
  geo = mergeVertices(geo, 1e-4);
  geo.rotateX(-Math.PI / 2); // extrusión en Z -> eje Y
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Estrecha un prisma hacia arriba (para boquillas tipo "duckbill").
 * taperX / taperZ: fracción de reducción en la parte superior (0..1).
 */
export function taperGeometry(geo, { taperX = 0, taperZ = 0 } = {}) {
  geo.computeBoundingBox();
  const h = geo.boundingBox.max.y - geo.boundingBox.min.y;
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) - geo.boundingBox.min.y) / h;
    pos.setX(i, pos.getX(i) * (1 - taperX * t));
    pos.setZ(i, pos.getZ(i) * (1 - taperZ * t));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  return geo;
}

/** Puntos del perímetro (x, z) de un rectángulo redondeado, empezando en el centro trasero. */
function perimeterPoints(halfW, halfD, r, seg) {
  const pts = [];
  const push = (x, z) => {
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(last[0] - x, last[1] - z) > 1e-6) pts.push([x, z]);
  };
  const arc = (cx, cz, a0, a1) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + ((a1 - a0) * i) / seg;
      push(cx + r * Math.cos(a), cz + r * Math.sin(a));
    }
  };
  push(0, -halfD);
  push(-halfW + r, -halfD);
  arc(-halfW + r, -halfD + r, -Math.PI / 2, -Math.PI);
  push(-halfW, halfD - r);
  arc(-halfW + r, halfD - r, Math.PI, Math.PI / 2);
  push(halfW - r, halfD);
  arc(halfW - r, halfD - r, Math.PI / 2, 0);
  push(halfW, -halfD + r);
  arc(halfW - r, -halfD + r, 0, -Math.PI / 2);
  push(0, -halfD);
  return pts;
}

/**
 * "Manga" (sleeve) que envuelve un prisma entre y0 e y1, con UVs limpias:
 * u recorre el perímetro (centro frontal en u = 0.5), v va de y0 (0) a y1 (1).
 * Se usa para la etiqueta y la banda. `offset` la separa del cuerpo (evita z-fighting).
 */
export function sleeveGeometry({ width, depth, cornerRadius, y0, y1, offset = 0.25, segmentsPerCorner = 14 }) {
  const halfW = width / 2 + offset;
  const halfD = depth / 2 + offset;
  const r = Math.max(0.01, Math.min(cornerRadius + offset, halfW, halfD));
  const pts = perimeterPoints(halfW, halfD, r, segmentsPerCorner);
  const n = pts.length;

  const lengths = [0];
  for (let i = 1; i < n; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const total = lengths[n - 1];

  const positions = new Float32Array(n * 2 * 3);
  const normals = new Float32Array(n * 2 * 3);
  const uvs = new Float32Array(n * 2 * 2);
  const indices = [];

  for (let i = 0; i < n; i++) {
    const [x, z] = pts[i];
    const prev = pts[i === 0 ? n - 2 : i - 1];
    const next = pts[i === n - 1 ? 1 : i + 1];
    let tx = next[0] - prev[0];
    let tz = next[1] - prev[1];
    const len = Math.hypot(tx, tz) || 1;
    tx /= len;
    tz /= len;
    const nx = -tz;
    const nz = tx;
    const u = lengths[i] / total;
    for (let k = 0; k < 2; k++) {
      const v = 2 * i + k;
      positions.set([x, k === 0 ? y0 : y1, z], v * 3);
      normals.set([nx, 0, nz], v * 3);
      uvs.set([u, k], v * 2);
    }
    if (i < n - 1) {
      const bl = 2 * i, tl = 2 * i + 1, br = 2 * i + 2, tr = 2 * i + 3;
      indices.push(bl, br, tl, tl, br, tr);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.userData.perimeter = total;
  geo.userData.frontFraction = width / total; // fracción de u que ocupa la cara frontal
  geo.userData.sideFraction = depth / total;  // fracción de u que ocupa cada cara lateral
  return geo;
}

/** Plano con forma de rectángulo redondeado y UVs normalizadas 0..1 (para la pantalla). */
export function roundedPlane(width, height, radius, curveSegments = 12) {
  const geo = new THREE.ShapeGeometry(roundedRectShape(width, height, radius), curveSegments);
  const uv = geo.attributes.uv;
  const pos = geo.attributes.position;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, pos.getX(i) / width + 0.5, pos.getY(i) / height + 0.5);
  }
  uv.needsUpdate = true;
  return geo;
}

/**
 * Tapa abovedada (domo) con sección de rectángulo redondeado. Un aro recto de
 * altura `rim` y encima un perfil que se estrecha de forma distinta en cada eje:
 *  - eje X (vista frontal): arco elíptico hasta una meseta de ancho `topX`.
 *  - eje Z (vista de perfil): se estrecha hasta una cresta de grosor `topZ`.
 *    El hundido se concentra en la parte baja: `pinch` (0..1) es qué parte del
 *    estrechamiento ocurre en la curva inferior (0 = recto) y `bendHeight` a qué
 *    altura (fracción del domo) termina esa curva; de ahí arriba sube casi recto.
 * Base en y = 0. Se usa para la boquilla tipo 'dome'.
 */
export function domeGeometry({
  width,
  depth,
  cornerRadius,
  height,
  rim = 1.5,
  topX = 0.3,
  topZ = 0.22,
  pinch = 0.55,
  bendHeight = 0.35,
  rings = 24,
  segmentsPerCorner = 10,
}) {
  const halfW = width / 2;
  const halfD = depth / 2;
  const r = Math.max(0.01, Math.min(cornerRadius, halfW, halfD));
  const pts = perimeterPoints(halfW, halfD, r, segmentsPerCorner);
  const n = pts.length;

  const levels = [{ y: 0, sx: 1, sz: 1 }];
  if (rim > 0) levels.push({ y: rim, sx: 1, sz: 1 });
  const domeH = Math.max(height - rim, 0.1);
  for (let i = 1; i <= rings; i++) {
    const t = i / rings;
    const sx = topX + (1 - topX) * Math.sqrt(1 - t * t);
    const p = 1.4 / Math.max(0.05, bendHeight);
    const bend = 1 - Math.pow(1 - t, p); // sube rápido hasta ~1 dentro de bendHeight
    const f = 1 - pinch * bend - (1 - pinch) * t; // 1 en la base, 0 en la cresta
    const sz = topZ + (1 - topZ) * f;
    levels.push({ y: rim + domeH * t, sx, sz });
  }

  const positions = [];
  const uvs = [];
  const indices = [];
  levels.forEach(({ y, sx, sz }, li) => {
    pts.forEach(([x, z], i) => {
      positions.push(x * sx, y, z * sz);
      uvs.push(i / (n - 1), li / levels.length);
    });
  });
  for (let l = 0; l < levels.length - 1; l++) {
    for (let i = 0; i < n - 1; i++) {
      const a = l * n + i;
      const b = a + 1;
      const c = a + n;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }
  // Meseta superior
  const center = positions.length / 3;
  positions.push(0, height, 0);
  uvs.push(0.5, 1);
  const top = (levels.length - 1) * n;
  for (let i = 0; i < n - 1; i++) indices.push(top + i, top + i + 1, center);

  let geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo = mergeVertices(geo, 1e-4);
  geo.computeVertexNormals();
  return geo;
}
