import { MAX_MEDIA_BYTES, MAX_MESSAGE_ATTACHMENTS } from '../../api/types';
import {
  ALLOWED_ATTACHMENTS,
  type AllowedKind,
  type AllowedType,
  type LocalAttachment,
} from './limits';

function extensionOf(name: string): string {
  const base = name.replace(/\\/g, '/').split('/').pop() ?? name;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) {
    return '';
  }
  return base.slice(dot + 1).toLowerCase();
}

function normalizeMime(value: string | undefined): string {
  return (value ?? '').split(';')[0].trim().toLowerCase();
}

export function matchAllowedType(
  name: string,
  mime?: string,
): AllowedType | null {
  const ext = extensionOf(name);
  const byExt = ALLOWED_ATTACHMENTS.find(item => item.extension === ext);
  if (!byExt) {
    return null;
  }
  const declared = normalizeMime(mime);
  if (
    declared &&
    declared !== 'application/octet-stream' &&
    declared !== byExt.contentType &&
    !(declared === 'image/jpg' && byExt.contentType === 'image/jpeg')
  ) {
    return null;
  }
  return byExt;
}

export function formatByteSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateLocalFile(input: {
  name: string;
  type?: string;
  size?: number | null;
}): { ok: true; allowed: AllowedType } | { ok: false; error: string } {
  const size = input.size ?? 0;
  if (size <= 0) {
    return { ok: false, error: 'That file is empty.' };
  }
  if (size > MAX_MEDIA_BYTES) {
    return {
      ok: false,
      error: `Files must be ${formatByteSize(MAX_MEDIA_BYTES)} or smaller.`,
    };
  }
  const allowed = matchAllowedType(input.name, input.type);
  if (!allowed) {
    return {
      ok: false,
      error:
        'Use PNG, JPEG, GIF, WebP, PDF, DOCX, XLSX, or PPTX. Video is not supported.',
    };
  }
  return { ok: true, allowed };
}

export function validateAttachmentSet(
  existing: LocalAttachment[],
  next: LocalAttachment,
): string | null {
  if (existing.some(item => item.localId === next.localId)) {
    return 'That file is already attached.';
  }
  if (existing.length >= MAX_MESSAGE_ATTACHMENTS) {
    return `You can attach up to ${MAX_MESSAGE_ATTACHMENTS} files.`;
  }
  const kind: AllowedKind | undefined = existing[0]?.kind;
  if (kind && kind !== next.kind) {
    return 'A message can include images or documents, not both.';
  }
  return null;
}

export function outgoingMessageType(
  attachments: LocalAttachment[],
): 'text' | 'image' | 'file' {
  if (attachments.length === 0) {
    return 'text';
  }
  return attachments[0].kind === 'image' ? 'image' : 'file';
}
