import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';

import { type LocalAttachment } from './limits';
import { validateAttachmentSet, validateLocalFile } from './validateSelection';

export type PickResult =
  | { status: 'cancelled' }
  | { status: 'error'; error: string }
  | { status: 'picked'; file: LocalAttachment };

function nextLocalId(): string {
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function toLocalAttachment(input: {
  uri: string;
  name: string;
  type?: string;
  size?: number | null;
}): PickResult {
  const checked = validateLocalFile({
    name: input.name,
    type: input.type,
    size: input.size,
  });
  if (!checked.ok) {
    return { status: 'error', error: checked.error };
  }
  return {
    status: 'picked',
    file: {
      localId: nextLocalId(),
      uri: input.uri,
      name: input.name,
      type: checked.allowed.contentType,
      size: input.size ?? 0,
      kind: checked.allowed.kind,
    },
  };
}

export async function pickImageAttachment(): Promise<PickResult> {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    includeBase64: false,
  });
  if (result.didCancel) {
    return { status: 'cancelled' };
  }
  const asset = result.assets?.[0];
  if (!asset?.uri) {
    return { status: 'error', error: 'Could not read that photo.' };
  }
  return toLocalAttachment({
    uri: asset.uri,
    name: asset.fileName || 'image.jpg',
    type: asset.type,
    size: asset.fileSize,
  });
}

export async function pickDocumentAttachment(): Promise<PickResult> {
  try {
    const [file] = await pick({
      allowMultiSelection: false,
      type: [types.pdf, types.docx, types.xlsx, types.pptx],
    });
    return toLocalAttachment({
      uri: file.uri,
      name: file.name ?? 'document',
      type: file.type ?? undefined,
      size: file.size,
    });
  } catch (caught) {
    if (
      isErrorWithCode(caught) &&
      caught.code === errorCodes.OPERATION_CANCELED
    ) {
      return { status: 'cancelled' };
    }
    return {
      status: 'error',
      error:
        caught instanceof Error ? caught.message : 'Could not open a file.',
    };
  }
}

export function addPickedAttachment(
  existing: LocalAttachment[],
  picked: LocalAttachment,
): { ok: true; next: LocalAttachment[] } | { ok: false; error: string } {
  const problem = validateAttachmentSet(existing, picked);
  if (problem) {
    return { ok: false, error: problem };
  }
  return { ok: true, next: [...existing, picked] };
}
