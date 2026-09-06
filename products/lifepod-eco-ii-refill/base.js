/**
 * Life Pod Eco II · Refill (cápsula intercambiable, 10k puffs).
 * Medidas estimadas a partir de references/. Ver NOTES.md.
 */
export default {
  id: 'lifepod-eco-ii-refill',
  name: 'Life Pod Eco II Refill',

  body: { width: 25, depth: 14, height: 51, cornerRadius: 6.5, edgeRadius: 0.8, color: '#0a0a0a', finish: 'glossy' },
  base: { enabled: true, height: 2.5, inset: 0.9, color: '#0b0b0b' },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  mouthpiece: { style: 'dome', height: 14, width: 25, depth: 14, color: '#060606', translucent: false, domeTopX: 0.3, domeTopZ: 0.26, domePinch: 0.55, domeBendHeight: 0.35 },

  label: {
    enabled: true,
    template: 'wave',
    logoImage: 'textures/lifepod-logo.png',
    glyphImage: 'textures/lifepod-glyph.png',
    brand: 'LIFE POD',
    line: 'ECO II',
    flavor: 'FLAVOR',
    puffs: '10k',
    puffsLabel: 'PUFFS',
    metallic: true,
    coverage: 1,
    offsetY: 0,
    resolution: 1024,
    colors: {
      top: '#ff4a3d',
      main: '#7ac832',
      bottom: '#a5e34a',
      brand: '#b9f24a',
      flavorText: '#ffffff',
      puffsText: '#ffffff',
      outline: '#e8e8e8',
    },
  },
};
