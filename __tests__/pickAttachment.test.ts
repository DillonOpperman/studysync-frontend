import { pick, types } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';

import {
  pickDocumentAttachment,
  pickImageAttachment,
} from '../src/features/media/pickAttachment';

describe('pickers (mocked native modules — not a device picker)', () => {
  it('cancels image and document selection without throwing', async () => {
    (launchImageLibrary as jest.Mock).mockResolvedValueOnce({
      didCancel: true,
    });
    await expect(pickImageAttachment()).resolves.toEqual({
      status: 'cancelled',
    });
    (pick as jest.Mock).mockRejectedValueOnce({
      code: 'OPERATION_CANCELED',
    });
    await expect(pickDocumentAttachment()).resolves.toEqual({
      status: 'cancelled',
    });
    expect(types.pdf).toBe('application/pdf');
  });

  it('rejects unsupported image types from the library', async () => {
    (launchImageLibrary as jest.Mock).mockResolvedValueOnce({
      didCancel: false,
      assets: [
        {
          uri: 'file://clip.mp4',
          fileName: 'clip.mp4',
          type: 'video/mp4',
          fileSize: 99,
        },
      ],
    });
    const result = await pickImageAttachment();
    expect(result.status).toBe('error');
  });
});
