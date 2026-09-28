/** Sabores del refill Life Pod Eco III 20K (Vape Station Perú). [id, nombre, degradado del arco arriba→abajo (medido en la foto de cada sabor), src]. */
import { defineVariant } from '../../src/models/_schema.js';
import base from './base.js';

// prettier-ignore
export const FLAVORS = [
  ['blueberry-bubblegum',     'Blueberry Bubblegum',     ['#df66b9', '#78b4cf', '#46cad5'], 'foto'],
  ['cherry-bubblegum',        'Cherry Bubblegum',        ['#eb3713', '#cb3f87', '#b743b1'], 'foto'],
  ['grape-bubblegum',         'Grape Bubblegum',         ['#762eaa', '#cc36aa', '#df3ca8'], 'foto'],
  ['green-apple-ice',         'Green Apple Ice',         ['#79d4e1', '#7ad0b3', '#83c916'], 'foto'],
  ['green-grape-ice',         'Green Grape Ice',         ['#b2d41b', '#a57d82', '#a838ad'], 'foto'],
  ['love-66',                 'Love 66',                 ['#e09fcd', '#db5db7', '#d544ac'], 'foto'],
  ['miami-mint',              'Miami Mint',              ['#79d4e1', '#197cc9', '#0035b0'], 'foto'],
  ['mint-bubblegum',          'Mint Bubblegum',          ['#05be2c', '#ae8292', '#dc5fb4'], 'foto'],
  ['passion-fruit-bubblegum', 'Passion Fruit Bubblegum', ['#eeca00', '#e94f00', '#e40300'], 'foto'],
  ['strawberry-bubblegum',    'Strawberry Bubblegum',    ['#e447b0', '#6440b4', '#033cb6'], 'foto'],
  ['strawberry-kiwi',         'Strawberry Kiwi',         ['#c9b679', '#e26d2f', '#e5561d'], 'foto'],
  ['watermelon-bubblegum',    'Watermelon Bubblegum',    ['#e95d25', '#dd6190', '#dc5fb4'], 'foto'],
];

export default FLAVORS.map(([slug, name, gradient, src]) =>
  defineVariant(base, {
    id: `${base.id}-${slug}`,
    name: `${base.name} · ${name}`,
    notes: src === 'foto' ? 'colores tomados de la foto del producto' : 'colores estimados',
    label: { flavor: name.toUpperCase(), gradient },
  }),
);
