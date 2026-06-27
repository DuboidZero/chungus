import type { Role } from '../../shared/permissions/roles';
import { useAuth } from '../../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Shield } from 'lucide-react';

interface RoleOption {
  role: Role;
  label: string;
  description: string;
  icon: typeof GraduationCap;
  border: string;
  iconColor: string;
  iconBg: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'student',
    label: 'Continue as Student',
    description: 'Build your portfolio, track academic progress, and manage your achievements.',
    icon: GraduationCap,
    border: 'border-brand-700 hover:border-brand-500',
    iconColor: 'text-brand-400',
    iconBg: 'bg-brand-800 group-hover:bg-brand-700',
  },
  {
    role: 'teacher',
    label: 'Continue as Teacher',
    description: 'View student portfolios, add assessments, and monitor cohort progress.',
    icon: BookOpen,
    border: 'border-brand-700 hover:border-emerald-600',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-brand-800 group-hover:bg-emerald-900/60',
  },
  {
    role: 'admin',
    label: 'Continue as Admin',
    description: 'Manage cohorts, users, system settings, and institutional analytics.',
    icon: Shield,
    border: 'border-brand-700 hover:border-amber-500',
    iconColor: 'text-amber-400',
    iconBg: 'bg-brand-800 group-hover:bg-amber-900/40',
  },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: Role) => {
    login(role);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-6">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#5869c9 1px, transparent 1px), linear-gradient(to right, #5869c9 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-800 border border-brand-700 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-extrabold text-white text-lg">
              M
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">MIT WPU Portfolio</h1>
          <p className="text-slate-400 text-sm">Select your role to continue</p>
        </div>

        {/* Role cards */}
        <div className="space-y-3">
          {ROLE_OPTIONS.map(({ role, label, description, icon: Icon, border, iconColor, iconBg }) => (
            <button
              key={role}
              id={`login-${role}`}
              onClick={() => handleLogin(role)}
              className={`w-full text-left flex items-start gap-4 p-5 rounded-xl border bg-brand-900/60 backdrop-blur-sm transition-all duration-200 cursor-pointer group ${border}`}
            >
              <div className={`mt-0.5 p-2 rounded-lg transition-colors duration-200 ${iconBg} ${iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-white mb-0.5">{label}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600">
          MIT World Peace University · Internal System · Not for public access
        </p>
      </div>
    </div>
  );
}
