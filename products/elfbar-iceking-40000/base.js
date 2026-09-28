/**
 * ElfBar Ice King 40000. Cuerpo blanco brillante con brochazos de color y ELFBAR girado (se lee de
 * abajo hacia arriba) con el símbolo del hada encima. El costado derecho es una banda de color en
 * relieve con la pantalla vertical de cubitos de hielo (nivel de frío) y, arriba, la perilla
 * cuadrada esmerilada con un copo de nieve. Boquilla blanca: trapecio visto de frente, cuña que se
 * afina hacia la ranura vista de perfil.
 * Medidas: 103.3 × 50.6 × 28.6 (tiendas); disposición del dibujo oficial del Ice King Pro. Ver NOTES.md.
 */
const W = 50.6;
const D = 28.6;
const H = 88;
const BAND = '#b8261c';

export const sideParts = (band) => [
  // banda de color en relieve en el costado derecho
  { name: 'band', type: 'box', x: W / 2 + 0.35, y: H / 2, z: 0, width: 1.3, height: H - 9, depth: D - 5.5, cornerRadius: 0.6, edgeRadius: 0.5, color: band, material: 'glossy' },
  // pantalla vertical de hielo
  { name: 'iceScreen', type: 'screen', x: W / 2 + 1.03, y: 33, z: 0, width: 13.5, height: 50, cornerRadius: 3, rotation: [0, 90, 0],
    screen: { template: 'ice', data: { level: 4, cubes: 4, accent: '#5fe08a' }, emissiveIntensity: 1.4 } },
  // perilla esmerilada con copo de nieve
  { name: 'iceKnob', type: 'box', x: W / 2 + 2.6, y: 74, z: 0, width: 14, height: 3.2, depth: 14, cornerRadius: 3.2, edgeRadius: 1.2, rotation: [0, 0, 90],
    color: '#eef3f7', material: 'glossy' },
  { name: 'knobFace', type: 'screen', x: W / 2 + 4.23, y: 74, z: 0, width: 11.5, height: 11.5, cornerRadius: 2.6, rotation: [0, 90, 0],
    screen: { template: 'snowflake', data: { accent: 'rgba(150,172,192,0.95)' }, emissiveIntensity: 0.85 } },
];

export default {
  id: 'elfbar-iceking-40000',
  name: 'ElfBar Ice King 40000',
  notes: 'medidas de tienda (103.3 × 50.6 × 28.6), diseño del dibujo oficial',

  body: { width: W, depth: D, height: H, cornerRadius: 5.5, edgeRadius: 3, color: '#f3f1ee', finish: 'glossy', topRound: 4, bottomRound: 3 },
  base: { enabled: false },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  frontScreen: { enabled: false },
  mouthpiece: {
    enabled: true, style: 'loft', width: 20, depth: 15, height: 15.3, offsetX: -4, offsetY: -0.8,
    cornerRadius: 4.5, edgeRadius: 2.2, topRound: 3.5, profile: [[0, 1.06, 1.06], [0.12, 1, 1], [0.5, 0.94, 0.86], [1, 0.86, 0.62]],
    color: '#f1f0ee', translucent: false, slotWidth: 0.42, slotDepth: 0.16,
  },

  label: {
    enabled: true,
    template: 'brush',
    font: "'Montserrat'",
    brand: 'ELFBAR',
    line: 'Ice King',
    flavor: 'FLAVOR',
    textColor: '#ffffff',
    resolution: 2048,
    brush: {
      background: '#f3f1ee',
      colors: ['#c8342a', '#f08a5a'],
      angle: 38,
      strokes: 6,
      seams: true,
      brandX: -0.35,
      brandSize: 0.125,
      glyphSize: 0.17,
      brandWeight: 600,
      brandSpacing: 0.36,
      brandStart: 0.94,
      brandLen: 0.62,
      readUp: true,
      stripWidth: 0.08,
      stripBump: 0.1,
      stripColor: BAND,
    },
  },

  extras: sideParts(BAND),
};
