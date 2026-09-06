import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.06;
  controls.maxDistance = 1.2;
  controls.maxPolarAngle = Math.PI * 0.95;
  controls.autoRotateSpeed = 1.2;
  return controls;
}
