import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { useReduceMotion, useTheme } from '../theme';
import { type as typeTokens } from '../theme/tokens';
import { canWriteInInk, INK_EM, layoutInk } from './ink/glyphs';

type Variant = keyof typeof typeTokens;

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * Stroke-based fountain-pen ink: SVG path dash offset per glyph stroke.
 * Dynamic text is composed from a bundled bookhand alphabet (not a hardcoded name).
 * After the write, Courier Prime text remains for the settled layout.
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
  const layout = useMemo(() => layoutInk(text), [text]);
  const writable = canWriteInInk(text);
  const values = useMemo(
    () => layout.strokes.map(stroke => new Animated.Value(stroke.length)),
    [layout],
  );
  const [animate] = useState(
    () => writable && !reduceMotion && !played.has(playKey),
  );
  const [written, setWritten] = useState(false);
  const instant = reduceMotion || !animate || written || !writable;

  useEffect(() => {
    if (reduceMotion || !animate || written || !writable) {
      return;
    }
    played.add(playKey);
    let delay = 0;
    const sequence = layout.strokes.map((stroke, index) => {
      const duration = Math.min(260, Math.max(85, stroke.length * 5.2));
      const run = Animated.timing(values[index], {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: false,
      });
      delay += duration * 0.62;
      return run;
    });
    const run = Animated.parallel(sequence);
    let settle: ReturnType<typeof setTimeout> | undefined;
    run.start(({ finished }) => {
      if (finished) {
        settle = setTimeout(() => setWritten(true), 450);
      }
    });
    return () => {
      run.stop();
      if (settle) {
        clearTimeout(settle);
      }
    };
  }, [
    animate,
    layout.strokes,
    playKey,
    reduceMotion,
    values,
    writable,
    written,
  ]);

  const ink = color ?? theme.colors.text;
  const preset = theme.type[variant];
  const textStyle: StyleProp<TextStyle> = [preset, style, { color: ink }];
  const height = preset.fontSize ?? 32;
  const width = (layout.width / INK_EM) * height;

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
      accessibilityRole="text"
      accessibilityLabel={text}
      style={{ width, height: preset.lineHeight ?? height }}
    >
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${layout.width} ${INK_EM}`}
        accessible={false}
        importantForAccessibility="no"
      >
        {layout.strokes.map((stroke, index) => (
          <G key={`${playKey}-${index}`} x={stroke.x}>
            <AnimatedPath
              d={stroke.d}
              fill="none"
              stroke={ink}
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${stroke.length} ${stroke.length}`}
              strokeDashoffset={values[index]}
            />
          </G>
        ))}
      </Svg>
    </View>
  );
}

export function resetInkWriteForTests() {
  played.clear();
}
