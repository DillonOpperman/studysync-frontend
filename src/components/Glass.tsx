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
  soft: 'rgba(255, 252, 246, 0.28)',
  strong: 'rgba(255, 252, 246, 0.38)',
  action: 'rgba(247, 240, 227, 0.46)',
};

const rim: Record<Intensity, string> = {
  soft: 'rgba(255, 255, 255, 0.7)',
  strong: 'rgba(255, 255, 255, 0.78)',
  action: 'rgba(255, 255, 255, 0.82)',
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
          shadowOpacity: intensity === 'action' ? 0.1 : 0.07,
        },
        style,
      ]}
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="xlight"
        blurAmount={intensity === 'soft' ? 12 : 18}
        blurRadius={intensity === 'soft' ? 8 : 14}
        downsampleFactor={6}
        overlayColor={overlay[intensity]}
        reducedTransparencyFallbackColor="rgba(247, 240, 227, 0.82)"
      />
      <View
        pointerEvents="none"
        style={[styles.walnutEdge, { borderRadius: radius }]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.rim,
          { borderRadius: radius, borderColor: rim[intensity] },
        ]}
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
    shadowColor: '#49382B',
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  walnutEdge: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(121, 88, 63, 0.16)',
  },
  rim: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  content: {
    zIndex: 1,
  },
});
