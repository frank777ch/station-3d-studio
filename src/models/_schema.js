/**
 * Esquema de un config de vape. Todas las medidas en milímetros.
 * Un modelo es un objeto parcial que sobreescribe estos DEFAULTS.
 *
 * @typedef {Object} VapeConfig
 * @property {string} id
 * @property {string} name
 * @property {{width:number, depth:number, height:number, cornerRadius:number, edgeRadius:number, color:string, finish:'glossy'|'mate'}} body
 * @property {{enabled:boolean, wall:number, floorY:number, color:string}} cavity
 * @property {{enabled:boolean, image:string|null, color:string, length:number, offsetX:number, offsetY:number, rotation:number, emissiveIntensity:number}} ledLogo
 * @property {{enabled:boolean, template:'boost'|'percent', width:number, height:number, cornerRadius:number, offsetX:number, offsetY:number, mode:string, image:string|null, data:object, emissiveIntensity:number}} frontScreen
 * @property {{enabled:boolean, height:number, inset:number, color:string}} base
 * @property {{enabled:boolean, height:number, inset:number, color:string, metalness:number, roughness:number}} frameRing
 * @property {{enabled:boolean, height:number, color:string, screen:{width:number, height:number, cornerRadius:number, offsetY:number, mode:'procedural'|'image', image:string|null, data:{battery:number, boost:boolean, iceBoost:boolean, accent:string}, emissiveIntensity:number}}} screenModule
 * @property {{style:'flat'|'duckbill'|'round'|'dome', height:number, width:number, depth:number, color:string, translucent:boolean, transmission:number, opacity:number, thickness:number, domeTopX:number, domeTopZ:number, domePinch:number, domeBendHeight:number}} mouthpiece
 * @property {{enabled:boolean, height:number, color:string, roughness:number}} band
 * @property {{enabled:boolean, side:'left'|'right'|'front', width:number, height:number, offsetY:number, color:string}} button
 * @property {{enabled:boolean, template:'gradient'|'wave'|'vertical'|'brush'|'one'|'twoTone'|'pill', mode:'procedural'|'image', image:string|null, imageFit:'front'|'wrap', logoImage:string|null, glyphImage:string|null, brand:string, line:string, flavor:string, puffs:string, puffsLabel:string, gradient:string[], gradientAngle:number, textColor:string, colors:{top:string, main:string, bottom:string, brand:string, flavorText:string, puffsText:string, outline:string}, metallic:boolean, coverage:number, offsetY:number, resolution:number}} label
 */

export const FINISHES = ['glossy', 'mate'];
export const MOUTHPIECE_STYLES = ['flat', 'duckbill', 'round', 'dome', 'loft'];
export const BUTTON_SIDES = ['left', 'right', 'front'];
export const TEXTURE_MODES = ['procedural', 'image'];
export const IMAGE_FITS = ['front', 'wrap'];
export const LABEL_TEMPLATES = ['gradient', 'wave', 'vertical', 'brush', 'one', 'twoTone', 'pill'];
export const SCREEN_TEMPLATES = ['boost', 'percent', 'ice', 'boostRow', 'mixpro', 'dial', 'snowflake', 'digits', 'levels'];

