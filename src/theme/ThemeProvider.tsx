import React, { createContext, useContext, useMemo } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import { lightTheme, type Theme } from './tokens';

type ThemeContextValue = {
  theme: Theme;
  reduceMotion: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  reduceMotion: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const apply = (value: boolean) => setReduceMotion(value);
    AccessibilityInfo.isReduceMotionEnabled()
      .then(apply)
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      apply,
    );
    return () => sub.remove();
  }, []);

  const value = useMemo(
    () => ({ theme: lightTheme, reduceMotion }),
    [reduceMotion],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

export function useReduceMotion(): boolean {
  return useContext(ThemeContext).reduceMotion;
}

export function hairlineWidth(): number {
  return Platform.select({ ios: 1 / 2, default: 1 }) ?? 1;
}
