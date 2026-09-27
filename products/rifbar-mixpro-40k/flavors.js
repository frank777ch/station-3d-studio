/** Sabores Rifbar MixPro 40K (Vape Station Perú). [id, nombre, color superior, color inferior, acento pantalla, boquilla, src]. */
import { defineVariant } from '../../src/models/_schema.js';
import base from './base.js';

// prettier-ignore
export const FLAVORS = [
  ['blackberry-mint',         'Blackberry Mint',         '#5a2c8a', '#49d7bb', '#8ff0d8', '#9ff0dc', 'foto'],
  ['blue-razz-ice',           'Blue Razz Ice',           '#1a8fe0', '#d2d5db', '#5fc8ff', '#e6f2ff', 'foto'],
  ['blueberry-pink-lemonade', 'Blueberry Pink Lemonade', '#e86bc0', '#3f2f8a', '#ff8fd8', '#5a48c0', 'foto'],
  ['miami-mint',              'Miami Mint',              '#1fc9d0', '#9df0b1', '#7ff0c0', '#b8f5d0', 'foto'],
  ['peach-mango-pineapple',   'Peach Mango Pineapple',   '#eba73b', '#f0d874', '#ffd96a', '#f8e8a0', 'foto'],
  ['sour-apple-ice',          'Sour Apple Ice',          '#1fc74a', '#12d6b0', '#7fff9a', '#8ff5d8', 'foto'],
  ['triple-berry-ice',        'Triple Berry Ice',        '#8a3fd0', '#3fc8e0', '#d08cf0', '#a0e0f0', 'foto'],
  ['watermelon-ice',          'Watermelon Ice',          '#e8244a', '#3fd8c8', '#ff6f8a', '#8fe8e0', 'foto'],
];

export default FLAVORS.map(([slug, name, top, bottom, accent, mouth, src]) =>
  defineVariant(base, {
    id: `${base.id}-${slug}`,
    name: `${base.name} · ${name}`,
    notes: src === 'foto' ? 'colores tomados de la foto del producto' : 'colores estimados',
    body: { color: top },
    button: { color: bottom },
    mouthpiece: { color: mouth },
    frontScreen: { data: { accent, flavor: name } },
    label: { gradient: [top], twoTone: { bottomColor: bottom } },
  }),
);
