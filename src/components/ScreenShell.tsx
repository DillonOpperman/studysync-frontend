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
      {!showPaper ? (
        <>
          <View pointerEvents="none" style={styles.hingeLight} />
          <View pointerEvents="none" style={styles.pageEdge} />
          <View pointerEvents="none" style={styles.pageShade} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden', backgroundColor: '#F7F0E3' },
  clear: { backgroundColor: 'transparent' },
  hingeLight: {
    position: 'absolute',
    top: 18,
    bottom: 18,
    left: 0,
    width: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 252, 246, 0.55)',
  },
  pageEdge: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    right: 0,
    width: 1,
    backgroundColor: 'rgba(255, 252, 246, 0.28)',
  },
  pageShade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 18,
    backgroundColor: 'rgba(73, 56, 43, 0.08)',
  },
});
