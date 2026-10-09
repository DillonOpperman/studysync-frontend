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
  soft: 'rgba(255, 255, 255, 0.08)',
  strong: 'rgba(255, 255, 255, 0.12)',
  action: 'rgba(255, 226, 190, 0.26)',
};

const rim: Record<Intensity, string> = {
  soft: 'rgba(255, 255, 255, 0.22)',
  strong: 'rgba(255, 255, 255, 0.28)',
  action: 'rgba(255, 240, 220, 0.42)',
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
          shadowOpacity: intensity === 'action' ? 0.35 : 0.28,
        },
        style,
      ]}
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurAmount={intensity === 'soft' ? 18 : 24}
        blurRadius={intensity === 'soft' ? 14 : 20}
        downsampleFactor={4}
        overlayColor={overlay[intensity]}
        reducedTransparencyFallbackColor="rgba(42, 26, 18, 0.72)"
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
      <View
        pointerEvents="none"
        style={[
          styles.innerShadow,
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
    shadowColor: '#050302',
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: Platform.OS === 'android' ? 4 : 0,
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
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  innerShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  content: {
    zIndex: 1,
  },
});
