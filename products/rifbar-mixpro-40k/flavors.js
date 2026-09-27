/**
 * Sabores Rifbar MixPro 40K (Vape Station Perú).
 * [id, nombre, color superior, color inferior, color del sabor en pantalla, src].
 * Los botones laterales y el núcleo de la boquilla llevan el color inferior.
 */
import * as THREE from 'three';
import { defineVariant } from '../../src/models/_schema.js';
import base, { colorParts } from './base.js';

const mix = (a, b, k) => `#${new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString()}`;

// prettier-ignore
export const FLAVORS = [
  ['blackberry-mint',         'Blackberry Mint',         '#5a2c8a', '#49d7bb', '#c77cff', 'foto'],
  ['blue-razz-ice',           'Blue Razz Ice',           '#1a8fe0', '#dfe3ea', '#43a8ff', 'foto'],
  ['blueberry-pink-lemonade', 'Blueberry Pink Lemonade', '#e86bc0', '#3f2f8a', '#ff7ad0', 'foto'],
  ['miami-mint',              'Miami Mint',              '#1fc9d0', '#9df0b1', '#45e6d8', 'foto'],
  ['peach-mango-pineapple',   'Peach Mango Pineapple',   '#eba73b', '#f0d874', '#ffc23a', 'foto'],
  ['sour-apple-ice',          'Sour Apple Ice',          '#1fc74a', '#12d6b0', '#5cf07a', 'foto'],
  ['triple-berry-ice',        'Triple Berry Ice',        '#8a3fd0', '#3fc8e0', '#d77cff', 'foto'],
  ['watermelon-ice',          'Watermelon Ice',          '#e8244a', '#3fd8c8', '#ff4060', 'foto'],
];

export default FLAVORS.map(([slug, name, top, bottom, accent, src]) =>
  defineVariant(base, {
    id: `${base.id}-${slug}`,
    name: `${base.name} · ${name}`,
    notes: src === 'foto' ? 'colores tomados de la foto del producto' : 'colores estimados',
    body: { color: top, bottomColor: bottom },
    frontScreen: { data: { accent, flavor: name } },
    label: { gradient: [top], twoTone: { bottomColor: bottom, backPanel: `${mix(top, '#ffffff', 0.3)}` } },
    extras: [...base.extras.filter((e) => !colorParts(bottom).some((c) => c.name === e.name)), ...colorParts(bottom)],
  }),
);
