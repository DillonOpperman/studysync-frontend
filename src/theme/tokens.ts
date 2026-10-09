/**
 * StudySync visual language: gold-brew coffee, blurred cream, clean glass.
 * Canvas is the cup. Controls are the cream.
 */

export const palette = {
  ink: '#1C1410',
  cocoa: '#5A463A',
  stone: '#C4B0A0',
  canvas: '#3C2418',
  brew: '#2F1B12',
  mocha: '#4A2E20',
  gold: '#C49A6C',
  cream: '#F3E6D4',
  foam: '#FFF6EC',
  mist: '#F6EDE3',
  clay: '#C49A6C',
  blush: '#E8D3BE',
  sageMist: '#A89078',
  surface: 'rgba(255, 249, 242, 0.94)',
  inputFill: 'rgba(255, 246, 236, 0.86)',
  line: 'rgba(255, 255, 255, 0.55)',
  espresso: '#241C18',
  espressoPressed: '#3A2E27',
  cinnamon: '#E08A5C',
  cinnamonPressed: '#C45C32',
  cinnamonSoft: 'rgba(224, 138, 92, 0.22)',
  sage: '#8FA084',
  sageSoft: 'rgba(143, 160, 132, 0.2)',
  danger: '#E87A6C',
  dangerSoft: 'rgba(232, 122, 108, 0.18)',
  inverse: '#F6EDE3',
  skeleton: 'rgba(243, 230, 212, 0.16)',
  shadow: '#1A0E08',
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
  text: palette.mist,
  textSecondary: palette.blush,
  textMuted: 'rgba(246, 237, 227, 0.64)',
  textInverse: palette.mist,
  onGlass: palette.ink,
  onGlassMuted: palette.cocoa,
  border: palette.line,
  divider: 'rgba(246, 237, 227, 0.12)',
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
  placeholder: 'rgba(28, 20, 16, 0.42)',
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
