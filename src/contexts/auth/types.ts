import type { AuthState } from '../../types';

export interface AuthContextValue {
  auth: AuthState;
  handleAuthenticated: (auth: AuthState) => void;
  logout: () => void;
}
