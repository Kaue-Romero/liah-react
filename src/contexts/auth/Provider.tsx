import { useCallback, useState, type ReactNode } from 'react';
import type { AuthState } from '../../types';
import { clearAuth, readAuth } from '../../utils/storage';
import { useUi } from '../ui/useUi';
import { AuthContext } from './context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { closeModal } = useUi();
  const [auth, setAuth] = useState<AuthState>(() => readAuth());

  const handleAuthenticated = useCallback((nextAuth: AuthState) => {
    setAuth(nextAuth);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setAuth({ id: null, token: null });
    closeModal();
    window.dispatchEvent(new CustomEvent('liah:logout'));
  }, [closeModal]);

  return <AuthContext.Provider value={{ auth, handleAuthenticated, logout }}>{children}</AuthContext.Provider>;
}
