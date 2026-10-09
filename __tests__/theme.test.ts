import { initialsFromName } from '../src/components/Avatar';
import { lightColors, palette } from '../src/theme';

describe('StudySync palette', () => {
  it('keeps a warm brown identity with forest actions', () => {
    expect(lightColors.canvas).toBe('#F6F2EB');
    expect(lightColors.surface).toBe('#FFFDFA');
    expect(lightColors.text).toBe(palette.espresso);
    expect(lightColors.accent).toBe(palette.forest);
    expect(lightColors.accent).not.toMatch(/#1B4D6E|#007AFF|#1A73E8/i);
    expect(lightColors.caramel).toBe(palette.caramel);
  });

  it('does not use low-contrast taupe for primary text', () => {
    expect(lightColors.text).not.toBe(palette.taupe);
    expect(lightColors.text).not.toBe(palette.border);
  });
});

describe('avatars', () => {
  it('derives initials without icons', () => {
    expect(initialsFromName('Ada Lovelace')).toBe('AL');
    expect(initialsFromName('Ada')).toBe('AD');
  });
});
