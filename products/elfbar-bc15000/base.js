/**
 * ElfBar BC15000. Botella redondeada de hombros suaves con un cuello (boquilla) del mismo color,
 * desplazado a la izquierda. Tapa superior lisa con borde en V, degradado del color del sabor a negro hacia la base,
 * pantallita vertical de niveles en el costado derecho y textos finos girados que se leen de abajo hacia arriba: ELFBAR (muy espaciado), BC15K y el sabor.
 * Proporciones medidas en fotos frontales de alta resolución: cuerpo 1.55 × ancho, cuello 0.29 × ancho,
 * hombro izquierdo grande (se funde con el cuello) y derecho más cerrado. Ver NOTES.md.
 */
export default {
  id: 'elfbar-bc15000',
  name: 'ElfBar BC15000',
  notes: 'proporciones de la foto de tienda, ancho estimado',

  body: {
    width: 46, depth: 26, height: 71, cornerRadius: 10, edgeRadius: 4, color: '#7fd8ec', finish: 'glossy',
    topRoundL: 10, topRoundR: 6.4, bottomRound: 7, topRoundDepth: 5, topColor: '#7fd8ec', bottomColor: '#08090c',
  },
  base: { enabled: false },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  frontScreen: { enabled: false },

  // cuello a la izquierda: su borde izquierdo continúa la curva grande del hombro izquierdo
  mouthpiece: {
    enabled: true, style: 'loft', width: 16.4, depth: 11.5, height: 15.3, offsetX: -7.2, offsetY: -2,
    cornerRadius: 4.5, edgeRadius: 1.5, topRound: 1.8,
    profile: [[0, 1.3, 1.25], [0.06, 1.15, 1.12], [0.14, 1.05, 1.04], [0.24, 1.0, 1.0], [1, 1, 1]],
    color: '#7fd8ec', translucent: false, slotWidth: 0.4, slotDepth: 0.28,
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
      cap: { y: 0.19, dip: 0.105, color: '#58c8e2', line: 'rgba(255,255,255,0.3)' },
      brandX: -0.354, brandY: 0.827, brandSize: 0.098, brandWeight: 300, brandSpacing: 0.5, brandAlign: 'start', brandMaxLen: 0.46,
      lineX: -0.22, lineY: 0.827, lineSize: 0.071, lineWeight: 400, lineSpacing: 0.02, lineAlign: 'start', lineStyle: '', lineMaxLen: 0.2,
      flavorX: -0.115, flavorY: 0.827, flavorSize: 0.044, flavorWeight: 400, flavorSpacing: 0.03, flavorAlign: 'start', flavorMaxLen: 0.42,
    },
  },

  extras: [
    // pantallita vertical de niveles en el costado derecho (TURBO, 25-100 %)
    { name: 'sideDisplay', type: 'screen', x: 23.03, y: 26.6, z: 0, width: 5.6, height: 29, cornerRadius: 2.7, rotation: [0, 90, 0],
      screen: { template: 'levels', data: { accent: '#e8e8e8' }, emissiveIntensity: 1.1 } },
  ],
};
