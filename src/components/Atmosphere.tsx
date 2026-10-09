import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';

export type AtmosphereMood =
  | 'auth'
  | 'splash'
  | 'home'
  | 'groups'
  | 'search'
  | 'form'
  | 'detail'
  | 'chat';

type Wash = {
  width: number;
  height: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  color: 'clay' | 'blush' | 'sageMist' | 'mist';
  opacity: number;
};

const moods: Record<AtmosphereMood, { canvas: string; washes: Wash[] }> = {
  auth: {
    canvas: '#F4EDE4',
    washes: [
      {
        width: 520,
        height: 520,
        top: -220,
        right: -160,
        color: 'clay',
        opacity: 0.2,
      },
      {
        width: 380,
        height: 380,
        bottom: -160,
        left: -140,
        color: 'sageMist',
        opacity: 0.14,
      },
    ],
  },
  splash: {
    canvas: '#F3EBE2',
    washes: [
      {
        width: 560,
        height: 560,
        top: -180,
        left: -120,
        color: 'clay',
        opacity: 0.18,
      },
    ],
  },
  home: {
    canvas: '#F1EAE2',
    washes: [
      {
        width: 480,
        height: 480,
        top: -260,
        left: -80,
        color: 'blush',
        opacity: 0.16,
      },
    ],
  },
  groups: {
    canvas: '#EEEEE6',
    washes: [
      {
        width: 500,
        height: 500,
        top: -200,
        right: -200,
        color: 'sageMist',
        opacity: 0.18,
      },
    ],
  },
  search: {
    canvas: '#F0E8E2',
    washes: [
      {
        width: 440,
        height: 440,
        bottom: -180,
        right: -80,
        color: 'blush',
        opacity: 0.14,
      },
    ],
  },
  form: {
    canvas: '#F2EDE6',
    washes: [
      {
        width: 360,
        height: 360,
        top: -140,
        right: -120,
        color: 'mist',
        opacity: 0.5,
      },
    ],
  },
  detail: {
    canvas: '#EFE9E2',
    washes: [
      {
        width: 420,
        height: 420,
        bottom: -200,
        left: -160,
        color: 'clay',
        opacity: 0.12,
      },
    ],
  },
  chat: {
    canvas: '#EBE6E0',
    washes: [],
  },
};

export function Atmosphere({ mood = 'home' }: { mood?: AtmosphereMood }) {
  const theme = useTheme();
  const setup = moods[mood];
  const tint = {
    clay: theme.colors.clay,
    blush: theme.colors.blush,
    sageMist: theme.colors.sageMist,
    mist: theme.colors.mist,
  };
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: setup.canvas }]}
    >
      {setup.washes.map((wash, index) => (
        <View
          key={`${mood}-${index}`}
          style={[
            styles.blob,
            {
              width: wash.width,
              height: wash.height,
              top: wash.top,
              left: wash.left,
              right: wash.right,
              bottom: wash.bottom,
              backgroundColor: tint[wash.color],
              opacity: wash.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
});
