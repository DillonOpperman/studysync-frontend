import { initialsFromName } from '../src/components/Avatar';
import { lightColors, palette } from '../src/theme';

describe('StudySync palette', () => {
  it('uses a coffee canvas so cream glass stays clean', () => {
    expect(lightColors.canvas).toBe('#3C2418');
    expect(lightColors.text).toBe(palette.mist);
    expect(lightColors.onGlass).toBe(palette.ink);
    expect(lightColors.brand).toBe(palette.cinnamon);
    expect(lightColors.gold).toBe(palette.gold);
    expect(lightColors.accent).not.toMatch(/#1B4D6E|#007AFF|#1A73E8/i);
    expect(lightColors.caramel).toBe(palette.cinnamon);
  });

  it('does not use muted stone for canvas text', () => {
    expect(lightColors.text).not.toBe(palette.stone);
    expect(lightColors.text).not.toBe(palette.ink);
  });
});

describe('avatars', () => {
  it('derives initials without icons', () => {
    expect(initialsFromName('Ada Lovelace')).toBe('AL');
    expect(initialsFromName('Ada')).toBe('AD');
  });
});