/** @type {VapeConfig} */
export const DEFAULTS = {
  id: 'default',
  name: 'Default',
  product: '',            // nombre del producto para agrupar en el catálogo
  notes: '',

  body: {
    width: 26,
    depth: 16,
    height: 95,
    cornerRadius: 6,
    edgeRadius: 1.5,
    color: '#0a0a0a',
    finish: 'glossy',
    topSlope: 0,          // mm que baja el borde frontal de la boca (solo con cavity)
    // Silueta (cualquiera activa el modo loft: cuerpo con forma y etiqueta impresa encima)
    loft: false,
    profile: null,        // [[t, sx, sz], ...] escala de ancho/grosor a lo largo de la altura
    topRound: 0,          // radio (mm) de las esquinas superiores vistas de frente
    topChamfer: 0,        // chaflán (mm) de las esquinas superiores vistas de frente (alto que ocupa)
    topChamferX: null,    // cuánto entra el chaflán en horizontal (null = igual al alto, 45°)
    bottomRound: 0,
    bottomChamfer: 0,
    bottomChamferX: null,
    topRoundDepth: 0,     // redondeo superior visto de perfil
    topRoundL: 0,         // hombro izquierdo (radio, vista frontal) distinto del derecho
    topRoundR: 0,
    bottomRoundDepth: 0,
    edgeRadiusBottom: null, // canto inferior (por defecto = edgeRadius)
    topColor: null,       // color de la tapa superior (por defecto = color)
    bottomColor: null,    // color de la tapa inferior
  },

  cavity: {
    enabled: false,       // cuerpo hueco abierto por arriba (batería)
    wall: 1.5,            // grosor de pared (mm)
    floorY: 4,            // altura del fondo interior desde la base (mm)
    color: '#050505',
  },

  ledLogo: {
    enabled: false,
    image: null,          // PNG máscara (ej. 'textures/lifepod-logo.png')
    color: '#ff2a2a',
    length: 30,           // mm del lado mayor
    offsetX: -6,
    offsetY: 34,          // centro, desde la base del cuerpo
    rotation: 90,         // grados; 90 = se lee de abajo hacia arriba
    emissiveIntensity: 2.2,
  },

  frontScreen: {
    enabled: false,
    template: 'percent',
    width: 9,
    height: 4.5,
    cornerRadius: 0.8,
    chamfer: 0,           // > 0: pantalla achaflanada (octógono) en vez de redondeada
    bezel: 0.6,           // margen del bisel (mm, 0 = sin bisel)
    bezelDepth: 0,        // bisel en relieve (mm)
    bezelColor: '#050505',
    glass: null,          // losa de cristal en relieve: { depth, notchTop: { top, bottom, depth }, notchBottom }
    resolution: null,     // ancho del canvas de la pantalla (px)
    offsetX: -6,
    offsetY: 9,
    mode: 'procedural',
    image: null,
    data: { battery: 99, liquid: 99, level: 3, boost: false, iceBoost: false, accent: '#37d67a', flavor: '' },
    emissiveIntensity: 1.8,
  },

  base: {
    enabled: false,
    height: 2.5,
    inset: 0.8,
    color: '#0b0b0b',
  },

  frameRing: {
    enabled: true,
    height: 3,
    inset: 0.4,
    color: '#d8d8d8',
    metalness: 1.0,
    roughness: 0.12,
  },

  screenModule: {
    enabled: true,
    height: 22,
    color: '#111111',
    screen: {
      template: 'boost',
      width: 18,
      height: 12,
      cornerRadius: 1.5,
      offsetY: 0,
      mode: 'procedural',
      image: null,
      data: {
        battery: 82,
        liquid: 99,       // % de líquido (plantillas 'mixpro')
        level: 3,         // nivel de frío 0..5 (plantilla 'ice')
        boost: true,
        iceBoost: false,
        accent: '#37d67a',
        flavor: '',       // texto de sabor en pantalla (plantilla 'mixpro')
      },
      emissiveIntensity: 1.6,
    },
  },

  mouthpiece: {
    enabled: true,
    style: 'flat',        // 'flat' | 'duckbill' | 'round' | 'dome' | 'loft'
    // solo style 'loft' (mismas claves de silueta que el cuerpo)
    profile: null,
    cornerRadius: null,
    edgeRadius: null,
    topRound: 0,
    topChamfer: 0,
    topRoundDepth: 0,
    slot: true,           // ranura de aire
    slotWidth: null,      // fracción del ancho (null = automático)
    slotDepth: null,      // fracción del grosor
    offsetX: 0,       // desplazamiento lateral (mm)
    offsetZ: 0,       // desplazamiento frontal (mm)
    offsetY: 0,       // desplazamiento vertical (mm); negativo la hunde en el cuerpo
    height: 9,
    width: 20,
    depth: 9,
    color: '#1b1b1b',
    translucent: true,
    transmission: 0.6,
    opacity: 0.9,
    thickness: 2,
    // solo style 'dome'
    domeTopX: 0.3,    // ancho de la meseta superior (fracción del ancho)
    domeTopZ: 0.22,   // grosor de la cresta superior (fracción del grosor)
    domePinch: 0.55,  // parte del estrechamiento que ocurre en la curva baja (0 = recto)
    domeBendHeight: 0.35, // altura (fracción del domo) donde termina esa curva
  },

  band: {
    enabled: true,
    height: 6,
    color: '#37d67a',
    roughness: 0.4,
  },

  button: {
    enabled: false,
    side: 'right',
    width: 5,
    height: 10,
    offsetY: 30,
    color: '#222222',
  },

  label: {
    enabled: true,
    template: 'gradient',   // 'gradient' | 'wave'
    mode: 'procedural',
    image: null,
    imageFit: 'front',
    font: null,             // familia web para la marca (ej. "'Montserrat'"), con respaldo del sistema
    logoImage: null,        // PNG opcional que reemplaza el texto de marca
    glyphImage: null,       // PNG opcional del símbolo solo (costados)
    brand: 'BRAND',
    line: 'MODEL',
    flavor: 'FLAVOR',
    puffs: '10k',
    puffsLabel: 'PUFFS',
    // template 'gradient'
    gradient: ['#444444', '#999999'],
    gradientAngle: 90,
    textColor: '#ffffff',
    // template 'wave'
    colors: {
      top: '#ff4a3d',       // zona superior (logo)
      main: '#7ac832',      // zona central (sabor)
      bottom: '#a5e34a',    // zona inferior (10k puffs)
      brand: '#b9f24a',     // color del logo
      flavorText: '#ffffff',
      puffsText: '#ffffff',
      outline: '#e8e8e8',   // filete plateado entre zonas
    },
    metallic: true,         // acabado foil (solo template wave)
    // template 'vertical' (texto girado, estilo HQD / ElfBar)
    vertical: {
      brandSize: 0.34,      // alto del texto de marca (fracción de la altura de etiqueta)
      brandX: 0.36,         // posición horizontal del texto de marca (fracción del ancho frontal, desde el centro)
      lineX: 0.2,           // posición de la línea/sub-marca
      flavorX: -0.34,       // posición del sabor
      grooves: 0,           // líneas verticales sutiles (0 = ninguna)
      stripWidth: 0,        // franja oscura a la izquierda de la cara frontal (fracción del ancho frontal, 0 = ninguna)
      stripColor: '#0a0a0a',
      readUp: false,        // true: los textos se leen de abajo hacia arriba
      textAlpha: null,
      highlight: null,      // brillo superior (0..1)
      cap: null,            // tapa superior con borde en V: { y, dip, color, line }
      backColor: null,      // carcasa trasera y costado izquierdo de otro color
      backArcs: null,       // arcos en la trasera (cantidad)
      arcColor: null,
      // posición, tamaño, peso, espaciado (em), alineación y largo máximo de cada texto (null = por defecto)
      brandY: null, brandWeight: null, brandSpacing: null, brandAlign: null, brandMaxLen: null,
      lineY: null, lineSize: null, lineWeight: null, lineSpacing: null, lineAlign: null, lineStyle: null, lineMaxLen: null,
      flavorY: null, flavorSize: null, flavorWeight: null, flavorSpacing: null, flavorAlign: null, flavorMaxLen: null,
    },
    // template 'brush' (fondo claro con brochazos de color, estilo ElfBar Ice King)
    brush: {
      background: '#f3f1ee',
      colors: ['#c8102e', '#f3a07a'],   // brochazos, del más intenso al más claro
      angle: 62,                        // inclinación de los brochazos (grados)
      strokes: 3,
      brandX: -0.30,                    // posición del texto de marca girado (fracción del ancho frontal)
      brandSize: 0.16,
      stripWidth: 0.22,                 // franja oscura a la derecha de la cara frontal (fracción, 0 = ninguna)
      stripColor: '#1a1a1a',
      style: 'strokes',                 // 'strokes' (pincel seco) | 'waves' (bandas onduladas)
      seams: false,                     // líneas blancas en relieve
      readUp: null,                     // null = se lee de abajo hacia arriba
      brandColor: null, brandWeight: null, brandSpacing: null, brandStart: null, brandLen: null, glyphSize: null,
      stripBump: null,                  // joroba de la franja hacia el frente, arriba (fracción del ancho frontal)
    },
    // template 'one' (placa lisa o metálica con logo vertical, glifo grande tono sobre tono y zona inferior negra en diagonal)
    one: {
      glyphOpacity: 0.22,
      glyphSize: 0.28,                  // alto del glifo (fracción de la altura de etiqueta)
      splitLeft: 0.36,                  // altura donde empieza la zona negra en el borde izquierdo (fracción)
      splitRight: 0.22,                 // ... y en el borde derecho
      bottomColor: '#0a0a0a',
      flavorSize: 0.022,
      flavorAt: null, flavorColor: null,
      glyphX: null, glyphY: null, glyphLine: null,
      logoX: null, logoLen: null, logoBottom: null, lineSize: null, lineOffset: null, readUp: null,
      sideStripes: 0, stripeColor: '#0e0e0e',
    },
    // template 'twoTone' (cuerpo de dos colores con corte inclinado, estilo Rifbar MixPro)
    twoTone: {
      bottomColor: '#3fd8c8',
      splitLeft: 0.27,                  // altura del corte en el borde izquierdo (fracción)
      splitRight: 0.20,                 // altura del corte en el borde derecho
      speckle: 0.35,                    // moteado sutil (0 = ninguno)
      backText: null,                   // texto girado en la trasera
      backLogo: false,                  // logo "//" encima del texto trasero
      backPanel: null,                  // color del panel en relieve de la trasera (contorno)
      speckleColor: null,               // color de las motas claras
    },
    // template 'pill' (fondo oscuro con píldora vertical degradada y sabor girado, estilo refill Eco III)
    pill: {
      background: '#141414',
      tag: 'ICE',
      width: 0.26,                      // ancho de la píldora (fracción del ancho frontal)
      top: 0.28,                        // borde superior de la píldora (fracción de la altura)
      bottom: 0.985,
      tagColor: '#d8d8d8',
      tagY: null, tagSize: null,
      flare: null,                      // ensanche de la base (fracción del ancho frontal)
      offsetX: null,
      outline: null,                    // color del contorno
      readUp: null,
      flavorStart: null, flavorSize: null,
      bottomBand: null,                 // franja inferior de ancho completo (fracción de la altura)
    },
    coverage: 0.7,
    offsetY: 0.08,
    resolution: 1024,
  },

  // Piezas extra (módulos, diales, perillas, puertos...). Ver src/builder/parts/extras.js
  extras: [],
};

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Copia profunda (arrays incluidos). */
export function deepClone(v) {
  return structuredClone(v);
}

