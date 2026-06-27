import { NavLink } from 'react-router-dom';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NavGroup } from './navigation/student';
import type { Role } from '../../shared/permissions/roles';

function getRoleAccent(role: Role | undefined): string {
  if (role === 'teacher') return 'bg-emerald-500';
  if (role === 'admin') return 'bg-amber-500';
  return 'bg-brand-500';
}

function getRoleLabel(role: Role | undefined): string {
  if (role === 'teacher') return 'Teacher Portal';
  if (role === 'admin') return 'Admin Console';
  return 'Portfolio';
}

interface SidebarProps {
  role?: Role;
  navigation: NavGroup[];
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export function Sidebar({ role, navigation, collapsed, setCollapsed }: SidebarProps) {
  const accent = getRoleAccent(role);
  const label = getRoleLabel(role);

  return (
    <aside
      className={`flex flex-col bg-brand-900 border-r border-brand-800 transition-all duration-300 h-screen sticky top-0 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center p-4 mb-4">
        {!collapsed ? (
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className={`w-8 h-8 rounded-lg ${accent} flex items-center justify-center font-bold text-white shrink-0`}>
              M
            </div>
            <h1 className="text-xl font-bold text-white truncate">{label}</h1>
          </div>
        ) : (
          <div className={`w-8 h-8 rounded-lg ${accent} flex items-center justify-center font-bold text-white shrink-0 mx-auto`}>
            M
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 scrollbar-hide">
        {navigation.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'pt-4' : ''}>
            {!collapsed && group.title && (
              <h3 className="px-3 pb-1 text-xs font-semibold text-brand-400 uppercase tracking-wider">
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
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-800 text-white'
                      : 'text-slate-300 hover:bg-brand-800 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-brand-800 space-y-1">
        <NavLink
          to="/settings"
          title="Settings"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-brand-800 text-white' : 'text-slate-300 hover:bg-brand-800 hover:text-white'
            } ${collapsed ? 'justify-center' : ''}`
          }
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
          className={`flex items-center w-full space-x-3 px-3 py-2.5 rounded-lg font-medium text-slate-300 hover:bg-brand-800 hover:text-white transition-colors ${
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
