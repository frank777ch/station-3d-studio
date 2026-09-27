import * as THREE from 'three';
import { roundedPrism, taperGeometry, domeGeometry, loftGeometry, shapeSection } from '../utils/roundedBox.js';
import { makeMouthpieceMaterial, makeDarkPlasticMaterial } from '../materials.js';

const STYLES = {
  flat: { cornerRadius: (w, d) => d / 2, edgeRadius: (h) => Math.min(1.5, h / 3), taperX: 0, taperZ: 0 },
  round: { cornerRadius: (w, d) => Math.min(w, d) / 2, edgeRadius: (h) => h / 2.2, taperX: 0, taperZ: 0 },
  duckbill: { cornerRadius: (w, d) => d / 2, edgeRadius: (h) => Math.min(2, h / 3), taperX: 0.15, taperZ: 0.45 },
};

export function buildMouthpiece(cfg, L) {
  const mp = cfg.mouthpiece;
  const style = STYLES[mp.style] ?? STYLES.flat;
  const group = new THREE.Group();
  group.name = 'mouthpiece';

  let geo;
  if (mp.style === 'loft') {
    // perfil libre: mp.profile [[t, sx, sz]], mp.topRound / topChamfer (vista frontal), mp.topRoundDepth (perfil)
    const cr = mp.cornerRadius ?? Math.min(mp.width, mp.depth) / 2;
    const shape = shapeSection({ ...mp, cornerRadius: cr });
    geo = loftGeometry({
      height: mp.height,
      section: shape.section,
      samples: shape.samples,
      rings: 24,
      edgeTop: mp.edgeRadius ?? Math.min(1.5, mp.height / 4),
      edgeBottom: 0,
    });
  } else if (mp.style === 'dome') {
    geo = domeGeometry({
      width: mp.width,
      depth: mp.depth,
      cornerRadius: cfg.body.cornerRadius,
      height: mp.height,
      rim: Math.min(1.5, mp.height * 0.15),
      topX: mp.domeTopX,
      topZ: mp.domeTopZ,
      pinch: mp.domePinch,
      bendHeight: mp.domeBendHeight,
    });
  } else {
    geo = roundedPrism({
      width: mp.width,
      depth: mp.depth,
      height: mp.height,
      cornerRadius: style.cornerRadius(mp.width, mp.depth),
      edgeRadius: style.edgeRadius(mp.height),
    });
    if (style.taperX || style.taperZ) geo = taperGeometry(geo, style);
  }

  const mesh = new THREE.Mesh(geo, makeMouthpieceMaterial(mp));
  mesh.name = 'mouthpieceShell';
  const mouthY = L.mouthY + (mp.offsetY ?? 0); // offsetY < 0 hunde la boquilla en un hombro redondeado
  mesh.position.set(mp.offsetX, mouthY, mp.offsetZ);
  group.add(mesh);

  if (mp.slot === false) return group;

  // Ranura de aire en la parte superior
  const isDome = mp.style === 'dome';
  const isLoft = mp.style === 'loft';
  const topScale = isLoft && mp.profile?.length ? mp.profile[mp.profile.length - 1] : [1, 1, 1];
  const slotW = mp.slotWidth != null ? mp.width * mp.slotWidth
    : isDome ? mp.width * mp.domeTopX * 0.6
    : isLoft ? mp.width * topScale[1] * 0.5
    : mp.width * (1 - style.taperX) * 0.55;
  const slotD = mp.slotDepth != null ? mp.depth * mp.slotDepth
    : isDome ? Math.max(1.0, mp.depth * mp.domeTopZ * 0.5)
    : isLoft ? Math.max(1.0, mp.depth * (topScale[2] ?? topScale[1]) * 0.28)
    : Math.max(1.2, mp.depth * (1 - style.taperZ) * 0.3);
  const slot = new THREE.Mesh(
    roundedPrism({ width: slotW, depth: slotD, height: 1.5, cornerRadius: slotD / 2, edgeRadius: 0 }),
    makeDarkPlasticMaterial('#050505'),
  );
  slot.name = 'airSlot';
  slot.position.set(mp.offsetX, mouthY + mp.height - 1.2, mp.offsetZ);
  group.add(slot);

  return group;
}
