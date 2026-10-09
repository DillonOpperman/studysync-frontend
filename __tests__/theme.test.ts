import { initialsFromName } from '../src/components/Avatar';
import { lightColors, palette } from '../src/theme';

describe('StudySync palette', () => {
  it('keeps espresso type and cinnamon brand over liquid glass', () => {
    expect(lightColors.text).toBe(palette.ink);
    expect(lightColors.onGlass).toBe(palette.ink);
    expect(lightColors.brand).toBe(palette.cinnamon);
    expect(lightColors.accent).not.toMatch(/#1B4D6E|#007AFF|#1A73E8/i);
  });
});

describe('avatars', () => {
  it('derives initials without icons', () => {
    expect(initialsFromName('Ada Lovelace')).toBe('AL');
    expect(initialsFromName('Ada')).toBe('AD');
  });
});
