import {
  CardStyleInterpolators,
  type StackCardInterpolationProps,
} from '@react-navigation/stack';
import { Animated } from 'react-native';

import {
  deskStackOptions,
  glassPageTurn,
  PAGE_TURN_FADE_MS,
  PAGE_TURN_MS,
} from '../src/navigation/glassPageTurn';

function props(
  next?: StackCardInterpolationProps['next'],
): StackCardInterpolationProps {
  return {
    current: { progress: new Animated.Value(0) },
    next,
    closing: new Animated.Value(0),
    swiping: new Animated.Value(0),
    inverted: new Animated.Value(1),
    layouts: { screen: { width: 390, height: 844 } },
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  } as unknown as StackCardInterpolationProps;
}

describe('glass page turn (unit — not an emulator recording)', () => {
  it('uses a 400ms simulated hinge, not a 180-degree flip', () => {
    expect(PAGE_TURN_MS).toBe(400);
    const open = glassPageTurn(props());
    expect(open.cardStyle).toMatchObject({ backgroundColor: 'transparent' });
    const close = glassPageTurn(props({ progress: new Animated.Value(0) }));
    expect(close.cardStyle).toBeDefined();
  });

  it('replaces the turn with a fade when reduced motion is on', () => {
    const reduced = deskStackOptions(true);
    expect(reduced.cardStyleInterpolator).toBe(
      CardStyleInterpolators.forFadeFromCenter,
    );
    expect(reduced.gestureEnabled).toBe(false);
    expect(reduced.transitionSpec?.open).toMatchObject({
      config: { duration: PAGE_TURN_FADE_MS },
    });
    const motion = deskStackOptions(false);
    expect(motion.cardStyleInterpolator).toBe(glassPageTurn);
    expect(motion.transitionSpec?.open).toMatchObject({
      config: { duration: PAGE_TURN_MS },
    });
  });
});
