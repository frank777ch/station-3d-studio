/**
 * ElfBar Ice King 40000. Cuerpo blanco con brochazos de color, "ELFBAR" girado en el color
 * del sabor, franja oscura a la derecha con la columna de pantalla (TURBO + 5 cubitos de hielo)
 * y boquilla translúcida descentrada a la derecha sobre esa franja.
 * Medidas estimadas de las fotos de tienda. Ver NOTES.md.
 */
export default {
  id: 'elfbar-iceking-40000',
  name: 'ElfBar Ice King 40000',
  notes: 'medidas estimadas de fotos de tienda',

  body: { width: 51, depth: 26, height: 92, cornerRadius: 6, edgeRadius: 2.0, color: '#f3f1ee', finish: 'glossy' },
  base: { enabled: false },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  mouthpiece: {
    enabled: true, style: 'flat', width: 10, depth: 10, height: 7, offsetX: 17,
    color: '#eef2f6', translucent: true, transmission: 0.75, opacity: 0.88, thickness: 2,
  },

  frontScreen: {
    enabled: true,
    template: 'ice',
    width: 7.5,
    height: 40,
    cornerRadius: 1.2,
    offsetX: 19.5,
    offsetY: 34,
    data: { battery: 90, level: 3, accent: '#5fe08a' },
    emissiveIntensity: 1.7,
  },

  label: {
    enabled: true,
    template: 'brush',
    brand: 'ELFBAR',
    line: 'Ice King',
    flavor: 'FLAVOR',
    textColor: '#ffffff',
    coverage: 1,
    offsetY: 0,
    resolution: 1024,
    brush: {
      background: '#f3f1ee',
      colors: ['#b8261c', '#d76f51'],
      angle: 62,
      strokes: 3,
      brandX: -0.30,
      brandSize: 0.15,
      stripWidth: 0.24,
      stripColor: '#a1201a',
    },
  },
};
