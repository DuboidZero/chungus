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
          <div className="p-4 bg-emerald-900/30 border border-emerald-800 rounded-lg">
            <p className="text-sm text-emerald-400">
              If an account matches that identifier, password reset instructions have been sent.
            </p>
          </div>
          <Link to="/login" className="inline-block text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors">
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              PRN / Institutional Email
            </label>
            <input
              required
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your PRN or MITWPU Email"
              className="w-full bg-brand-950 border border-brand-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || !identifier}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending request...' : 'Send Reset Link'}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Back to Login
              </Link>
            </div>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
