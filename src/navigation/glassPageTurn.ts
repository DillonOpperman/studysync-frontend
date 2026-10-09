import { Easing } from 'react-native';
import {
  CardStyleInterpolators,
  type StackCardInterpolatedStyle,
  type StackCardInterpolationProps,
  type StackNavigationOptions,
} from '@react-navigation/stack';

/** Simulated glass page turn — rotate/translate only, not a physical curl. */
export const PAGE_TURN_MS = 400;
export const PAGE_TURN_FADE_MS = 200;

const pageTurnTiming = {
  animation: 'timing' as const,
  config: {
    duration: PAGE_TURN_MS,
    easing: Easing.out(Easing.cubic),
  },
};

const fadeTiming = {
  animation: 'timing' as const,
  config: {
    duration: PAGE_TURN_FADE_MS,
    easing: Easing.out(Easing.quad),
  },
};

/**
 * Forward navigation hinges the incoming glass page in from the right.
 * Back navigation is the reverse because the stack inverts progress.
 * Cards stay transparent so paper behind the navigator does not move.
 */
export function glassPageTurn({
  current,
  next,
  layouts: { screen },
}: StackCardInterpolationProps): StackCardInterpolatedStyle {
  const width = screen.width;
  const leaving = next;
  const opening = !leaving;

  const rotateY = opening
    ? current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['48deg', '0deg'],
        extrapolate: 'clamp',
      })
    : leaving.progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-42deg'],
        extrapolate: 'clamp',
      });

  const translateX = opening
    ? current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [Math.round(width * 0.07), 0],
        extrapolate: 'clamp',
      })
    : leaving.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Math.round(-width * 0.04)],
        extrapolate: 'clamp',
      });

  const opacity = opening
    ? current.progress.interpolate({
        inputRange: [0, 0.18, 1],
        outputRange: [0.88, 1, 1],
        extrapolate: 'clamp',
      })
    : leaving.progress.interpolate({
        inputRange: [0, 0.55, 1],
        outputRange: [1, 0.2, 0],
        extrapolate: 'clamp',
      });

  const overlay = opening
    ? current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.14, 0],
        extrapolate: 'clamp',
      })
    : leaving.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.12],
        extrapolate: 'clamp',
      });

  return {
    cardStyle: {
      backgroundColor: 'transparent',
      backfaceVisibility: 'hidden',
      opacity,
      transform: [{ perspective: 1200 }, { translateX }, { rotateY }],
    },
    overlayStyle: {
      backgroundColor: '#49382B',
      opacity: overlay,
    },
  };
}

export function deskStackOptions(
  reduceMotion: boolean,
): StackNavigationOptions {
  if (reduceMotion) {
    return {
      headerShown: false,
      gestureEnabled: false,
      cardStyle: { backgroundColor: 'transparent' },
      cardOverlayEnabled: false,
      cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
      transitionSpec: { open: fadeTiming, close: fadeTiming },
    };
  }
  return {
    headerShown: false,
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    cardStyle: { backgroundColor: 'transparent' },
    cardOverlayEnabled: true,
    cardStyleInterpolator: glassPageTurn,
    transitionSpec: { open: pageTurnTiming, close: pageTurnTiming },
  };
}
