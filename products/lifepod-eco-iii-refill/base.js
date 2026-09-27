/**
 * Life Pod Eco III · Refill 20K. Cápsula negra alargada que se inserta en el dispositivo Eco III.
 * Etiqueta "ICE" girada arriba y píldora vertical con degradado de dos colores y el sabor girado.
 * Boquilla gris oscura translúcida.
 * Medidas estimadas de las fotos de tienda. Ver NOTES.md.
 */
export default {
  id: 'lifepod-eco-iii-refill',
  name: 'Life Pod Eco III Refill',
  notes: 'medidas estimadas de fotos de tienda',

  body: { width: 26, depth: 15, height: 74, cornerRadius: 4, edgeRadius: 1.0, color: '#141414', finish: 'mate' },
  base: { enabled: true, height: 2, inset: 0.6, color: '#0b0b0b' },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  mouthpiece: {
    enabled: true, style: 'flat', width: 13, depth: 8, height: 7, offsetX: 0,
    color: '#4a4a4a', translucent: true, transmission: 0.35, opacity: 0.95, thickness: 2,
  },

  label: {
    enabled: true,
    template: 'pill',
    flavor: 'FLAVOR',
    gradient: ['#b39ad0', '#54c9d5'],
    textColor: '#ffffff',
    coverage: 1,
    offsetY: 0,
    resolution: 1024,
    pill: { background: '#141414', tag: 'ICE', width: 0.26, top: 0.28, bottom: 0.985, tagColor: '#d8d8d8' },
  },
};
