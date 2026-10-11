import { Easing } from 'react-native';
import {
  type StackCardInterpolatedStyle,
  type StackCardInterpolationProps,
  type StackNavigationOptions,
} from '@react-navigation/stack';

/** Simulated glass page turn — rotate/translate only, not a physical curl. */
export const PAGE_TURN_MS = 420;
export const PAGE_TURN_FADE_MS = 200;

/** Frosted ivory sheet: paper shows through, stacked text does not. */
export const GLASS_SHEET = 'rgba(251, 246, 238, 0.28)';

const pageTurnTiming = {
  animation: 'timing' as const,
  config: {
    duration: PAGE_TURN_MS,
    easing: Easing.bezier(0.22, 0.08, 0.18, 1),
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
 * A frosted sheet plus overlay hide the outgoing text before the new page settles.
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
        outputRange: ['28deg', '0deg'],
        extrapolate: 'clamp',
      })
    : leaving.progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-24deg'],
        extrapolate: 'clamp',
      });

  const translateX = opening
    ? current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [Math.round(width * 0.16), 0],
        extrapolate: 'clamp',
      })
    : leaving.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Math.round(-width * 0.1)],
        extrapolate: 'clamp',
      });

  const opacity = opening
    ? current.progress.interpolate({
        inputRange: [0, 0.22, 1],
        outputRange: [0.55, 1, 1],
        extrapolate: 'clamp',
      })
    : leaving.progress.interpolate({
        inputRange: [0, 0.28, 0.52, 1],
        outputRange: [1, 0.28, 0.04, 0],
        extrapolate: 'clamp',
      });

  const overlay = opening
    ? current.progress.interpolate({
        inputRange: [0, 0.4, 1],
        outputRange: [0.22, 0.06, 0],
        extrapolate: 'clamp',
      })
    : leaving.progress.interpolate({
        inputRange: [0, 0.22, 0.55, 1],
        outputRange: [0, 0.55, 0.82, 0.88],
        extrapolate: 'clamp',
      });

  return {
    cardStyle: {
      backgroundColor: GLASS_SHEET,
      backfaceVisibility: 'hidden',
      opacity,
      transform: [{ perspective: 1400 }, { translateX }, { rotateY }],
    },
    overlayStyle: {
      backgroundColor: 'rgba(237, 224, 201, 0.94)',
      opacity: overlay,
    },
  };
}

export function glassPageFade({
  current,
  next,
}: StackCardInterpolationProps): StackCardInterpolatedStyle {
  const leaving = next;
  const opacity = leaving
    ? leaving.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      })
    : current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      });
  return {
    cardStyle: {
      backgroundColor: GLASS_SHEET,
      backfaceVisibility: 'hidden',
      opacity,
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
      cardStyle: {
        backgroundColor: GLASS_SHEET,
        backfaceVisibility: 'hidden',
      },
      cardOverlayEnabled: false,
      cardStyleInterpolator: glassPageFade,
      transitionSpec: { open: fadeTiming, close: fadeTiming },
    };
  }
  return {
    headerShown: false,
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    cardStyle: {
      backgroundColor: GLASS_SHEET,
      backfaceVisibility: 'hidden',
    },
    cardOverlayEnabled: true,
    cardStyleInterpolator: glassPageTurn,
    transitionSpec: { open: pageTurnTiming, close: pageTurnTiming },
  };
}
