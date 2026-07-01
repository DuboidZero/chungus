import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import type { NavGroup } from './navigation/student';
import type { Role } from '../../shared/permissions/roles';

interface AppLayoutProps {
  navigation: NavGroup[];
  role?: Role;
}

export function AppLayout({ navigation, role }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-brand-950 text-slate-900 dark:text-slate-100">
      <Sidebar
        role={role}
        navigation={navigation}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 pt-10 md:pt-12 lg:pt-16 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
