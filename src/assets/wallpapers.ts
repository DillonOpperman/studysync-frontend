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

export const paperWashes: Record<AtmosphereMood, string> = {
  auth: 'rgba(247, 240, 227, 0.08)',
  splash: 'rgba(247, 240, 227, 0.1)',
  home: 'rgba(237, 224, 201, 0.12)',
  search: 'rgba(237, 224, 201, 0.1)',
  form: 'rgba(247, 240, 227, 0.14)',
  groups: 'rgba(213, 190, 155, 0.16)',
  detail: 'rgba(213, 190, 155, 0.12)',
  chat: 'rgba(213, 190, 155, 0.18)',
};
