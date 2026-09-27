/**
 * Rifbar MixPro 40K. Cuerpo de dos colores con corte inclinado y moteado, pantalla grande a color
 * en la cara frontal (marca y sabor girados, panel violeta con porcentajes y boosts), botón NIC
 * lateral del color inferior y boquilla translúcida teñida.
 * Medidas: 101 × 51 × 25 según reseñas. Ver NOTES.md.
 */
export default {
  id: 'rifbar-mixpro-40k',
  name: 'Rifbar MixPro 40K',
  notes: 'medidas de reseñas (101 × 51 × 25)',

  body: { width: 50, depth: 25, height: 93, cornerRadius: 7, edgeRadius: 2.5, color: '#e8244a', finish: 'mate' },
  base: { enabled: false },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: true, side: 'right', width: 5, height: 11, offsetY: 48, color: '#3fd8c8' },
  mouthpiece: {
    enabled: true, style: 'flat', width: 14, depth: 9, height: 8, offsetX: 4,
    color: '#8fe8e0', translucent: true, transmission: 0.7, opacity: 0.9, thickness: 2,
  },

  frontScreen: {
    enabled: true,
    template: 'mixpro',
    width: 30,
    height: 50,
    cornerRadius: 3,
    offsetX: 0,
    offsetY: 48,
    data: { battery: 99, liquid: 99, accent: '#ff6f8a', flavor: 'FLAVOR' },
    emissiveIntensity: 1.5,
  },

  label: {
    enabled: true,
    template: 'twoTone',
    gradient: ['#e8244a'],
    gradientAngle: 90,
    coverage: 1,
    offsetY: 0,
    resolution: 1024,
    twoTone: { bottomColor: '#3fd8c8', splitLeft: 0.27, splitRight: 0.20, speckle: 0.35 },
  },
};
