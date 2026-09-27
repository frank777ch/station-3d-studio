/** Sabores Voopoo Zest 40000 (Vape Station Perú). [id, nombre, degradado del cuerpo, color de texto, src]. */
import { defineVariant } from '../../src/models/_schema.js';
import base from './base.js';

// prettier-ignore
export const FLAVORS = [
  ['black-ice',            'Black Ice',            ['#5a565c', '#2a282c'], '#ffffff', 'foto'],
  ['blue-razz-ice',        'Blue Razz Ice',        ['#c4dbe3', '#a9c8d3'], '#ffffff', 'foto'],
  ['blueberry-raspberry',  'Blueberry Raspberry',  ['#c6dde4', '#9ebccb'], '#ffffff', 'foto'],
  ['strawberry-ice-cream', 'Strawberry Ice Cream', ['#f7efeb', '#e9dcd6'], '#e02020', 'foto'],
  ['summer-dream',         'Summer Dream',         ['#d9bcd8', '#b596c0'], '#ffffff', 'foto'],
];

export default FLAVORS.map(([slug, name, gradient, textColor, src]) =>
  defineVariant(base, {
    id: `${base.id}-${slug}`,
    name: `${base.name} · ${name}`,
    notes: src === 'foto' ? 'colores tomados de la foto del producto' : 'colores estimados',
    body: { color: gradient[0] },
    label: { flavor: name.toUpperCase(), gradient, textColor },
  }),
);
