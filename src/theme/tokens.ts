/**
 * StudySync visual language: warm antique paper, typewriter headings,
 * and light liquid glass resting on the page.
 */

import { fonts } from './fonts';

export const palette = {
  ink: '#49382B',
  cocoa: '#79583F',
  stone: '#D5BE9B',
  canvas: '#F7F0E3',
  brew: '#EDE0C9',
  mocha: '#D5BE9B',
  gold: '#D5BE9B',
  cream: '#F7F0E3',
  foam: '#FBF6EE',
  mist: '#F7F0E3',
  clay: '#79583F',
  blush: '#EDE0C9',
  sageMist: '#C8B79A',
  surface: 'rgba(247, 240, 227, 0.42)',
  inputFill: 'rgba(255, 252, 246, 0.28)',
  line: 'rgba(121, 88, 63, 0.18)',
  espresso: '#49382B',
  espressoPressed: '#3A2C22',
  cinnamon: '#B96F4A',
  cinnamonPressed: '#A56342',
  cinnamonSoft: 'rgba(185, 111, 74, 0.16)',
  sage: '#6F7A5A',
  sageSoft: 'rgba(111, 122, 90, 0.16)',
  danger: '#A33D2F',
  dangerSoft: 'rgba(163, 61, 47, 0.14)',
  inverse: '#F7F0E3',
  skeleton: 'rgba(121, 88, 63, 0.12)',
  shadow: '#49382B',
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
  textSecondary: palette.cocoa,
  textMuted: 'rgba(73, 56, 43, 0.62)',
  textInverse: palette.canvas,
  onGlass: palette.ink,
  onGlassMuted: 'rgba(73, 56, 43, 0.7)',
  border: palette.line,
  divider: 'rgba(121, 88, 63, 0.16)',
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
  placeholder: 'rgba(73, 56, 43, 0.42)',
  glass: palette.inputFill,
  glassStrong: palette.surface,
  glassEdge: 'rgba(255, 255, 255, 0.62)',
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
    fontFamily: fonts.typewriterBold,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: fonts.typewriterBold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '400' as const,
    letterSpacing: 0.3,
  },
  headline: {
    fontFamily: fonts.typewriterBold,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
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
    lineHeight: 21,
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
    fontFamily: fonts.typewriter,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 1.2,
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
