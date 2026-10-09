import { initialsFromName } from '../src/components/Avatar';
import { lightColors, palette } from '../src/theme';

describe('StudySync palette', () => {
  it('keeps a warm brown identity with espresso actions and cinnamon brand', () => {
    expect(lightColors.canvas).toBe('#F4F0EB');
    expect(lightColors.surface).toBe('#FFFFFF');
    expect(lightColors.text).toBe(palette.ink);
    expect(lightColors.accent).toBe(palette.espresso);
    expect(lightColors.brand).toBe(palette.cinnamon);
    expect(lightColors.accent).not.toMatch(/#1B4D6E|#007AFF|#1A73E8/i);
    expect(lightColors.caramel).toBe(palette.cinnamon);
  });

  it('does not use muted stone for primary text', () => {
    expect(lightColors.text).not.toBe(palette.stone);
    expect(lightColors.text).not.toBe(palette.line);
  });
});

describe('avatars', () => {
  it('derives initials without icons', () => {
    expect(initialsFromName('Ada Lovelace')).toBe('AL');
    expect(initialsFromName('Ada')).toBe('AD');
  });
});
