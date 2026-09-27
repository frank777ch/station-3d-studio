/**
 * Life Pod One 40000. Placa delgada (grosor ≈ 1/3 del ancho) con frente liso (Carbon: negro;
 * Gold: dorado metálico) y costados acanalados con tres nervios verticales. Arriba, un pozo con
 * marco negro escalonado del que sale una boquilla negra translúcida tipo lámina. Logo LIFE POD + ONE
 * girado arriba a la izquierda (se lee de abajo hacia arriba), glifo grande grabado, zona inferior
 * negra con corte diagonal que sube a la derecha (también en los nervios), sabor sobre el corte y
 * lectura "99 % BOOST" sin marco.
 * Proporciones de las fotos oficiales y de tienda (ancho 46 mm como referencia). Ver NOTES.md.
 */
const W = 46;
const D = 15;
const H = 86.5;
const SPLIT_L = 0.185;
const SPLIT_R = 0.43;

/** Nervios de un costado: parte superior del color de la placa, inferior negra (sigue el corte). */
export function ribs(upper, material = 'glossy') {
  const out = [];
  [[-1, SPLIT_L], [1, SPLIT_R]].forEach(([side, split]) => {
    const cut = H * split;
    [-4.2, 0, 4.2].forEach((z, i) => {
      const x = side * (W / 2 - 0.25);
      out.push({ name: `ribLow${side}${i}`, type: 'cylinder', axis: 'y', x, y: (cut + 0.4) / 2, z, radius: 1.55, length: cut - 0.4, edgeRadius: 0.4, color: '#0a0a0a', material: 'glossy' });
      out.push({ name: `ribUp${side}${i}`, type: 'cylinder', axis: 'y', x, y: (cut + H - 0.4) / 2, z, radius: 1.55, length: H - 0.4 - cut, edgeRadius: 0.4, color: upper, material, rib: true });
    });
  });
  return out;
}

export default {
  id: 'lifepod-one-40000',
  name: 'Life Pod One 40000',
  notes: 'proporciones de fotos oficiales y de tienda, ancho estimado',

  body: { width: W, depth: D, height: H, cornerRadius: 1.8, edgeRadius: 0.7, color: '#2a2a2a', finish: 'glossy', loft: true, topColor: '#0c0c0c', bottomColor: '#0c0c0c' },
  base: { enabled: false },
  frameRing: { enabled: true, height: 1.4, inset: 0.05, color: '#0b0b0b', metalness: 0.2, roughness: 0.25 },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  mouthpiece: {
    enabled: true, style: 'loft', width: 15, depth: 7.5, height: 12, offsetX: 0, offsetY: 0.6,
    cornerRadius: 3.7, edgeRadius: 2.6, profile: [[0, 1.05, 1.1], [0.15, 1, 1], [1, 0.95, 0.9]],
    color: '#101012', translucent: true, transmission: 0.35, opacity: 0.97, thickness: 3,
    slotWidth: 0.45, slotDepth: 0.3,
  },

  frontScreen: {
    enabled: true,
    template: 'boostRow',
    width: 27,
    height: 5.2,
    cornerRadius: 0.3,
    bezel: 0,
    offsetX: -1,
    offsetY: 5,
    data: { battery: 99, boost: true, accent: '#e8e8e8' },
    emissiveIntensity: 1.4,
  },

  label: {
    enabled: true,
    template: 'one',
    font: "'Montserrat'",
    logoImage: 'textures/lifepod-logo.png',
    glyphImage: 'textures/lifepod-glyph.png',
    brand: 'LIFE POD',
    line: 'ONE',
    flavor: 'FLAVOR',
    gradient: ['#363636', '#2b2b2b', '#313131'],
    gradientAngle: 70,
    textColor: '#dcdcdc',
    metallic: false,
    resolution: 2048,
    one: {
      glyphOpacity: 0.22, glyphSize: 0.45, glyphX: -0.05, glyphY: 0.37, glyphLine: 0.006,
      splitLeft: SPLIT_L, splitRight: SPLIT_R, bottomColor: '#0b0b0b',
      logoX: 0.11, logoLen: 0.26, logoBottom: 0.31, readUp: true,
      flavorSize: 0.02, flavorAt: 0.74, sideStripes: 0, lineSize: 0.4, lineOffset: 0.3,
    },
  },

  extras: [
    // marco escalonado del pozo superior
    { name: 'wellRim', type: 'box', x: 0, y: H + 1.4 + 0.5, z: 0, width: W - 2.6, height: 1.0, depth: D - 2.6, cornerRadius: 1.2, edgeRadius: 0.35, color: '#0a0a0a', material: 'glossy' },
    { name: 'wellRim2', type: 'box', x: 0, y: H + 1.4 + 1.2, z: 0, width: W - 6, height: 0.6, depth: D - 5, cornerRadius: 1, edgeRadius: 0.25, color: '#050505', material: 'glossy' },
    ...ribs('#2e2e2e'),
  ],
};
