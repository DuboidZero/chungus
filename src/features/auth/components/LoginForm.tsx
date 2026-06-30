import React, { useState } from 'react';
import { PasswordInput } from './PasswordInput';
import { Link } from 'react-router-dom';

interface LoginFormProps {
  onSubmit: (identifier: string, password: string) => Promise<void>;
  loading: boolean;
}

export function LoginForm({ onSubmit, loading }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(identifier, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          PRN / Institutional Email
        </label>
        <input
          required
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Enter your PRN (Students) or MITWPU Email (Faculty/Admin)"
          className="w-full bg-brand-950 border border-brand-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors placeholder:text-slate-500"
        />
      </div>

      <PasswordInput
        required
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
      />

      <div className="flex justify-end">
        <Link to="/forgot-password" className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors">
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading || !identifier || !password}
        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <div className="text-xs text-slate-400 leading-relaxed bg-brand-950/50 p-3 rounded-lg border border-brand-800">
        <p className="font-semibold text-slate-300 mb-1">Help</p>
        <p>Students: Login using your PRN.</p>
        <p>Faculty/Admin: Login using your institutional email.</p>
      </div>
    </form>
  );
}
