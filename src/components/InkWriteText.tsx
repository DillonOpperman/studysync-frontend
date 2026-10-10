import React, { useEffect, useMemo, useRef, useState } from 'react';
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
 * After the write, strokes crossfade into Courier Prime.
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
  const inkOpacity = useRef(new Animated.Value(1)).current;
  const typeOpacity = useRef(new Animated.Value(0)).current;
  const [animate] = useState(
    () => writable && !reduceMotion && !played.has(playKey),
  );
  const [settled, setSettled] = useState(false);
  const instant = reduceMotion || !animate || !writable || settled;

  useEffect(() => {
    if (reduceMotion || !animate || settled || !writable) {
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
    const write = Animated.parallel(sequence);
    const fade = Animated.parallel([
      Animated.timing(inkOpacity, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(typeOpacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
    ]);
    write.start(({ finished }) => {
      if (!finished) {
        return;
      }
      fade.start(({ finished: faded }) => {
        if (faded) {
          setSettled(true);
        }
      });
    });
    return () => {
      write.stop();
      fade.stop();
    };
  }, [
    animate,
    inkOpacity,
    layout.strokes,
    playKey,
    reduceMotion,
    settled,
    typeOpacity,
    values,
    writable,
  ]);

  const ink = color ?? theme.colors.text;
  const preset = theme.type[variant];
  const textStyle: StyleProp<TextStyle> = [preset, style, { color: ink }];
  const height = preset.fontSize ?? 32;
  const lineHeight = preset.lineHeight ?? height;
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
      style={{ width: Math.max(width, 1), height: lineHeight }}
    >
      <Animated.View
        pointerEvents="none"
        style={{ position: 'absolute', opacity: inkOpacity }}
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
      </Animated.View>
      <Animated.Text
        maxFontSizeMultiplier={1.35}
        style={[textStyle, { opacity: typeOpacity }]}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

export function resetInkWriteForTests() {
  played.clear();
}
