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
  soft: 'rgba(255, 252, 246, 0.12)',
  strong: 'rgba(255, 252, 246, 0.16)',
  action: 'rgba(247, 240, 227, 0.18)',
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
          shadowOpacity: intensity === 'action' ? 0.08 : 0.05,
        },
        style,
      ]}
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="xlight"
        blurAmount={intensity === 'soft' ? 14 : 20}
        blurRadius={intensity === 'soft' ? 10 : 16}
        downsampleFactor={4}
        overlayColor={overlay[intensity]}
        reducedTransparencyFallbackColor="rgba(247, 240, 227, 0.34)"
      />
      <View
        pointerEvents="none"
        style={[styles.walnutEdge, { borderRadius: radius }]}
      />
      <View
        pointerEvents="none"
        style={[styles.innerRim, { borderRadius: radius }]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.shine,
          { borderTopLeftRadius: radius, borderTopRightRadius: radius },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.secondaryShine,
          { borderBottomLeftRadius: radius, borderBottomRightRadius: radius },
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
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: Platform.OS === 'android' ? 1 : 0,
  },
  walnutEdge: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(121, 88, 63, 0.2)',
  },
  innerRim: {
    ...StyleSheet.absoluteFill,
    margin: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 252, 246, 0.28)',
  },
  shine: {
    position: 'absolute',
    top: 1,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255, 252, 246, 0.42)',
  },
  secondaryShine: {
    position: 'absolute',
    bottom: 1,
    left: 18,
    right: 18,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 252, 246, 0.16)',
  },
  content: {
    zIndex: 1,
  },
});
