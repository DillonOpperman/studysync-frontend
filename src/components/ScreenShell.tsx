import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Atmosphere, type AtmosphereMood } from './Atmosphere';

export function ScreenShell({
  children,
  mood = 'home',
}: {
  children: React.ReactNode;
  mood?: AtmosphereMood;
}) {
  return (
    <View style={styles.fill}>
      <Atmosphere mood={mood} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden' },
});
