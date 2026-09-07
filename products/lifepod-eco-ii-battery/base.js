/**
 * Life Pod Eco II · Batería (650 mAh, USB-C). Carcasa negra hueca donde se inserta el refill,
 * boca superior inclinada, logo LED rojo vertical y pantallita de porcentaje.
 * Medidas estimadas a partir de references/. Ver NOTES.md.
 */
export default {
  id: 'lifepod-eco-ii-battery',
  name: 'Life Pod Eco II Batería',
  notes: 'medidas estimadas de las fotos del kit',

  body: { width: 36, depth: 21, height: 58, cornerRadius: 5, edgeRadius: 0, color: '#0a0a0a', finish: 'glossy', topSlope: 8 },
  cavity: { enabled: true, wall: 1.6, floorY: 5, color: '#050505' },
  base: { enabled: false },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  mouthpiece: { enabled: false },
  label: { enabled: false },

  ledLogo: {
    enabled: true,
    image: 'textures/lifepod-logo.png',
    color: '#ff1a1a',
    length: 30,
    offsetX: -7,
    offsetY: 34,
    rotation: 90,
    emissiveIntensity: 1.5,
  },

  frontScreen: {
    enabled: true,
    template: 'percent',
    width: 9,
    height: 4.5,
    cornerRadius: 0.8,
    offsetX: -7,
    offsetY: 9,
    data: { battery: 99, boost: false, iceBoost: false, accent: '#37d67a' },
    emissiveIntensity: 1.8,
  },
};
