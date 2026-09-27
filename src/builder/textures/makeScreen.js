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
  const W = screen.resolution ?? (screen.template === 'mixpro' ? 1024 : 512);
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

  /**
   * Pantalla del Rifbar MixPro, medida sobre fotos del producto (fracciones del cristal).
   * Arriba: arcos punteados (blanco a la izquierda, cian a la derecha), RIFBAR fino, línea amarilla
   * punteada y el sabor (data.flavor, color data.accent), todo girado para leerse de abajo hacia arriba.
   * Abajo: panel lila con goteo, logo MIXPRO, píldoras de líquido y batería con borde de color, franja
   * de goteo blanca y dos tiles (NIC BOOST con frasco sobre mármol violeta, ICE BOOST con cubo de hielo)
   * separados por el logo "//".
   */
  function drawMixpro() {
    const d = screen.data;
    const X = (f) => f * W;
    const Y = (f) => f * H;
    const DISPLAY = "'Montserrat', " + FONT;
    const TECH = "'Rajdhani', " + FONT;
    ctx.fillStyle = '#020203';
    ctx.fillRect(0, 0, W, H);

    // ---------- arcos y línea punteados ----------
    const dashed = (pts, color, lw, dashes = 4, gap = 0.2) => {
      // pts: polilínea densa; se reparte en `dashes` trazos con huecos
      const lens = [0];
      for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const total = lens[lens.length - 1];
      const seg = total / (dashes - gap);
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = lw * 0.9;
      for (let k = 0; k < dashes; k++) {
        const a0 = k * seg;
        const a1 = a0 + seg * (1 - gap);
        ctx.beginPath();
        let started = false;
        pts.forEach(([x, y], i) => {
          if (lens[i] < a0 || lens[i] > a1) return;
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    };
    const quad = (p0, c, p2, n = 60) => {
      const out = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p2[0];
        const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p2[1];
        out.push([X(x), Y(y)]);
      }
      return out;
    };
    const lw = X(0.021);
    dashed(quad([0.1, 0.085], [0.235, 0.235], [0.15, 0.372]), '#f4f4f4', lw);
    dashed(quad([0.885, 0.085], [0.75, 0.235], [0.835, 0.372]), '#35d3ee', lw);
    dashed([[X(0.485), Y(0.078)], [X(0.485), Y(0.36)]].flatMap(([x0, y0], i, arr) => (i ? Array.from({ length: 60 }, (_, k) => [x0, arr[0][1] + ((y0 - arr[0][1]) * (k + 1)) / 60]) : [[x0, y0]])), '#f2eea6', X(0.019));

    // texto girado (se lee de abajo hacia arriba)
    const up = (text, x, yStart, size, weight, family, color, spacing = 0, style = '') => {
      ctx.save();
      ctx.translate(X(x), Y(yStart));
      ctx.rotate(-Math.PI / 2);
      ctx.font = `${style} ${weight} ${size}px ${family}`;
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = `${spacing}px`;
      ctx.fillText(text, 0, 0);
      ctx.restore();
      ctx.letterSpacing = '0px';
    };
    const fit = (text, maxLen, maxSize, weight, family, spacingEm = 0) => {
      let size = maxSize;
      for (; size > 6; size -= 1) {
        ctx.font = `${weight} ${size}px ${family}`;
        if (ctx.measureText(text).width + spacingEm * size * (text.length - 1) <= maxLen) break;
      }
      return size;
    };
    {
      const size = fit('RIFBAR', Y(0.27), X(0.075), 300, DISPLAY, 0.62);
      up('RIFBAR', 0.335, 0.357, size, 300, DISPLAY, '#f2f2f2', size * 0.62);
    }
    {
      const words = String(d.flavor || '').toUpperCase().split(/\s+/).filter(Boolean);
      const lines = words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : words;
      const xs = lines.length > 1 ? [0.603, 0.69] : [0.645];
      const size = Math.min(...lines.map((ln) => fit(ln, Y(0.27), X(0.085), 700, TECH, 0.04)));
      lines.forEach((ln, i) => up(ln, xs[i], 0.355, size, 700, TECH, d.accent ?? '#ff5fc0', size * 0.04));
    }

    // ---------- panel inferior ----------
    const px0 = X(0.09), px1 = X(0.89), py0 = Y(0.382), py1 = Y(0.905);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(px0, py0, px1 - px0, py1 - py0, X(0.075));
    ctx.clip();
    const base = ctx.createLinearGradient(0, py0, 0, Y(0.64));
    base.addColorStop(0, '#f1e6ff');
    base.addColorStop(0.18, '#d7bdf8');
    base.addColorStop(0.45, '#ad7fea');
    base.addColorStop(1, '#9765de');
    ctx.fillStyle = base;
    ctx.fillRect(px0, py0, px1 - px0, py1 - py0);

    // goteo superior (lila claro) con gotas que caen
    const drips = (yTop, yBase, amp, color, seed, count = 7) => {
      let t = seed;
      const rnd = () => ((t = (t * 9301 + 49297) % 233280) / 233280);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(px0, yTop);
      ctx.lineTo(px0, yBase);
      const n = count;
      for (let i = 0; i < n; i++) {
        const xa = px0 + ((px1 - px0) * i) / n;
        const xb = px0 + ((px1 - px0) * (i + 1)) / n;
        const xm = (xa + xb) / 2;
        const depth = amp * (0.35 + rnd() * 0.9);
        ctx.bezierCurveTo(xa + (xb - xa) * 0.2, yBase, xm - (xb - xa) * 0.28, yBase + depth, xm, yBase + depth);
        ctx.bezierCurveTo(xm + (xb - xa) * 0.28, yBase + depth, xb - (xb - xa) * 0.2, yBase, xb, yBase);
      }
      ctx.lineTo(px1, yTop);
      ctx.closePath();
      ctx.fill();
    };
    drips(py0, Y(0.43), Y(0.03), 'rgba(236,222,255,0.9)', 11, 6);
    drips(py0, Y(0.415), Y(0.022), 'rgba(250,244,255,0.75)', 29, 5);

    // logo MIXPRO (grafiti: relleno blanco, contorno lila, sombra violeta)
    {
      const text = 'MIXPRO';
      const size = fit(text, X(0.42), Y(0.06), 900, DISPLAY);
      ctx.save();
      ctx.translate(X(0.49), Y(0.415));
      // gotas del logo
      ctx.fillStyle = '#f4ecff';
      [[-0.3, 0.6], [-0.05, 0.9], [0.22, 0.5], [0.36, 0.75]].forEach(([dx, len]) => {
        ctx.beginPath();
        ctx.roundRect(dx * size * 3.2, size * 0.2, size * 0.14, size * len, size * 0.07);
        ctx.fill();
      });
      ctx.transform(1, 0, -0.12, 1, 0, 0);
      ctx.font = `900 ${size}px ${DISPLAY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#7b48d0';
      ctx.lineWidth = size * 0.34;
      ctx.strokeText(text, size * 0.05, size * 0.1);
      ctx.strokeStyle = '#c9a6f7';
      ctx.lineWidth = size * 0.22;
      ctx.strokeText(text, 0, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    // píldoras de líquido y batería
    const pill = (x0, x1, border, icon, value) => {
      const y0 = Y(0.476), y1 = Y(0.568);
      const h = y1 - y0;
      ctx.beginPath();
      ctx.roundRect(X(x0), y0, X(x1) - X(x0), h, h / 2);
      const g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, '#b58cf5');
      g.addColorStop(0.5, '#8a58e6');
      g.addColorStop(1, '#6a3ccc');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = X(0.02);
      ctx.strokeStyle = border;
      ctx.stroke();
      // brillo interior
      ctx.beginPath();
      ctx.roundRect(X(x0) + h * 0.2, y0 + h * 0.1, X(x1) - X(x0) - h * 0.4, h * 0.22, h * 0.11);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fill();
      const ix = X(x0) + h * 0.55;
      const iy = y0 + h / 2;
      ctx.fillStyle = border;
      if (icon === 'drop') {
        ctx.beginPath();
        ctx.moveTo(ix, iy - h * 0.3);
        ctx.bezierCurveTo(ix + h * 0.22, iy - h * 0.02, ix + h * 0.22, iy + h * 0.28, ix, iy + h * 0.28);
        ctx.bezierCurveTo(ix - h * 0.22, iy + h * 0.28, ix - h * 0.22, iy - h * 0.02, ix, iy - h * 0.3);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(ix + h * 0.08, iy - h * 0.32);
        ctx.lineTo(ix - h * 0.16, iy + h * 0.04);
        ctx.lineTo(ix + h * 0.01, iy + h * 0.04);
        ctx.lineTo(ix - h * 0.07, iy + h * 0.32);
        ctx.lineTo(ix + h * 0.17, iy - h * 0.06);
        ctx.lineTo(ix, iy - h * 0.06);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.font = `800 ${h * 0.62}px ${DISPLAY}`;
      const tx = ix + h * 0.3;
      ctx.fillText(value, tx, iy + h * 0.03);
      const vw = ctx.measureText(value).width;
      ctx.font = `700 ${h * 0.32}px ${DISPLAY}`;
      ctx.fillText('%', tx + vw + h * 0.06, iy + h * 0.1);
    };
    pill(0.12, 0.46, '#f7e36b', 'drop', `${Math.round(d.liquid ?? 99)}`);
    pill(0.495, 0.865, '#72e3a6', 'bolt', `${Math.round(d.battery ?? 99)}`);

    // franja blanca de goteo bajo las píldoras
    ctx.fillStyle = 'rgba(248,242,255,0.95)';
    ctx.beginPath();
    ctx.moveTo(px0, Y(0.572));
    for (let i = 0; i <= 8; i++) {
      const x = px0 + ((px1 - px0) * i) / 8;
      const yy = Y(0.585) + Math.sin(i * 1.7) * Y(0.006);
      ctx.lineTo(x, yy);
    }
    ctx.lineTo(px1, Y(0.572));
    ctx.closePath();
    ctx.fill();
    drips(Y(0.57), Y(0.588), Y(0.028), 'rgba(248,242,255,0.95)', 7, 7);

    // zona blanca inferior
    ctx.beginPath();
    ctx.roundRect(px0, Y(0.637), px1 - px0, py1 - Y(0.637) + Y(0.05), X(0.07));
    ctx.fillStyle = '#f6f1fe';
    ctx.fill();

    // tiles
    const tile = (x0, x1, draw) => {
      const y0 = Y(0.652), y1 = Y(0.892);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(X(x0), y0, X(x1) - X(x0), y1 - y0, X(0.055));
      ctx.clip();
      draw(X(x0), y0, X(x1), y1);
      ctx.restore();
      ctx.beginPath();
      ctx.roundRect(X(x0), y0, X(x1) - X(x0), y1 - y0, X(0.055));
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = X(0.008);
      ctx.stroke();
    };
    const labels = (x0, y0, x1, y1, title) => {
      const cx = (x0 + x1) / 2;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `800 ${Y(0.019)}px ${DISPLAY}`;
      ctx.fillText(title, cx, y0 + Y(0.02));
      ctx.shadowColor = 'rgba(40,0,80,0.5)';
      ctx.shadowBlur = Y(0.006);
      ctx.font = `800 ${Y(0.042)}px ${DISPLAY}`;
      const t = '100';
      const tw = ctx.measureText(t).width;
      ctx.fillText(t, cx - Y(0.012), y1 - Y(0.028));
      ctx.font = `700 ${Y(0.02)}px ${DISPLAY}`;
      ctx.fillText('%', cx + tw / 2 + Y(0.002), y1 - Y(0.025));
      ctx.shadowBlur = 0;
    };
    // NIC BOOST: mármol violeta con vetas blancas + frasco gotero rosa
    tile(0.13, 0.435, (x0, y0, x1, y1) => {
      const w = x1 - x0, h = y1 - y0;
      const bg = ctx.createLinearGradient(x0, y0, x1, y1);
      bg.addColorStop(0, '#8d45dc');
      bg.addColorStop(1, '#a86cea');
      ctx.fillStyle = bg;
      ctx.fillRect(x0, y0, w, h);
      let t = 5;
      const rnd = () => ((t = (t * 9301 + 49297) % 233280) / 233280);
      // vetas de mármol: curvas orgánicas (espirales y eses) claras con borde violeta oscuro
      const swirl = (cx0, cy0, r, turns, lwf, col) => {
        ctx.strokeStyle = col;
        ctx.lineWidth = w * lwf;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let k = 0; k <= 60; k++) {
          const tt = k / 60;
          const ang = tt * Math.PI * 2 * turns;
          const rr = r * (0.25 + tt);
          const x = cx0 + Math.cos(ang) * rr + (tt - 0.5) * w * 0.6;
          const y = cy0 + Math.sin(ang) * rr * 0.8 + Math.sin(tt * 5) * h * 0.05;
          k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      };
      for (let i = 0; i < 6; i++) {
        const cx0 = x0 + w * (0.15 + rnd() * 0.7), cy0 = y0 + h * (0.1 + rnd() * 0.8), r = w * (0.15 + rnd() * 0.25), tn = 0.6 + rnd() * 0.9;
        swirl(cx0, cy0, r, tn, 0.09, 'rgba(105,30,175,0.4)');
        swirl(cx0, cy0, r, tn, 0.04, i % 2 ? 'rgba(255,255,255,0.7)' : 'rgba(236,205,255,0.65)');
      }
      // frasco gotero
      const cx = (x0 + x1) / 2 + w * 0.02;
      const bw = w * 0.5, bh = h * 0.44, by = y0 + h * 0.36;
      ctx.lineJoin = 'round';
      ctx.lineWidth = w * 0.03;
      ctx.strokeStyle = '#3b0a4d';
      const bottle = ctx.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
      bottle.addColorStop(0, '#f6a6ec');
      bottle.addColorStop(0.45, '#ea72dc');
      bottle.addColorStop(1, '#c34cbc');
      ctx.fillStyle = bottle;
      ctx.beginPath();
      ctx.moveTo(cx - bw * 0.2, by - h * 0.02);
      ctx.lineTo(cx - bw * 0.2, by + h * 0.02);
      ctx.quadraticCurveTo(cx - bw / 2, by + h * 0.03, cx - bw / 2, by + h * 0.1);
      ctx.lineTo(cx - bw / 2, by + bh - bw * 0.12);
      ctx.quadraticCurveTo(cx - bw / 2, by + bh, cx - bw * 0.38, by + bh);
      ctx.lineTo(cx + bw * 0.38, by + bh);
      ctx.quadraticCurveTo(cx + bw / 2, by + bh, cx + bw / 2, by + bh - bw * 0.12);
      ctx.lineTo(cx + bw / 2, by + h * 0.1);
      ctx.quadraticCurveTo(cx + bw / 2, by + h * 0.03, cx + bw * 0.2, by + h * 0.02);
      ctx.lineTo(cx + bw * 0.2, by - h * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.roundRect(cx - bw * 0.36, by + h * 0.12, bw * 0.12, bh * 0.62, bw * 0.06);
      ctx.fill();
      // tapa y gotero
      ctx.fillStyle = '#2a0736';
      ctx.beginPath();
      ctx.roundRect(cx - bw * 0.28, by - h * 0.1, bw * 0.56, h * 0.09, bw * 0.08);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f6f2fa';
      ctx.beginPath();
      ctx.roundRect(cx - bw * 0.12, by - h * 0.26, bw * 0.24, h * 0.17, bw * 0.12);
      ctx.fill();
      ctx.stroke();
      labels(x0, y0, x1, y1, 'NIC. BOOST');
    });
    // ICE BOOST: fondo celeste con brillo + cubo de hielo facetado que gotea
    tile(0.56, 0.875, (x0, y0, x1, y1) => {
      const w = x1 - x0, h = y1 - y0;
      const g = ctx.createRadialGradient((x0 + x1) / 2, y0 + h * 0.45, w * 0.1, (x0 + x1) / 2, y0 + h * 0.5, w * 0.9);
      g.addColorStop(0, '#7fe6ff');
      g.addColorStop(0.5, '#2cc4f4');
      g.addColorStop(1, '#0a86d8');
      ctx.fillStyle = g;
      ctx.fillRect(x0, y0, w, h);
      const cx = (x0 + x1) / 2, cy = y0 + h * 0.46, s2 = w * 0.36;
      const top = [[cx - s2 * 0.95, cy - s2 * 0.62], [cx + s2 * 0.05, cy - s2 * 0.95], [cx + s2 * 1.0, cy - s2 * 0.6], [cx - s2 * 0.02, cy - s2 * 0.3]];
      const bl = [cx - s2 * 0.95, cy + s2 * 0.75], bm = [cx - s2 * 0.02, cy + s2 * 1.05], br = [cx + s2 * 1.0, cy + s2 * 0.72];
      ctx.strokeStyle = '#123f9e';
      ctx.lineWidth = w * 0.022;
      ctx.lineJoin = 'round';
      const poly = (pts, fill) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); };
      // gotas colgando (detrás del cubo)
      ctx.fillStyle = '#8fdcff';
      [[-0.8, 0.45], [-0.45, 0.7], [-0.1, 0.4], [0.3, 0.55], [0.7, 0.35], [0.9, 0.5]].forEach(([dx, len]) => {
        const x = cx + dx * s2;
        const yb = cy + s2 * (0.8 + 0.25 * (1 - Math.abs(dx)));
        ctx.beginPath();
        ctx.roundRect(x - w * 0.028, yb - s2 * 0.2, w * 0.056, s2 * len + s2 * 0.2, w * 0.028);
        ctx.fill();
        ctx.stroke();
      });
      poly([top[0], top[3], bm, bl], '#5fb4f0');
      poly([top[3], top[2], br, bm], '#9edcff');
      poly(top, '#e3f8ff');
      // escarcha y reflejos
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let i = 0; i < 40; i++) {
        const u = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
        const v = Math.abs(Math.sin(i * 78.233) * 12345.678) % 1;
        ctx.beginPath();
        ctx.arc(cx + (u - 0.5) * s2 * 1.7, cy + (v - 0.4) * s2 * 1.5, w * (0.006 + (i % 3) * 0.004), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = w * 0.012;
      ctx.beginPath();
      ctx.moveTo(top[0][0] + w * 0.03, top[0][1] + w * 0.05);
      ctx.lineTo(bl[0] + w * 0.03, bl[1] - w * 0.06);
      ctx.stroke();
      labels(x0, y0, x1, y1, 'ICE BOOST');
    });
    // logo "//" entre los tiles: dos paralelogramos inclinados lila con contorno, punto y gotas
    {
      const cx = X(0.497), cy = Y(0.728), hh = Y(0.07), ww = X(0.05);
      const slash = (ox) => {
        ctx.beginPath();
        ctx.moveTo(cx + ox - ww * 0.95, cy + hh * 0.5);
        ctx.lineTo(cx + ox + ww * 0.05, cy - hh * 0.5);
        ctx.lineTo(cx + ox + ww * 0.95, cy - hh * 0.5);
        ctx.lineTo(cx + ox - ww * 0.05, cy + hh * 0.5);
        ctx.closePath();
      };
      ctx.lineJoin = 'round';
      [-ww * 0.72, ww * 0.72].forEach((ox) => {
        slash(ox);
        ctx.fillStyle = '#d7bafa';
        ctx.fill();
        ctx.strokeStyle = '#7d45cf';
        ctx.lineWidth = X(0.01);
        ctx.stroke();
      });
      // gotas bajo la franja izquierda y punto
      ctx.fillStyle = '#d7bafa';
      ctx.strokeStyle = '#7d45cf';
      [[-ww * 1.2, 0.55], [-ww * 0.55, 0.9], [ww * 0.15, 0.4]].forEach(([ox, len]) => {
        ctx.beginPath();
        ctx.roundRect(cx + ox - X(0.009), cy + hh * 0.42, X(0.018), hh * len, X(0.009));
        ctx.fill();
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.arc(cx - ww * 1.55, cy + hh * 0.2, X(0.016), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    texture.needsUpdate = true;
  }

  /**
   * Dial redondo (Voopoo Zest): anillo de segmentos alrededor y texto central.
   * data.text ('88%' por defecto con data.battery), data.accent (anillo), data.accent2 (segundo arco),
   * data.icon 'N' dibuja una N grande (selector de nicotina).
   */
  function drawDial() {
    const d = screen.data;
    ctx.fillStyle = '#020304';
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.42;
    const seg = 18;
    const lit = d.icon === 'N' ? seg : Math.round((seg * (d.ring ?? d.battery ?? 88)) / 100);
    for (let i = 0; i < seg; i++) {
      const a0 = -Math.PI / 2 + (i / seg) * Math.PI * 2 + 0.04;
      const a1 = a0 + (Math.PI * 2) / seg - 0.08;
      const on = i < lit;
      const col = i < seg / 2 ? d.accent : d.accent2 ?? d.accent;
      ctx.strokeStyle = on ? col : '#1a1f24';
      ctx.shadowColor = on ? col : 'transparent';
      ctx.shadowBlur = on ? R * 0.12 : 0;
      ctx.lineWidth = R * 0.16;
      ctx.beginPath();
      ctx.arc(cx, cy, R, a0, a1);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = d.textColor ?? '#e8f4ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (d.icon === 'N') {
      ctx.fillStyle = d.accent;
      ctx.font = `800 ${R * 0.9}px ${FONT}`;
      ctx.fillText('N', cx, cy + R * 0.04);
    } else {
      const txt = d.text ?? `${Math.round(d.battery ?? 88)}`;
      ctx.font = `800 ${R * 0.62}px ${FONT}`;
      ctx.fillText(txt, cx - R * 0.08, cy + R * 0.02);
      ctx.font = `700 ${R * 0.26}px ${FONT}`;
      ctx.fillText('%', cx + R * 0.46, cy + R * 0.16);
    }
    texture.needsUpdate = true;
  }

  /** Perilla de hielo (Ice King): cubo esmerilado con un copo de nieve grabado. */
  function drawSnowflake() {
    const d = screen.data;
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#fbfdff');
    g.addColorStop(0.5, '#dfe8ef');
    g.addColorStop(1, '#c9d6e0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.strokeStyle = d.accent ?? 'rgba(150,170,190,0.9)';
    ctx.lineWidth = Math.max(2, W * 0.018);
    ctx.lineCap = 'round';
    const R = Math.min(W, H) * 0.3;
    for (let k = 0; k < 6; k++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -R);
      ctx.moveTo(0, -R * 0.55);
      ctx.lineTo(-R * 0.22, -R * 0.78);
      ctx.moveTo(0, -R * 0.55);
      ctx.lineTo(R * 0.22, -R * 0.78);
      ctx.stroke();
    }
    ctx.restore();
    texture.needsUpdate = true;
  }

  /** Solo dígitos grandes (data.text), para pantallitas numéricas. */
  function drawDigits() {
    const d = screen.data;
    ctx.fillStyle = '#020304';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = d.accent ?? '#ffffff';
    ctx.font = `800 ${H * 0.7}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.text ?? `${Math.round(d.battery ?? 99)}`, W / 2, H / 2);
    texture.needsUpdate = true;
  }

  /** Columna vertical de niveles: TURBO, iconos y 25/50/75/100 % (costado del ElfBar BC15000). */
  function drawLevels() {
    const d = screen.data;
    ctx.fillStyle = '#020304';
    ctx.fillRect(0, 0, W, H);
    const items = ['TURBO', '💧⚡', '25%', '50%', '75%', '100%'];
    ctx.fillStyle = d.accent ?? '#e8e8e8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    items.forEach((t, i) => {
      const y = H * (0.1 + (0.82 * i) / (items.length - 1));
      ctx.save();
      ctx.translate(W / 2, y);
      ctx.rotate(-Math.PI / 2);
      ctx.font = `800 ${Math.min(W * 0.42, H * 0.07)}px ${FONT}`;
      ctx.fillText(t === '💧⚡' ? '• ⚡' : t, 0, 0);
      ctx.restore();
    });
    texture.needsUpdate = true;
  }

  function drawProcedural() {
    if (screen.template === 'percent') return drawPercent();
    if (screen.template === 'levels') return drawLevels();
    if (screen.template === 'dial') return drawDial();
    if (screen.template === 'snowflake') return drawSnowflake();
    if (screen.template === 'digits') return drawDigits();
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
