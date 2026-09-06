/**
 * Esquema de un config de vape. Todas las medidas en milímetros.
 * Un modelo es un objeto parcial que sobreescribe estos DEFAULTS.
 *
 * @typedef {Object} VapeConfig
 * @property {string} id
 * @property {string} name
 * @property {{width:number, depth:number, height:number, cornerRadius:number, edgeRadius:number, color:string, finish:'glossy'|'mate'}} body
 * @property {{enabled:boolean, height:number, inset:number, color:string}} base
 * @property {{enabled:boolean, height:number, inset:number, color:string, metalness:number, roughness:number}} frameRing
 * @property {{enabled:boolean, height:number, color:string, screen:{width:number, height:number, cornerRadius:number, offsetY:number, mode:'procedural'|'image', image:string|null, data:{battery:number, boost:boolean, iceBoost:boolean, accent:string}, emissiveIntensity:number}}} screenModule
 * @property {{style:'flat'|'duckbill'|'round'|'dome', height:number, width:number, depth:number, color:string, translucent:boolean, transmission:number, opacity:number, thickness:number, domeTopX:number, domeTopZ:number, domePinch:number, domeBendHeight:number}} mouthpiece
 * @property {{enabled:boolean, height:number, color:string, roughness:number}} band
 * @property {{enabled:boolean, side:'left'|'right'|'front', width:number, height:number, offsetY:number, color:string}} button
 * @property {{enabled:boolean, template:'gradient'|'wave', mode:'procedural'|'image', image:string|null, imageFit:'front'|'wrap', logoImage:string|null, glyphImage:string|null, brand:string, line:string, flavor:string, puffs:string, puffsLabel:string, gradient:string[], gradientAngle:number, textColor:string, colors:{top:string, main:string, bottom:string, brand:string, flavorText:string, puffsText:string, outline:string}, metallic:boolean, coverage:number, offsetY:number, resolution:number}} label
 */

export const FINISHES = ['glossy', 'mate'];
export const MOUTHPIECE_STYLES = ['flat', 'duckbill', 'round', 'dome'];
export const BUTTON_SIDES = ['left', 'right', 'front'];
export const TEXTURE_MODES = ['procedural', 'image'];
export const IMAGE_FITS = ['front', 'wrap'];
export const LABEL_TEMPLATES = ['gradient', 'wave'];

/** @type {VapeConfig} */
export const DEFAULTS = {
  id: 'default',
  name: 'Default',

  body: {
    width: 26,
    depth: 16,
    height: 95,
    cornerRadius: 6,
    edgeRadius: 1.5,
    color: '#0a0a0a',
    finish: 'glossy',
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
      width: 18,
      height: 12,
      cornerRadius: 1.5,
      offsetY: 0,
      mode: 'procedural',
      image: null,
      data: {
        battery: 82,
        boost: true,
        iceBoost: false,
        accent: '#37d67a',
      },
      emissiveIntensity: 1.6,
    },
  },

  mouthpiece: {
    style: 'flat',
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
    coverage: 0.7,
    offsetY: 0.08,
    resolution: 1024,
  },
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
