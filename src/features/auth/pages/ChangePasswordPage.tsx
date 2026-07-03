import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/useAuth';
import { AuthCard } from '../components/AuthCard';
import { PasswordInput } from '../components/PasswordInput';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { validatePassword } from '../lib/passwordValidation';
import { changePassword } from '../../../api/services/auth';

export function ChangePasswordPage() {
  const { user, firstLogin, clearFirstLogin } = useAuth();
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else if (!firstLogin) {
      navigate('/', { replace: true });
    }
  }, [user, firstLogin, navigate]);

  const isValid = validatePassword(newPassword) && newPassword === confirmPassword && currentPassword && newPassword !== currentPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);
    try {
      await changePassword({ currentPassword, newPassword });
      clearFirstLogin();
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Set New Password"
      subtitle="Choose a strong new password for your account."
    >
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          required
          label="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
        />

        <div className="space-y-1">
          <PasswordInput
            required
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <PasswordRequirements password={newPassword} />
        </div>

        <PasswordInput
          required
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
        />
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-red-400">Passwords do not match.</p>
        )}
        {newPassword && currentPassword === newPassword && (
          <p className="text-xs text-red-400">New password must be different from current.</p>
        )}

        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </AuthCard>
  );
}
