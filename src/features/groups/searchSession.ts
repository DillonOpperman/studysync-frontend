import { AbortedError } from '../../api/errors';
import type { ApiClient } from '../../api/client';
import type {
  GroupSearchRequest,
  GroupSearchResponse,
  SearchMode,
} from '../../api/types';
import { groupsApi } from './groupsApi';

export async function runGroupSearch(
  client: ApiClient,
  input: {
    query: string;
    mode: SearchMode;
    offset?: number;
    limit?: number;
  },
  signal?: AbortSignal,
): Promise<GroupSearchResponse> {
  const query = input.query.trim();
  if (!query) {
    throw new Error('query must not be blank');
  }
  const body: GroupSearchRequest = {
    query,
    mode: input.mode,
    limit: input.limit ?? 20,
    offset: input.offset ?? 0,
  };
  return groupsApi(client).search(body, signal);
}

export function isSearchCancelled(error: unknown): boolean {
  return error instanceof AbortedError;
}

/** Backend pages by limit/offset and does not return a total count. */
export function searchHasMore(
  lastPageResultCount: number,
  limit: number,
): boolean {
  return lastPageResultCount === limit;
}
