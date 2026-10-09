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
  color: 'gold' | 'cream' | 'foam' | 'brew' | 'mocha';
  opacity: number;
};

const moods: Record<AtmosphereMood, { canvas: string; washes: Wash[] }> = {
  auth: {
    canvas: '#4A2C1C',
    washes: [
      {
        width: 560,
        height: 560,
        top: -240,
        right: -140,
        color: 'gold',
        opacity: 0.32,
      },
      {
        width: 420,
        height: 420,
        bottom: -180,
        left: -160,
        color: 'cream',
        opacity: 0.16,
      },
    ],
  },
  splash: {
    canvas: '#422818',
    washes: [
      {
        width: 600,
        height: 600,
        top: -200,
        left: -140,
        color: 'gold',
        opacity: 0.28,
      },
      {
        width: 280,
        height: 280,
        bottom: 80,
        right: -40,
        color: 'foam',
        opacity: 0.12,
      },
    ],
  },
  home: {
    canvas: '#3C2418',
    washes: [
      {
        width: 520,
        height: 520,
        top: -280,
        left: -100,
        color: 'cream',
        opacity: 0.18,
      },
      {
        width: 360,
        height: 360,
        bottom: -120,
        right: -80,
        color: 'gold',
        opacity: 0.22,
      },
    ],
  },
  groups: {
    canvas: '#382418',
    washes: [
      {
        width: 500,
        height: 500,
        top: -200,
        right: -180,
        color: 'mocha',
        opacity: 0.45,
      },
      {
        width: 340,
        height: 340,
        bottom: -80,
        left: -80,
        color: 'cream',
        opacity: 0.14,
      },
    ],
  },
  search: {
    canvas: '#452818',
    washes: [
      {
        width: 460,
        height: 460,
        bottom: -160,
        right: -60,
        color: 'gold',
        opacity: 0.26,
      },
    ],
  },
  form: {
    canvas: '#402616',
    washes: [
      {
        width: 400,
        height: 400,
        top: -160,
        right: -100,
        color: 'cream',
        opacity: 0.14,
      },
    ],
  },
  detail: {
    canvas: '#362218',
    washes: [
      {
        width: 440,
        height: 440,
        bottom: -200,
        left: -140,
        color: 'gold',
        opacity: 0.18,
      },
    ],
  },
  chat: {
    canvas: '#2F1B12',
    washes: [
      {
        width: 380,
        height: 380,
        top: -200,
        right: -120,
        color: 'brew',
        opacity: 0.5,
      },
    ],
  },
};

export function Atmosphere({ mood = 'home' }: { mood?: AtmosphereMood }) {
  const theme = useTheme();
  const setup = moods[mood];
  const tint = {
    gold: theme.colors.gold,
    cream: theme.colors.cream,
    foam: theme.colors.foam,
    brew: theme.colors.brew,
    mocha: theme.colors.mocha,
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
