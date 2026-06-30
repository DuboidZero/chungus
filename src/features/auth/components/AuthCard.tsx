import type { ReactNode } from 'react';
import { Logo } from './Logo';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-brand-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#5869c9 1px, transparent 1px), linear-gradient(to right, #5869c9 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative w-full max-w-md space-y-8 z-10">
        <div className="text-center space-y-3">
          <Logo />
          <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-slate-400 text-sm">{subtitle}</p>
        </div>

        <div className="bg-brand-900/80 border border-brand-700 rounded-xl p-6 space-y-6 backdrop-blur-sm shadow-xl">
          {children}
        </div>

        <p className="text-center text-xs text-slate-600">
          MIT World Peace University · Internal System · Not for public access
        </p>
      </div>
    </div>
  );
}
