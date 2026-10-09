import { mediaContentRef } from '../src/features/media/contentUrl';

describe('private media URLs (unit — does not fetch bytes)', () => {
  it('rewrites memory signed URLs onto the HTTP content route', () => {
    const ref = mediaContentRef('m1', 'memory://groups/g/m1.png?exp=9&sig=abc');
    expect(ref?.needsAuth).toBe(false);
    expect(ref?.uri).toContain('/api/v1/media/m1/content?exp=9&sig=abc');
    expect(ref?.uri.startsWith('http')).toBe(true);
  });

  it('uses https download URLs as-is and falls back to authenticated content', () => {
    expect(mediaContentRef('m1', 'https://objects.example/file?sig=1')).toEqual(
      {
        uri: 'https://objects.example/file?sig=1',
        needsAuth: false,
      },
    );
    expect(mediaContentRef('m1', null)).toEqual({
      uri: expect.stringContaining('/api/v1/media/m1/content'),
      needsAuth: true,
    });
  });
});
