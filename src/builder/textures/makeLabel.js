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
      const rect = drawContain(ctx, tintImage(logo, label.textColor), frontX + frontW * 0.15, H * 0.09, frontW * 0.7, H * 0.09);
      if (label.line) {
        const s = fitFont(ctx, label.line, rect.w * 0.45, H * 0.035, 700);
        ctx.font = `700 ${s}px ${FONT}`;
        ctx.letterSpacing = `${s * 0.25}px`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(label.line, rect.right, rect.bottom + H * 0.015);
        ctx.textBaseline = 'middle';
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
      const rect = drawContain(ctx, tintImage(logo, c.brand), W / 2 - boxW / 2, H * WAVE.brandY - boxH / 2, boxW, boxH);
      if (label.line) {
        // "ECO II" alineado a la derecha con el borde real del logo, justo debajo
        const s = fitFont(ctx, label.line, rect.w * 0.4, H * 0.028, 700);
        ctx.font = `700 ${s}px ${FONT}`;
        ctx.letterSpacing = `${s * 0.2}px`;
        ctx.fillStyle = c.brand;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(label.line, rect.right, rect.bottom + H * 0.012);
        ctx.textBaseline = 'middle';
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

  // ---------- template: vertical ----------
  // Fondo degradado y textos girados 90° (se leen de arriba hacia abajo), como HQD / ElfBar.
  function drawVerticalText(text, x, yCenter, size, weight, color, align = 'center', style = '', spacing = 0) {
    ctx.save();
    ctx.translate(x, yCenter);
    ctx.rotate(Math.PI / 2);
    ctx.font = `${style} ${weight} ${size}px ${FONT}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = `${spacing}px`;
    ctx.fillText(text, 0, 0);
    ctx.restore();
    ctx.letterSpacing = '0px';
  }

  function drawVertical(logo) {
    const v = label.vertical;
    drawGradient();
    if (v.stripWidth > 0) {
      // franja oscura que envuelve el canto izquierdo (módulo lateral tipo Voopoo Zest)
      ctx.fillStyle = v.stripColor;
      ctx.fillRect(frontX - sideW * 0.55, 0, sideW * 0.55 + frontW * v.stripWidth, H);
    }
    if (v.grooves > 0) {
      ctx.strokeStyle = 'rgba(0,0,0,0.10)';
      ctx.lineWidth = Math.max(1, W * 0.002);
      for (let i = 1; i <= v.grooves; i++) {
        const x = frontX + (frontW * i) / (v.grooves + 1);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
    }
    const maxLen = H * 0.9;
    if (logo) {
      // logo girado en la posición de la marca
      const lw = H * v.brandSize * 2.2;
      const lh = lw * (logo.height / logo.width);
      ctx.save();
      ctx.translate(W / 2 + frontW * v.brandX, H * 0.5);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(tintImage(logo, label.textColor), -lw / 2, -lh / 2, lw, lh);
      ctx.restore();
    } else if (label.brand) {
      const size = fitFont(ctx, label.brand, maxLen, H * v.brandSize, 900);
      drawVerticalText(label.brand, W / 2 + frontW * v.brandX, H * 0.5, size, 900, label.textColor, 'center', '', size * -0.02);
    }
    if (label.line) {
      const size = fitFont(ctx, label.line, maxLen * 0.5, H * 0.09, 900, 'italic');
      drawVerticalText(label.line, W / 2 + frontW * v.lineX, H * 0.8, size, 900, label.textColor, 'center', 'italic');
    }
    if (label.flavor) {
      const size = fitFont(ctx, label.flavor.toUpperCase(), maxLen * 0.6, H * 0.035, 700);
      drawVerticalText(label.flavor.toUpperCase(), W / 2 + frontW * v.flavorX, H * 0.06, size, 700, label.textColor, 'left', '', size * 0.12);
    }
  }

  // ---------- utilidades comunes ----------
  /** Generador pseudoaleatorio determinista (misma etiqueta = mismo dibujo). */
  function rng(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Zona inferior con corte inclinado en las caras frontal y trasera (y horizontal en los
   * costados), como en los cuerpos de dos colores. splitLeft / splitRight son la altura del
   * corte (fracción de H desde abajo) en el borde izquierdo y derecho de la cara frontal.
   */
  function fillSlantedBottom(splitLeft, splitRight, color) {
    const yL = H * (1 - splitLeft);
    const yR = H * (1 - splitRight);
    const yMid = (yL + yR) / 2;
    const backW = W - frontW - 2 * sideW; // ancho de la cara trasera (partida en el borde)
    ctx.beginPath();
    ctx.moveTo(0, yR);
    ctx.lineTo(backW / 2, yL);          // cara trasera derecha (vista por detrás, corte invertido)
    ctx.lineTo(frontX - sideW, yMid);   // costado izquierdo
    ctx.lineTo(frontX, yL);
    ctx.lineTo(frontX + frontW, yR);    // cara frontal
    ctx.lineTo(frontX + frontW + sideW, yMid); // costado derecho
    ctx.lineTo(W - backW / 2, yL);
    ctx.lineTo(W, yR);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    return { yL, yR };
  }

  /** Moteado sutil (plástico con partículas). */
  function drawSpeckle(amount, seed = 7) {
    if (amount <= 0) return;
    const rand = rng(seed);
    const n = Math.round(W * H * 0.0012 * amount);
    for (let i = 0; i < n; i++) {
      const x = rand() * W;
      const y = rand() * H;
      const r = 0.6 + rand() * 1.4;
      ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------- template: brush ----------
  // Fondo claro con brochazos de color inclinados, marca girada y franja oscura a la derecha (ElfBar Ice King).
  function brushStroke(cx, cy, len, thick, angleRad, color, rand) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleRad);
    ctx.fillStyle = color;
    const bands = 9;
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1) - 0.5;
      const y = t * thick;
      const l = len * (0.62 + 0.38 * rand());
      const h = (thick / bands) * (0.9 + 0.5 * rand());
      const dx = (rand() - 0.5) * len * 0.25;
      ctx.globalAlpha = 0.75 + 0.25 * rand();
      ctx.beginPath();
      ctx.roundRect(-l / 2 + dx, y - h / 2, l, h, h / 2);
      ctx.fill();
    }
    // punta desflecada
    for (let i = 0; i < 12; i++) {
      const y = (rand() - 0.5) * thick;
      const l = len * (0.05 + 0.12 * rand());
      const h = thick * 0.05;
      const side = rand() > 0.5 ? 1 : -1;
      ctx.globalAlpha = 0.5 + 0.4 * rand();
      ctx.beginPath();
      ctx.roundRect(side * len * (0.42 + 0.12 * rand()) - l / 2, y - h / 2, l, h, h / 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawBrush(logo, glyph) {
    const b = label.brush;
    const rand = rng(1234);
    const stripW = frontW * b.stripWidth;
    const paintW = frontW - stripW; // zona pintada de la cara frontal
    const angle = (-b.angle * Math.PI) / 180;

    ctx.fillStyle = b.background;
    ctx.fillRect(0, 0, W, H);

    // brochazos en cada cara (frontal y trasera), los laterales reciben su continuación
    const colors = b.colors.length ? b.colors : ['#c8102e'];
    faceCenters.forEach((xc, fi) => {
      const cx0 = fi === 1 ? frontX + paintW / 2 : xc;
      for (let i = 0; i < b.strokes; i++) {
        const color = colors[i % colors.length];
        const cx = cx0 + (rand() - 0.5) * paintW * 0.5;
        const cy = H * (0.2 + 0.6 * rand());
        const len = H * (0.5 + 0.5 * rand());
        const thick = paintW * (0.22 + 0.25 * rand());
        brushStroke(cx, cy, len, thick, angle, color, rand);
      }
    });

    // franja oscura a la derecha de la cara frontal (módulo de pantalla), envuelve el canto
    if (stripW > 0) {
      ctx.fillStyle = b.stripColor;
      ctx.fillRect(frontX + paintW, 0, stripW + sideW * 0.5, H);
    }

    // marca girada (se lee de arriba hacia abajo), en el color principal
    const brandColor = colors[0];
    const bx = frontX + paintW / 2 + paintW * b.brandX;
    if (logo) {
      const lw = H * b.brandSize * 2.4;
      const lh = lw * (logo.height / logo.width);
      ctx.save();
      ctx.translate(bx, H * 0.58);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(tintImage(logo, brandColor), -lw / 2, -lh / 2, lw, lh);
      ctx.restore();
    } else if (label.brand) {
      const size = fitFont(ctx, label.brand, H * 0.8, H * b.brandSize, 500);
      drawVerticalText(label.brand, bx, H * 0.6, size, 500, brandColor, 'center', '', size * 0.28);
    }
    // glifo pequeño arriba a la izquierda
    ctx.save();
    ctx.translate(frontX + paintW * 0.2, H * 0.09);
    if (glyph) {
      const gh = H * 0.06;
      const gw = gh * (glyph.width / glyph.height);
      ctx.drawImage(tintImage(glyph, brandColor), -gw / 2, -gh / 2, gw, gh);
    } else {
      ctx.strokeStyle = brandColor;
      ctx.lineWidth = Math.max(1.5, W * 0.0025);
      ctx.beginPath();
      ctx.arc(0, 0, H * 0.018, 0, Math.PI * 2);
      ctx.moveTo(H * 0.03, -H * 0.01);
      ctx.bezierCurveTo(H * 0.06, -H * 0.05, H * 0.08, H * 0.0, H * 0.05, H * 0.035);
      ctx.stroke();
    }
    ctx.restore();
    // sabor pequeño girado, bajo la marca
    if (label.flavor) {
      const size = fitFont(ctx, label.flavor.toUpperCase(), H * 0.5, H * 0.03, 600);
      drawVerticalText(label.flavor.toUpperCase(), bx + H * b.brandSize * 0.75, H * 0.08, size, 600, brandColor, 'left', '', size * 0.12);
    }
  }

  // ---------- template: one ----------
  // Placa lisa o metálica con logo girado arriba a la izquierda, glifo grande tono sobre tono,
  // sabor pequeño sobre el corte y zona inferior negra en diagonal (Life Pod One).
  function drawOne(logo, glyph) {
    const o = label.one;
    drawGradient();

    // glifo grande, tono sobre tono (relieve): sombra oscura y luz clara desplazadas
    const gx = W / 2 + frontW * 0.05;
    const gy = H * 0.42;
    const gh = H * o.glyphSize;
    const drawGlyphAt = (dx, dy, color, alpha) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(gx + dx, gy + dy);
      if (glyph) {
        const gw = gh * (glyph.width / glyph.height);
        ctx.drawImage(tintImage(glyph, color), -gw / 2, -gh / 2, gw, gh);
      } else {
        drawBrandGlyph(ctx, 0, 0, gh, color);
      }
      ctx.restore();
    };
    const off = Math.max(1, W * 0.0015);
    drawGlyphAt(off, off, '#000000', o.glyphOpacity);
    drawGlyphAt(-off, -off, '#ffffff', o.glyphOpacity);

    // zona inferior negra con corte inclinado
    const { yL, yR } = fillSlantedBottom(o.splitLeft, o.splitRight, o.bottomColor);
    // filete de luz en el corte
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = Math.max(1, W * 0.001);
    ctx.beginPath();
    ctx.moveTo(frontX, yL);
    ctx.lineTo(frontX + frontW, yR);
    ctx.stroke();

    // logo girado (se lee de arriba hacia abajo) arriba a la izquierda + línea
    const lx = frontX + frontW * 0.17;
    const ly0 = H * 0.045;
    let logoLen = H * 0.16;
    ctx.save();
    ctx.translate(lx, ly0 + logoLen / 2);
    ctx.rotate(Math.PI / 2);
    if (logo) {
      const lh = logoLen * (logo.height / logo.width);
      ctx.drawImage(tintImage(logo, label.textColor), -logoLen / 2, -lh / 2, logoLen, lh);
    } else if (label.brand) {
      const size = fitFont(ctx, label.brand, logoLen, H * 0.045, 900, 'italic');
      ctx.font = `italic 900 ${size}px ${FONT}`;
      ctx.fillStyle = label.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.brand, 0, 0);
    }
    ctx.restore();
    if (label.line) {
      const size = fitFont(ctx, label.line, logoLen * 0.4, H * 0.022, 700);
      drawVerticalText(label.line, lx + H * 0.038, ly0 + logoLen, size, 700, label.textColor, 'right', '', size * 0.2);
    }

    // sabor pequeño, siguiendo la diagonal del corte
    if (label.flavor) {
      const ang = Math.atan2(yR - yL, frontW);
      const size = H * o.flavorSize;
      ctx.save();
      ctx.translate(frontX + frontW * 0.66, yL + (yR - yL) * 0.66 - size * 1.1);
      ctx.rotate(ang);
      ctx.font = `600 ${size}px ${FONT}`;
      ctx.fillStyle = label.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.letterSpacing = `${size * 0.1}px`;
      ctx.fillText(label.flavor.toUpperCase(), 0, 0);
      ctx.restore();
      ctx.letterSpacing = '0px';
    }
  }

  // ---------- template: twoTone ----------
  // Cuerpo de dos colores con corte inclinado y moteado (Rifbar MixPro). Los textos van en la pantalla.
  function drawTwoTone() {
    const t = label.twoTone;
    drawGradient();
    fillSlantedBottom(t.splitLeft, t.splitRight, t.bottomColor);
    drawSpeckle(t.speckle, 42);
  }

  // ---------- template: pill ----------
  // Fondo oscuro, etiqueta "ICE" girada arriba y píldora vertical degradada con el sabor (refill Eco III).
  function drawPill() {
    const p = label.pill;
    ctx.fillStyle = p.background;
    ctx.fillRect(0, 0, W, H);
    const stops = label.gradient.length ? label.gradient : ['#ffffff', '#888888'];
    const pw = frontW * p.width;
    const y0 = H * p.top;
    const y1 = H * p.bottom;
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    stops.forEach((c, i) => g.addColorStop(stops.length === 1 ? 0 : i / (stops.length - 1), c));
    // frontal y trasera (la trasera está partida en el borde: se dibuja en 0 y en W)
    faceCenters.forEach((cx) => {
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(cx - pw / 2, y0, pw, y1 - y0 + pw, pw / 2);
      ctx.fill();
      if (p.tag) {
        const size = fitFont(ctx, p.tag, H * 0.12, H * 0.032, 600);
        drawVerticalText(p.tag, cx, H * 0.15, size, 600, p.tagColor, 'center', '', size * 0.15);
      }
      if (label.flavor) {
        const text = label.flavor.toUpperCase();
        const size = fitFont(ctx, text, (y1 - y0) * 0.8, pw * 0.4, 500);
        drawVerticalText(text, cx, y0 + pw * 0.8, size, 500, label.textColor, 'left', '', size * 0.18);
      }
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
    else if (label.template === 'vertical') drawVertical(logo);
    else if (label.template === 'brush') drawBrush(logo, glyph);
    else if (label.template === 'one') drawOne(logo, glyph);
    else if (label.template === 'twoTone') drawTwoTone();
    else if (label.template === 'pill') drawPill();
    else drawGradient();

    if (image) {
      drawContain(ctx, image, frontX + frontW * 0.06, H * 0.06, frontW * 0.88, H * 0.88);
    } else if (label.template === 'gradient') {
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
