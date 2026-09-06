import * as THREE from 'three';
import { loadImage, drawCover, drawContain, tintImage } from './loadImage.js';

const FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";

function fitFont(ctx, text, maxWidth, maxSize, weight = 800, style = '') {
  let size = maxSize;
  for (; size > 8; size -= 1) {
    ctx.font = `${style} ${weight} ${size}px ${FONT}`;
    if (ctx.measureText(text).width <= maxWidth) break;
  }
  return size;
}

function gradientEndpoints(angleDeg, W, H) {
  // 90° = vertical de arriba hacia abajo; 0° = de izquierda a derecha.
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const half = (Math.abs(dx) * W) / 2 + (Math.abs(dy) * H) / 2;
  return [W / 2 - dx * half, H / 2 - dy * half, W / 2 + dx * half, H / 2 + dy * half];
}

/** Aclara (amount > 0) u oscurece (amount < 0) un color hex. */
function shade(hex, amount) {
  const c = new THREE.Color(hex);
  const t = amount > 0 ? 1 : 0;
  const k = Math.abs(amount);
  c.r += (t - c.r) * k;
  c.g += (t - c.g) * k;
  c.b += (t - c.b) * k;
  return `#${c.getHexString()}`;
}

/** Glifo de marca: una "+" inclinada con extremos redondeados (placeholder del logo real). */
function drawBrandGlyph(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.35);
  ctx.fillStyle = color;
  const bar = size * 0.26;
  ctx.beginPath();
  ctx.roundRect(-bar / 2, -size / 2, bar, size, bar / 2);
  ctx.roundRect(-size * 0.42, -bar / 2, size * 0.84, bar, bar / 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Textura de etiqueta. La manga tiene el centro de la cara frontal en u = 0.5
 * y la cara trasera en u = 0 / 1.
 * @param {object} label  config.label
 * @param {object} opts   { aspect: alto/ancho de la manga, frontFraction: ancho frontal / perímetro, anisotropy }
 * @returns {{ texture: THREE.CanvasTexture, ready: Promise<void> }}
 */
export function makeLabelTexture(label, { aspect, frontFraction, sideFraction = frontFraction * 0.55, anisotropy = 8 }) {
  const W = label.resolution;
  const H = Math.round(W * aspect);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  const frontW = W * frontFraction;
  const sideW = W * sideFraction;
  const frontX = W / 2 - frontW / 2;
  const faceCenters = [0, W / 2, W]; // trasera (partida en el borde), frontal, trasera
  const sideCenters = [W * 0.25, W * 0.75];

  // ---------- template: gradient ----------
  function drawGradient() {
    const stops = label.gradient.length ? label.gradient : ['#333333', '#888888'];
    const g = ctx.createLinearGradient(...gradientEndpoints(label.gradientAngle, W, H));
    stops.forEach((c, i) => g.addColorStop(stops.length === 1 ? 0 : i / (stops.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawGradientText(logo) {
    const maxW = frontW * 0.84;
    ctx.fillStyle = label.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = W * 0.004;

    if (logo) {
      drawContain(ctx, tintImage(logo, label.textColor), frontX + frontW * 0.15, H * 0.09, frontW * 0.7, H * 0.09);
      if (label.line) {
        const s = fitFont(ctx, label.line, maxW * 0.5, H * 0.035, 700);
        ctx.font = `700 ${s}px ${FONT}`;
        ctx.letterSpacing = `${s * 0.25}px`;
        ctx.textAlign = 'right';
        ctx.fillText(label.line, W / 2 + frontW * 0.35, H * 0.215);
        ctx.textAlign = 'center';
      }
    } else if (label.brand) {
      const s = fitFont(ctx, label.brand, maxW, H * 0.075, 900);
      ctx.font = `900 ${s}px ${FONT}`;
      ctx.letterSpacing = `${s * 0.12}px`;
      ctx.fillText(label.brand, W / 2, H * 0.14);
    }
    if (label.line && !logo) {
      const s = fitFont(ctx, label.line, maxW * 0.8, H * 0.045, 600);
      ctx.font = `600 ${s}px ${FONT}`;
      ctx.letterSpacing = `${s * 0.25}px`;
      ctx.fillText(label.line, W / 2, H * 0.225);
    }
    if (label.flavor) {
      ctx.letterSpacing = '0px';
      const words = label.flavor.toUpperCase().split(/\s+/).filter(Boolean);
      const lineH = H * 0.1;
      const startY = H * 0.62 - ((words.length - 1) * lineH) / 2;
      words.forEach((word, i) => {
        const s = fitFont(ctx, word, maxW, H * 0.095, 900);
        ctx.font = `900 ${s}px ${FONT}`;
        ctx.fillText(word, W / 2, startY + i * lineH);
      });
    }
    ctx.shadowBlur = 0;
  }

  // ---------- template: wave ----------
  // Proporciones tomadas de las referencias (fracción de la altura de la etiqueta).
  const WAVE = {
    brandY: 0.11,
    lineY: 0.165,
    topSide: 0.365,   // altura del borde superior en los laterales de la cara
    topPeak: 0.19,    // cima de la ola central que sube hacia el logo
    topHalfW: 0.39,   // semiancho de la ola (fracción del ancho frontal)
    flavorY: 0.51,
    bottomSide: 0.88,
    bottomPeak: 0.70,
    bottomHalfW: 0.30,
    puffsY: 0.775,
    puffsLabelY: 0.83,
  };

  /**
   * Traza la ola con arcos de círculo, como en las referencias:
   * esquina cóncava (radio r) → tramo vertical (cuello) → semicírculo (radio R)
   * → tramo vertical → esquina cóncava. Va de (xc-hw, ySide) a (xc+hw, ySide)
   * pasando por la cima en (xc, yPeak).
   */
  function wave(xc, hw, ySide, yPeak) {
    const D = ySide - yPeak;
    let R = hw * 0.55;
    let r = hw - R;
    if (R + r > D) {
      const k = D / (R + r);
      R *= k;
      r *= k;
    }
    ctx.lineTo(xc - R - r, ySide);
    ctx.arc(xc - R - r, ySide - r, r, Math.PI / 2, 0, true);          // esquina izquierda
    ctx.lineTo(xc - R, yPeak + R);                                     // cuello izquierdo
    ctx.arc(xc, yPeak + R, R, Math.PI, 2 * Math.PI, false);            // cima semicircular
    ctx.lineTo(xc + R, ySide - r);                                     // cuello derecho
    ctx.arc(xc + R + r, ySide - r, r, Math.PI, Math.PI / 2, true);     // esquina derecha
  }

  /** Olas en frente/atrás (semiancho hw) y en los costados (semiancho hwSide), de izquierda a derecha. */
  function boundaryPath(ySide, yPeak, hw, hwSide) {
    const bumps = [
      ...faceCenters.map((xc) => ({ xc, hw })),
      ...sideCenters.map((xc) => ({ xc, hw: hwSide })),
    ].sort((a, b) => a.xc - b.xc);
    ctx.beginPath();
    ctx.moveTo(-W, ySide);
    bumps.forEach(({ xc, hw: h }) => wave(xc, h, ySide, yPeak));
    ctx.lineTo(2 * W, ySide);
  }

  function fillRegion(ySide, yPeak, hw, hwSide, color, closeY) {
    boundaryPath(ySide, yPeak, hw, hwSide);
    ctx.lineTo(2 * W, closeY);
    ctx.lineTo(-W, closeY);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function strokeBoundary(ySide, yPeak, hw, hwSide, color) {
    boundaryPath(ySide, yPeak, hw, hwSide);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, W * 0.0035);
    ctx.stroke();
  }

  function drawSheen() {
    // Brillo tipo foil: claro en el centro de cada cara, oscuro hacia los cantos.
    const g = ctx.createLinearGradient(0, 0, W, 0);
    const ff = frontFraction;
    const add = (u, c) => g.addColorStop(Math.max(0, Math.min(1, u)), c);
    const light = 'rgba(255,255,255,0.22)';
    const mid = 'rgba(255,255,255,0.0)';
    const dark = 'rgba(0,0,0,0.28)';
    faceCenters.forEach((xc) => {
      const u = xc / W;
      add(u - ff / 2, dark);
      add(u - ff * 0.2, mid);
      add(u, light);
      add(u + ff * 0.2, mid);
      add(u + ff / 2, dark);
    });
    add(0.25, 'rgba(0,0,0,0.35)');
    add(0.75, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawWave(logo, glyph) {
    const c = label.colors;
    const hwTop = frontW * WAVE.topHalfW;
    const hwBot = frontW * WAVE.bottomHalfW;
    const hwTopSide = sideW * 0.42;
    const hwBotSide = sideW * 0.34;

    ctx.fillStyle = c.main;
    ctx.fillRect(0, 0, W, H);
    fillRegion(H * WAVE.topSide, H * WAVE.topPeak, hwTop, hwTopSide, c.top, -H);
    fillRegion(H * WAVE.bottomSide, H * WAVE.bottomPeak, hwBot, hwBotSide, c.bottom, 2 * H);
    if (label.metallic) drawSheen();
    strokeBoundary(H * WAVE.topSide, H * WAVE.topPeak, hwTop, hwTopSide, c.outline);
    strokeBoundary(H * WAVE.bottomSide, H * WAVE.bottomPeak, hwBot, hwBotSide, c.outline);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const maxW = frontW * 0.8;

    // Marca + línea (zona superior)
    if (logo) {
      const boxW = frontW * 0.66;
      const boxH = H * 0.075;
      drawContain(ctx, tintImage(logo, c.brand), W / 2 - boxW / 2, H * WAVE.brandY - boxH / 2, boxW, boxH);
      if (label.line) {
        const s = fitFont(ctx, label.line, maxW * 0.4, H * 0.03, 700);
        ctx.font = `700 ${s}px ${FONT}`;
        ctx.letterSpacing = `${s * 0.2}px`;
        ctx.fillStyle = c.brand;
        ctx.textAlign = 'right';
        ctx.fillText(label.line, W / 2 + boxW / 2, H * WAVE.lineY);
        ctx.textAlign = 'center';
      }
    } else {
      if (label.brand) {
        const s = fitFont(ctx, label.brand, maxW * 0.72, H * 0.06, 900, 'italic');
        ctx.font = `italic 900 ${s}px ${FONT}`;
        ctx.letterSpacing = `${s * 0.04}px`;
        const tw = ctx.measureText(label.brand).width;
        const glyph = s * 1.1;
        const totalW = tw + glyph * 0.9;
        const x0 = W / 2 - totalW / 2;
        drawBrandGlyph(ctx, x0 + glyph * 0.4, H * WAVE.brandY, glyph, c.brand);
        ctx.fillStyle = c.brand;
        ctx.textAlign = 'left';
        ctx.fillText(label.brand, x0 + glyph * 0.9, H * WAVE.brandY);
        ctx.textAlign = 'center';
      }
      if (label.line) {
        const s = fitFont(ctx, label.line, maxW * 0.4, H * 0.03, 700);
        ctx.font = `700 ${s}px ${FONT}`;
        ctx.letterSpacing = `${s * 0.2}px`;
        ctx.fillStyle = c.brand;
        ctx.textAlign = 'right';
        ctx.fillText(label.line, W / 2 + maxW * 0.36, H * WAVE.lineY);
        ctx.textAlign = 'center';
      }
    }

    // Sabor (zona central), en una o dos líneas
    if (label.flavor) {
      ctx.letterSpacing = '0px';
      ctx.fillStyle = c.flavorText;
      const text = label.flavor.toUpperCase();
      const maxS = H * 0.042;
      const single = fitFont(ctx, text, maxW, maxS, 900, 'italic');
      const words = text.split(/\s+/).filter(Boolean);
      const lines = single < maxS * 0.7 && words.length > 1
        ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
        : [text];
      const lineH = H * 0.05;
      const y0 = H * WAVE.flavorY - ((lines.length - 1) * lineH) / 2;
      lines.forEach((ln, i) => {
        const s = fitFont(ctx, ln, maxW, maxS, 900, 'italic');
        ctx.font = `italic 900 ${s}px ${FONT}`;
        ctx.fillText(ln, W / 2, y0 + i * lineH);
      });
    }

    // 10k PUFFS (zona inferior)
    if (label.puffs) {
      ctx.fillStyle = c.puffsText;
      const s = fitFont(ctx, label.puffs, hwBot * 1.5, H * 0.075, 900, 'italic');
      ctx.font = `italic 900 ${s}px ${FONT}`;
      ctx.letterSpacing = `${-s * 0.04}px`;
      ctx.fillText(label.puffs, W / 2, H * WAVE.puffsY);
      if (label.puffsLabel) {
        const s2 = fitFont(ctx, label.puffsLabel, hwBot * 1.3, H * 0.024, 800);
        ctx.font = `800 ${s2}px ${FONT}`;
        ctx.letterSpacing = `${s2 * 0.3}px`;
        ctx.fillText(label.puffsLabel, W / 2, H * WAVE.puffsLabelY);
      }
      ctx.letterSpacing = '0px';
    }

    // Símbolo de marca (solo el glifo) en los laterales
    sideCenters.forEach((xc) => {
      ctx.save();
      ctx.translate(xc, H * 0.46);
      ctx.globalAlpha = 0.9;
      if (glyph) {
        const gh = H * 0.075;
        const gw = gh * (glyph.width / glyph.height);
        ctx.drawImage(tintImage(glyph, c.flavorText), -gw / 2, -gh / 2, gw, gh);
      } else {
        drawBrandGlyph(ctx, 0, 0, H * 0.06, c.flavorText);
      }
      ctx.restore();
    });
  }

  function draw({ image = null, logo = null, glyph = null } = {}) {
    ctx.clearRect(0, 0, W, H);
    ctx.letterSpacing = '0px';
    if (image && label.imageFit === 'wrap') {
      drawCover(ctx, image, 0, 0, W, H);
      texture.needsUpdate = true;
      return;
    }
    if (label.template === 'wave') drawWave(logo, glyph);
    else drawGradient();

    if (image) {
      drawContain(ctx, image, frontX + frontW * 0.06, H * 0.06, frontW * 0.88, H * 0.88);
    } else if (label.template !== 'wave') {
      drawGradientText(logo);
    }
    texture.needsUpdate = true;
  }

  draw();
  const loads = [];
  if (label.mode === 'image' && label.image) {
    loads.push(loadImage(label.image).then((image) => ({ image })).catch((err) => (console.warn('[label]', err.message), {})));
  }
  if (label.logoImage) {
    loads.push(loadImage(label.logoImage).then((logo) => ({ logo })).catch((err) => (console.warn('[label]', err.message), {})));
  }
  if (label.glyphImage) {
    loads.push(loadImage(label.glyphImage).then((glyph) => ({ glyph })).catch((err) => (console.warn('[label]', err.message), {})));
  }
  const ready = loads.length
    ? Promise.all(loads).then((parts) => draw(Object.assign({}, ...parts)))
    : Promise.resolve();
  return { texture, ready };
}
