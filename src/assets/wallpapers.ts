import type { ImageSourcePropType } from 'react-native';

import type { AtmosphereMood } from '../components/Atmosphere';

const paper = require('./paper-texture.jpg');

export const wallpapers: Record<AtmosphereMood, ImageSourcePropType> = {
  auth: paper,
  splash: paper,
  home: paper,
  search: paper,
  form: paper,
  groups: paper,
  detail: paper,
  chat: paper,
};

/** Warm parchment veils over bundled `paper-texture.jpg` (asset itself unchanged). */
export const paperWashes: Record<AtmosphereMood, string> = {
  auth: 'rgba(237, 224, 201, 0.1)',
  splash: 'rgba(237, 224, 201, 0.12)',
  home: 'rgba(213, 190, 155, 0.14)',
  search: 'rgba(213, 190, 155, 0.12)',
  form: 'rgba(237, 224, 201, 0.12)',
  groups: 'rgba(213, 190, 155, 0.16)',
  detail: 'rgba(213, 190, 155, 0.14)',
  chat: 'rgba(213, 190, 155, 0.16)',
};
