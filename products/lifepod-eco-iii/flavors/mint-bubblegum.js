import { defineVariant } from '../../../src/models/_schema.js';
import base from '../base.js';

export default defineVariant(base, {
  id: 'lifepod-eco-iii-mint-bubblegum',
  name: 'Life Pod Eco III · Mint Bubblegum',
  band: { color: '#37d67a' },
  screenModule: { screen: { data: { battery: 82, boost: true, iceBoost: false, accent: '#37d67a' } } },
  label: { flavor: 'MINT BUBBLEGUM', gradient: ['#1fd171', '#ff5fb3'] },
});
