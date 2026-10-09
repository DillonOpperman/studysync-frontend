import { apiUrl } from '../../config/env';

export type MediaContentRef = {
  uri: string;
  needsAuth: boolean;
};

/**
 * Builds a fetchable URI for private media.
 * `memory://` signed URLs from local storage are rewritten to the HTTP content
 * route with the same `exp`/`sig` query. Do not log the result.
 */
export function mediaContentRef(
  mediaId: string,
  downloadUrl: string | null | undefined,
): MediaContentRef | null {
  if (!mediaId) {
    return null;
  }
  const url = downloadUrl?.trim() ?? '';
  if (/^https?:\/\//i.test(url)) {
    return { uri: url, needsAuth: false };
  }
  if (url.startsWith('memory://')) {
    const queryIndex = url.indexOf('?');
    const query = queryIndex >= 0 ? url.slice(queryIndex + 1) : '';
    const suffix = query ? `?${query}` : '';
    return {
      uri: apiUrl(`/media/${mediaId}/content${suffix}`),
      needsAuth: false,
    };
  }
  return {
    uri: apiUrl(`/media/${mediaId}/content`),
    needsAuth: true,
  };
}
