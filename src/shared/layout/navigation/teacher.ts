import {
  LayoutDashboard, Users, BookOpen, BarChart3, type LucideIcon
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

export const teacherNavigation: NavGroup[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'Teaching',
    items: [
      { label: 'My Students', path: '/students', icon: Users },
      { label: 'Assessments', path: '/assessments', icon: BookOpen },
      { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    ],
  },
];
