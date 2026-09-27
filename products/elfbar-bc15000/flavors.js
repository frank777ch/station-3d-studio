/**
 * Sabores ElfBar BC15000 (Vape Station Perú). [id, nombre, color claro (hombros), color medio, src].
 * El degradado completo se deriva: claro aclarado → claro → medio → oscuro → negro.
 */
import * as THREE from 'three';
import { defineVariant } from '../../src/models/_schema.js';
import base from './base.js';

const mix = (a, b, k) => `#${new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString()}`;

// prettier-ignore
export const FLAVORS = [
  ['blue-razz-ice',          'Blue Razz Ice',          '#58c8e2', '#1f8fbf', 'foto'],
  ['blueberry-ice',          'Blueberry Ice',          '#5ac6df', '#207fac', 'foto'],
  ['mango-magic',            'Mango Magic',            '#ece62a', '#b8b20e', 'foto'],
  ['miami-mint',             'Miami Mint',             '#c4e39a', '#5f9a4a', 'foto'],
  ['peach-mango-watermelon', 'Peach Mango Watermelon', '#fdb4b6', '#e57c82', 'foto'],
  ['sakura-grape',           'Sakura Grape',           '#fcb0b3', '#dc6c72', 'foto'],
  ['strawberry-watermelon',  'Strawberry Watermelon',  '#f84a4d', '#c91f24', 'foto'],
  ['watermelon-ice',         'Watermelon Ice',         '#f84749', '#c21e22', 'foto'],
];

export default FLAVORS.map(([slug, name, light, mid, src]) =>
  defineVariant(base, {
    id: `${base.id}-${slug}`,
    name: `${base.name} · ${name}`,
    notes: src === 'foto' ? 'colores tomados de la foto del producto' : 'colores estimados',
    body: { color: light, topColor: light },
    mouthpiece: { color: light },
    label: {
      vertical: { cap: { y: 0.23, dip: 0.07, color: light, line: 'rgba(255,255,255,0.35)' } },
      flavor: name.toUpperCase(),
      gradient: [light, mix(light, mid, 0.3), mix(light, mid, 0.7), mid, mix(mid, '#08090c', 0.55), '#0a0b0e', '#060608'],
    },
  }),
);
