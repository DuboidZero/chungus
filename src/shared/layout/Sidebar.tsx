import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { NavGroup } from './navigation/student';
import type { Role } from '../../shared/permissions/roles';

function getRoleLabel(role: Role | undefined): string {
  if (role === 'teacher') return 'Faculty Portal';
  if (role === 'admin') return 'Admin Console';
  return 'Student Portal';
}

interface SidebarProps {
  role?: Role;
  navigation: NavGroup[];
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

export function Sidebar({ role, navigation, collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const label = getRoleLabel(role);

  return (
    <aside
      className={`flex flex-col bg-surface-container-low/70 backdrop-blur-xl border-r border-outline-variant/40 h-screen shrink-0
        fixed lg:sticky top-0 left-0 z-40 transition-transform duration-300 w-64
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
    >
      {/* Logo + mobile close */}
      <div className="flex items-center justify-between p-4 mb-2">
        {!collapsed ? (
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-container to-tertiary flex items-center justify-center font-bold text-on-primary shrink-0 shadow-sm">
              M
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-on-surface leading-tight truncate">MIT WPU Portfolio</h1>
              <p className="text-xs text-on-surface-variant truncate">{label}</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-container to-tertiary flex items-center justify-center font-bold text-on-primary shrink-0 mx-auto shadow-sm">
            M
          </div>
        )}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container shrink-0"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 scrollbar-hide">
        {navigation.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'pt-4' : ''}>
            {!collapsed && group.title && (
              <h3 className="px-3 pb-1 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {group.title}
              </h3>
            )}
            {collapsed && group.title && <div className="h-3" />}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                title={item.label}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  } ${collapsed ? 'lg:justify-center' : ''}`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer — desktop collapse only */}
      <div className="p-3 border-t border-outline-variant/40 space-y-1 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
          className={`flex items-center w-full space-x-3 px-3 py-2.5 rounded-lg font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 shrink-0" />
          ) : (
            <ChevronLeft className="w-5 h-5 shrink-0" />
          )}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
