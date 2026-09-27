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

/**
 * Prisma hueco (carcasa): pared de grosor `wall`, abierto arriba y abajo, con
 * la boca superior inclinada (`topSlope` = cuánto baja el borde frontal, mm).
 * Sección de rectángulo redondeado. Base en y = 0. Para la batería.
 */
export function hollowPrism({ width, depth, height, cornerRadius, wall = 1.5, topSlope = 0, curveSegments = 24 }) {
  const shape = roundedRectShape(width, depth, cornerRadius);
  const hole = roundedRectShape(width - 2 * wall, depth - 2 * wall, Math.max(0.5, cornerRadius - wall));
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments });
  geo.rotateX(-Math.PI / 2);
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
  if (topSlope > 0) {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const t = pos.getY(i) / height;
      const f = (pos.getZ(i) + depth / 2) / depth; // 0 atrás, 1 adelante
      pos.setY(i, pos.getY(i) - topSlope * t * f);
    }
    pos.needsUpdate = true;
  }
  geo.deleteAttribute('normal');
  geo.deleteAttribute('uv');
  geo.computeVertexNormals();
  return geo;
}

/**
 * Puntos de un anillo de rectángulo redondeado con estructura FIJA (misma cantidad de puntos
 * para cualquier tamaño), empezando en el centro trasero y recorriendo izquierda → frente →
 * derecha → atrás, igual que la manga: el centro frontal queda en u = 0.5.
 */
function ringPoints(halfW, halfD, r, seg) {
  r = Math.max(0.01, Math.min(r, halfW - 1e-4, halfD - 1e-4));
  const pts = [[0, -halfD]];
  const arc = (cx, cz, a0, a1) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + ((a1 - a0) * i) / seg;
      pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
    }
  };
  arc(-halfW + r, -halfD + r, -Math.PI / 2, -Math.PI);
  arc(-halfW + r, halfD - r, Math.PI, Math.PI / 2);
  pts.push([0, halfD]);
  arc(halfW - r, halfD - r, Math.PI / 2, 0);
  arc(halfW - r, -halfD + r, 0, -Math.PI / 2);
  pts.push([0, -halfD]);
  return pts;
}

/**
 * Sólido "loft": secciones de rectángulo redondeado apiladas en Y, cada una con su ancho,
 * grosor y radio (section(y) → { w, d, r }). Permite hombros, chaflanes y siluetas curvas.
 * Los cantos superior/inferior se redondean con edgeTop / edgeBottom (mm).
 * UVs de la cara lateral como la manga (u = perímetro con el frente en 0.5, v = y / height),
 * así la etiqueta se imprime directamente sobre la forma. Grupos: 0 = lateral, 1 = tapa inferior, 2 = tapa superior.
 * Base en y = 0.
 */
