/**
 * StudySync design tokens. Light theme only for this phase; names are semantic
 * so a later dark palette can slot in without restyling every screen.
 */

export const palette = {
  canvas: '#F6F2EB',
  surface: '#FFFDFA',
  espresso: '#302720',
  cocoa: '#594236',
  secondary: '#846B5B',
  taupe: '#B6A797',
  border: '#E7DED3',
  forest: '#365A46',
  forestPressed: '#2C4A3A',
  forestSoft: '#E7EFEA',
  caramel: '#B68B5D',
  danger: '#8F3A32',
  dangerSoft: '#F4E6E3',
  inverse: '#FFFDFA',
  skeleton: '#EDE6DC',
} as const;

export type ColorTokens = {
  canvas: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  divider: string;
  accent: string;
  accentPressed: string;
  accentSoft: string;
  caramel: string;
  danger: string;
  dangerSoft: string;
  skeleton: string;
  placeholder: string;
};

export const lightColors: ColorTokens = {
  canvas: palette.canvas,
  surface: palette.surface,
  text: palette.espresso,
  textSecondary: palette.cocoa,
  textMuted: palette.secondary,
  textInverse: palette.inverse,
  border: palette.border,
  divider: palette.border,
  accent: palette.forest,
  accentPressed: palette.forestPressed,
  accentSoft: palette.forestSoft,
  caramel: palette.caramel,
  danger: palette.danger,
  dangerSoft: palette.dangerSoft,
  skeleton: palette.skeleton,
  placeholder: palette.taupe,
};

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '600' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400' as const },
  callout: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400' as const },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
} as const;

export const control = {
  minHeight: 48,
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
