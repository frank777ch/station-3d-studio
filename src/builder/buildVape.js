import * as THREE from 'three';
import { mergeWithDefaults, validateConfig } from '../models/_schema.js';
import { computeLayout } from './layout.js';
import { buildBody } from './parts/body.js';
import { buildFrameRing } from './parts/frameRing.js';
import { buildScreenModule } from './parts/screenModule.js';
import { buildMouthpiece } from './parts/mouthpiece.js';
import { buildBand } from './parts/band.js';
import { buildLabel } from './parts/label.js';
import { buildButton } from './parts/button.js';
import { buildBase } from './parts/base.js';
import { buildLedLogo } from './parts/ledLogo.js';
import { buildFrontScreen } from './parts/frontScreen.js';

const MM_TO_M = 0.001;

/**
 * Único constructor: recibe un config (parcial o completo) y devuelve un THREE.Group
 * en metros (1 mm del config = 0.001 m), con la base en y = 0.
 *
 * group.userData: { config, layout, ready }  (ready: Promise que resuelve cuando
 * las texturas en modo imagen terminaron de cargar).
 */
export function buildVape(config, { anisotropy = 8 } = {}) {
  validateConfig(config);
  const cfg = mergeWithDefaults(config);
  const L = computeLayout(cfg);

  const group = new THREE.Group();
  group.name = cfg.id;

  if (cfg.base.enabled) group.add(buildBase(cfg, L));
  group.add(buildBody(cfg, L));
  if (cfg.label.enabled) group.add(buildLabel(cfg, L, { anisotropy }));
  if (cfg.band.enabled) group.add(buildBand(cfg, L));
  if (cfg.frameRing.enabled) group.add(buildFrameRing(cfg, L));
  if (cfg.screenModule.enabled) group.add(buildScreenModule(cfg, L));
  if (cfg.mouthpiece.enabled) group.add(buildMouthpiece(cfg, L));
  if (cfg.button.enabled) group.add(buildButton(cfg, L));
  if (cfg.ledLogo.enabled) group.add(buildLedLogo(cfg, L));
  if (cfg.frontScreen.enabled) group.add(buildFrontScreen(cfg, L));

  const pending = [];
  group.traverse((o) => o.userData.ready && pending.push(o.userData.ready));

  group.scale.setScalar(MM_TO_M);
  group.userData.config = cfg;
  group.userData.layout = L;
  group.userData.ready = Promise.all(pending).then(() => undefined);
  return group;
}
