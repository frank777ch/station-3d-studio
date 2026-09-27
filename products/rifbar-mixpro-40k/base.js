/**
 * Rifbar MixPro 40K. Medido sobre la foto promocional oficial ("Meet MixPro"), la vista oficial de tres
 * cuartos y la foto frontal del trío (ver NOTES.md):
 *  - Cuerpo de dos colores con chaflanes empinados arriba y abajo (vista frontal), cantos verticales
 *    redondeados, plástico moteado y corte de color que sube de izquierda a derecha.
 *  - Cristal negro en relieve que ocupa casi todo el frente, con esquinas achaflanadas y muescas
 *    trapezoidales arriba y abajo; la pantalla (plantilla 'mixpro') va impresa en él.
 *  - Boquilla de cápsula transparente con núcleo del color inferior, desplazada a la derecha.
 *  - Costado derecho: botón corto con ícono, botón "NIC" y USB-C bajo el corte.
 *  - Trasera: panel en relieve, logo "//" y RIFBAR girado.
 */
const W = 45.5;
const D = 24;
const H = 88;
const TOP = '#e8244a';
const BOTTOM = '#3fd8c8';

/** Piezas que dependen del color inferior (botones, núcleo de la boquilla). */
export function colorParts(bottom) {
  const X = W / 2;
  return [
    // núcleo de color dentro de la boquilla transparente
    { name: 'mouthCore', type: 'box', x: 4.2, y: H + 6.5, z: 0, width: 15, height: 12.8, depth: 9.2, cornerRadius: 3, topRound: 5.2, edgeRadius: 1.4, color: bottom, material: 'glossy' },
    // botón corto superior con ícono
    { name: 'modeButton', type: 'box', x: X + 0.55, y: 63.5, z: 0.3, width: 9.5, height: 2.1, depth: 8.4, cornerRadius: 2.4, edgeRadius: 0.6, rotation: [0, 0, 90], color: bottom, material: 'glossy' },
    { name: 'modeIcon', type: 'box', x: X + 1.75, y: 63.8, z: 0.3, width: 4.2, height: 0.5, depth: 2.6, cornerRadius: 1.2, edgeRadius: 0.2, rotation: [0, 0, 90], color: '#1f7fe8', material: 'glossy' },
    // botón NIC con su rótulo
    { name: 'nicButton', type: 'box', x: X + 0.55, y: 45.5, z: 0.3, width: 14, height: 2.1, depth: 8.4, cornerRadius: 2.4, edgeRadius: 0.6, rotation: [0, 0, 90], color: bottom, material: 'glossy' },
    { name: 'nicLabel', type: 'screen', x: X + 1.63, y: 47, z: 0.3, width: 7.5, height: 4.2, cornerRadius: 0.5, rotation: [0, 90, 90],
      screen: { template: 'digits', transparent: true, data: { text: 'NIC', accent: '#f4fff0' }, emissiveIntensity: 0.55 } },
    { name: 'nicRing', type: 'cylinder', axis: 'x', x: X + 1.62, y: 41, z: 0.3, radius: 1.3, length: 0.2, edgeRadius: 0.05, color: '#f4fff0', material: 'glossy' },
    { name: 'nicRingHole', type: 'cylinder', axis: 'x', x: X + 1.66, y: 41, z: 0.3, radius: 0.85, length: 0.2, edgeRadius: 0.05, color: bottom, material: 'glossy' },
  ];
}

export default {
  id: 'rifbar-mixpro-40k',
  name: 'Rifbar MixPro 40K',
  notes: 'medido sobre la foto promocional oficial y vistas de tienda',

  body: {
    width: W, depth: D, height: H, cornerRadius: 5, edgeRadius: 2.2, color: TOP, finish: 'glossy',
    topChamfer: 10, topChamferX: 6.5, bottomChamfer: 9, bottomChamferX: 6, bottomColor: BOTTOM,
  },
  base: { enabled: false },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },

  // cápsula transparente (el núcleo de color es una pieza extra)
  mouthpiece: {
    enabled: true, style: 'loft', width: 16.4, depth: 10.4, height: 15.6, offsetX: 4.2, offsetY: -0.3,
    cornerRadius: 3.6, edgeRadius: 1.6, topRound: 6, topRoundDepth: 3,
    profile: [[0, 1, 1], [1, 0.97, 0.94]],
    color: '#f4f9ff', translucent: true, transmission: 0.95, opacity: 0.5, thickness: 1,
    slot: false,
  },

  frontScreen: {
    enabled: true,
    template: 'mixpro',
    resolution: 1024,
    width: 36,
    height: 73,
    chamfer: 5.5,
    bezel: 0,
    glass: {
      depth: 1.2,
      notchTop: { top: 14, bottom: 9, depth: 2.8 },
      notchBottom: { top: 12.5, bottom: 8.5, depth: 2.6 },
    },
    offsetX: 0,
    offsetY: 44,
    data: { battery: 99, liquid: 99, accent: '#ff4060', flavor: 'FLAVOR' },
    emissiveIntensity: 1.2,
  },

  label: {
    enabled: true,
    template: 'twoTone',
    font: "'Montserrat'",
    gradient: [TOP],
    gradientAngle: 90,
    resolution: 2048,
    twoTone: {
      bottomColor: BOTTOM, splitLeft: 0.15, splitRight: 0.335, speckle: 4,
      backText: 'RIFBAR', backLogo: true, backPanel: 'rgba(255,255,255,0.22)',
    },
  },

  extras: [
    ...colorParts(BOTTOM),
    // puerto USB-C bajo el corte de color
    { name: 'usbC', type: 'box', x: W / 2 + 0.05, y: 30, z: 0.3, width: 3.2, height: 0.9, depth: 9, cornerRadius: 1.5, edgeRadius: 0.15, rotation: [0, 0, 90], color: '#0a0a0a' },
    { name: 'usbCTongue', type: 'box', x: W / 2 + 0.2, y: 30, z: 0.3, width: 1, height: 0.7, depth: 6, cornerRadius: 0.4, edgeRadius: 0.1, rotation: [0, 0, 90], color: '#3a3a3a' },
  ],
};
