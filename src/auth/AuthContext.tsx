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
  firstLogin: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  firstLogin: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
  clearFirstLogin: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

import { getMe } from '../api/services/auth';
import { useInactivityTimeout } from '../features/auth/hooks/useInactivityTimeout';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firstLogin, setFirstLogin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Inactivity timeout logs user out
  useInactivityTimeout(() => {
    logout();
  }, user !== null);

  /** Rehydrate authentication state from local storage upon initial mount. */
  useEffect(() => {
    if (USE_MOCK) {
      const savedSessionStr = localStorage.getItem('mit_mock_session');
      if (savedSessionStr) {
        try {
          const session = JSON.parse(savedSessionStr) as AuthSession;
          setUser(session.user);
          setFirstLogin(session.firstLogin);
        } catch (e) {
          localStorage.removeItem('mit_mock_session');
        }
      }
      setLoading(false);
    } else {
      /** Rehydrates the user session from the stored JWT token by querying the profile endpoint. */
      const token = localStorage.getItem('mit_access_token');
      if (token) {
        getMe()
          .then(u => {
            setUser(u);
            const savedSessionStr = localStorage.getItem('mit_mock_session');
            if (savedSessionStr) {
              const session = JSON.parse(savedSessionStr) as AuthSession;
              setFirstLogin(session.firstLogin);
            }
          })
          .catch(() => logout())
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  const login = (session: AuthSession) => {
    setUser(session.user);
    setFirstLogin(session.firstLogin);
    
    localStorage.setItem('mit_access_token', session.accessToken);
    localStorage.setItem('mit_refresh_token', session.refreshToken);
    localStorage.setItem('mit_mock_session', JSON.stringify(session)); // needed for keeping firstLogin state if page refreshes
  };

  const logout = () => {
    setUser(null);
    setFirstLogin(false);
    localStorage.removeItem('mit_mock_session');
    localStorage.removeItem('mit_access_token');
    localStorage.removeItem('mit_refresh_token');
  };

  const clearFirstLogin = () => {
    setFirstLogin(false);
    const savedSessionStr = localStorage.getItem('mit_mock_session');
    if (savedSessionStr) {
      const session = JSON.parse(savedSessionStr) as AuthSession;
      session.firstLogin = false;
      localStorage.setItem('mit_mock_session', JSON.stringify(session));
    }
  };

  if (loading) {
    return null; // Or a global loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, firstLogin, login, logout, clearFirstLogin }}>
      {children}
    </AuthContext.Provider>
  );
}
