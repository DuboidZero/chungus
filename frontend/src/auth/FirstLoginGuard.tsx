import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { ReactNode } from 'react';

interface FirstLoginGuardProps {
  children: ReactNode;
}

export function FirstLoginGuard({ children }: FirstLoginGuardProps) {
  const { isAuthenticated, firstLogin } = useAuth();
  const location = useLocation();

  if (isAuthenticated && firstLogin && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
}
