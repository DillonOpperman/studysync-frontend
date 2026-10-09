import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BrandMark } from '../components/BrandMark';
import { useTheme } from '../theme';

export function SplashScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: theme.colors.canvas }]}>
      <BrandMark />
      <ActivityIndicator
        color={theme.colors.brand}
        style={{ marginTop: theme.space.xl }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
