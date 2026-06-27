import { Search, Moon, Sun, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../providers/ThemeProvider';
import { useAuth } from '../../auth/useAuth';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const SEARCH_PLACEHOLDERS: Record<string, string> = {
  '/projects': 'Search projects...',
  '/skills': 'Search skills...',
  '/achievements': 'Search achievements...',
  '/work-experience': 'Search experience...',
  '/students': 'Search students...',
  '/users': 'Search users...',
};

export function Topbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const placeholder =
    Object.entries(SEARCH_PLACEHOLDERS).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Search...';

  const initials = user ? getInitials(user.name) : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-brand-900 dark:bg-brand-950/50 border-b border-brand-800 sticky top-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={placeholder}
            className="w-full h-9 pl-9 pr-4 rounded-md bg-brand-800 dark:bg-brand-900 border border-brand-600 dark:border-brand-800 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center space-x-3">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-brand-800 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-brand-800 transition-colors"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center border border-brand-400 shrink-0 cursor-pointer"
          title={user?.name}
        >
          <span className="text-xs font-semibold text-white">{initials}</span>
        </div>
      </div>
    </header>
  );
}
