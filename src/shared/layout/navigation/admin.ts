import {
  LayoutDashboard, Users, Building2, BarChart3, Shield, type LucideIcon
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const adminNavigation: NavGroup[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Users', path: '/users', icon: Users },
      { label: 'Cohorts', path: '/cohorts', icon: Building2 },
      { label: 'Analytics', path: '/analytics', icon: BarChart3 },
      { label: 'Roles & Permissions', path: '/permissions', icon: Shield },
    ],
  },
];
