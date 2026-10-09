import { isUserId, normalizeUserId } from '../src/features/social/userId';

describe('user ids', () => {
  it('accepts canonical UUIDs and rejects junk', () => {
    expect(isUserId('11111111-1111-7111-8111-111111111111')).toBe(true);
    expect(isUserId(' not-a-uuid ')).toBe(false);
    expect(normalizeUserId('  AABBCCDD-1111-4111-8111-111111111111  ')).toBe(
      'aabbccdd-1111-4111-8111-111111111111',
    );
  });
});
