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
        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
          PRN / Institutional Email
        </label>
        <input
          required
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Enter your PRN (Students) or MITWPU Email (Faculty/Admin)"
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2.5 px-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors placeholder:text-on-surface-variant/70"
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
        <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-primary-container transition-colors">
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading || !identifier || !password}
        className="w-full bg-primary-container hover:bg-primary text-on-primary font-medium py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <div className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-md border border-outline-variant/50">
        <p className="font-semibold text-on-surface mb-1">Help</p>
        <p>Students: Login using your PRN.</p>
        <p>Faculty/Admin: Login using your institutional email.</p>
      </div>
    </form>
  );
}
