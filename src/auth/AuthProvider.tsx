import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ApiClient } from '../api/client';
import type {
  GroupDto,
  LoginRequest,
  RegisterRequest,
  UserProfileDto,
} from '../api/types';
import { keychainRefreshTokenStore } from './refreshTokenStore';
import { SessionController, type SessionState } from './session';

type AuthContextValue = {
  state: SessionState;
  client: ApiClient;
  register: (body: RegisterRequest) => Promise<void>;
  login: (body: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfileDto>;
  loadGroups: () => Promise<GroupDto[]>;
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const controller = new SessionController(keychainRefreshTokenStore);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: 'loading' });

  useEffect(() => {
    const unsubscribe = controller.subscribe(next => {
      if (next.status === 'signedOut' || next.status === 'signedIn') {
        setState(next);
      }
    });
    controller
      .restore()
      .then(setState)
      .catch(() => setState({ status: 'signedOut' }));
    return unsubscribe;
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    await controller.register(body);
  }, []);

  const login = useCallback(async (body: LoginRequest) => {
    await controller.login(body);
  }, []);

  const logout = useCallback(async () => {
    await controller.logout();
  }, []);

  const refreshProfile = useCallback(async () => {
    return controller.loadMe();
  }, []);

  const loadGroups = useCallback(async () => {
    return controller.listMyGroups();
  }, []);

  const getAccessToken = useCallback(() => controller.currentAccessToken(), []);
  const refreshAccessToken = useCallback(
    () => controller.refreshAccessToken(),
    [],
  );

  const value = useMemo(
    () => ({
      state,
      client: controller.client,
      register,
      login,
      logout,
      refreshProfile,
      loadGroups,
      getAccessToken,
      refreshAccessToken,
    }),
    [
      state,
      register,
      login,
      logout,
      refreshProfile,
      loadGroups,
      getAccessToken,
      refreshAccessToken,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}
