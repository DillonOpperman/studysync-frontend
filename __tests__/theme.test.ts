import { initialsFromName } from '../src/components/Avatar';
import { lightColors, palette } from '../src/theme';

describe('StudySync palette', () => {
  it('keeps printed ink on antique paper with cinnamon as an accent', () => {
    expect(lightColors.canvas).toBe('#F7F0E3');
    expect(lightColors.text).toBe('#49382B');
    expect(lightColors.onGlass).toBe(palette.ink);
    expect(lightColors.brand).toBe('#B96F4A');
    expect(lightColors.accent).not.toMatch(/#1B4D6E|#007AFF|#1A73E8/i);
  });
});

describe('avatars', () => {
  it('derives initials without icons', () => {
    expect(initialsFromName('Ada Lovelace')).toBe('AL');
    expect(initialsFromName('Ada')).toBe('AD');
  });
});
