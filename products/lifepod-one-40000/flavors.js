/**
 * Sabores Life Pod One 40000 (Vape Station Perú), en dos acabados:
 *   Carbon: placa negra mate-brillante.
 *   Gold:   placa dorada metálica.
 * [acabado, id, nombre, src]
 */
import { defineVariant } from '../../src/models/_schema.js';
import base, { ribs } from './base.js';

const FINISH = {
  carbon: {
    name: 'Carbon',
    body: { color: '#2c2c2c' },
    ribs: ['#303030', 'glossy'],
    label: {
      gradient: ['#363636', '#2b2b2b', '#313131'], gradientAngle: 70, textColor: '#d6d6d6', metallic: false,
      one: { glyphOpacity: 0.22, stripeColor: '#0e0e0e', flavorColor: '#111111' },
    },
  },
  gold: {
    name: 'Gold',
    body: { color: '#9c8742' },
    ribs: ['#a08a44', 'metal'],
    label: {
      gradient: ['#8a7838', '#a8934e', '#b39d58', '#9a8540'], gradientAngle: 20, textColor: '#141414', metallic: true,
      one: { glyphOpacity: 0.2, stripeColor: '#121212', flavorColor: '#3a2e10' },
    },
  },
};

// prettier-ignore
export const FLAVORS = [
  ['carbon', 'love-66',              'Love 66',              'foto'],
  ['carbon', 'miami-mint',           'Miami Mint',           'foto'],
  ['carbon', 'blue-razz-bubblegum',  'Blue Razz Bubblegum',  'foto'],
  ['carbon', 'grape-ice',            'Grape Ice',            'foto'],
  ['carbon', 'watermelon-bubblegum', 'Watermelon Bubblegum', 'foto'],
  ['gold',   'grape-ice',            'Grape Ice',            'foto'],
  ['gold',   'passion-mango',        'Passion Mango',        'foto'],
  ['gold',   'monster-drink',        'Monster Drink',        'foto'],
];

export default FLAVORS.map(([finish, slug, name, src]) =>
  defineVariant(base, {
    id: `${base.id}-${finish}-${slug}`,
    name: `${base.name} ${FINISH[finish].name} · ${name}`,
    notes: src === 'foto' ? 'colores tomados de la foto del producto' : 'colores estimados',
    body: FINISH[finish].body,
    extras: [...base.extras.filter((e) => !e.name.startsWith('rib')), ...ribs(...FINISH[finish].ribs)],
    label: { ...FINISH[finish].label, flavor: name.toUpperCase() },
  }),
);
