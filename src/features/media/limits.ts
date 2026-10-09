export type AllowedKind = 'image' | 'file';

export type AllowedType = {
  extension: string;
  contentType: string;
  kind: AllowedKind;
};

/** Mirrors `studysync-backend-rs` `src/media/validate.rs` ALLOWED. */
export const ALLOWED_ATTACHMENTS: AllowedType[] = [
  { extension: 'png', contentType: 'image/png', kind: 'image' },
  { extension: 'jpg', contentType: 'image/jpeg', kind: 'image' },
  { extension: 'jpeg', contentType: 'image/jpeg', kind: 'image' },
  { extension: 'gif', contentType: 'image/gif', kind: 'image' },
  { extension: 'webp', contentType: 'image/webp', kind: 'image' },
  { extension: 'pdf', contentType: 'application/pdf', kind: 'file' },
  {
    extension: 'docx',
    contentType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    kind: 'file',
  },
  {
    extension: 'xlsx',
    contentType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    kind: 'file',
  },
  {
    extension: 'pptx',
    contentType:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    kind: 'file',
  },
];

export type LocalAttachment = {
  localId: string;
  uri: string;
  name: string;
  type: string;
  size: number;
  kind: AllowedKind;
  mediaId?: string;
};
