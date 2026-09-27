/**
 * Sabores ElfBar Ice King 40000 (Vape Station Perú).
 * [id, nombre, brochazos [intenso, claro] (u olas), color de la banda lateral, src, fondo?, estilo?]
 * Los 4 sabores "Summer Edition" tienen un diseño de playa/olas; se aproximan con brochazos
 * claros sobre fondo de color.
 */
import { defineVariant } from '../../src/models/_schema.js';
import base, { sideParts } from './base.js';

// prettier-ignore
export const FLAVORS = [
  ['blue-razz-ice',               'Blue Razz Ice',               ['#5a86c8', '#9ad5bd'], '#6a8fb4', 'foto'],
  ['dragon-strawnana',            'Dragon Strawnana',            ['#c89a50', '#e8b888'], '#b8905a', 'foto'],
  ['grape-ice',                   'Grape Ice',                   ['#5847a4', '#c894c4'], '#5a48b0', 'foto'],
  ['green-apple-ice',             'Green Apple Ice',             ['#1f9a86', '#7cca6c'], '#1f8f80', 'foto'],
  ['mango-magic',                 'Mango Magic',                 ['#b8924a', '#e0a878'], '#a88a55', 'foto'],
  ['miami-mint',                  'Miami Mint',                  ['#5f86ac', '#99d5bd'], '#6a8fb4', 'foto'],
  ['sour-strawberry-dragonfruit', 'Sour Strawberry Dragonfruit', ['#6a3fa0', '#d48fc0'], '#5a48b0', 'foto'],
  ['strawberry-ice',              'Strawberry Ice',              ['#d86a9a', '#e8d870'], '#c46a8a', 'foto'],
  ['summer-splash',               'Summer Splash',               ['#d08a3a', '#eab070'], '#a8824a', 'foto'],
  ['watermelon-ice',              'Watermelon Ice',              ['#c8342a', '#f08a5a'], '#b8261c', 'foto'],
  ['summer-edition-black-mint',       'Summer Edition · Black Mint',       ['#cfe66a', '#bfe6f5', '#5a9fd8'], '#4f91c7', 'foto', '#dfeecc', 'waves'],
  ['summer-edition-strawberry-spark', 'Summer Edition · Strawberry Spark', ['#ff9a8a', '#fff29a', '#ffc860'], '#f5a13a', 'foto', '#ffc2b0', 'waves'],
  ['summer-edition-triple-berry',     'Summer Edition · Triple Berry',     ['#cfe66a', '#c6e8f8', '#7fbad0'], '#4f91c7', 'foto', '#dfeecc', 'waves'],
  ['summer-edition-wild-berry-slush', 'Summer Edition · Wild Berry Slush', ['#85cfeb', '#fae164', '#ffd23a'], '#e8b820', 'foto', '#a8dcf0', 'waves'],
];

export default FLAVORS.map(([slug, name, colors, band, src, background = '#f3f1ee', style = 'strokes']) =>
  defineVariant(base, {
    id: `${base.id}-${slug}`,
    name: `${base.name} · ${name}`,
    notes: src === 'foto' ? 'colores tomados de la foto del producto' : 'colores estimados',
    body: { color: background },
    label: {
      flavor: name.replace(/^Summer Edition · /, '').toUpperCase(),
      brush: { background, colors, stripColor: band, style, brandColor: style === 'waves' ? band : colors[0] },
    },
    extras: sideParts(band),
  }),
);
