import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { Atmosphere } from './Atmosphere';

export function ScreenShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.canvas }]}>
      <Atmosphere />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden' },
});
