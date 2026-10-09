import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BrandMark } from '../components/BrandMark';
import { ScreenShell } from '../components/ScreenShell';
import { useTheme } from '../theme';

export function SplashScreen() {
  const theme = useTheme();
  return (
    <ScreenShell mood="splash">
      <View style={styles.box}>
        <BrandMark align="center" />
        <ActivityIndicator
          color={theme.colors.brand}
          style={{ marginTop: theme.space.xl }}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