export function loftGeometry({
  height,
  section,
  samples = [],
  rings = 40,
  edgeTop = 0,
  edgeBottom = 0,
  edgeSegments = 6,
  segmentsPerCorner = 10,
  capTop = true,
  capBottom = true,
}) {
  const eT = Math.max(0, Math.min(edgeTop, height / 2 - 0.01));
  const eB = Math.max(0, Math.min(edgeBottom, height / 2 - 0.01));

  // niveles: canto inferior, cuerpo (muestreo uniforme + puntos del perfil), canto superior
  const levels = [];
  const push = (y, inset) => levels.push({ y, inset });
  if (eB > 0) for (let k = 0; k < edgeSegments; k++) {
    const phi = (k / edgeSegments) * (Math.PI / 2);
    push(eB - eB * Math.cos(phi), eB - eB * Math.sin(phi));
  }
  const ys = new Set();
  for (let i = 0; i <= rings; i++) ys.add(eB + ((height - eB - eT) * i) / rings);
  samples.forEach((y) => { if (y > eB && y < height - eT) ys.add(y); });
  [...ys].sort((a, b) => a - b).forEach((y) => push(y, 0));
  if (eT > 0) for (let k = 1; k <= edgeSegments; k++) {
    const phi = (k / edgeSegments) * (Math.PI / 2);
    push(height - eT + eT * Math.sin(phi), eT - eT * Math.cos(phi));
  }

  const positions = [];
  const uvs = [];
  const sideIdx = [];
  let n = 0;
  levels.forEach(({ y, inset }, li) => {
    const s = section(Math.min(height, Math.max(0, y)));
    const hw = Math.max(0.05, s.w / 2 - inset);
    const hd = Math.max(0.05, s.d / 2 - inset);
    const pts = ringPoints(hw, hd, Math.max(0.01, s.r - inset), segmentsPerCorner);
    n = pts.length;
    const lens = [0];
    for (let i = 1; i < n; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = lens[n - 1];
    pts.forEach(([x, z], i) => {
      positions.push(x, y, z);
      uvs.push(lens[i] / total, y / height);
    });
    levels[li].pts = pts;
  });
  for (let l = 0; l < levels.length - 1; l++) {
    for (let i = 0; i < n - 1; i++) {
      const a = l * n + i;
      const b = a + 1;
      const c = a + n;
      const d = c + 1;
      sideIdx.push(a, b, c, b, d, c);
    }
  }

  // tapas (vértices propios para que el canto quede definido)
  const capBottomIdx = [];
  const capTopIdx = [];
  const addCap = (level, up, capIdx) => {
    const base = positions.length / 3;
    level.pts.forEach(([x, z]) => {
      positions.push(x, level.y, z);
      uvs.push(0.5 + x / 200, 0.5 + z / 200);
    });
    const center = positions.length / 3;
    positions.push(0, level.y, 0);
    uvs.push(0.5, 0.5);
    for (let i = 0; i < n - 1; i++) {
      if (up) capIdx.push(base + i, base + i + 1, center);
      else capIdx.push(base + i, center, base + i + 1);
    }
  };
  if (capBottom) addCap(levels[0], false, capBottomIdx);
  if (capTop) addCap(levels[levels.length - 1], true, capTopIdx);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex([...sideIdx, ...capBottomIdx, ...capTopIdx]);
  geo.addGroup(0, sideIdx.length, 0);
  if (capBottomIdx.length) geo.addGroup(sideIdx.length, capBottomIdx.length, 1);
  if (capTopIdx.length) geo.addGroup(sideIdx.length + capBottomIdx.length, capTopIdx.length, 2);
  geo.computeVertexNormals();
  const top = levels[levels.length - 1];
  geo.userData.topY = top.y;
  return geo;
}

/** Interpola un perfil [[t, sx, sz], ...] (t de 0 a 1, ordenado) en t. */
export function sampleProfile(profile, t) {
  if (!profile || !profile.length) return [1, 1];
  if (t <= profile[0][0]) return [profile[0][1], profile[0][2] ?? profile[0][1]];
  for (let i = 1; i < profile.length; i++) {
    const [t1, x1, z1 = x1] = profile[i];
    if (t <= t1) {
      const [t0, x0, z0 = x0] = profile[i - 1];
      const k = (t - t0) / Math.max(1e-6, t1 - t0);
      return [x0 + (x1 - x0) * k, z0 + (z1 - z0) * k];
    }
  }
  const last = profile[profile.length - 1];
  return [last[1], last[2] ?? last[1]];
}

/** Rectángulo con esquinas achaflanadas (octógono), centrado. */
export function chamferRectShape(width, height, c) {
  const w = width / 2;
  const h = height / 2;
  c = Math.max(0, Math.min(c, w, h));
  const s = new THREE.Shape();
  s.moveTo(-w + c, -h);
  s.lineTo(w - c, -h);
  s.lineTo(w, -h + c);
  s.lineTo(w, h - c);
  s.lineTo(w - c, h);
  s.lineTo(-w + c, h);
  s.lineTo(-w, h - c);
  s.lineTo(-w, -h + c);
  s.closePath();
  return s;
}

/** Plano con UVs 0..1 a partir de un Shape centrado de tamaño width × height. */
export function shapePlane(shape, width, height, curveSegments = 12) {
  const geo = new THREE.ShapeGeometry(shape, curveSegments);
  const uv = geo.attributes.uv;
  const pos = geo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / width + 0.5, pos.getY(i) / height + 0.5);
  uv.needsUpdate = true;
  return geo;
}

/**
 * Función de sección para loftGeometry a partir de medidas y silueta:
 *   profile        [[t, sx, sz], ...] escala del ancho y grosor a lo largo de la altura (t = 0 base, 1 tope)
 *   topRound       radio (mm) de las esquinas superiores vistas de frente (redondeo del ancho)
 *   topChamfer     chaflán (mm) de las esquinas superiores vistas de frente
 *   bottomRound / bottomChamfer   lo mismo abajo
 *   topRoundDepth / bottomRoundDepth   redondeo vista de perfil (del grosor)
 * Devuelve { section, samples, perimeter, frontFraction, sideFraction }.
 */
