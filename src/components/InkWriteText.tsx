import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { useReduceMotion, useTheme } from '../theme';
import { type as typeTokens } from '../theme/tokens';

type Variant = keyof typeof typeTokens;

/**
 * Character-based ink reveal (not stroke-by-stroke handwriting).
 * Plays once per `playKey` unless reduced motion is on, then text is immediate.
 */
const played = new Set<string>();

export function InkWriteText({
  text,
  playKey,
  variant = 'display',
  color,
  style,
}: {
  text: string;
  playKey: string;
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const chars = useMemo(() => [...text], [text]);
  const values = useMemo(() => chars.map(() => new Animated.Value(0)), [chars]);
  const [animate] = useState(() => !reduceMotion && !played.has(playKey));
  const [written, setWritten] = useState(false);
  const instant = reduceMotion || !animate || written;

  useEffect(() => {
    if (reduceMotion || !animate || written) {
      return;
    }
    played.add(playKey);
    const step = Math.min(48, Math.floor(720 / Math.max(chars.length, 1)));
    const run = Animated.stagger(
      step,
      values.map(value =>
        Animated.timing(value, {
          toValue: 1,
          duration: 90,
          useNativeDriver: true,
        }),
      ),
    );
    run.start(({ finished }) => {
      if (finished) {
        setWritten(true);
      }
    });
    return () => run.stop();
  }, [animate, chars.length, playKey, reduceMotion, values, written]);

  const ink = color ?? theme.colors.text;
  const preset = theme.type[variant];
  const textStyle: StyleProp<TextStyle> = [preset, style, { color: ink }];

  if (instant) {
    return (
      <Text
        accessibilityRole="text"
        accessibilityLabel={text}
        maxFontSizeMultiplier={1.35}
        style={textStyle}
      >
        {text}
      </Text>
    );
  }

  return (
    <View
      style={{ flexDirection: 'row', flexWrap: 'wrap' }}
      accessibilityRole="text"
      accessibilityLabel={text}
    >
      {chars.map((char, index) => (
        <Animated.View
          key={`${playKey}-${index}`}
          style={{
            opacity: values[index],
            transform: [
              {
                translateY: values[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [4, 0],
                }),
              },
            ],
          }}
        >
          <Text maxFontSizeMultiplier={1.35} style={textStyle}>
            {char === ' ' ? '\u00a0' : char}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}

export function resetInkWriteForTests() {
  played.clear();
}
