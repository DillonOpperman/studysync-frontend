import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { AtmosphereMood } from './Atmosphere';
import { Wallpaper } from './Wallpaper';

export function ScreenShell({
  children,
  mood = 'home',
  showPaper = true,
}: {
  children: React.ReactNode;
  mood?: AtmosphereMood;
  showPaper?: boolean;
}) {
  return (
    <View style={[styles.fill, !showPaper && styles.clear]}>
      {showPaper ? <Wallpaper mood={mood} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden', backgroundColor: '#F7F0E3' },
  clear: { backgroundColor: 'transparent' },
});
