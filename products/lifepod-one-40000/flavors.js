/**
 * Sabores Life Pod One 40000 (Vape Station Perú), en dos acabados:
 *   Carbon: placa negra mate-brillante.
 *   Gold:   placa dorada metálica.
 * [acabado, id, nombre, src]
 */
import { defineVariant } from '../../src/models/_schema.js';
import base from './base.js';

const FINISH = {
  carbon: {
    name: 'Carbon',
    label: { gradient: ['#303030', '#1c1c1c'], gradientAngle: 90, textColor: '#d8d8d8', metallic: false, one: { glyphOpacity: 0.2 } },
  },
  gold: {
    name: 'Gold',
    label: { gradient: ['#d2b565', '#a88c3f', '#c4a452'], gradientAngle: 70, textColor: '#f4e8c4', metallic: true, one: { glyphOpacity: 0.16 } },
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
    label: { ...FINISH[finish].label, flavor: name.toUpperCase() },
  }),
);
