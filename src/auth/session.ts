import { ApiClient } from '../api/client';
import { ApiError, isInvalidRefresh } from '../api/errors';
import type {
  AuthResponse,
  GroupDto,
  LoginRequest,
  RegisterRequest,
  UserProfileDto,
} from '../api/types';
import type { RefreshTokenStore } from './refreshTokenStore';

export type SessionState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; user: UserProfileDto };

export type SessionListener = (state: SessionState) => void;

export class SessionController {
  private accessToken: string | null = null;
  private user: UserProfileDto | null = null;
  private refreshInFlight: Promise<string | null> | null = null;
  private readonly listeners = new Set<SessionListener>();
  readonly client: ApiClient;

  constructor(
    private readonly store: RefreshTokenStore,
    fetchImpl: typeof fetch = fetch,
  ) {
    this.client = new ApiClient(
      {
        getAccessToken: () => this.accessToken,
        refreshAccessToken: () => this.refreshAccessToken(),
        onAuthFailure: () => this.clearLocalSession(),
      },
      fetchImpl,
    );
  }

  getState(): SessionState {
    if (this.user && this.accessToken) {
      return { status: 'signedIn', user: this.user };
    }
    return { status: 'signedOut' };
  }

  currentAccessToken(): string | null {
    return this.accessToken;
  }

  subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  private applyAuth(response: AuthResponse) {
    this.accessToken = response.accessToken;
    this.user = response.user;
  }

  async restore(): Promise<SessionState> {
    const refreshToken = await this.store.get();
    if (!refreshToken) {
      this.accessToken = null;
      this.user = null;
      this.emit();
      return this.getState();
    }
    const ok = await this.refreshAccessToken();
    if (!ok) {
      await this.clearLocalSession();
    }
    this.emit();
    return this.getState();
  }

  async register(body: RegisterRequest): Promise<UserProfileDto> {
    const response = await this.client.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
      skipAuth: true,
    });
    await this.persistAuth(response);
    return response.user;
  }

  async login(body: LoginRequest): Promise<UserProfileDto> {
    const response = await this.client.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
      skipAuth: true,
    });
    await this.persistAuth(response);
    return response.user;
  }

  async loadMe(): Promise<UserProfileDto> {
    const profile = await this.client.request<UserProfileDto>('/me', {
      method: 'GET',
    });
    this.user = profile;
    this.emit();
    return profile;
  }

  async listMyGroups() {
    return this.client.request<GroupDto[]>('/groups/mine', {
      method: 'GET',
    });
  }

  async logout(): Promise<void> {
    const refreshToken = await this.store.get();
    try {
      if (refreshToken) {
        await this.client.request<void>('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
          skipAuth: true,
          parseJson: false,
        });
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === 'invalid_refresh_token') {
        // Already revoked; still drop local credentials.
      } else if (!(error instanceof ApiError)) {
        await this.clearLocalSession();
        throw error;
      }
    }
    await this.clearLocalSession();
  }

  /**
   * Rotates the refresh token (backend revokes the previous session).
   * Concurrent callers share one in-flight request.
   */
  refreshAccessToken(): Promise<string | null> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }
    this.refreshInFlight = this.performRefresh().finally(() => {
      this.refreshInFlight = null;
    });
    return this.refreshInFlight;
  }

  private async performRefresh(): Promise<string | null> {
    const refreshToken = await this.store.get();
    if (!refreshToken) {
      return null;
    }
    try {
      const response = await this.client.request<AuthResponse>(
        '/auth/refresh',
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
          skipAuth: true,
        },
      );
      await this.persistAuth(response);
      return response.accessToken;
    } catch (error) {
      if (
        isInvalidRefresh(error) ||
        (error instanceof ApiError && error.status === 401)
      ) {
        await this.clearLocalSession();
        return null;
      }
      throw error;
    }
  }

  private async persistAuth(response: AuthResponse) {
    this.applyAuth(response);
    await this.store.set(response.refreshToken);
    this.emit();
  }

  async clearLocalSession(): Promise<void> {
    this.accessToken = null;
    this.user = null;
    await this.store.clear();
    this.emit();
  }
}
