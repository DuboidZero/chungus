import type { ReactNode } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left — brand hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-tertiary p-12 flex-col justify-between text-on-primary">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -right-16 w-96 h-96 rounded-full bg-secondary-container/25 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-bold text-lg">M</div>
          <span className="text-lg font-semibold">MIT WPU Portfolio</span>
        </div>

        <div className="relative space-y-6 max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            The unified portal for student performance &amp; portfolios.
          </h2>
          <p className="text-on-primary-container text-lg">
            Track academics, build your portfolio, and connect with mentors — all in one secure place.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl bg-white/10 backdrop-blur border border-white/15 p-4">
              <Sparkles className="w-5 h-5 mb-2" />
              <p className="font-semibold text-sm">Unified</p>
              <p className="text-xs text-on-primary-container/85">Academics, skills &amp; projects in one place.</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur border border-white/15 p-4">
              <ShieldCheck className="w-5 h-5 mb-2" />
              <p className="font-semibold text-sm">Secure</p>
              <p className="text-xs text-on-primary-container/85">Role-based access &amp; data protection.</p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-on-primary-container/70">
          MIT World Peace University · Internal System
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center lg:hidden">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">{title}</h1>
            <p className="text-on-surface-variant text-sm">{subtitle}</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-6 sm:p-8 space-y-6 shadow-[0_8px_32px_rgba(90,86,139,0.10)]">
            {children}
          </div>

          <p className="text-center text-xs text-on-surface-variant/70">
            MIT World Peace University · Internal System · Not for public access
          </p>
        </div>
      </div>
    </div>
  );
}
