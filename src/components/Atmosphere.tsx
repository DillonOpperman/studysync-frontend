import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';

export function Atmosphere() {
  const theme = useTheme();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.blob,
          {
            width: 340,
            height: 340,
            top: -80,
            right: -90,
            backgroundColor: theme.colors.clay,
            opacity: 0.55,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: 280,
            height: 280,
            top: 180,
            left: -120,
            backgroundColor: theme.colors.sageMist,
            opacity: 0.45,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: 420,
            height: 420,
            bottom: -140,
            right: -80,
            backgroundColor: theme.colors.blush,
            opacity: 0.42,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: 180,
            height: 180,
            bottom: 220,
            left: 40,
            backgroundColor: theme.colors.mist,
            opacity: 0.7,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
});
