import { MAX_MEDIA_BYTES } from '../src/api/types';
import {
  addPickedAttachment,
  toLocalAttachment,
} from '../src/features/media/pickAttachment';
import {
  matchAllowedType,
  outgoingMessageType,
  validateAttachmentSet,
  validateLocalFile,
} from '../src/features/media/validateSelection';

describe('attachment selection (local rules — not a live upload)', () => {
  it('accepts backend allowlisted images and documents', () => {
    expect(matchAllowedType('notes.PNG', 'image/png')?.kind).toBe('image');
    expect(matchAllowedType('slides.pptx')?.kind).toBe('file');
    expect(matchAllowedType('movie.mp4')).toBeNull();
    expect(matchAllowedType('notes.png', 'video/mp4')).toBeNull();
  });

  it('rejects empty and oversized files', () => {
    expect(validateLocalFile({ name: 'a.png', size: 0 }).ok).toBe(false);
    expect(
      validateLocalFile({
        name: 'a.png',
        type: 'image/png',
        size: MAX_MEDIA_BYTES + 1,
      }).ok,
    ).toBe(false);
    expect(
      validateLocalFile({ name: 'a.png', type: 'image/png', size: 12 }).ok,
    ).toBe(true);
  });

  it('keeps a message to one kind and at most five files', () => {
    const image = toLocalAttachment({
      uri: 'file://a.png',
      name: 'a.png',
      type: 'image/png',
      size: 12,
    });
    const file = toLocalAttachment({
      uri: 'file://a.pdf',
      name: 'a.pdf',
      type: 'application/pdf',
      size: 12,
    });
    if (image.status !== 'picked' || file.status !== 'picked') {
      throw new Error('expected picked files');
    }
    expect(validateAttachmentSet([image.file], file.file)).toMatch(/not both/);
    const many = Array.from({ length: 5 }, (_, index) => ({
      ...image.file,
      localId: `id-${index}`,
    }));
    expect(
      validateAttachmentSet(many, { ...image.file, localId: 'extra' }),
    ).toMatch(/up to 5/);
    expect(addPickedAttachment([image.file], image.file).ok).toBe(false);
    expect(outgoingMessageType([image.file])).toBe('image');
    expect(outgoingMessageType([file.file])).toBe('file');
    expect(outgoingMessageType([])).toBe('text');
  });
});