/** Mezcla profunda: los objetos se recorren, arrays y primitivos se reemplazan. */
export function mergeWithDefaults(partial, defaults = DEFAULTS) {
  const out = deepClone(defaults);
  const merge = (target, src) => {
    for (const key of Object.keys(src ?? {})) {
      const sv = src[key];
      if (isPlainObject(sv) && isPlainObject(target[key])) merge(target[key], sv);
      else target[key] = Array.isArray(sv) ? [...sv] : sv;
    }
  };
  merge(out, partial);
  return out;
}

/** Crea una variante a partir de un config base (por ejemplo, un sabor de un producto). */
export function defineVariant(base, overrides) {
  return mergeWithDefaults(overrides, base);
}

/** Avisa por consola de claves desconocidas. Devuelve la lista de rutas desconocidas. */
export function validateConfig(partial, defaults = DEFAULTS) {
  const unknown = [];
  const walk = (src, ref, path) => {
    for (const key of Object.keys(src ?? {})) {
      const p = path ? `${path}.${key}` : key;
      if (!(key in ref)) unknown.push(p);
      else if (isPlainObject(src[key]) && isPlainObject(ref[key])) walk(src[key], ref[key], p);
    }
  };
  walk(partial, defaults, '');
  if (unknown.length) console.warn(`[schema] Claves desconocidas en "${partial?.id}":`, unknown);
  return unknown;
}
