/**
 * Voopoo Zest 40000. Cuerpo muy redondeado de acabado brillante con un módulo negro en el lado
 * izquierdo y trasero (con arcos del color del sabor atrás) y tres cápsulas redondas que sobresalen (arriba lisa, al medio el dial de
 * batería "88 %", abajo el selector de nicotina "N"). VOOPOO grande y fino girado (se lee de arriba
 * hacia abajo), sabor pequeño a su derecha y boquilla transparente rectangular.
 * Proporciones medidas en la foto de tienda de 1080 px (ancho 45 mm como referencia; cápsulas a 69 / 44.5 / 20 mm). Ver NOTES.md.
 */
const W = 45;
const DEPTH = 24;
const H = 89;
const POD_X = -W / 2 + 4.3;
const pod = (y, r) => ({ type: 'cylinder', axis: 'z', x: POD_X, y, z: 0, radius: r, length: DEPTH + 2.6, edgeRadius: 2.4, color: '#050506', material: 'glossy' });

export default {
  id: 'voopoo-zest-40000',
  name: 'Voopoo Zest 40000',
  notes: 'proporciones de la foto de tienda, ancho estimado',

  body: {
    width: W, depth: DEPTH, height: H, cornerRadius: 8, edgeRadius: 4.5, color: '#b9d3dc', finish: 'glossy',
    topRound: 6, bottomRound: 6,
  },
  base: { enabled: false },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  frontScreen: { enabled: false },
  mouthpiece: {
    enabled: true, style: 'loft', width: 16, depth: 9, height: 13.7, offsetX: -1.2, offsetY: -0.8,
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
      readUp: false, highlight: 0.1, stripWidth: 0.3, stripColor: '#060607',
      backColor: '#060607', backArcs: 3, arcColor: '#a9c8d3',
      brandX: 0.03, brandY: 0.465, brandSize: 0.1, brandWeight: 600, brandSpacing: 0.02, brandAlign: 'center', brandMaxLen: 0.4,
      flavorX: 0.19, flavorY: 0.46, flavorSize: 0.024, flavorWeight: 700, flavorSpacing: 0.06, flavorAlign: 'start', flavorMaxLen: 0.2,
    },
  },

  extras: [
    // base negra que une las cápsulas al borde izquierdo
    // base del color del cuerpo dentro de la boquilla transparente
    { name: 'mouthCore', type: 'box', x: -1.2, y: H + 3.6, z: 0, width: 13.6, height: 6.4, depth: 6.6, cornerRadius: 1.4, edgeRadius: 0.8, color: '#b9d3dc', material: 'glossy' },
    { name: 'moduleBase', type: 'box', x: -W / 2 + 3.6, y: 45, z: 0, width: 9, height: 58, depth: DEPTH + 1.2, cornerRadius: 2.5, edgeRadius: 2, color: '#050506', material: 'glossy' },
    { name: 'podTop', ...pod(69.3, 9.5) },
    { name: 'podMid', ...pod(44.5, 7.7) },
    { name: 'podBottom', ...pod(20.1, 9.9) },
    // diales en la cara frontal de las cápsulas
    { name: 'dialBattery', type: 'screen', x: POD_X, y: 44.5, z: DEPTH / 2 + 1.32, width: 12.6, height: 12.6, cornerRadius: 6.3,
      screen: { template: 'dial', data: { battery: 88, accent: '#7fd3ff', accent2: '#5fe08a' }, emissiveIntensity: 1.4 } },
    { name: 'dialNic', type: 'screen', x: POD_X, y: 20.1, z: DEPTH / 2 + 1.32, width: 16, height: 16, cornerRadius: 8,
      screen: { template: 'dial', data: { icon: 'N', accent: '#7ee06a' }, emissiveIntensity: 1.3 } },
  ],
};
