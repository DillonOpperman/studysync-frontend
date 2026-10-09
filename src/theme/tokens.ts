/**
 * StudySync visual language.
 *
 * References: Nothing OS (soft atmosphere, circular glyphs, floating search),
 * ChromeOS sign-in (centered identity, one quiet field), Apple liquid glass
 * (translucent edges, light on the rim). Brown is the identity: clay, cinnamon,
 * espresso — not contest-slide beige and not a copy of those systems.
 */

export const palette = {
  ink: '#1C1410',
  cocoa: '#5A463A',
  stone: '#7A6A60',
  canvas: '#EDE4D8',
  mist: '#F6EFE6',
  clay: '#E4B48C',
  blush: '#E8C4AE',
  sageMist: '#C5D0B8',
  surface: 'rgba(255, 250, 245, 0.78)',
  inputFill: 'rgba(255, 252, 248, 0.55)',
  line: 'rgba(255, 255, 255, 0.7)',
  espresso: '#241C18',
  espressoPressed: '#3A2E27',
  cinnamon: '#C45C32',
  cinnamonPressed: '#A34B29',
  cinnamonSoft: 'rgba(196, 92, 50, 0.16)',
  sage: '#5C6B52',
  sageSoft: 'rgba(92, 107, 82, 0.16)',
  danger: '#B42318',
  dangerSoft: 'rgba(180, 35, 24, 0.12)',
  inverse: '#FFFFFF',
  skeleton: 'rgba(90, 70, 58, 0.12)',
  shadow: '#2A1C14',
} as const;

export type ColorTokens = {
  canvas: string;
  mist: string;
  clay: string;
  blush: string;
  sageMist: string;
  surface: string;
  inputFill: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  divider: string;
  accent: string;
  accentPressed: string;
  accentSoft: string;
  brand: string;
  brandPressed: string;
  brandSoft: string;
  success: string;
  successSoft: string;
  caramel: string;
  danger: string;
  dangerSoft: string;
  skeleton: string;
  placeholder: string;
  glass: string;
  glassStrong: string;
  glassEdge: string;
  shadow: string;
};

export const lightColors: ColorTokens = {
  canvas: palette.canvas,
  mist: palette.mist,
  clay: palette.clay,
  blush: palette.blush,
  sageMist: palette.sageMist,
  surface: palette.surface,
  inputFill: palette.inputFill,
  text: palette.ink,
  textSecondary: palette.cocoa,
  textMuted: palette.stone,
  textInverse: palette.inverse,
  border: palette.line,
  divider: 'rgba(80, 60, 48, 0.08)',
  accent: palette.espresso,
  accentPressed: palette.espressoPressed,
  accentSoft: palette.inputFill,
  brand: palette.cinnamon,
  brandPressed: palette.cinnamonPressed,
  brandSoft: palette.cinnamonSoft,
  success: palette.sage,
  successSoft: palette.sageSoft,
  caramel: palette.cinnamon,
  danger: palette.danger,
  dangerSoft: palette.dangerSoft,
  skeleton: palette.skeleton,
  placeholder: palette.stone,
  glass: palette.inputFill,
  glassStrong: palette.surface,
  glassEdge: palette.line,
  shadow: palette.shadow,
};

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 44,
  screen: 22,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const type = {
  display: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700' as const,
    letterSpacing: -1.2,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.25,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: -0.2,
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400' as const,
    letterSpacing: -0.15,
  },
  subhead: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: -0.1,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.6,
  },
} as const;

export const control = {
  minHeight: 52,
  circle: 56,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
  icon: 22,
  avatar: 44,
  hairline: 1,
} as const;

export const motion = {
  fast: 120,
  normal: 220,
  slow: 320,
  pressScale: 0.97,
} as const;

export const lightTheme = {
  scheme: 'light' as const,
  colors: lightColors,
  space,
  radius,
  type,
  control,
  motion,
};

export type Theme = typeof lightTheme;
