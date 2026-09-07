/**
 * Sabores del Life Pod Eco II Refill 10K. Una línea por sabor: [id, nombre, zona superior, zona central, opciones].
 *
 * Regla observada en las fotos oficiales: el logo va del color de la zona central,
 * la zona inferior es la central aclarada, y los textos van en blanco.
 * `src: 'foto'` = colores tomados de la foto del producto (Vape Station Perú).
 * `src: 'estimado'` = sabor del catálogo oficial (Life Pod Brasil) sin foto; colores deducidos del nombre.
 */
import * as THREE from 'three';
import { defineVariant } from '../../src/models/_schema.js';
import base from './base.js';

const lighten = (hex, k) => {
  const c = new THREE.Color(hex);
  c.r += (1 - c.r) * k;
  c.g += (1 - c.g) * k;
  c.b += (1 - c.b) * k;
  return `#${c.getHexString()}`;
};

// prettier-ignore
export const FLAVORS = [
  // id                     nombre                     top        main       opciones
  ['tobacco-virginia',      'Tobacco Virginia',        '#f3e2a3', '#4a2a12', { bottom: '#f3e2a3', brand: '#3a2010', puffsText: '#3a2010', src: 'foto' }],
  ['watermelon-ice',        'Watermelon Ice',          '#ff4a3d', '#7ac832', { bottom: '#a5e34a', src: 'foto' }],
  ['strawberry-kiwi',       'Strawberry Kiwi',         '#ff3d5e', '#8fd43a', { src: 'foto' }],
  ['passion-fruit-ice',     'Passion Fruit Ice',       '#f2e33a', '#7a1a4a', { src: 'foto' }],
  ['grape-ice',             'Grape Ice',               '#e04aa8', '#7a0f4a', { src: 'foto' }],
  ['blueberry-watermelon',  'Blueberry Watermelon',    '#1d2a8a', '#ff3b2f', { src: 'foto' }],
  ['blue-razz',             'Blue Razz',               '#4aa8ff', '#0b3aa8', { src: 'foto' }],
  ['dragon-blue-razz',      'Dragon Blue Razz',        '#b78fc4', '#c81f9a', { src: 'foto' }],
  ['green-grape-ice',       'Green Grape Ice',         '#e8ef5a', '#7fcf6a', { src: 'foto' }],
  ['coconut-water-ice',     'Coconut Water Ice',       '#f4f4f2', '#6fb52a', { src: 'foto' }],
  ['mint-waterberry',       'Mint Waterberry',         '#3fd6c8', '#c8151b', { src: 'foto' }],
  ['blueberry-strawberry',  'Blueberry Strawberry',    '#1f2f9a', '#e0141c', { src: 'foto' }],
  ['menthol',               'Menthol',                 '#f2f2f2', '#0f3fb5', { src: 'foto' }],
  ['summer-love',           'Summer Love',             '#ffd21f', '#e8141c', { src: 'foto' }],
  ['dragon-fruit-ice',      'Dragon Fruit Ice',        '#ff3aa0', '#2ab4e8', { src: 'foto' }],
  ['green-apple-ice',       'Green Apple Ice',         '#7fcf3a', '#1e8fe0', { src: 'foto' }],
  ['pink-lemonade',         'Pink Lemonade',           '#f7e7e3', '#f2a3b8', { src: 'foto' }],
  ['grape-honey',           'Grape Honey',             '#c8189a', '#f5a51a', { src: 'foto' }],
  ['capuccino',             'Capuccino',               '#b8734a', '#0f6b3a', { src: 'foto' }],
  ['blueberry-mint',        'Blueberry Mint',          '#1f2f9a', '#7ac832', { src: 'foto' }],
  ['banana-ice',            'Banana Ice',              '#f7e98a', '#1e8fe0', { src: 'foto' }],
  ['passion-mango-ice',     'Passion Mango Ice',       '#8a5aa0', '#f5b51a', { src: 'foto' }],
  ['blackberry-ice',        'Blackberry Ice',          '#6a1a5a', '#1e8fe0', { src: 'foto' }],
  ['mint-bubblegum',        'Mint Bubblegum',          '#2fd6c4', '#c9c9c9', { brand: '#ffffff', bottom: '#e6e6e6', src: 'foto' }],
  ['strawberry-coconut',    'Strawberry Coconut',      '#d81f1f', '#7fbf2a', { src: 'foto' }],
  ['blue-razz-bubblegum',   'Blue Razz Bubblegum',     '#2fd6d6', '#0b3aa8', { src: 'foto' }],
  ['strawberry-bubblegum',  'Strawberry Bubblegum',    '#f7e6e6', '#f0246a', { src: 'foto' }],
  // --- catálogo oficial sin foto: colores estimados ---
  ['banana-custard',        'Banana Custard',          '#f7e0a0', '#f2b632', { src: 'estimado' }],
  ['blue-passion-mint',     'Blue Passion Mint',       '#8fe3d6', '#3a3fb5', { src: 'estimado' }],
  ['blue-strawberry-cake',  'Blue Strawberry Cake',    '#f2d0e8', '#3f5fd6', { src: 'estimado' }],
  ['candy-ice',             'Candy Ice',               '#ffd6f0', '#ff5aa8', { src: 'estimado' }],
  ['cherry-bubblegum',      'Cherry Bubblegum',        '#f7b8c8', '#c8102e', { src: 'estimado' }],
  ['cherry-lime',           'Cherry Lime',             '#b8e34a', '#b3102e', { src: 'estimado' }],
  ['clear',                 'Clear',                   '#ffffff', '#a8d8ff', { brand: '#5aa8e0', src: 'estimado' }],
  ['cranberry-cake',        'Cranberry Cake',          '#f7dcc8', '#a3122e', { src: 'estimado' }],
  ['cranberry-soda',        'Cranberry Soda',          '#ff9fbf', '#8a0f2e', { src: 'estimado' }],
  ['grape-bubblegum',       'Grape Bubblegum',         '#e3c8ff', '#6a2fb5', { src: 'estimado' }],
  ['kiwi-berry',            'Kiwi Berry',              '#d6f5a3', '#d81f5e', { src: 'estimado' }],
  ['love-66',               'Love 66',                 '#ff8ab5', '#4ac86a', { src: 'estimado' }],
  ['miami-mint',            'Miami Mint',              '#ffffff', '#1fbf9a', { src: 'estimado' }],
  ['monster-drink',         'Monster Drink',           '#2fe03a', '#1a1a1a', { bottom: '#2fe03a', puffsText: '#0a0a0a', src: 'estimado' }],
  ['peach-mango',           'Peach Mango',             '#ffd18f', '#ff7a2e', { src: 'estimado' }],
  ['polar-ice',             'Polar Ice',               '#ffffff', '#2ea8ff', { src: 'estimado' }],
  ['red-orange',            'Red Orange',              '#ffd1a8', '#ff3f1f', { src: 'estimado' }],
  ['strawberry-watermelon-ice', 'Strawberry Watermelon Ice', '#ff6f8f', '#58c848', { src: 'estimado' }],
  ['strong-apple',          'Strong Apple',            '#d6f2a3', '#2f9e2f', { src: 'estimado' }],
  ['watermelon-bubblegum',  'Watermelon Bubblegum',    '#ffb3c8', '#58c848', { src: 'estimado' }],
  ['watermelon-peach',      'Watermelon Peach',        '#ffb37a', '#ff4f6d', { src: 'estimado' }],
  ['white-chocolate-mocha', 'White Chocolate Mocha',   '#f5e6d3', '#6b3a1e', { src: 'estimado' }],
  ['white-peach-berry',     'White Peach Berry',       '#ffe0c8', '#d64a8a', { src: 'estimado' }],
];

export default FLAVORS.map(([slug, name, top, main, opts = {}]) =>
  defineVariant(base, {
    id: `${base.id}-${slug}`,
    name: `${base.name} · ${name}`,
    notes: opts.src === 'foto' ? 'colores tomados de la foto del producto' : 'colores estimados (sin foto de referencia)',
    label: {
      flavor: name.toUpperCase(),
      colors: {
        top,
        main,
        bottom: opts.bottom ?? lighten(main, 0.28),
        brand: opts.brand ?? main,
        flavorText: opts.flavorText ?? '#ffffff',
        puffsText: opts.puffsText ?? '#ffffff',
        outline: '#e8e8e8',
      },
    },
  }),
);
