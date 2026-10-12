import type { ApiClient } from '../../api/client';
import type {
  PushDeviceDto,
  PushPreferencesDto,
  RegisterPushDeviceRequest,
  UpdatePushPreferencesRequest,
} from '../../api/types';

export function pushApi(client: ApiClient) {
  return {
    registerDevice(body: RegisterPushDeviceRequest) {
      return client.request<PushDeviceDto>('/push/devices', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    unregisterDevice(id: string) {
      return client.request<void>(`/push/devices/${id}`, {
        method: 'DELETE',
        parseJson: false,
      });
    },
    getPreferences(signal?: AbortSignal) {
      return client.request<PushPreferencesDto>('/push/preferences', {
        method: 'GET',
        signal,
      });
    },
    updatePreferences(body: UpdatePushPreferencesRequest) {
      return client.request<PushPreferencesDto>('/push/preferences', {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    },
  };
}
