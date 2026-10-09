/**
 * StudySync visual language: dark espresso liquid wallpaper with
 * translucent glass controls and ivory type.
 */

export const palette = {
  ink: '#F6EBDD',
  cocoa: '#D9B48C',
  stone: '#C4B0A0',
  canvas: '#1B120D',
  brew: '#1B120D',
  mocha: '#2A1A12',
  gold: '#E9B77A',
  cream: '#F3E6D3',
  foam: '#FFF6EA',
  mist: '#F6EBDD',
  clay: '#C98B4E',
  blush: '#E8D3BE',
  sageMist: '#A89078',
  surface: 'rgba(255, 255, 255, 0.14)',
  inputFill: 'rgba(255, 255, 255, 0.11)',
  line: 'rgba(255, 255, 255, 0.22)',
  espresso: '#1B120D',
  espressoPressed: '#2A1A12',
  cinnamon: '#F2C48D',
  cinnamonPressed: '#E9B77A',
  cinnamonSoft: 'rgba(242, 196, 141, 0.22)',
  sage: '#C8D4B8',
  sageSoft: 'rgba(200, 212, 184, 0.2)',
  danger: '#F09595',
  dangerSoft: 'rgba(240, 149, 149, 0.22)',
  inverse: '#1B120D',
  skeleton: 'rgba(255, 255, 255, 0.14)',
  shadow: '#050302',
} as const;

export type ColorTokens = {
  canvas: string;
  brew: string;
  mocha: string;
  gold: string;
  cream: string;
  foam: string;
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
  onGlass: string;
  onGlassMuted: string;
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
  brew: palette.brew,
  mocha: palette.mocha,
  gold: palette.gold,
  cream: palette.cream,
  foam: palette.foam,
  mist: palette.mist,
  clay: palette.clay,
  blush: palette.blush,
  sageMist: palette.sageMist,
  surface: palette.surface,
  inputFill: palette.inputFill,
  text: palette.ink,
  textSecondary: 'rgba(246, 235, 221, 0.86)',
  textMuted: 'rgba(246, 235, 221, 0.72)',
  textInverse: palette.espresso,
  onGlass: palette.ink,
  onGlassMuted: 'rgba(246, 235, 221, 0.78)',
  border: palette.line,
  divider: 'rgba(246, 235, 221, 0.14)',
  accent: palette.cinnamon,
  accentPressed: palette.cinnamonPressed,
  accentSoft: palette.cinnamonSoft,
  brand: palette.cinnamon,
  brandPressed: palette.cinnamonPressed,
  brandSoft: palette.cinnamonSoft,
  success: palette.sage,
  successSoft: palette.sageSoft,
  caramel: palette.cinnamon,
  danger: palette.danger,
  dangerSoft: palette.dangerSoft,
  skeleton: palette.skeleton,
  placeholder: 'rgba(246, 235, 221, 0.48)',
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
  screen: 24,
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
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '500' as const,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.4,
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
  scheme: 'dark' as const,
  colors: lightColors,
  space,
  radius,
  type,
  control,
  motion,
};

export type Theme = typeof lightTheme;
