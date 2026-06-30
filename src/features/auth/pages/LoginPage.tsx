import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/useAuth';
import { AuthCard } from '../components/AuthCard';
import { LoginForm } from '../components/LoginForm';
import { login as loginService } from '../../../api/services/auth';

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to home which handles role routing
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginService({ identifier, password });
      login({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        firstLogin: response.firstLogin
      });
      // Navigation is handled by App.tsx or useAuth observer if needed
      // Actually we should navigate here:
      if (response.firstLogin) {
        navigate('/change-password', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="MIT WPU Portfolio"
      subtitle="Sign in to your account"
    >
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}
      <LoginForm onSubmit={handleSubmit} loading={loading} />
    </AuthCard>
  );
}
