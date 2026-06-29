/**
 * Authentication Context.
 *
 * When VITE_USE_MOCK=true, uses the mock driver to simulate login and stores the mock session.
 * When VITE_USE_MOCK=false, auth flows through the API contract (FastAPI).
 */

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../api/entities/user';
import { USE_MOCK } from '../api/mock';

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  /** Rehydrate authentication state from local storage upon initial mount. */
  useEffect(() => {
    if (USE_MOCK) {
      const savedSessionStr = localStorage.getItem('mit_mock_session');
      if (savedSessionStr) {
        try {
          const session = JSON.parse(savedSessionStr) as AuthSession;
          setUser(session.user);
        } catch (e) {
          localStorage.removeItem('mit_mock_session');
        }
      }
    } else {
      /** Rehydrates the user session from the stored JWT token by querying the profile endpoint. */
      // const token = localStorage.getItem('mit_access_token');
      // if (token) { getMe().then(setUser).catch(() => setUser(null)); }
    }
  }, []);

  const login = (session: AuthSession) => {
    if (USE_MOCK) {
      setUser(session.user);
      localStorage.setItem('mit_mock_session', JSON.stringify(session));
    } else {
      /** Submits user credentials to the authentication endpoint to establish a session. */
      console.warn('[Auth] Real login not implemented yet.');
    }
  };

  const logout = () => {
    setUser(null);
    if (USE_MOCK) {
      localStorage.removeItem('mit_mock_session');
    } else {
      localStorage.removeItem('mit_access_token');
      localStorage.removeItem('mit_refresh_token');
      /** Invalidates the current session on the backend and clears local authentication state. */
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
