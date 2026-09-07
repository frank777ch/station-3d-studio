/** Sabores HQD Ez Bar 1500 (Vape Station Perú). [id, nombre, degradado arriba→abajo, src, color de texto]. */
import { defineVariant } from '../../src/models/_schema.js';
import base from './base.js';

// prettier-ignore
export const FLAVORS = [
  ['strawberry-banana',        'Strawberry Banana',         ['#ff5f8f', '#ff9f3a'], 'foto'],
  ['mango-peach-watermelon',   'Mango Peach Watermelon',    ['#ff4a5a', '#d8b23a'], 'foto'],
  ['strawberry-kiwi',          'Strawberry Kiwi',           ['#ff6fa0', '#ff9fb0', '#4fbf3a'], 'foto'],
  ['apple-peach',              'Apple Peach',               ['#ff7fb0', '#e01f3a'], 'foto'],
  ['blue-raspberry-ice',       'Blue Raspberry Ice',        ['#a8c8f0', '#c9ddf5', '#d8d8d8'], 'foto', '#1a2340'],
  ['grape-ice',                'Grape Ice',                 ['#cfe8ff', '#1a2a6a'], 'foto', '#ffffff'],
  ['black-ice',                'Black Ice',                 ['#2a1a5a', '#bfbfbf'], 'foto'],
  ['lush-ice',                 'Lush Ice',                  ['#ff3a3a', '#1fb8c8'], 'foto'],
  ['strawberry-watermelon-ice','Strawberry Watermelon Ice', ['#ff3a5a', '#3fbf3a'], 'foto'],
  ['lime-passion-fruit-ice',   'Lime Passion Fruit Ice',    ['#ff2a4a', '#ff6a3a', '#f5b820'], 'foto'],
];

export default FLAVORS.map(([slug, name, gradient, src, textColor = '#ffffff']) =>
  defineVariant(base, {
    id: `${base.id}-${slug}`,
    name: `${base.name} · ${name}`,
    notes: src === 'foto' ? 'colores tomados de la foto del producto' : 'colores estimados',
    label: { flavor: name.toUpperCase(), gradient, textColor },
  }),
);
