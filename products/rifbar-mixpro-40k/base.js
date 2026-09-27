/**
 * Rifbar MixPro 40K. Cuerpo de dos colores con esquinas achaflanadas (silueta octogonal), plástico
 * moteado, pantalla a color enorme con bisel negro en relieve que ocupa casi todo el frente (RIFBAR y
 * sabor girados arriba, panel violeta con porcentajes y boosts abajo), botón "NIC" alto en el costado
 * derecho, puerto USB-C debajo y boquilla translúcida abombada del color inferior.
 * Medidas: 101 × 51 × 25 según reseñas; el reparto interno sale de la foto de tienda. Ver NOTES.md.
 */
const W = 51;
const D = 25;
const BOTTOM = '#3fd8c8';

export default {
  id: 'rifbar-mixpro-40k',
  name: 'Rifbar MixPro 40K',
  notes: 'medidas de reseñas (101 × 51 × 25), detalles de la foto de tienda',

  body: {
    width: W, depth: D, height: 89, cornerRadius: 3.5, edgeRadius: 2.2, color: '#e8244a', finish: 'mate',
    topChamfer: 7.5, bottomChamfer: 6, bottomColor: BOTTOM,
  },
  base: { enabled: false },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  mouthpiece: {
    enabled: true, style: 'loft', width: 22, depth: 13, height: 12, offsetX: 1.5, offsetY: -0.5,
    cornerRadius: 5, edgeRadius: 2.5, topRound: 7,
    color: '#8fe8e0', translucent: true, transmission: 0.7, opacity: 0.9, thickness: 2.5,
    slotWidth: 0.4, slotDepth: 0.25,
  },

  frontScreen: {
    enabled: true,
    template: 'mixpro',
    width: 40.5,
    height: 73,
    chamfer: 6,
    bezel: 2.4,
    bezelDepth: 0.9,
    bezelColor: '#060607',
    offsetX: -0.5,
    offsetY: 46,
    data: { battery: 99, liquid: 99, accent: '#ff3d5a', flavor: 'FLAVOR' },
    emissiveIntensity: 1.35,
  },

  label: {
    enabled: true,
    template: 'twoTone',
    gradient: ['#e8244a'],
    gradientAngle: 90,
    resolution: 2048,
    twoTone: { bottomColor: BOTTOM, splitLeft: 0.2, splitRight: 0.34, speckle: 0.4, backText: 'RIFBAR' },
  },

  extras: [
    // botón NIC alto en el costado derecho, con su rótulo
    { name: 'nicButton', type: 'box', x: W / 2 + 0.6, y: 52, z: 0.5, width: 2.6, height: 27, depth: 8, cornerRadius: 1.2, edgeRadius: 0.8, color: BOTTOM, material: 'glossy' },
    { name: 'nicLabel', type: 'screen', x: W / 2 + 1.95, y: 46, z: 0.5, width: 9, height: 4, cornerRadius: 1, rotation: [0, 90, 90],
      screen: { template: 'digits', data: { text: 'NIC', accent: '#ffffff' }, emissiveIntensity: 0.9 } },
    { name: 'nicSlider', type: 'box', x: W / 2 + 2.0, y: 58, z: 0.5, width: 1.2, height: 3.5, depth: 3, cornerRadius: 0.6, edgeRadius: 0.4, color: '#1f8fe0', material: 'glossy' },
    // botón pequeño de frío/dulzor encima del NIC
    { name: 'modeButton', type: 'box', x: W / 2 + 0.5, y: 72, z: 0.5, width: 2.2, height: 6, depth: 6, cornerRadius: 1.2, edgeRadius: 0.8, color: '#1f8fe0', material: 'glossy' },
    // puerto USB-C
    { name: 'usbC', type: 'box', x: W / 2 - 0.1, y: 36, z: 0.5, width: 0.8, height: 3.2, depth: 9, cornerRadius: 0.35, edgeRadius: 0.1, color: '#050505' },
  ],
};
