import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function PasswordInput({ label, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className="w-full bg-brand-950 border border-brand-700 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors placeholder:text-slate-500"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
