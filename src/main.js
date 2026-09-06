import * as THREE from 'three';
import { createRenderer } from './core/renderer.js';
import { setupEnvironment } from './core/environment.js';
import { createControls } from './core/controls.js';
import { buildVape } from './builder/buildVape.js';
import { disposeObject } from './builder/utils/dispose.js';
import { MODELS, MODEL_IDS, MODEL_OPTIONS } from './models/index.js';
import { mergeWithDefaults, deepClone } from './models/_schema.js';
import { createPanel } from './ui/panel.js';
import { exportGLB } from './export/exportGLB.js';
import { exportConfigJSON, importConfigJSON } from './export/exportConfig.js';

// ---------- Escena ----------
const canvas = document.getElementById('app');
const hudName = document.getElementById('hud-name');
const hudStatus = document.getElementById('hud-status');

const renderer = createRenderer(canvas);
const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.005, 10);
camera.position.set(0.16, 0.10, 0.30);

const controls = createControls(camera, renderer.domElement);

const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(0.3, 0.6, 0.5);
scene.add(key);
const rim = new THREE.DirectionalLight(0xbfd8ff, 0.6);
rim.position.set(-0.5, 0.3, -0.4);
scene.add(rim);

// Pedestal sutil para anclar el objeto
const pedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(0.04, 0.04, 0.003, 64),
  new THREE.MeshPhysicalMaterial({ color: 0x1a1c20, roughness: 0.35, metalness: 0.1, clearcoat: 0.6 }),
);
pedestal.position.y = -0.002;
scene.add(pedestal);

// ---------- Estado ----------
const state = {
  currentId: MODEL_IDS[0],
  config: mergeWithDefaults(MODELS[MODEL_IDS[0]]),
  vape: null,
};
const view = { autoRotate: false, exposure: 1.0, envIntensity: 1.0 };
const anisotropy = renderer.capabilities.getMaxAnisotropy();

function rebuild() {
  if (state.vape) disposeObject(state.vape);
  try {
    state.vape = buildVape(state.config, { anisotropy });
  } catch (err) {
    console.error('[buildVape]', err);
    hudStatus.textContent = `error al construir: ${err.message}`;
    return;
  }
  scene.add(state.vape);
  const L = state.vape.userData.layout;
  controls.target.set(0, (L.total / 2) * 0.001, 0);
  hudName.textContent = state.config.name;
  hudStatus.textContent = `${state.config.id} · ${L.total.toFixed(1)} mm`;
}

let rebuildQueued = false;
function scheduleRebuild() {
  if (rebuildQueued) return;
  rebuildQueued = true;
  requestAnimationFrame(() => {
    rebuildQueued = false;
    rebuild();
  });
}

function selectModel(id) {
  if (!MODELS[id]) return;
  state.currentId = id;
  state.config = mergeWithDefaults(MODELS[id]);
  rebuild();
  panel.refresh(id);
}

function applyView() {
  controls.autoRotate = view.autoRotate;
  renderer.toneMappingExposure = view.exposure;
  scene.environmentIntensity = view.envIntensity;
}

// ---------- UI ----------
const panel = createPanel({
  modelOptions: MODEL_OPTIONS,
  initialId: state.currentId,
  getConfig: () => state.config,
  onSelect: selectModel,
  onChange: scheduleRebuild,
  view,
  onViewChange: applyView,
  actions: {
    exportGLB: async () => {
      if (!state.vape) return;
      await state.vape.userData.ready;
      await exportGLB(state.vape, `${state.config.id}.glb`);
    },
    exportJSON: () => exportConfigJSON(deepClone(state.config)),
    importJSON: async () => {
      try {
        const json = await importConfigJSON();
        if (!json) return;
        state.config = mergeWithDefaults(json);
        rebuild();
        panel.refresh();
      } catch (err) {
        console.error('[importJSON]', err);
        hudStatus.textContent = `JSON inválido: ${err.message}`;
      }
    },
    reset: () => selectModel(state.currentId),
  },
});

// ---------- Arranque ----------
rebuild();
applyView();

setupEnvironment(renderer, scene).then(({ source }) => {
  hudStatus.textContent += source === 'hdr' ? ' · HDR estudio' : ' · sin HDR (RoomEnvironment)';
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
});

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
