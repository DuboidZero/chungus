import {
  LayoutDashboard, User, GraduationCap, Code,
  Briefcase, Trophy, Folder, Building2, BookMarked, type LucideIcon
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean; // for NavLink exact matching
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const studentNavigation: NavGroup[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'Profile',
    items: [
      { label: 'Profile', path: '/profile', icon: User },
      { label: 'Academic Records', path: '/academic-records', icon: GraduationCap },
    ],
  },
  {
    title: 'Portfolio',
    items: [
      { label: 'Skills', path: '/skills', icon: Code },
      { label: 'Projects', path: '/projects', icon: Folder },
      { label: 'Work Experience', path: '/work-experience', icon: Briefcase },
      { label: 'Achievements', path: '/achievements', icon: Trophy },
    ],
  },
  {
    title: 'Career',
    items: [
      { label: 'Placements', path: '/placements', icon: Building2 },
      { label: 'Course Catalog', path: '/courses', icon: BookMarked },
    ],
  },
];
