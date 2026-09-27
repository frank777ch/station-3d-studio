import lifepodEcoIII from '../../products/lifepod-eco-iii/index.js';
import lifepodEcoIIRefill from '../../products/lifepod-eco-ii-refill/index.js';
import lifepodEcoIIBattery from '../../products/lifepod-eco-ii-battery/index.js';
import hqdEzBar from '../../products/hqd-ez-bar-1500/index.js';
import lifepodEcoIIIRefill from '../../products/lifepod-eco-iii-refill/index.js';
import lifepodOne from '../../products/lifepod-one-40000/index.js';
import elfbarBC15000 from '../../products/elfbar-bc15000/index.js';
import elfbarIceKing from '../../products/elfbar-iceking-40000/index.js';
import rifbarMixPro from '../../products/rifbar-mixpro-40k/index.js';
import voopooZest from '../../products/voopoo-zest-40000/index.js';

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
  ...tag(lifepodEcoIIIRefill, 'Life Pod Eco III Refill'),
  ...tag(lifepodOne, 'Life Pod One 40000'),
  ...tag(hqdEzBar, 'HQD Ez Bar 1500'),
  ...tag(elfbarBC15000, 'ElfBar BC15000'),
  ...tag(elfbarIceKing, 'ElfBar Ice King 40000'),
  ...tag(rifbarMixPro, 'Rifbar MixPro 40K'),
  ...tag(voopooZest, 'Voopoo Zest 40000'),
];

export const MODELS = Object.fromEntries(ALL.map((m) => [m.id, m]));
export const MODEL_IDS = ALL.map((m) => m.id);
export const MODEL_OPTIONS = Object.fromEntries(ALL.map((m) => [m.name, m.id]));
export const MODEL_LIST = ALL;
