/**
 * Convierte medidas del config en posiciones Y (mm) de cada parte.
 * Las partes no saben dónde van: solo reciben tamaño y material.
 */
export function computeLayout(cfg) {
  const baseH = cfg.base.enabled ? cfg.base.height : 0;
  const bodyY = baseH;
  const bodyTop = bodyY + cfg.body.height;
  const ringH = cfg.frameRing.enabled ? cfg.frameRing.height : 0;
  const ringY = bodyTop;
  const moduleH = cfg.screenModule.enabled ? cfg.screenModule.height : 0;
  const moduleY = ringY + ringH;
  const moduleTop = moduleY + moduleH;
  const mouthY = moduleTop;
  const total = mouthY + cfg.mouthpiece.height;

  const labelY0 = bodyY + cfg.body.height * cfg.label.offsetY;
  const labelY1 = Math.min(labelY0 + cfg.body.height * cfg.label.coverage, bodyTop - 0.3);

  return { baseH, bodyY, bodyTop, ringY, ringH, moduleY, moduleH, moduleTop, mouthY, total, labelY0, labelY1 };
}
