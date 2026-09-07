import lifepodEcoIII from '../../products/lifepod-eco-iii/index.js';
import lifepodEcoIIRefill from '../../products/lifepod-eco-ii-refill/index.js';
import lifepodEcoIIBattery from '../../products/lifepod-eco-ii-battery/index.js';

/**
 * Catálogo. Cada producto vive en products/<producto>/ con:
 *   base.js       config base del producto
 *   flavors.js    variantes (tabla, defineVariant(base, overrides))
 *   references/   fotos de referencia
 *   index.js      exporta el array de variantes
 * Para añadir un producto: crea la carpeta e impórtala aquí.
 */
const tag = (list, product) => list.map((m) => ({ ...m, product }));

const ALL = [
  ...tag(lifepodEcoIIBattery, 'Life Pod Eco II Batería'),
  ...tag(lifepodEcoIIRefill, 'Life Pod Eco II Refill'),
  ...tag(lifepodEcoIII, 'Life Pod Eco III'),
];

export const MODELS = Object.fromEntries(ALL.map((m) => [m.id, m]));
export const MODEL_IDS = ALL.map((m) => m.id);
export const MODEL_OPTIONS = Object.fromEntries(ALL.map((m) => [m.name, m.id]));
export const MODEL_LIST = ALL;
