import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { paperWashes, wallpapers } from '../assets/wallpapers';
import type { AtmosphereMood } from './Atmosphere';

export function Wallpaper({ mood = 'home' }: { mood?: AtmosphereMood }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={wallpapers[mood]}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        accessibilityIgnoresInvertColors
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: paperWashes[mood] },
        ]}
      />
    </View>
  );
}
