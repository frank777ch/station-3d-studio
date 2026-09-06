import * as THREE from 'three';
import { roundedPrism, roundedPlane } from '../utils/roundedBox.js';
import { makeDarkPlasticMaterial, makeScreenMaterial } from '../materials.js';
import { makeScreenTexture } from '../textures/makeScreen.js';

export function buildScreenModule(cfg, L) {
  const m = cfg.screenModule;
  const b = cfg.body;
  const group = new THREE.Group();
  group.name = 'screenModule';

  const shell = new THREE.Mesh(
    roundedPrism({
      width: b.width,
      depth: b.depth,
      height: m.height,
      cornerRadius: b.cornerRadius,
      edgeRadius: Math.min(1.2, b.edgeRadius),
    }),
    makeDarkPlasticMaterial(m.color),
  );
  shell.name = 'screenShell';
  shell.position.y = L.moduleY;
  group.add(shell);

  const s = m.screen;
  const { texture, ready } = makeScreenTexture(s, { aspect: s.height / s.width });
  const screen = new THREE.Mesh(roundedPlane(s.width, s.height, s.cornerRadius), makeScreenMaterial(s, texture));
  screen.name = 'screen';
  screen.position.set(0, L.moduleY + m.height / 2 + s.offsetY, b.depth / 2 + 0.06);
  group.add(screen);

  // Bisel oscuro alrededor de la pantalla (ligeramente más grande, detrás)
  const bezel = new THREE.Mesh(
    roundedPlane(s.width + 1.6, s.height + 1.6, s.cornerRadius + 0.8),
    new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.15, clearcoat: 1 }),
  );
  bezel.name = 'screenBezel';
  bezel.position.copy(screen.position);
  bezel.position.z -= 0.03;
  group.add(bezel);

  group.userData.ready = ready;
  return group;
}
