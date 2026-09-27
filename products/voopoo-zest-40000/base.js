/**
 * Voopoo Zest 40000. Cuerpo muy redondeado de acabado brillante con un módulo negro que envuelve
 * el canto izquierdo (dos diales redondos: pantalla de porcentaje y selector), "VOOPOO" girado en el
 * centro, sabor pequeño girado a la derecha y boquilla translúcida transparente.
 * Medidas estimadas de las fotos de tienda. Ver NOTES.md.
 */
export default {
  id: 'voopoo-zest-40000',
  name: 'Voopoo Zest 40000',
  notes: 'medidas estimadas de fotos de tienda',

  body: { width: 49, depth: 24, height: 92, cornerRadius: 11, edgeRadius: 3.5, color: '#b9d3dc', finish: 'glossy' },
  base: { enabled: false },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  mouthpiece: {
    enabled: true, style: 'round', width: 12, depth: 8, height: 6, offsetX: 0,
    color: '#eef6ff', translucent: true, transmission: 0.85, opacity: 0.85, thickness: 1.5,
  },

  frontScreen: {
    enabled: true,
    template: 'percent',
    width: 9,
    height: 9,
    cornerRadius: 4.5,
    offsetX: -15.5,
    offsetY: 52,
    data: { battery: 88, accent: '#37d67a' },
    emissiveIntensity: 1.6,
  },

  label: {
    enabled: true,
    template: 'vertical',
    brand: 'VOOPOO',
    line: '',
    flavor: 'FLAVOR',
    gradient: ['#c4dbe3', '#a9c8d3'],
    gradientAngle: 90,
    textColor: '#ffffff',
    coverage: 1,
    offsetY: 0,
    resolution: 1024,
    vertical: { brandSize: 0.2, brandX: 0.12, lineX: 0, flavorX: 0.34, grooves: 0, stripWidth: 0.3, stripColor: '#0a0a0a' },
  },
};
