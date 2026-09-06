import * as THREE from 'three';
import { loadImage, drawCover } from './loadImage.js';

const FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";

function pill(ctx, x, y, w, h, text, lit, color) {
  const r = h / 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (lit) {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = h * 0.5;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#05070a';
  } else {
    ctx.strokeStyle = '#2a2f36';
    ctx.lineWidth = Math.max(2, h * 0.06);
    ctx.stroke();
    ctx.fillStyle = '#3a4048';
  }
  ctx.font = `800 ${h * 0.42}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = `${h * 0.04}px`;
  ctx.fillText(text, x + w / 2, y + h / 2 + h * 0.02);
  ctx.letterSpacing = '0px';
}

/**
 * Textura de pantalla encendida (batería, boost, ice boost).
 * @param {object} screen  config.screenModule.screen
 * @param {object} opts    { aspect: alto/ancho de la pantalla }
 */
export function makeScreenTexture(screen, { aspect }) {
  const W = 512;
  const H = Math.round(W * aspect);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  function drawProcedural() {
    const { battery, boost, iceBoost, accent } = screen.data;
    ctx.fillStyle = '#030405';
    ctx.fillRect(0, 0, W, H);

    const pad = W * 0.07;
    const pct = Math.max(0, Math.min(100, battery));
    const battColor = pct <= 20 ? '#ff4d4d' : accent;

    // Icono de batería
    const bw = W * 0.34;
    const bh = H * 0.2;
    const bx = pad;
    const by = pad;
    ctx.strokeStyle = '#d8dde3';
    ctx.lineWidth = Math.max(2, bh * 0.08);
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, bh * 0.18);
    ctx.stroke();
    ctx.fillStyle = '#d8dde3';
    ctx.beginPath();
    ctx.roundRect(bx + bw + bh * 0.08, by + bh * 0.3, bh * 0.16, bh * 0.4, bh * 0.05);
    ctx.fill();
    const inner = bh * 0.2;
    ctx.fillStyle = battColor;
    ctx.shadowColor = battColor;
    ctx.shadowBlur = bh * 0.3;
    ctx.beginPath();
    ctx.roundRect(bx + inner, by + inner, (bw - 2 * inner) * (pct / 100), bh - 2 * inner, bh * 0.1);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Porcentaje
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${bh * 1.15}px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(pct)}%`, W - pad, by + bh / 2);

    // Píldoras
    const ph = H * 0.22;
    const gap = W * 0.04;
    const pw = (W - 2 * pad - gap) / 2;
    const py = H - pad - ph;
    pill(ctx, pad, py, pw, ph, 'BOOST', boost, accent);
    pill(ctx, pad + pw + gap, py, pw, ph, 'ICE', iceBoost, '#6fdcff');

    // Línea decorativa
    ctx.fillStyle = '#1b2026';
    ctx.fillRect(pad, py - H * 0.09, W - 2 * pad, Math.max(1, H * 0.008));
    texture.needsUpdate = true;
  }

  drawProcedural();
  let ready = Promise.resolve();
  if (screen.mode === 'image' && screen.image) {
    ready = loadImage(screen.image)
      .then((img) => {
        ctx.clearRect(0, 0, W, H);
        drawCover(ctx, img, 0, 0, W, H);
        texture.needsUpdate = true;
      })
      .catch((err) => console.warn('[screen]', err.message));
  }
  return { texture, ready };
}
