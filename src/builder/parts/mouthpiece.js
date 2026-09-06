import * as THREE from 'three';
import { roundedPrism, taperGeometry, domeGeometry } from '../utils/roundedBox.js';
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
  if (mp.style === 'dome') {
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
  mesh.position.y = L.mouthY;
  group.add(mesh);

  // Ranura de aire en la parte superior
  const isDome = mp.style === 'dome';
  const slotW = isDome ? mp.width * mp.domeTopX * 0.6 : mp.width * (1 - style.taperX) * 0.55;
  const slotD = isDome ? Math.max(1.0, mp.depth * mp.domeTopZ * 0.5) : Math.max(1.2, mp.depth * (1 - style.taperZ) * 0.3);
  const slot = new THREE.Mesh(
    roundedPrism({ width: slotW, depth: slotD, height: 1.5, cornerRadius: slotD / 2, edgeRadius: 0 }),
    makeDarkPlasticMaterial('#050505'),
  );
  slot.name = 'airSlot';
  slot.position.y = L.mouthY + mp.height - 1.2;
  group.add(slot);

  return group;
}
