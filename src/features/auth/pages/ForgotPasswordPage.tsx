import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { forgotPassword } from '../../../api/services/auth';

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    setLoading(true);
    setError(null);
    try {
      await forgotPassword({ identifier });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Enter your identifier to receive reset instructions"
    >
      {success ? (
        <div className="space-y-6 text-center">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md">
            <p className="text-sm text-emerald-700">
              If an account matches that identifier, password reset instructions have been sent.
            </p>
          </div>
          <Link to="/login" className="inline-block text-sm font-medium text-primary hover:text-primary-container transition-colors">
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-error-container border border-error/20 rounded-md text-sm text-on-error-container">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
              PRN / Institutional Email
            </label>
            <input
              required
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your PRN or MITWPU Email"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2.5 px-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors placeholder:text-on-surface-variant/70"
            />
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || !identifier}
              className="w-full bg-primary-container hover:bg-primary text-on-primary font-medium py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Sending request...' : 'Send Reset Link'}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Back to Login
              </Link>
            </div>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
