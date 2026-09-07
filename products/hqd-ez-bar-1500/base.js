/**
 * HQD Ez Bar 1500. Caja compacta redondeada, tapa negra, boquilla pequeña descentrada,
 * etiqueta envolvente con degradado vertical y textos girados (HQD grande a la derecha).
 * Medidas estimadas de las fotos de tienda. Ver NOTES.md.
 */
export default {
  id: 'hqd-ez-bar-1500',
  name: 'HQD Ez Bar 1500',
  notes: 'medidas estimadas de fotos de tienda',

  body: { width: 40, depth: 17, height: 52, cornerRadius: 5, edgeRadius: 1.0, color: '#0a0a0a', finish: 'glossy' },
  base: { enabled: true, height: 2, inset: 0.3, color: '#0a0a0a' },
  frameRing: { enabled: true, height: 7, inset: 0, color: '#0c0c0c', metalness: 0.1, roughness: 0.3 },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  mouthpiece: { enabled: true, style: 'flat', width: 13, depth: 10, height: 12, offsetX: -7, color: '#0a0a0a', translucent: false },

  label: {
    enabled: true,
    template: 'vertical',
    brand: 'HQD',
    line: 'ez bar',
    flavor: 'FLAVOR',
    gradient: ['#ff5f8f', '#ff9f3a'],
    gradientAngle: 90,
    textColor: '#ffffff',
    coverage: 0.985,
    offsetY: 0.01,
    resolution: 1024,
    vertical: { brandSize: 0.15, brandX: 0.32, lineX: 0.02, flavorX: 0.12, grooves: 2 },
  },
};
