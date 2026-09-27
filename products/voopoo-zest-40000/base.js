/**
 * Voopoo Zest 40000. Cuerpo muy redondeado de acabado brillante con un módulo negro en el lado
 * izquierdo y trasero (con arcos del color del sabor atrás) y tres cápsulas redondas que sobresalen (arriba lisa, al medio el dial de
 * batería "88 %", abajo el selector de nicotina "N"). VOOPOO grande y fino girado (se lee de arriba
 * hacia abajo), sabor pequeño a su derecha y boquilla transparente rectangular.
 * Proporciones medidas en la foto de tienda (ancho total 47 mm como referencia). Ver NOTES.md.
 */
const DEPTH = 24;
const podZ = 0;
const POD_X = -16;
const pod = (y, r) => ({ type: 'cylinder', axis: 'z', x: POD_X, y, z: podZ, radius: r, length: DEPTH + 2.6, edgeRadius: 2.4, color: '#050506', material: 'glossy' });

export default {
  id: 'voopoo-zest-40000',
  name: 'Voopoo Zest 40000',
  notes: 'proporciones de la foto de tienda, ancho estimado',

  body: {
    width: 45, depth: DEPTH, height: 89, cornerRadius: 8, edgeRadius: 5, color: '#b9d3dc', finish: 'glossy',
    topRound: 6, bottomRound: 5,
  },
  base: { enabled: false },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  frontScreen: { enabled: false },
  mouthpiece: {
    enabled: true, style: 'loft', width: 11.5, depth: 8, height: 10, offsetX: -1.3, offsetY: -0.8,
    cornerRadius: 1.6, edgeRadius: 0.8,
    color: '#e8f2f8', translucent: true, transmission: 0.9, opacity: 0.75, thickness: 1.2,
    slotWidth: 0.62, slotDepth: 0.45,
  },

  label: {
    enabled: true,
    template: 'vertical',
    font: "'Quicksand'",
    brand: 'VOOPOO',
    line: '',
    flavor: 'FLAVOR',
    gradient: ['#c4dbe3', '#b0cbd6', '#a2c1cc'],
    gradientAngle: 80,
    textColor: '#ffffff',
    resolution: 2048,
    vertical: {
      readUp: false, highlight: 0.1, stripWidth: 0.22, stripColor: '#060607',
      backColor: '#060607', backArcs: 3, arcColor: '#a9c8d3',
      brandX: 0.05, brandY: 0.44, brandSize: 0.1, brandWeight: 500, brandSpacing: 0.02, brandAlign: 'center', brandMaxLen: 0.4,
      flavorX: 0.2, flavorY: 0.31, flavorSize: 0.026, flavorWeight: 700, flavorSpacing: 0.04, flavorAlign: 'start', flavorMaxLen: 0.3,
    },
  },

  extras: [
    // módulo negro: base que une las cápsulas y envuelve el canto izquierdo
    { name: 'moduleBase', type: 'box', x: -15.2, y: 48.5, z: 0, width: 14.6, height: 62, depth: DEPTH + 1.8, cornerRadius: 5, edgeRadius: 2.5, color: '#050506', material: 'glossy' },
    { name: 'podTop', ...pod(70, 9.6) },
    { name: 'podMid', ...pod(49.3, 9.2) },
    { name: 'podBottom', ...pod(27.8, 9.2) },
    // diales en la cara frontal de las cápsulas
    { name: 'dialBattery', type: 'screen', x: POD_X, y: 49.3, z: DEPTH / 2 + 1.32, width: 13.4, height: 13.4, cornerRadius: 6.7,
      screen: { template: 'dial', data: { battery: 88, accent: '#7fd3ff', accent2: '#5fe08a' }, emissiveIntensity: 1.4 } },
    { name: 'dialNic', type: 'screen', x: POD_X, y: 27.8, z: DEPTH / 2 + 1.32, width: 13.4, height: 13.4, cornerRadius: 6.7,
      screen: { template: 'dial', data: { icon: 'N', accent: '#7ee06a' }, emissiveIntensity: 1.3 } },
  ],
};
