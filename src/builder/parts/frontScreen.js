import * as THREE from 'three';
import { roundedPlane } from '../utils/roundedBox.js';
import { makeScreenMaterial } from '../materials.js';
import { makeScreenTexture } from '../textures/makeScreen.js';

/** Pantalla pequeña directamente sobre la cara frontal del cuerpo (batería). */
export function buildFrontScreen(cfg, L) {
  const s = cfg.frontScreen;
  const b = cfg.body;
  const group = new THREE.Group();
  group.name = 'frontScreen';

  const { texture, ready } = makeScreenTexture(s, { aspect: s.height / s.width });
  const screen = new THREE.Mesh(roundedPlane(s.width, s.height, s.cornerRadius), makeScreenMaterial(s, texture));
  screen.position.set(s.offsetX, L.bodyY + s.offsetY, b.depth / 2 + 0.06);
  group.add(screen);

  const bezel = new THREE.Mesh(
    roundedPlane(s.width + 1.2, s.height + 1.2, s.cornerRadius + 0.6),
    new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.15, clearcoat: 1 }),
  );
  bezel.position.copy(screen.position);
  bezel.position.z -= 0.03;
  group.add(bezel);

  group.userData.ready = ready;
  return group;
}
