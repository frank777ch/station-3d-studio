/**
 * Life Pod Eco III · Refill 20K. Cápsula negra alta con un riel gris a la derecha (la parte que entra
 * en el dispositivo, con contactos dorados abajo), boquilla gris ancha de canto redondeado y un arco
 * degradado que nace de la base con "ICE" y el sabor girados (se leen de abajo hacia arriba).
 * Proporciones medidas en la foto frontal de tienda (ancho 25 mm como referencia). Ver NOTES.md.
 */
export default {
  id: 'lifepod-eco-iii-refill',
  name: 'Life Pod Eco III Refill',
  notes: 'proporciones de la foto de tienda, ancho estimado',

  body: { width: 25, depth: 17, height: 102, cornerRadius: 2.2, edgeRadius: 0.8, color: '#0d0d0e', finish: 'glossy', loft: true },
  base: { enabled: false },
  frameRing: { enabled: true, height: 1.0, inset: 0.05, color: '#3a3a3d', metalness: 0.2, roughness: 0.45 },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  mouthpiece: {
    enabled: true, style: 'loft', width: 18.5, depth: 12, height: 13.5, offsetX: -0.5,
    cornerRadius: 2.5, edgeRadius: 1.2, topRound: 2, topRoundDepth: 6,
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
      background: '#0d0d0e', tag: 'ICE', tagColor: '#f2f2f2', tagY: 0.23, tagSize: 0.036,
      width: 0.42, top: 0.295, flare: 0.14, offsetX: 0.08, outline: '#dcdcdc',
      readUp: true, flavorStart: 0.665, flavorSize: 0.3,
    },
  },

  extras: [
    // riel lateral que entra en el dispositivo (sobresale abajo, algo más corto arriba)
    { name: 'rail', type: 'box', x: 16.9, y: 48.7, z: -1.2, width: 8.8, height: 104, depth: 13, cornerRadius: 1.2, edgeRadius: 0.6, color: '#1c1c1f', material: 'plastic', roughness: 0.4 },
    { name: 'railGap', type: 'box', x: 12.6, y: 50, z: 0, width: 0.4, height: 100, depth: 15.5, cornerRadius: 0.2, edgeRadius: 0.1, color: '#050505' },
    // contactos dorados en la base del riel
    { name: 'pin1', type: 'cylinder', axis: 'x', x: 13.2, y: -1.2, z: 4.2, radius: 0.9, length: 1.2, color: '#c8943c', material: 'metal', roughness: 0.3 },
    { name: 'pin2', type: 'cylinder', axis: 'x', x: 13.2, y: 2.2, z: 4.2, radius: 0.9, length: 1.2, color: '#c8943c', material: 'metal', roughness: 0.3 },
    { name: 'pin3', type: 'cylinder', axis: 'x', x: 13.2, y: 5.6, z: 4.2, radius: 0.9, length: 1.2, color: '#c8943c', material: 'metal', roughness: 0.3 },
  ],
};
