/** Sabores del refill Life Pod Eco III 20K (Vape Station Perú). [id, nombre, degradado de la píldora arriba→abajo, src]. */
import { defineVariant } from '../../src/models/_schema.js';
import base from './base.js';

// prettier-ignore
export const FLAVORS = [
  ['blueberry-bubblegum',     'Blueberry Bubblegum',     ['#b39ad0', '#54c9d5'], 'foto'],
  ['cherry-bubblegum',        'Cherry Bubblegum',        ['#f06a3a', '#b03a8a'], 'foto'],
  ['grape-bubblegum',         'Grape Bubblegum',         ['#7a3aa0', '#e040b0'], 'foto'],
  ['green-apple-ice',         'Green Apple Ice',         ['#7fd8c8', '#84cd55'], 'foto'],
  ['green-grape-ice',         'Green Grape Ice',         ['#b8cc40', '#8a3a8a'], 'foto'],
  ['love-66',                 'Love 66',                 ['#f0b0d8', '#e050b0'], 'foto'],
  ['miami-mint',              'Miami Mint',              ['#7ab8d8', '#0d348c'], 'foto'],
  ['mint-bubblegum',          'Mint Bubblegum',          ['#40c060', '#d070b0'], 'foto'],
  ['passion-fruit-bubblegum', 'Passion Fruit Bubblegum', ['#f0d040', '#e02020'], 'foto'],
  ['strawberry-bubblegum',    'Strawberry Bubblegum',    ['#e070c0', '#2040c0'], 'foto'],
  ['strawberry-kiwi',         'Strawberry Kiwi',         ['#c8d8a0', '#e07030'], 'foto'],
  ['watermelon-bubblegum',    'Watermelon Bubblegum',    ['#f07030', '#e060a0'], 'foto'],
];

export default FLAVORS.map(([slug, name, gradient, src]) =>
  defineVariant(base, {
    id: `${base.id}-${slug}`,
    name: `${base.name} · ${name}`,
    notes: src === 'foto' ? 'colores tomados de la foto del producto' : 'colores estimados',
    label: { flavor: name.toUpperCase(), gradient },
  }),
);
