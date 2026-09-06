/** Life Pod Eco III (dispositivo con pantalla). Config base del producto. */
export default {
  id: 'lifepod-eco-iii',
  name: 'Life Pod Eco III',

  body: { width: 26, depth: 16, height: 95, cornerRadius: 6, edgeRadius: 1.5, color: '#0a0a0a', finish: 'glossy' },
  base: { enabled: false },
  frameRing: { enabled: true, height: 3, inset: 0.4, color: '#d8d8d8', metalness: 1.0, roughness: 0.12 },
  screenModule: {
    enabled: true,
    height: 22,
    color: '#111111',
    screen: {
      width: 18, height: 12, cornerRadius: 1.5, offsetY: 0,
      mode: 'procedural', image: null,
      data: { battery: 82, boost: true, iceBoost: false, accent: '#37d67a' },
      emissiveIntensity: 1.6,
    },
  },
  mouthpiece: { style: 'flat', height: 9, width: 20, depth: 9, color: '#1b1b1b', translucent: true, transmission: 0.6, opacity: 0.9, thickness: 2 },
  band: { enabled: true, height: 6, color: '#37d67a', roughness: 0.4 },
  button: { enabled: false },
  label: {
    enabled: true,
    template: 'gradient',
    logoImage: 'textures/lifepod-logo.png',
    glyphImage: 'textures/lifepod-glyph.png',
    brand: 'LIFE POD',
    line: 'ECO III',
    flavor: 'FLAVOR',
    gradient: ['#444444', '#999999'],
    gradientAngle: 90,
    textColor: '#ffffff',
    coverage: 0.7,
    offsetY: 0.08,
    resolution: 1024,
  },
};
