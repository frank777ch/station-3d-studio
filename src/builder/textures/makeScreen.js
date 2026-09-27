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

  function drawPercent() {
    const { battery, accent } = screen.data;
    const pct = Math.max(0, Math.min(100, battery));
    ctx.fillStyle = '#030405';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${H * 0.62}px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = `${-H * 0.03}px`;
    ctx.fillText(`${Math.round(pct)}`, W * 0.62, H * 0.5);
    ctx.font = `700 ${H * 0.22}px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('%', W * 0.63, H * 0.66);
    // tres barritas de color (como la pantalla real)
    const bars = [accent, '#ff4d4d', '#4da3ff'];
    const bw = W * 0.06;
    const bh = H * 0.62;
    bars.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.shadowColor = c;
      ctx.shadowBlur = H * 0.08;
      ctx.beginPath();
      ctx.roundRect(W * 0.76 + i * bw * 1.35, H * 0.19, bw, bh, bw * 0.3);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    ctx.letterSpacing = '0px';
    texture.needsUpdate = true;
  }

  /** Cubito de hielo: cuadrado redondeado con dos facetas claras. */
  function iceCube(x, y, size, lit) {
    const r = size * 0.18;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.12);
    const g = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
    if (lit) {
      g.addColorStop(0, '#f4fbff');
      g.addColorStop(0.5, '#9fd8ff');
      g.addColorStop(1, '#3f8fd8');
      ctx.shadowColor = '#7fd0ff';
      ctx.shadowBlur = size * 0.35;
    } else {
      g.addColorStop(0, '#2a3138');
      g.addColorStop(1, '#151a1f');
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, r);
    ctx.fill();
    ctx.shadowBlur = 0;
    // facetas
    ctx.fillStyle = lit ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(-size * 0.38, -size * 0.38);
    ctx.lineTo(size * 0.1, -size * 0.38);
    ctx.lineTo(-size * 0.38, size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = lit ? 'rgba(0,40,90,0.25)' : 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.moveTo(size * 0.42, size * 0.42);
    ctx.lineTo(size * 0.42, -size * 0.05);
    ctx.lineTo(-size * 0.05, size * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /** Columna vertical: TURBO arriba, cubitos de hielo (nivel de frío) y dos iconos abajo (ElfBar Ice King). */
  function drawIce() {
    const { level, accent } = screen.data;
    const cubes = 5;
    const lit = Math.max(0, Math.min(cubes, Math.round(level)));
    ctx.fillStyle = '#030405';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = accent;
    ctx.font = `700 ${W * 0.13}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = `${W * 0.01}px`;
    ctx.fillText('TURBO', W / 2, H * 0.05);
    ctx.letterSpacing = '0px';
    const size = W * 0.62;
    const y0 = H * 0.16;
    const y1 = H * 0.86;
    for (let i = 0; i < cubes; i++) {
      const y = y0 + ((y1 - y0) * i) / (cubes - 1);
      iceCube(W / 2, y, size, i < lit);
    }
    // iconos inferiores (dos pastillas pequeñas)
    const bw = W * 0.28;
    const bh = W * 0.22;
    [W * 0.32, W * 0.68].forEach((x) => {
      ctx.strokeStyle = accent;
      ctx.lineWidth = Math.max(1, W * 0.015);
      ctx.beginPath();
      ctx.roundRect(x - bw / 2, H * 0.955 - bh / 2, bw, bh, bh * 0.25);
      ctx.stroke();
    });
    texture.needsUpdate = true;
  }

  /** Fila: rayo, 99 %, píldora BOOST y copos (Life Pod One). */
  function drawBoostRow() {
    const { battery, boost, accent } = screen.data;
    const pct = Math.max(0, Math.min(100, battery));
    ctx.fillStyle = '#030405';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    // rayo
    const bx = W * 0.09;
    const bh = H * 0.5;
    ctx.beginPath();
    ctx.moveTo(bx, H * 0.5 - bh / 2);
    ctx.lineTo(bx - bh * 0.22, H * 0.5 + bh * 0.08);
    ctx.lineTo(bx + bh * 0.02, H * 0.5 + bh * 0.02);
    ctx.lineTo(bx - bh * 0.06, H * 0.5 + bh / 2);
    ctx.lineTo(bx + bh * 0.22, H * 0.5 - bh * 0.1);
    ctx.lineTo(bx - bh * 0.02, H * 0.5 - bh * 0.04);
    ctx.closePath();
    ctx.fill();
    // porcentaje (dígitos tipo siete segmentos: fuente ancha)
    ctx.font = `800 ${H * 0.62}px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = `${-H * 0.02}px`;
    ctx.fillText(`${Math.round(pct)}`, W * 0.36, H * 0.52);
    ctx.font = `700 ${H * 0.22}px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('%', W * 0.365, H * 0.66);
    ctx.letterSpacing = '0px';
    // píldora BOOST
    const pw = W * 0.26;
    const ph = H * 0.42;
    const px = W * 0.45;
    const py = H * 0.5 - ph / 2;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, H * 0.035);
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, ph / 2);
    if (boost) {
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.fillStyle = '#030405';
    } else {
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
    }
    ctx.font = `800 ${ph * 0.5}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = `${ph * 0.05}px`;
    ctx.fillText('BOOST', px + pw / 2, H * 0.51);
    ctx.letterSpacing = '0px';
    // copos
    ctx.fillStyle = accent;
    ctx.font = `700 ${H * 0.34}px ${FONT}`;
    for (let i = 0; i < 4; i++) ctx.fillText('✻', W * 0.78 + (i - 1.5) * W * 0.06, H * 0.52);
    texture.needsUpdate = true;
  }

  /** Pantalla grande Rifbar MixPro: marca y sabor girados arriba, panel con porcentajes y boosts abajo. */
  function drawMixpro() {
    const { battery, liquid, accent, flavor } = screen.data;
    ctx.fillStyle = '#030405';
    ctx.fillRect(0, 0, W, H);

    // arcos decorativos a la izquierda
    const arcColors = ['#ff4d4d', '#ffd23f', '#3fd8c8', '#ffffff'];
    arcColors.forEach((c, i) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = Math.max(1, W * 0.008);
      ctx.beginPath();
      ctx.arc(-W * 0.2, H * 0.27, W * (0.28 + i * 0.045), -0.55, 0.55);
      ctx.stroke();
    });
    // RIFBAR girado
    ctx.save();
    ctx.translate(W * 0.28, H * 0.27);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = `500 ${W * 0.085}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = `${W * 0.04}px`;
    ctx.fillText('RIFBAR', 0, 0);
    ctx.restore();
    // sabor girado en color
    if (flavor) {
      ctx.save();
      ctx.translate(W * 0.42, H * 0.27);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = accent;
      ctx.font = `800 ${W * 0.075}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = `${W * 0.006}px`;
      const words = flavor.toUpperCase().split(/\s+/);
      const lines = words.length > 1 ? [words.slice(0, -1).join(' '), words[words.length - 1]] : [flavor.toUpperCase()];
      lines.forEach((ln, i) => ctx.fillText(ln, 0, (i - (lines.length - 1) / 2) * W * 0.09));
      ctx.restore();
    }
    ctx.letterSpacing = '0px';

    // panel inferior violeta
    const px = W * 0.05;
    const py = H * 0.5;
    const pw = W * 0.9;
    const ph = H * 0.47;
    const pg = ctx.createLinearGradient(0, py, 0, py + ph);
    pg.addColorStop(0, '#8a4bd6');
    pg.addColorStop(1, '#5b2aa8');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, W * 0.05);
    ctx.fill();
    // MIXPRO
    ctx.fillStyle = '#ffffff';
    ctx.font = `italic 900 ${W * 0.075}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MIXPRO', W / 2, py + ph * 0.1);
    // píldoras líquido / batería
    const pillW = pw * 0.42;
    const pillH = ph * 0.15;
    const pillY = py + ph * 0.22;
    [[px + pw * 0.06, '#ffd23f', `${Math.round(liquid)}%`, 'rgba(255,210,63,0.25)'], [px + pw * 0.52, '#6fdcff', `${Math.round(battery)}%`, 'rgba(111,220,255,0.25)']].forEach(([x, c, txt, bg]) => {
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(x, pillY, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x + pillH * 0.55, pillY + pillH / 2, pillH * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${pillH * 0.62}px ${FONT}`;
      ctx.textAlign = 'left';
      ctx.fillText(txt, x + pillH * 1.05, pillY + pillH / 2 + pillH * 0.03);
    });
    // tiles NIC BOOST / ICE BOOST
    const tw = pw * 0.42;
    const th = ph * 0.5;
    const ty = py + ph * 0.44;
    [[px + pw * 0.06, 'NIC BOOST', '#ff5fbf'], [px + pw * 0.52, 'ICE BOOST', '#5fc8ff']].forEach(([x, title, c]) => {
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.beginPath();
      ctx.roundRect(x, ty, tw, th, W * 0.03);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${th * 0.12}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(title, x + tw / 2, ty + th * 0.14);
      // icono: bloque de color con brillo
      ctx.fillStyle = c;
      ctx.shadowColor = c;
      ctx.shadowBlur = th * 0.15;
      ctx.beginPath();
      ctx.roundRect(x + tw * 0.3, ty + th * 0.28, tw * 0.4, th * 0.4, tw * 0.08);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${th * 0.16}px ${FONT}`;
      ctx.fillText('100%', x + tw / 2, ty + th * 0.85);
    });
    texture.needsUpdate = true;
  }

  function drawProcedural() {
    if (screen.template === 'percent') return drawPercent();
    if (screen.template === 'ice') return drawIce();
    if (screen.template === 'boostRow') return drawBoostRow();
    if (screen.template === 'mixpro') return drawMixpro();
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
