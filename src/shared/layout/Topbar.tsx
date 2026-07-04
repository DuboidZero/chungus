import { Search, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
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
  const { user, logout } = useAuth();

  const placeholder =
    Object.entries(SEARCH_PLACEHOLDERS).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Search...';

  const initials = user ? getInitials(user.name) : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 md:px-8 gap-4 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder={placeholder}
            className="w-full h-10 pl-11 pr-4 rounded-full bg-surface-container-low border border-outline-variant/50 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center space-x-2">
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          title="Log out"
          aria-label="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center border border-outline-variant/40 shrink-0 cursor-pointer overflow-hidden"
          title={user?.name}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name ?? ''} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-semibold text-on-primary">{initials}</span>
          )}
        </div>
      </div>
    </header>
  );
}
