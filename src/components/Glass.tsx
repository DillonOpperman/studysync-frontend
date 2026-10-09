import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

type Intensity = 'soft' | 'strong' | 'action';

const overlay: Record<Intensity, string> = {
  soft: 'rgba(255, 252, 248, 0.1)',
  strong: 'rgba(255, 252, 248, 0.16)',
  action: 'rgba(255, 252, 248, 0.2)',
};

export function Glass({
  children,
  style,
  intensity = 'soft',
  radius,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: Intensity;
  radius: number;
}) {
  return (
    <View
      style={[
        styles.shell,
        {
          borderRadius: radius,
          shadowOpacity: intensity === 'action' ? 0.12 : 0.08,
        },
        style,
      ]}
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="xlight"
        blurAmount={intensity === 'soft' ? 14 : 20}
        blurRadius={intensity === 'soft' ? 10 : 16}
        downsampleFactor={6}
        overlayColor={overlay[intensity]}
        reducedTransparencyFallbackColor="rgba(255, 246, 236, 0.55)"
      />
      <View
        pointerEvents="none"
        style={[styles.rim, { borderRadius: radius }]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.shine,
          { borderTopLeftRadius: radius, borderTopRightRadius: radius },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    shadowColor: '#1A0E08',
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  rim: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.62)',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  content: {
    zIndex: 1,
  },
});
