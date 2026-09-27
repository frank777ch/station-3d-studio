/**
 * ElfBar BC15000. Botella redondeada de hombros suaves con un cuello (boquilla) del mismo color,
 * desplazado a la izquierda. Tapa superior lisa con borde en V, degradado del color del sabor a negro hacia la base,
 * pantallita vertical de niveles en el costado derecho y textos finos girados que se leen de abajo hacia arriba: ELFBAR (muy espaciado), BC15K y el sabor.
 * Proporciones medidas en la foto frontal de tienda (ancho 44 mm como referencia). Ver NOTES.md.
 */
export default {
  id: 'elfbar-bc15000',
  name: 'ElfBar BC15000',
  notes: 'proporciones de la foto de tienda, ancho estimado',

  body: {
    width: 44, depth: 25, height: 81, cornerRadius: 9, edgeRadius: 4.5, color: '#7fd8ec', finish: 'glossy',
    topRound: 9.5, bottomRound: 6, topRoundDepth: 5, topColor: '#7fd8ec', bottomColor: '#08090c',
  },
  base: { enabled: false },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  frontScreen: { enabled: false },

  // cuello: se ensancha en la base para unirse al hombro
  mouthpiece: {
    enabled: true, style: 'loft', width: 15.5, depth: 11, height: 16, offsetX: -5, offsetY: -2.2,
    cornerRadius: 4.5, edgeRadius: 2.6, topRound: 3,
    profile: [[0, 1.3, 1.25], [0.14, 1.1, 1.08], [0.26, 1.02, 1.02], [0.36, 1.0, 1.0], [1, 1, 1]],
    color: '#7fd8ec', translucent: false, slotWidth: 0.42, slotDepth: 0.3,
  },

  label: {
    enabled: true,
    template: 'vertical',
    font: "'Montserrat'",
    brand: 'ELFBAR',
    line: 'BC15K',
    flavor: 'FLAVOR',
    gradient: ['#a8e8f5', '#7fd8ec', '#4cc3e0', '#2a8fb6', '#12303f', '#08090c'],
    gradientAngle: 90,
    textColor: '#ffffff',
    resolution: 2048,
    vertical: {
      readUp: true, highlight: 0.1, textAlpha: 0.95,
      cap: { y: 0.23, dip: 0.07, color: '#58c8e2', line: 'rgba(255,255,255,0.35)' },
      brandX: -0.43, brandY: 0.935, brandSize: 0.095, brandWeight: 300, brandSpacing: 0.6, brandAlign: 'start', brandMaxLen: 0.62,
      lineX: -0.3, lineY: 0.935, lineSize: 0.068, lineWeight: 500, lineSpacing: 0.02, lineAlign: 'start', lineStyle: '', lineMaxLen: 0.34,
      flavorX: -0.17, flavorY: 0.935, flavorSize: 0.05, flavorWeight: 500, flavorSpacing: 0.02, flavorAlign: 'start', flavorMaxLen: 0.52,
    },
  },

  extras: [
    // pantallita vertical de niveles en el costado derecho (TURBO, 25-100 %)
    { name: 'sideDisplay', type: 'screen', x: 22.03, y: 31, z: 0, width: 5.2, height: 32, cornerRadius: 2.4, rotation: [0, 90, 0],
      screen: { template: 'levels', data: { accent: '#e8e8e8' }, emissiveIntensity: 1.1 } },
  ],
};
