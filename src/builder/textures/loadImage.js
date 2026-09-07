/**
 * Carga una imagen de public/ (ruta relativa, ej. 'textures/logo.png').
 * Se resuelve con BASE_URL para que funcione en dev y en build.
 */
export function loadImage(path) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen ${path}`));
    img.src = /^(https?:)?\/\//.test(path) ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
  });
}

/** Dibuja img cubriendo (cover) el rectángulo destino, centrada. */
export function drawCover(ctx, img, x, y, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/** Dibuja img dentro (contain) del rectángulo destino, centrada. Devuelve el rect dibujado. */
export function drawContain(ctx, img, x, y, w, h) {
  const s = Math.min(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
  return { x: dx, y: dy, w: dw, h: dh, right: dx + dw, bottom: dy + dh };
}

/** Devuelve un canvas con la imagen teñida de `color` (usa la imagen como máscara alfa). */
export function tintImage(img, color) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}
