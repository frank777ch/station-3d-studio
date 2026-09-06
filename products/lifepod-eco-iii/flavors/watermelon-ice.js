import { defineVariant } from '../../../src/models/_schema.js';
import base from '../base.js';

export default defineVariant(base, {
  id: 'lifepod-eco-iii-watermelon-ice',
  name: 'Life Pod Eco III · Watermelon Ice',
  band: { color: '#ff4f6d' },
  screenModule: { screen: { data: { battery: 64, boost: false, iceBoost: true, accent: '#ff4f6d' } } },
  label: { flavor: 'WATERMELON ICE', gradient: ['#ff4f6d', '#ffd166', '#2ec4b6'], gradientAngle: 75 },
});
