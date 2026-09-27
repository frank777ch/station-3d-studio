/**
 * Life Pod One 40000. Caja alta y estrecha con placa frontal lisa (Carbon: negro; Gold: dorado
 * metálico), logo LIFE POD + ONE girado arriba a la izquierda, glifo grande en relieve tono sobre
 * tono, sabor pequeño sobre el corte diagonal y zona inferior negra con pantalla (rayo, 99 %,
 * BOOST y copos). Boquilla oscura translúcida pequeña.
 * Medidas estimadas de las fotos de tienda. Ver NOTES.md.
 */
export default {
  id: 'lifepod-one-40000',
  name: 'Life Pod One 40000',
  notes: 'medidas estimadas de fotos de tienda',

  body: { width: 45, depth: 22, height: 90, cornerRadius: 4, edgeRadius: 1.2, color: '#141414', finish: 'glossy' },
  base: { enabled: false },
  frameRing: { enabled: false },
  screenModule: { enabled: false },
  band: { enabled: false },
  button: { enabled: false },
  mouthpiece: {
    enabled: true, style: 'flat', width: 12, depth: 8, height: 7, offsetX: -3,
    color: '#1a1a1a', translucent: true, transmission: 0.5, opacity: 0.92, thickness: 2,
  },

  frontScreen: {
    enabled: true,
    template: 'boostRow',
    width: 27,
    height: 5.5,
    cornerRadius: 0.8,
    offsetX: 1.5,
    offsetY: 7,
    data: { battery: 99, boost: true, accent: '#d8d8d8' },
    emissiveIntensity: 1.6,
  },

  label: {
    enabled: true,
    template: 'one',
    logoImage: 'textures/lifepod-logo.png',
    glyphImage: 'textures/lifepod-glyph.png',
    brand: 'LIFE POD',
    line: 'ONE',
    flavor: 'FLAVOR',
    gradient: ['#303030', '#1c1c1c'],
    gradientAngle: 90,
    textColor: '#d8d8d8',
    metallic: false,
    coverage: 1,
    offsetY: 0,
    resolution: 1024,
    one: { glyphOpacity: 0.2, glyphSize: 0.28, splitLeft: 0.36, splitRight: 0.22, bottomColor: '#0a0a0a', flavorSize: 0.022 },
  },
};
