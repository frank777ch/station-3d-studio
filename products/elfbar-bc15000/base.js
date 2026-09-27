/**
 * ElfBar BC15000. Caja redondeada compacta, degradado de color a negro hacia abajo,
 * textos girados (ELFBAR grande, BC15K y sabor) en la mitad izquierda, boquilla plana
 * del color del cuerpo y pantallita de batería/líquido abajo a la derecha.
 * Medidas estimadas de las fotos de tienda y de los BC5000/BC10000. Ver NOTES.md.
 */
export default {
  id: 'elfbar-bc15000',
  name: 'ElfBar BC15000',
  notes: 'medidas estimadas de fotos de tienda',

  body: { width: 42, depth: 21, height: 74, cornerRadius: 7, edgeRadius: 2.0, color: '#0a0a0a', finish: 'glossy' },
  base: { enabled: false },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  mouthpiece: { enabled: true, style: 'flat', width: 15, depth: 9, height: 6, offsetX: 0, color: '#4cc7e2', translucent: false },

  frontScreen: {
    enabled: true,
    template: 'percent',
    width: 6,
    height: 3,
    cornerRadius: 0.6,
    offsetX: 13,
    offsetY: 6,
    data: { battery: 88, accent: '#37d67a' },
    emissiveIntensity: 1.6,
  },

  label: {
    enabled: true,
    template: 'vertical',
    brand: 'ELFBAR',
    line: 'BC15K',
    flavor: 'FLAVOR',
    gradient: ['#4cc7e2', '#2a90b8', '#0b0d12'],
    gradientAngle: 90,
    textColor: '#ffffff',
    coverage: 1,
    offsetY: 0,
    resolution: 1024,
    vertical: { brandSize: 0.13, brandX: -0.32, lineX: -0.16, flavorX: -0.04, grooves: 0 },
  },
};
