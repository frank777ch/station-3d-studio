import * as THREE from 'three';
import { loadImage, drawCover, drawContain, tintImage } from './loadImage.js';

const FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";

function fitFont(ctx, text, maxWidth, maxSize, weight = 800, style = '', family = FONT, spacingEm = 0) {
  let size = maxSize;
  for (; size > 8; size -= 1) {
    ctx.font = `${style} ${weight} ${size}px ${family}`;
    const extra = spacingEm * size * Math.max(0, text.length - 1);
    if (ctx.measureText(text).width + extra <= maxWidth) break;
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

  // ---------- texto girado ----------
  const DISPLAY = label.font ? `${label.font}, ${FONT}` : FONT;

  /**
   * Texto girado 90°. readUp: se lee de abajo hacia arriba (rotación -90°); si no, de arriba abajo.
   * align 'start' | 'center' | 'end' en el sentido de lectura; (x, y) es el ancla.
   */
  function drawVerticalText(text, x, y, size, weight, color, align = 'center', style = '', spacing = 0, readUp = false, family = FONT, alpha = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(readUp ? -Math.PI / 2 : Math.PI / 2);
    ctx.font = `${style} ${weight} ${size}px ${family}`;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.textAlign = align === 'start' || align === 'left' ? 'left' : align === 'end' || align === 'right' ? 'right' : 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = `${spacing}px`;
    ctx.fillText(text, 0, 0);
    ctx.restore();
    ctx.letterSpacing = '0px';
  }

  /** Bloque de texto vertical configurable: { text, x (fracción del ancho frontal desde el centro), y (fracción de H), size, weight, ... } */
  function verticalItem(text, o, defaults) {
    if (!text) return;
    const c = { ...defaults, ...Object.fromEntries(Object.entries(o).filter(([, v]) => v != null)) };
    const family = c.display ? DISPLAY : FONT;
    const spacingEm = c.spacing ?? 0;
    const size = fitFont(ctx, text, H * c.maxLen, H * c.size, c.weight, c.style, family, spacingEm);
    drawVerticalText(text, W / 2 + frontW * c.x, H * c.y, size, c.weight, c.color, c.align, c.style, size * spacingEm, c.readUp, family, c.alpha ?? 1);
  }

  // ---------- template: vertical ----------
  // Fondo degradado y textos girados 90°, como HQD / ElfBar / Voopoo.
  function drawVertical(logo) {
    const v = label.vertical;
    drawGradient();
    if (v.cap) {
      // tapa superior de otra pieza con borde en V (ElfBar BC): color liso arriba del borde
      const y0 = H * v.cap.y;
      const dip = H * (v.cap.dip ?? 0.05);
      const vAt = (x) => {
        // V en frente y trasera (vértice en el centro de cada cara), recto en los costados
        const centers = [0, W / 2, W];
        let best = Infinity;
        centers.forEach((c) => { best = Math.min(best, Math.abs(x - c)); });
        const half = frontW / 2 + sideW * 0.5;
        const k = Math.max(0, 1 - best / half);
        return y0 + dip * k;
      };
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let x = 0; x <= W; x += W / 200) ctx.lineTo(x, vAt(x));
      ctx.lineTo(W, 0);
      ctx.closePath();
      ctx.fillStyle = v.cap.color ?? label.gradient[0];
      ctx.fill();
      ctx.strokeStyle = v.cap.line ?? 'rgba(255,255,255,0.35)';
      ctx.lineWidth = Math.max(1, W * 0.0015);
      ctx.beginPath();
      for (let x = 0; x <= W; x += W / 200) (x ? ctx.lineTo(x, vAt(x)) : ctx.moveTo(x, vAt(x)));
      ctx.stroke();
    }
    if (v.backColor) {
      // carcasa trasera + costado izquierdo de otro color, con arcos del color del frente
      const backW = W - frontW - 2 * sideW;
      ctx.fillStyle = v.backColor;
      ctx.fillRect(0, 0, frontX, H);
      ctx.fillRect(frontX + frontW + sideW, 0, W - (frontX + frontW + sideW), H);
      if (v.backArcs > 0) {
        ctx.strokeStyle = v.arcColor ?? label.gradient[0];
        ctx.lineWidth = backW * 0.035;
        [0, W].forEach((cx) => {
          for (let i = 0; i < v.backArcs; i++) {
            const R = H * (0.55 + i * 0.12);
            ctx.beginPath();
            ctx.arc(cx - backW * 0.9 + i * backW * 0.08, H * 0.5, R, -0.55, 0.55);
            ctx.stroke();
          }
        });
      }
    }
    if (v.highlight > 0) {
      // brillo superior (plástico brillante): banda clara que se desvanece hacia abajo
      const g = ctx.createLinearGradient(0, 0, 0, H * 0.45);
      g.addColorStop(0, `rgba(255,255,255,${v.highlight})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H * 0.45);
    }
    if (v.stripWidth > 0) {
      // franja oscura que envuelve el canto izquierdo (módulo lateral tipo Voopoo Zest)
      ctx.fillStyle = v.stripColor;
      ctx.fillRect(frontX - sideW * 1.05, 0, sideW * 1.05 + frontW * v.stripWidth, H);
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
    const readUp = !!v.readUp;
    const color = label.textColor;
    const alpha = v.textAlpha ?? 1;
    if (logo) {
      const lw = H * v.brandSize * 2.2;
      const lh = lw * (logo.height / logo.width);
      ctx.save();
      ctx.translate(W / 2 + frontW * v.brandX, H * (v.brandY ?? 0.5));
      ctx.rotate(readUp ? -Math.PI / 2 : Math.PI / 2);
      ctx.drawImage(tintImage(logo, color), -lw / 2, -lh / 2, lw, lh);
      ctx.restore();
    } else {
      verticalItem(label.brand, { x: v.brandX, y: v.brandY, size: v.brandSize, weight: v.brandWeight, spacing: v.brandSpacing, align: v.brandAlign, style: v.brandStyle },
        { x: 0, y: 0.5, size: 0.3, maxLen: v.brandMaxLen ?? 0.9, weight: 900, spacing: -0.02, align: 'center', style: '', color, readUp, display: true, alpha });
    }
    verticalItem(label.line, { x: v.lineX, y: v.lineY, size: v.lineSize, weight: v.lineWeight, spacing: v.lineSpacing, align: v.lineAlign, style: v.lineStyle },
      { x: 0.2, y: 0.8, size: 0.09, maxLen: v.lineMaxLen ?? 0.45, weight: 900, spacing: 0, align: 'center', style: 'italic', color, readUp, display: true, alpha });
    verticalItem(label.flavor ? label.flavor.toUpperCase() : '', { x: v.flavorX, y: v.flavorY, size: v.flavorSize, weight: v.flavorWeight, spacing: v.flavorSpacing, align: v.flavorAlign, style: v.flavorStyle },
      { x: -0.34, y: 0.06, size: 0.035, maxLen: v.flavorMaxLen ?? 0.54, weight: 700, spacing: 0.12, align: 'start', style: '', color, readUp, display: false, alpha });
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
  const hashStr = (str) => [...String(str)].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);

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
    // cada costado sigue a la altura del borde frontal que toca; la trasera une ambos por el centro
    ctx.beginPath();
    ctx.moveTo(0, yMid);
    ctx.lineTo(frontX - sideW, yL);     // mitad trasera izquierda
    ctx.lineTo(frontX, yL);             // costado izquierdo
    ctx.lineTo(frontX + frontW, yR);    // cara frontal
    ctx.lineTo(frontX + frontW + sideW, yR); // costado derecho
    ctx.lineTo(W, yMid);                // mitad trasera derecha
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    return { yL, yR };
  }

  /** Moteado (plástico con partículas): mayoría de motas claras y algunas oscuras. */
  function drawSpeckle(amount, seed = 7, light = 'rgba(255,255,255,0.8)') {
    if (amount <= 0) return;
    const rand = rng(seed);
    const n = Math.round(W * H * 0.0006 * amount);
    const scale = W / 1024;
    for (let i = 0; i < n; i++) {
      const x = rand() * W;
      const y = rand() * H;
      const r = (0.45 + rand() * rand() * 1.6) * scale;
      ctx.fillStyle = rand() > 0.18 ? light : 'rgba(40,20,60,0.45)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------- template: brush ----------
  // Fondo claro con brochazos de pincel seco, marca girada y franja de color a la derecha (ElfBar Ice King).
  // brush.style 'waves' dibuja en su lugar bandas verticales onduladas con espuma (Summer Edition).
  function dryBrush(cx, cy, len, thick, angle, color, rand) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    // cuerpo del trazo: muchas fibras finas de largo y opacidad variables
    // base sólida con bordes irregulares
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    const steps = 24;
    const taper = (i) => Math.sin((Math.PI * i) / steps) ** 0.35; // se afina en las puntas
    for (let i = 0; i <= steps; i++) {
      const x = -len * 0.42 + (len * 0.8 * i) / steps;
      const y = -thick * (0.18 + 0.2 * rand()) * taper(i);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    for (let i = steps; i >= 0; i--) {
      const x = -len * 0.42 + (len * 0.8 * i) / steps + (rand() - 0.5) * len * 0.05;
      ctx.lineTo(x, thick * (0.16 + 0.22 * rand()) * taper(i));
    }
    ctx.closePath();
    ctx.fill();
    // fibras de pincel seco alrededor, más largas en el centro
    const fibers = Math.max(40, Math.round(thick / Math.max(1, W * 0.003)));
    for (let i = 0; i < fibers; i++) {
      const t = i / (fibers - 1) - 0.5;
      const y = t * thick + (rand() - 0.5) * thick * 0.03;
      const edge = 1 - Math.pow(Math.abs(t) * 2, 3); // fibras más cortas en los bordes del trazo
      const l = len * (0.5 + 0.5 * rand()) * (0.55 + 0.45 * edge);
      const x0 = -len / 2 + (rand() * 0.2) * len;
      ctx.globalAlpha = 0.6 + 0.4 * rand() * (0.5 + 0.5 * edge);
      ctx.lineWidth = Math.max(1, (thick / fibers) * (1.4 + rand() * 1.8));
      ctx.beginPath();
      ctx.moveTo(x0, y);
      // pequeña ondulación
      ctx.quadraticCurveTo(x0 + l / 2, y + (rand() - 0.5) * thick * 0.06, x0 + l, y + (rand() - 0.5) * thick * 0.04);
      ctx.stroke();
    }
    // salpicado en la punta
    for (let i = 0; i < 24; i++) {
      const y = (rand() - 0.5) * thick;
      const x = len * (0.25 + 0.35 * rand());
      ctx.globalAlpha = 0.4 + 0.5 * rand();
      ctx.beginPath();
      ctx.ellipse(x, y, W * 0.004 * (1 + rand() * 3), W * 0.0015 * (1 + rand()), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawWaves(b, paintW, rand) {
    // bandas verticales onduladas (izquierda → derecha) con filete de espuma blanca
    const colors = b.colors.length ? b.colors : ['#cfe66a', '#bfe6f5'];
    ctx.fillStyle = b.background;
    ctx.fillRect(0, 0, W, H);
    const bands = colors.length;
    for (let i = 0; i < bands; i++) {
      const x0 = frontX + (paintW * (i + 0.35)) / bands;
      const amp = paintW * 0.05;
      const freq = 3 + (i % 2);
      const edge = (y) => x0 + Math.sin((y / H) * Math.PI * freq + i) * amp + Math.sin((y / H) * Math.PI * 9 + i * 2) * amp * 0.25;
      ctx.beginPath();
      ctx.moveTo(edge(0), 0);
      for (let y = 0; y <= H; y += H / 80) ctx.lineTo(edge(y), y);
      ctx.lineTo(W, H);
      ctx.lineTo(W, 0);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      // espuma
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = Math.max(2, W * 0.004);
      ctx.beginPath();
      ctx.moveTo(edge(0), 0);
      for (let y = 0; y <= H; y += H / 80) ctx.lineTo(edge(y) + W * 0.004, y);
      ctx.stroke();
    }
    // salpicaduras
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.5 + rand() * 0.5})`;
      ctx.beginPath();
      ctx.arc(frontX + rand() * paintW, rand() * H, W * 0.002 * (1 + rand() * 2), 0, Math.PI * 2);
      ctx.fill();
    }
    // la cara trasera repite el patrón de forma simplificada
  }

  /** Líneas blancas en relieve (costuras decorativas del Ice King). */
  function drawSeams(paintW) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = Math.max(1, W * 0.0018);
    const x0 = frontX;
    const pts = [
      [[0.15, 0.62], [0.55, 0.52], [0.98, 0.58]],
      [[0.05, 0.93], [0.45, 0.83], [0.98, 0.9]],
    ];
    pts.forEach((line) => {
      ctx.beginPath();
      line.forEach(([u, v], i) => (i ? ctx.lineTo(x0 + u * paintW, v * H) : ctx.moveTo(x0 + u * paintW, v * H)));
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawElfGlyph(x, y, size, color) {
    // hoja/hada estilizada con burbujas (placeholder del símbolo ElfBar)
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1.5, size * 0.06);
    ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      ctx.save();
      ctx.rotate(-0.9 + k * 0.9);
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.28, size * 0.12, size * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    [[0.35, -0.55, 0.07], [0.5, -0.75, 0.05], [0.28, -0.8, 0.04]].forEach(([bx, by, br]) => {
      ctx.beginPath();
      ctx.arc(bx * size, by * size, br * size, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawBrush(logo, glyph) {
    const b = label.brush;
    const rand = rng(hashStr(label.flavor + b.colors.join()));
    const stripW = frontW * b.stripWidth;
    const paintW = frontW - stripW; // zona pintada de la cara frontal
    const angle = (-b.angle * Math.PI) / 180;
    const colors = b.colors.length ? b.colors : ['#c8102e'];

    if (b.style === 'waves') {
      drawWaves(b, paintW, rand);
    } else {
      ctx.fillStyle = b.background;
      ctx.fillRect(0, 0, W, H);
      // brochazos en la cara frontal (y una versión en la trasera)
      const faces = [{ x0: frontX, w: paintW }, { x0: 0, w: W - frontW - 2 * sideW }];
      faces.forEach(({ x0, w }, fi) => {
        const n = fi === 0 ? b.strokes : Math.max(1, b.strokes - 1);
        for (let i = 0; i < n; i++) {
          const color = colors[i % colors.length];
          const cy = H * (0.26 + (0.52 * i) / Math.max(1, n - 1) + (rand() - 0.5) * 0.08);
          // en la cara frontal los trazos quedan a la derecha de la columna del texto
          const cx = x0 + w * (fi === 0 ? 0.66 + (rand() - 0.5) * 0.18 : 0.5 + (rand() - 0.5) * 0.3);
          const len = w * (fi === 0 ? 0.85 + 0.35 * rand() : 1.2 + 0.4 * rand());
          const thick = H * (0.11 + 0.08 * rand());
          dryBrush(cx, cy, len, thick, angle * (0.8 + rand() * 0.4), color, rand);
        }
      });
      if (b.seams) drawSeams(paintW);
    }

    // franja de color a la derecha de la cara frontal (módulo de pantalla), envuelve el canto
    if (stripW > 0) {
      ctx.fillStyle = b.stripColor;
      ctx.fillRect(frontX + paintW, 0, stripW + sideW * 1.05, H);
    }

    // marca girada, en el color principal
    const brandColor = b.brandColor ?? colors[0];
    const bx = frontX + paintW / 2 + paintW * b.brandX;
    const readUp = b.readUp ?? true;
    if (logo) {
      const lw = H * b.brandSize * 2.4;
      const lh = lw * (logo.height / logo.width);
      ctx.save();
      ctx.translate(bx, H * 0.6);
      ctx.rotate(readUp ? -Math.PI / 2 : Math.PI / 2);
      ctx.drawImage(tintImage(logo, brandColor), -lw / 2, -lh / 2, lw, lh);
      ctx.restore();
    } else if (label.brand) {
      const spacing = b.brandSpacing ?? 0.45;
      const size = fitFont(ctx, label.brand, H * (b.brandLen ?? 0.58), H * b.brandSize, b.brandWeight ?? 400, '', DISPLAY, spacing);
      drawVerticalText(label.brand, bx, H * (b.brandStart ?? 0.95), size, b.brandWeight ?? 400, brandColor, 'start', '', size * spacing, readUp, DISPLAY);
    }
    // símbolo encima de la marca
    if (b.glyph !== false) {
      const gy = H * ((b.brandStart ?? 0.95) - (b.brandLen ?? 0.58) - 0.06);
      if (glyph) {
        const gh = H * 0.07;
        const gw = gh * (glyph.width / glyph.height);
        ctx.drawImage(tintImage(glyph, brandColor), bx - gw / 2, gy - gh / 2, gw, gh);
      } else {
        drawElfGlyph(bx, gy + H * 0.02, H * (b.glyphSize ?? 0.1), brandColor);
      }
    }
    if (label.flavor && b.showFlavor) {
      const size = fitFont(ctx, label.flavor.toUpperCase(), H * 0.5, H * 0.03, 600);
      drawVerticalText(label.flavor.toUpperCase(), bx + H * b.brandSize * 0.8, H * 0.95, size, 600, brandColor, 'start', '', size * 0.12, readUp);
    }
  }

  // ---------- template: one ----------
  // Placa lisa o metálica con logo girado arriba a la izquierda, glifo grande grabado,
  // sabor pequeño sobre el corte, zona inferior negra en diagonal y cantos laminados (Life Pod One).
  function glyphOutline(img, color, thickness) {
    // contorno de la máscara: dilatar y restar la forma original
    const pad = Math.ceil(thickness * 2);
    const c = document.createElement('canvas');
    c.width = img.width + pad * 2;
    c.height = img.height + pad * 2;
    const g = c.getContext('2d');
    const tinted = tintImage(img, color);
    for (let a = 0; a < 16; a++) {
      const ang = (a / 16) * Math.PI * 2;
      g.drawImage(tinted, pad + Math.cos(ang) * thickness, pad + Math.sin(ang) * thickness);
    }
    g.globalCompositeOperation = 'destination-out';
    g.drawImage(img, pad, pad);
    return { canvas: c, pad };
  }

  function drawOne(logo, glyph) {
    const o = label.one;
    drawGradient();

    // cantos laminados: franjas en los costados (capas de la carcasa)
    if (o.sideStripes > 0) {
      // líneas finas oscuras entre capas, repartidas en cada costado
      const sides = [frontX - sideW, frontX + frontW];
      sides.forEach((x0) => {
        const n = o.sideStripes;
        const lw = sideW * (o.stripeWidth ?? 0.07);
        for (let i = 1; i <= n; i++) {
          ctx.fillStyle = o.stripeColor;
          ctx.fillRect(x0 + (sideW * i) / (n + 1) - lw / 2, 0, lw, H);
        }
      });
    }

    // glifo grande grabado (contorno oscuro + luz desplazada)
    const gx = W / 2 + frontW * (o.glyphX ?? 0.05);
    const gy = H * (o.glyphY ?? 0.42);
    const gh = H * o.glyphSize;
    if (glyph) {
      const gw = gh * (glyph.width / glyph.height);
      const scale = gh / glyph.height;
      const thick = Math.max(1, (o.glyphLine ?? 0.012) * frontW / scale);
      const dark = glyphOutline(glyph, '#000000', thick);
      const light = glyphOutline(glyph, '#ffffff', thick * 0.8);
      const draw = (res, dx, dy, alpha) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        const pw = res.pad * scale;
        ctx.drawImage(res.canvas, gx - gw / 2 - pw + dx, gy - gh / 2 - pw + dy, gw + 2 * pw, gh + 2 * pw);
        ctx.restore();
      };
      const off = Math.max(1, W * 0.0012);
      draw(dark, off, off, o.glyphOpacity * 2);
      draw(light, -off, -off, o.glyphOpacity * 1.2);
    } else {
      drawBrandGlyph(ctx, gx, gy, gh, `rgba(0,0,0,${o.glyphOpacity})`);
    }

    // zona inferior negra con corte inclinado
    const { yL, yR } = fillSlantedBottom(o.splitLeft, o.splitRight, o.bottomColor);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = Math.max(1, W * 0.001);
    ctx.beginPath();
    ctx.moveTo(frontX, yL);
    ctx.lineTo(frontX + frontW, yR);
    ctx.stroke();

    // logo girado (se lee de abajo hacia arriba) arriba a la izquierda, con su línea debajo
    const readUp = o.readUp ?? true;
    const lx = frontX + frontW * (o.logoX ?? 0.14);
    const logoLen = H * (o.logoLen ?? 0.2);
    const logoBottom = H * (o.logoBottom ?? 0.3);
    ctx.save();
    ctx.translate(lx, logoBottom - logoLen / 2);
    ctx.rotate(readUp ? -Math.PI / 2 : Math.PI / 2);
    let lockH = logoLen * 0.25;
    if (logo) {
      lockH = logoLen * (logo.height / logo.width);
      ctx.drawImage(tintImage(logo, label.textColor), -logoLen / 2, -lockH / 2, logoLen, lockH);
    } else if (label.brand) {
      const size = fitFont(ctx, label.brand, logoLen, H * 0.05, 900, 'italic', DISPLAY);
      ctx.font = `italic 900 ${size}px ${DISPLAY}`;
      ctx.fillStyle = label.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.brand, 0, 0);
      lockH = size;
    }
    if (label.line) {
      // "ONE" debajo de las letras del logo, alineado a la derecha (en el marco girado)
      const size = fitFont(ctx, label.line, logoLen * 0.3, lockH * (o.lineSize ?? 0.42), 400, '', DISPLAY, 0.12);
      ctx.font = `400 ${size}px ${DISPLAY}`;
      ctx.letterSpacing = `${size * 0.12}px`;
      ctx.fillStyle = label.textColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(label.line, logoLen / 2, lockH * (o.lineOffset ?? 0.3));
      ctx.letterSpacing = '0px';
    }
    ctx.restore();

    // sabor pequeño, siguiendo la diagonal del corte
    if (label.flavor) {
      const ang = Math.atan2(yR - yL, frontW);
      const size = H * o.flavorSize;
      const at = o.flavorAt ?? 0.72;
      ctx.save();
      ctx.translate(frontX + frontW * at, yL + (yR - yL) * at - size * 0.5);
      ctx.rotate(ang);
      ctx.font = `600 ${size}px ${FONT}`;
      ctx.fillStyle = o.flavorColor ?? label.textColor;
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
    const backW = W - frontW - 2 * sideW;
    // la trasera está partida en la costura (u = 0 / 1): se dibuja centrada en 0 y en W
    const onBack = (fn) => [0, W].forEach((cx) => { ctx.save(); ctx.translate(cx, 0); fn(); ctx.restore(); });
    if (t.backPanel) {
      // panel en relieve: contorno achaflanado con muescas, un poco más claro
      onBack(() => {
        const pw = backW * 0.8, ph = H * 0.84, c = pw * 0.14, nt = pw * 0.36, nb = pw * 0.24, nd = H * 0.03;
        const x0 = -pw / 2, y0 = H * 0.08;
        ctx.beginPath();
        ctx.moveTo(x0 + c, y0);
        ctx.lineTo(-nt / 2, y0); ctx.lineTo(-nb / 2, y0 + nd); ctx.lineTo(nb / 2, y0 + nd); ctx.lineTo(nt / 2, y0);
        ctx.lineTo(x0 + pw - c, y0); ctx.lineTo(x0 + pw, y0 + c);
        ctx.lineTo(x0 + pw, y0 + ph - c); ctx.lineTo(x0 + pw - c, y0 + ph);
        ctx.lineTo(nt / 2, y0 + ph); ctx.lineTo(nb / 2, y0 + ph - nd); ctx.lineTo(-nb / 2, y0 + ph - nd); ctx.lineTo(-nt / 2, y0 + ph);
        ctx.lineTo(x0 + c, y0 + ph); ctx.lineTo(x0, y0 + ph - c); ctx.lineTo(x0, y0 + c);
        ctx.closePath();
        ctx.strokeStyle = t.backPanel;
        ctx.lineWidth = Math.max(2, W * 0.004);
        ctx.stroke();
      });
    }
    drawSpeckle(t.speckle, 42, t.speckleColor ?? 'rgba(255,255,255,0.8)');
    if (t.backText) {
      onBack(() => {
        const size = fitFont(ctx, t.backText, H * 0.42, backW * 0.1, 300, '', DISPLAY, 0.6);
        const x = -backW * 0.12;
        drawVerticalText(t.backText, x, H * 0.66, size, 300, t.backTextColor ?? '#ffffff', 'start', '', size * 0.6, true, DISPLAY);
        if (t.backLogo) {
          // logo "//": dos franjas inclinadas
          const lx = backW * 0.18, ly = H * 0.2, hh = H * 0.05, ww = backW * 0.06;
          ctx.fillStyle = t.backTextColor ?? '#ffffff';
          [-0.6, 0.6].forEach((o) => {
            ctx.beginPath();
            ctx.moveTo(lx + o * ww - ww * 0.45, ly + hh * 0.5);
            ctx.lineTo(lx + o * ww + ww * 0.15, ly - hh * 0.5);
            ctx.lineTo(lx + o * ww + ww * 0.7, ly - hh * 0.5);
            ctx.lineTo(lx + o * ww + ww * 0.1, ly + hh * 0.5);
            ctx.closePath();
            ctx.fill();
          });
        }
      });
    }
  }

  // ---------- template: pill ----------
  // Fondo oscuro, etiqueta superior girada y arco vertical degradado que se ensancha en la base,
  // con el sabor girado dentro (refill Eco III).
  function pillPath(cx, pw, y0, flare) {
    const r = pw / 2;
    const f = flare;
    ctx.beginPath();
    ctx.moveTo(cx - r - f, H + 2);
    ctx.lineTo(cx - r - f, H);
    if (f > 0) ctx.arc(cx - r - f, H - f, f, Math.PI / 2, 0, true);
    ctx.lineTo(cx - r, y0 + r);
    ctx.arc(cx, y0 + r, r, Math.PI, 0, false);
    ctx.lineTo(cx + r, H - f);
    if (f > 0) ctx.arc(cx + r + f, H - f, f, Math.PI, Math.PI / 2, true);
    ctx.lineTo(cx + r + f, H + 2);
  }

  function drawPill() {
    const p = label.pill;
    ctx.fillStyle = p.background;
    ctx.fillRect(0, 0, W, H);
    const stops = label.gradient.length ? label.gradient : ['#ffffff', '#888888'];
    const pw = frontW * p.width;
    const y0 = H * p.top;
    const flare = frontW * (p.flare ?? 0);
    const g = ctx.createLinearGradient(0, y0, 0, H);
    stops.forEach((c, i) => g.addColorStop(stops.length === 1 ? 0 : i / (stops.length - 1), c));
    const readUp = p.readUp ?? true;
    const off = frontW * (p.offsetX ?? 0);
    // frontal y trasera (la trasera está partida en el borde: se dibuja en 0 y en W)
    faceCenters.forEach((c0) => {
      const cx = c0 + off;
      pillPath(cx, pw, y0, flare);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
      if (p.outline) {
        pillPath(cx, pw, y0, flare);
        ctx.strokeStyle = p.outline;
        ctx.lineWidth = Math.max(1.5, frontW * 0.012);
        ctx.stroke();
      }
      if (p.tag) {
        const size = fitFont(ctx, p.tag, H * 0.12, H * (p.tagSize ?? 0.034), 700, '', DISPLAY);
        drawVerticalText(p.tag, cx, H * (p.tagY ?? 0.22), size, 700, p.tagColor, 'center', '', size * 0.08, readUp, DISPLAY);
      }
      if (label.flavor) {
        const text = label.flavor.toUpperCase();
        const start = H * (p.flavorStart ?? 0.9);
        const size = fitFont(ctx, text, start - y0 - pw * 0.4, pw * (p.flavorSize ?? 0.3), 500, '', DISPLAY, 0.12);
        drawVerticalText(text, cx, start, size, 500, label.textColor, 'start', '', size * 0.12, readUp, DISPLAY);
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
  if (label.font && typeof document !== 'undefined' && document.fonts?.load) {
    const fam = label.font;
    loads.push(Promise.all(['300', '400', '500', '600', '700', '800', '900'].map((w) => document.fonts.load(`${w} 48px ${fam}`)))
      .then(() => ({})).catch(() => ({})));
  }
  if (label.glyphImage) {
    loads.push(loadImage(label.glyphImage).then((glyph) => ({ glyph })).catch((err) => (console.warn('[label]', err.message), {})));
  }
  const ready = loads.length
    ? Promise.all(loads).then((parts) => draw(Object.assign({}, ...parts)))
    : Promise.resolve();
  return { texture, ready };
}
