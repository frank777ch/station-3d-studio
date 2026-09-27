/**
 * Life Pod Eco III · Refill 20K. Cápsula negra alta con un riel gris a la derecha (la parte que entra
 * en el dispositivo, con contactos dorados abajo), boquilla gris ancha de canto redondeado y un arco
 * degradado que nace de la base con "ICE" y el sabor girados (se leen de abajo hacia arriba).
 * Proporciones medidas en la foto frontal de tienda de 2400 px (ancho 25 mm como referencia). Ver NOTES.md.
 */
export default {
  id: 'lifepod-eco-iii-refill',
  name: 'Life Pod Eco III Refill',
  notes: 'proporciones de la foto de tienda, ancho estimado',

  body: { width: 25, depth: 17, height: 74.6, cornerRadius: 6, edgeRadius: 0.8, color: '#0d0d0e', finish: 'glossy', loft: true },
  base: { enabled: false },
  frameRing: { enabled: true, height: 1.0, inset: 0.05, color: '#3a3a3d', metalness: 0.2, roughness: 0.45 },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  mouthpiece: {
    enabled: true, style: 'loft', width: 16.6, depth: 11, height: 11.3, offsetX: 0,
    cornerRadius: 2.5, edgeRadius: 1.2, topRound: 3, topRoundDepth: 6,
    profile: [[0, 1, 1], [1, 0.97, 0.9]],
    color: '#2e2e31', translucent: false, slot: false,
  },

  label: {
    enabled: true,
    template: 'pill',
    font: "'Montserrat'",
    flavor: 'FLAVOR',
    gradient: ['#f0481f', '#b03fc8'],
    textColor: '#ffffff',
    resolution: 2048,
    pill: {
      background: '#0d0d0e', tag: 'ICE', tagColor: '#f2f2f2', tagY: 0.24, tagSize: 0.05,
      width: 0.4, top: 0.373, flare: 0.29, offsetX: 0, outline: '#dcdcdc', bottomBand: 0.014,
      readUp: true, flavorStart: 0.853, flavorSize: 0.28,
    },
  },

  extras: [
    // riel lateral que entra en el dispositivo (sobresale abajo, algo más corto arriba)
    { name: 'rail', type: 'box', x: 14.4, y: 32.85, z: -1.2, width: 4, height: 75.5, depth: 13, cornerRadius: 1.2, edgeRadius: 0.6, color: '#38383c', material: 'plastic', roughness: 0.4 },
    { name: 'railGap', type: 'box', x: 12.45, y: 35, z: -1.2, width: 0.3, height: 68, depth: 12, cornerRadius: 0.2, edgeRadius: 0.1, color: '#050505' },
    // contactos dorados en la base del riel
    { name: 'pin1', type: 'cylinder', axis: 'z', x: 15.2, y: -2.0, z: 5.4, radius: 0.9, length: 1.2, color: '#c8943c', material: 'metal', roughness: 0.3 },
    { name: 'pin2', type: 'cylinder', axis: 'z', x: 15.2, y: 1.0, z: 5.4, radius: 0.9, length: 1.2, color: '#c8943c', material: 'metal', roughness: 0.3 },
    { name: 'pin3', type: 'cylinder', axis: 'z', x: 15.2, y: 4.0, z: 5.4, radius: 0.9, length: 1.2, color: '#c8943c', material: 'metal', roughness: 0.3 },
  ],
};
