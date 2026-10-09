/**
 * StudySync design tokens. Light theme only for this phase; names are semantic
 * so a later dark palette can slot in without restyling every screen.
 *
 * Warm brown is the identity. Primary actions use near-black espresso (high
 * contrast, contemporary). Cinnamon is the brand accent for selection, links,
 * and the wordmark — not a wash of beige.
 */

export const palette = {
  ink: '#1A1410',
  cocoa: '#4E3F36',
  stone: '#6D5E55',
  canvas: '#F4F0EB',
  surface: '#FFFFFF',
  inputFill: '#EFE8E1',
  line: '#E2D9D0',
  espresso: '#241C18',
  espressoPressed: '#3A2E27',
  cinnamon: '#C45C32',
  cinnamonPressed: '#A34B29',
  cinnamonSoft: '#F6E6DC',
  sage: '#5C6B52',
  sageSoft: '#E7EDE3',
  danger: '#B42318',
  dangerSoft: '#F8E7E4',
  inverse: '#FFFFFF',
  skeleton: '#E8E0D7',
} as const;

export type ColorTokens = {
  canvas: string;
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
};

export const lightColors: ColorTokens = {
  canvas: palette.canvas,
  surface: palette.surface,
  inputFill: palette.inputFill,
  text: palette.ink,
  textSecondary: palette.cocoa,
  textMuted: palette.stone,
  textInverse: palette.inverse,
  border: palette.line,
  divider: palette.line,
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
  screen: 20,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const type = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.7,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.45,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
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
    letterSpacing: 0.4,
  },
} as const;

export const control = {
  minHeight: 50,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
  icon: 22,
  avatar: 40,
  hairline: 1,
} as const;

export const motion = {
  fast: 120,
  normal: 200,
  slow: 280,
  pressScale: 0.98,
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
