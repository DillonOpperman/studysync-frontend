import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { AtmosphereMood } from './Atmosphere';
import { Wallpaper } from './Wallpaper';

export function ScreenShell({
  children,
  mood = 'home',
}: {
  children: React.ReactNode;
  mood?: AtmosphereMood;
}) {
  return (
    <View style={styles.fill}>
      <Wallpaper mood={mood} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden', backgroundColor: '#F7F0E3' },
});
