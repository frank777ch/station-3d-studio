/** Sabores ElfBar BC15000 (Vape Station Perú). [id, nombre, degradado arriba→abajo, src]. */
import { defineVariant } from '../../src/models/_schema.js';
import base from './base.js';

// prettier-ignore
export const FLAVORS = [
  ['blue-razz-ice',          'Blue Razz Ice',          ['#4cc7e2', '#2a90b8', '#0b0d12'], 'foto'],
  ['blueberry-ice',          'Blueberry Ice',          ['#56c8df', '#2782a8', '#0b0d12'], 'foto'],
  ['mango-magic',            'Mango Magic',            ['#e6e21c', '#a9a512', '#0a0a0a'], 'foto'],
  ['miami-mint',             'Miami Mint',             ['#bfe08a', '#3f8a44', '#0b100c'], 'foto'],
  ['peach-mango-watermelon', 'Peach Mango Watermelon', ['#fca8ab', '#e2727a', '#120a0e'], 'foto'],
  ['sakura-grape',           'Sakura Grape',           ['#fca6a8', '#d9686c', '#100a0c'], 'foto'],
  ['strawberry-watermelon',  'Strawberry Watermelon',  ['#f63a3e', '#b81d22', '#140405'], 'foto'],
  ['watermelon-ice',         'Watermelon Ice',         ['#f73a3d', '#c21e22', '#140405'], 'foto'],
];

export default FLAVORS.map(([slug, name, gradient, src]) =>
  defineVariant(base, {
    id: `${base.id}-${slug}`,
    name: `${base.name} · ${name}`,
    notes: src === 'foto' ? 'colores tomados de la foto del producto' : 'colores estimados',
    mouthpiece: { color: gradient[0] },
    label: { flavor: name.toUpperCase(), gradient },
  }),
);
