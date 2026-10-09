import { Platform } from 'react-native';

export const fonts = {
  typewriter: Platform.select({
    ios: 'CourierPrime-Regular',
    android: 'CourierPrime-Regular',
    default: 'Courier Prime',
  }) as string,
  typewriterBold: Platform.select({
    ios: 'CourierPrime-Bold',
    android: 'CourierPrime-Bold',
    default: 'Courier Prime',
  }) as string,
};