export function shapeSection({
  width, depth, height, cornerRadius = 0, profile = null,
  topRound = 0, topChamfer = 0, bottomRound = 0, bottomChamfer = 0,
  topChamferX = null, bottomChamferX = null,
  topRoundDepth = 0, bottomRoundDepth = 0,
}) {
  const H = height;
  // chaflán: topChamfer = alto (mm) que ocupa; topChamferX = cuánto entra en horizontal (por defecto igual, 45°)
  const inset = (dist, R, type, X = R) => {
    if (!(R > 0) || dist >= R) return 0;
    const k = R - dist;
    return type === 'round' ? R - Math.sqrt(Math.max(0, R * R - k * k)) : (k * (X ?? R)) / R;
  };
  const section = (y) => {
    const [sx, sz] = sampleProfile(profile, y / H);
    let w = width * sx;
    let d = depth * sz;
    w -= 2 * (inset(H - y, topRound, 'round') + inset(H - y, topChamfer, 'chamfer', topChamferX)
      + inset(y, bottomRound, 'round') + inset(y, bottomChamfer, 'chamfer', bottomChamferX));
    d -= 2 * (inset(H - y, topRoundDepth, 'round') + inset(y, bottomRoundDepth, 'round'));
    w = Math.max(0.2, w);
    d = Math.max(0.2, d);
    const r = Math.min(cornerRadius * Math.min(sx, sz), w / 2, d / 2);
    return { w, d, r };
  };
  const samples = [];
  (profile ?? []).forEach(([t]) => samples.push(t * H));
  const dense = (from, to, n = 14) => { for (let i = 0; i <= n; i++) samples.push(from + ((to - from) * i) / n); };
  const topZ = Math.max(topRound, topChamfer, topRoundDepth);
  const botZ = Math.max(bottomRound, bottomChamfer, bottomRoundDepth);
  if (topZ > 0) dense(H - topZ, H);
  if (botZ > 0) dense(0, botZ);
  const r = Math.min(cornerRadius, width / 2, depth / 2);
  const perimeter = 2 * (width - 2 * r) + 2 * (depth - 2 * r) + 2 * Math.PI * r;
  return { section, samples, perimeter, frontFraction: width / perimeter, sideFraction: depth / perimeter };
}

/** ¿El cuerpo usa silueta (loft con etiqueta impresa) en vez de prisma + manga? */
export function isLoftShape(b) {
  return !!(b.loft || (b.profile && b.profile.length) || b.topRound || b.topChamfer || b.bottomRound
    || b.bottomChamfer || b.topRoundDepth || b.bottomRoundDepth);
}

/**
 * Contorno de cristal: rectángulo con esquinas achaflanadas y muescas trapezoidales centradas
 * arriba y abajo (el cuerpo entra en el cristal), como la pantalla del Rifbar MixPro.
 * notch = { top: ancho en el borde, bottom: ancho del fondo, depth: profundidad, x: desplazamiento } (mm)
 */
export function notchedGlassShape(width, height, chamfer, notchTop = null, notchBottom = null) {
  const w = width / 2;
  const h = height / 2;
  const c = Math.max(0, Math.min(chamfer, w, h));
  const s = new THREE.Shape();
  s.moveTo(-w + c, -h);
  if (notchBottom) {
    const x0 = notchBottom.x ?? 0;
    s.lineTo(x0 - notchBottom.top / 2, -h);
    s.lineTo(x0 - notchBottom.bottom / 2, -h + notchBottom.depth);
    s.lineTo(x0 + notchBottom.bottom / 2, -h + notchBottom.depth);
    s.lineTo(x0 + notchBottom.top / 2, -h);
  }
  s.lineTo(w - c, -h);
  s.lineTo(w, -h + c);
  s.lineTo(w, h - c);
  s.lineTo(w - c, h);
  if (notchTop) {
    const x0 = notchTop.x ?? 0;
    s.lineTo(x0 + notchTop.top / 2, h);
    s.lineTo(x0 + notchTop.bottom / 2, h - notchTop.depth);
    s.lineTo(x0 - notchTop.bottom / 2, h - notchTop.depth);
    s.lineTo(x0 - notchTop.top / 2, h);
  }
  s.lineTo(-w + c, h);
  s.lineTo(-w, h - c);
  s.lineTo(-w, -h + c);
  s.closePath();
  return s;
}
