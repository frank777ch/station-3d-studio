import * as THREE from 'three';
import { loadImage, tintImage } from '../textures/loadImage.js';

/** Logo iluminado (LED) en la cara frontal: imagen teñida, emisiva, con transparencia. */
export function buildLedLogo(cfg, L) {
  const led = cfg.ledLogo;
  const b = cfg.body;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const group = new THREE.Group();
  group.name = 'ledLogo';
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    emissive: 0xffffff,
    emissiveMap: texture,
    emissiveIntensity: led.emissiveIntensity,
    transparent: true,
    depthWrite: false,
    roughness: 0.4,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(led.length, led.length), mat);
  plane.position.set(led.offsetX, L.bodyY + led.offsetY, b.depth / 2 + 0.08);
  plane.rotation.z = (led.rotation * Math.PI) / 180;
  group.add(plane);

  const ready = led.image
    ? loadImage(led.image)
        .then((img) => {
          ctx.clearRect(0, 0, size, size);
          const s = Math.min(size / img.width, size / img.height);
          const w = img.width * s;
          const h = img.height * s;
          ctx.drawImage(tintImage(img, led.color), (size - w) / 2, (size - h) / 2, w, h);
          // halo suave
          ctx.globalCompositeOperation = 'destination-over';
          ctx.filter = `blur(${size * 0.01}px)`;
          ctx.drawImage(tintImage(img, led.color), (size - w) / 2, (size - h) / 2, w, h);
          ctx.filter = 'none';
          ctx.globalCompositeOperation = 'source-over';
          texture.needsUpdate = true;
        })
        .catch((err) => console.warn('[ledLogo]', err.message))
    : Promise.resolve();
  group.userData.ready = ready;
  return group;
}
