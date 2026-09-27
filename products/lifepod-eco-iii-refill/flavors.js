/** Sabores del refill Life Pod Eco III 20K (Vape Station Perú). [id, nombre, degradado de la píldora arriba→abajo, src]. */
import { defineVariant } from '../../src/models/_schema.js';
import base from './base.js';

// prettier-ignore
export const FLAVORS = [
  ['blueberry-bubblegum',     'Blueberry Bubblegum',     ['#e070c8', '#9aa6d8', '#48d2dc'], 'foto'],
  ['cherry-bubblegum',        'Cherry Bubblegum',        ['#f24a1c', '#d8407a', '#b040c8'], 'foto'],
  ['grape-bubblegum',         'Grape Bubblegum',         ['#6a38b0', '#c43cb0', '#e84aa8'], 'foto'],
  ['green-apple-ice',         'Green Apple Ice',         ['#6ad0e0', '#8ad89a', '#8ccc2a'], 'foto'],
  ['green-grape-ice',         'Green Grape Ice',         ['#c8d830', '#b07a8a', '#a040b8'], 'foto'],
  ['love-66',                 'Love 66',                 ['#f4c8e4', '#ec88c8', '#e048b0'], 'foto'],
  ['miami-mint',              'Miami Mint',              ['#78d8e8', '#3a78d0', '#0a2ea8'], 'foto'],
  ['mint-bubblegum',          'Mint Bubblegum',          ['#12c848', '#9ab89a', '#e070b8'], 'foto'],
  ['passion-fruit-bubblegum', 'Passion Fruit Bubblegum', ['#f4d020', '#f08020', '#e81818'], 'foto'],
  ['strawberry-bubblegum',    'Strawberry Bubblegum',    ['#f040b0', '#8a48c0', '#1030c0'], 'foto'],
  ['strawberry-kiwi',         'Strawberry Kiwi',         ['#cfe8b8', '#e0a878', '#ec6a20'], 'foto'],
  ['watermelon-bubblegum',    'Watermelon Bubblegum',    ['#f06020', '#ec6878', '#e060b8'], 'foto'],
];

export default FLAVORS.map(([slug, name, gradient, src]) =>
  defineVariant(base, {
    id: `${base.id}-${slug}`,
    name: `${base.name} · ${name}`,
    notes: src === 'foto' ? 'colores tomados de la foto del producto' : 'colores estimados',
    label: { flavor: name.toUpperCase(), gradient },
  }),
);
