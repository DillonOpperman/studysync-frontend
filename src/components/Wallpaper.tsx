import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';

import { wallpapers } from '../assets/wallpapers';
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
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurAmount={8}
        blurRadius={6}
        downsampleFactor={8}
        overlayColor="rgba(27, 18, 13, 0.06)"
      />
    </View>
  );
}
