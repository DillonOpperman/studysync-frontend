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
        blurType="xlight"
        blurAmount={6}
        blurRadius={4}
        downsampleFactor={8}
        overlayColor="transparent"
      />
    </View>
  );
}
