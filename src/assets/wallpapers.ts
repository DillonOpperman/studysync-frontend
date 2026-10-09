import type { ImageSourcePropType } from 'react-native';

import type { AtmosphereMood } from '../components/Atmosphere';

export const wallpapers: Record<AtmosphereMood, ImageSourcePropType> = {
  auth: require('./wallpaper-auth.jpg'),
  splash: require('./wallpaper-auth.jpg'),
  home: require('./wallpaper-home.jpg'),
  search: require('./wallpaper-home.jpg'),
  form: require('./wallpaper-home.jpg'),
  groups: require('./wallpaper-dusk.jpg'),
  detail: require('./wallpaper-dusk.jpg'),
  chat: require('./wallpaper-dusk.jpg'),
};
