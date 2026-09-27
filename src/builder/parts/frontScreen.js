import * as THREE from 'three';
import { roundedPlane, roundedRectShape, chamferRectShape, shapePlane, isLoftShape } from '../utils/roundedBox.js';
import { makeScreenMaterial } from '../materials.js';
import { makeScreenTexture } from '../textures/makeScreen.js';

/** Pantalla pequeña directamente sobre la cara frontal del cuerpo (batería). */
export function buildFrontScreen(cfg, L) {
  const s = cfg.frontScreen;
  const b = cfg.body;
  const group = new THREE.Group();
  group.name = 'frontScreen';

  // La manga de la etiqueta va 0.2 mm por delante del cuerpo: la pantalla debe quedar por delante de ella.
  const z = b.depth / 2 + (cfg.label.enabled && !isLoftShape(b) ? 0.34 : 0.06);
  const plane = (w, h, r) => (s.chamfer > 0
    ? shapePlane(chamferRectShape(w, h, r), w, h)
    : roundedPlane(w, h, r));
  const bz = s.bezel ?? 0.6;
  const raise = s.bezelDepth ?? 0; // bisel en relieve (mm)
  const { texture, ready } = makeScreenTexture(s, { aspect: s.height / s.width });
  const screen = new THREE.Mesh(plane(s.width, s.height, s.chamfer > 0 ? s.chamfer : s.cornerRadius), makeScreenMaterial(s, texture));
  screen.position.set(s.offsetX, L.bodyY + s.offsetY, z + (raise > 0 ? 0.05 : 0));
  group.add(screen);

  if (bz > 0) {
    const bezelMat = new THREE.MeshPhysicalMaterial({ color: s.bezelColor ?? 0x050505, roughness: 0.15, clearcoat: 1 });
    const bw = s.width + 2 * bz;
    const bh = s.height + 2 * bz;
    const br = s.chamfer > 0 ? s.chamfer + bz * 0.6 : s.cornerRadius + bz;
    let bezel;
    if (raise > 0) {
      // marco en relieve: prisma extruido hacia afuera desde la cara
      const shape = s.chamfer > 0 ? chamferRectShape(bw, bh, br) : roundedRectShape(bw, bh, br);
      const hole = s.chamfer > 0 ? chamferRectShape(s.width, s.height, s.chamfer) : roundedRectShape(s.width, s.height, s.cornerRadius);
      shape.holes.push(hole);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: raise, bevelEnabled: true, bevelThickness: Math.min(0.3, raise / 3), bevelSize: 0.25, bevelSegments: 3, curveSegments: 12 });
      bezel = new THREE.Mesh(geo, bezelMat);
      bezel.position.set(s.offsetX, L.bodyY + s.offsetY, z - 0.25);
      // fondo del hueco, justo detrás de la pantalla
      const back = new THREE.Mesh(plane(bw, bh, br), bezelMat);
      back.position.set(s.offsetX, L.bodyY + s.offsetY, z + 0.01);
      group.add(back);
    } else {
      bezel = new THREE.Mesh(plane(bw, bh, br), bezelMat);
      bezel.position.copy(screen.position);
      bezel.position.z -= 0.03;
    }
    group.add(bezel);
  }

  group.userData.ready = ready;
  return group;
}
