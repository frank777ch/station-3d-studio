/**
 * Sabores ElfBar Ice King 40000 (Vape Station Perú).
 * [id, nombre, brochazos [intenso, claro], franja derecha, src, fondo?]
 * Los 4 sabores "Summer Edition" tienen un diseño de playa/olas; se aproximan con brochazos
 * claros sobre fondo de color.
 */
import { defineVariant } from '../../src/models/_schema.js';
import base from './base.js';

// prettier-ignore
export const FLAVORS = [
  ['blue-razz-ice',               'Blue Razz Ice',               ['#5a86c8', '#9ad5bd'], '#5b7d99', 'foto'],
  ['dragon-strawnana',            'Dragon Strawnana',            ['#c8a45c', '#3f6a7a'], '#7a6a48', 'foto'],
  ['grape-ice',                   'Grape Ice',                   ['#5847a4', '#c894c4'], '#4a3f8a', 'foto'],
  ['green-apple-ice',             'Green Apple Ice',             ['#2aa08a', '#7cca6c'], '#1f7f78', 'foto'],
  ['mango-magic',                 'Mango Magic',                 ['#b8924a', '#dea379'], '#8a7a55', 'foto'],
  ['miami-mint',                  'Miami Mint',                  ['#6985a1', '#99d5bd'], '#5a7c98', 'foto'],
  ['sour-strawberry-dragonfruit', 'Sour Strawberry Dragonfruit', ['#6a3fa0', '#d48fc0'], '#534a95', 'foto'],
  ['strawberry-ice',              'Strawberry Ice',              ['#af677d', '#e2d983'], '#976279', 'foto'],
  ['summer-splash',               'Summer Splash',               ['#d08a3a', '#e8b070'], '#8a6a3a', 'foto'],
  ['watermelon-ice',              'Watermelon Ice',              ['#b8261c', '#d76f51'], '#a1201a', 'foto'],
  ['summer-edition-black-mint',       'Summer Edition · Black Mint',       ['#7fc0e8', '#ffffff'], '#4f91c7', 'foto', '#cfe66a'],
  ['summer-edition-strawberry-spark', 'Summer Edition · Strawberry Spark', ['#ffd461', '#ffffff'], '#f08a80', 'foto', '#ffb07a'],
  ['summer-edition-triple-berry',     'Summer Edition · Triple Berry',     ['#7fbad0', '#ffffff'], '#4f91c7', 'foto', '#cfe66a'],
  ['summer-edition-wild-berry-slush', 'Summer Edition · Wild Berry Slush', ['#fae164', '#ffffff'], '#3a8fc0', 'foto', '#85cfeb'],
];

export default FLAVORS.map(([slug, name, colors, strip, src, background = '#f3f1ee']) =>
  defineVariant(base, {
    id: `${base.id}-${slug}`,
    name: `${base.name} · ${name}`,
    notes: src === 'foto' ? 'colores tomados de la foto del producto' : 'colores estimados',
    body: { color: background },
    label: {
      flavor: name.replace(/^Summer Edition · /, '').toUpperCase(),
      brush: { background, colors, stripColor: strip },
    },
  }),
);
