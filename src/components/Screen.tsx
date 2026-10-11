import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../theme';
import type { AtmosphereMood } from './Atmosphere';
import { ScreenShell } from './ScreenShell';

export function Screen({
  children,
  scroll = true,
  padded = true,
  center = false,
  mood = 'form',
  showPaper = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  center?: boolean;
  mood?: AtmosphereMood;
  showPaper?: boolean;
}) {
  const theme = useTheme();
  const padding = padded ? theme.space.screen : 0;
  const body = scroll ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          padding,
          paddingBottom: theme.space.xxxl + theme.space.xl,
          flexGrow: 1,
          justifyContent: center ? 'center' : 'flex-start',
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  ) : (
    <View style={[{ flex: 1, padding }, styles.flex]}>{children}</View>
  );

  return (
    <ScreenShell mood={mood} showPaper={showPaper}>
      <SafeAreaView
        style={styles.flex}
        edges={['top', 'bottom', 'left', 'right']}
      >
        {body}
      </SafeAreaView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
