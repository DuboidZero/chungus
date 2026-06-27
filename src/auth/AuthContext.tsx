import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Role } from '../shared/permissions/roles';
import { MOCK_USERS } from '../shared/permissions/roles';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: Role) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  /** Rehydrate authentication state from local storage upon initial mount. */
  useEffect(() => {
    const savedRole = localStorage.getItem('mit_role') as Role | null;
    if (savedRole && MOCK_USERS[savedRole]) {
      setUser(MOCK_USERS[savedRole]);
    }
  }, []);

  const login = (role: Role) => {
    setUser(MOCK_USERS[role]);
    localStorage.setItem('mit_role', role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mit_role');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
