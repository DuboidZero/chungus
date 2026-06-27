/** 
 * Teacher Dashboard View.
 * Provides insights into cohort health, students needing attention, and recent activity.
 */
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/card';
import { Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../shared/providers/ThemeProvider';
import type { User } from '../../shared/permissions/roles';

const cohortCgpaDistribution = [
  { range: '< 6.0', count: 2 },
  { range: '6.0–7.0', count: 8 },
  { range: '7.0–8.0', count: 24 },
  { range: '8.0–9.0', count: 35 },
  { range: '9.0–10', count: 12 },
];

const atRiskStudents = [
  { name: 'Ankit Desai',   cgpa: 5.8, issue: 'CGPA below threshold' },
  { name: 'Sneha Patil',   cgpa: 6.1, issue: '2 missed submissions' },
  { name: 'Rohan Kulkarni', cgpa: 6.4, issue: 'No portfolio activity' },
];

interface Props { user: User }

export function TeacherDashboard({ user }: Props) {
  const { theme } = useTheme();
  const chartColors = {
    grid:  theme === 'dark' ? '#29315A' : '#e2e8f0',
    axis:  theme === 'dark' ? '#94a3b8' : '#64748b',
    tooltip: {
      bg:     theme === 'dark' ? '#1a1e3a' : '#ffffff',
      border: theme === 'dark' ? '#29315A' : '#e2e8f0',
      color:  theme === 'dark' ? '#f1f5f9' : '#0f172a',
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Good morning, {user.name.split(' ').slice(0, 2).join(' ')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here's an overview of your cohort's progress.
        </p>
      </div>

      {/* Cohort stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value="81"  icon={Users}         color="text-brand-600 dark:text-brand-400"   bg="bg-brand-50 dark:bg-brand-800" />
        <StatCard label="At Risk"        value="3"   icon={AlertTriangle} color="text-red-600 dark:text-red-400"       bg="bg-red-50 dark:bg-red-900/20" />
        <StatCard label="On Track"       value="71"  icon={CheckCircle}   color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" />
        <StatCard label="Pending Reviews" value="12" icon={Clock}         color="text-amber-600 dark:text-amber-400"  bg="bg-amber-50 dark:bg-amber-900/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* CGPA Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Cohort CGPA Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cohortCgpaDistribution} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis dataKey="range" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: chartColors.tooltip.bg, borderColor: chartColors.tooltip.border, color: chartColors.tooltip.color }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: at risk */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Students Needing Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {atRiskStudents.map((s, i) => (
                  <li key={i} className={`pb-4 ${i < atRiskStudents.length - 1 ? 'border-b border-slate-100 dark:border-brand-800' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{s.name}</p>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">CGPA {s.cgpa}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.issue}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: {
  label: string; value: string; icon: typeof Users; color: string; bg: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6 pb-5 px-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${bg} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
}
