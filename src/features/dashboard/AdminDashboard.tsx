/** 
 * Administrator Dashboard View.
 * Provides system-wide statistics, global cohort overview, and platform activity logs.
 */
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/card';
import { Users, BookOpen, Building2, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../shared/providers/ThemeProvider';
import type { User } from '../../shared/permissions/roles';

const enrollmentTrend = [
  { month: 'Jan', students: 420 },
  { month: 'Feb', students: 435 },
  { month: 'Mar', students: 448 },
  { month: 'Apr', students: 461 },
  { month: 'May', students: 470 },
  { month: 'Jun', students: 481 },
];

const cohorts = [
  { name: 'Computer Engineering 2024', students: 120, avg: 8.3, completion: 72 },
  { name: 'Mechanical Engineering 2024', students: 98, avg: 7.9, completion: 58 },
  { name: 'Civil Engineering 2024', students: 85, avg: 8.1, completion: 64 },
  { name: 'Electronics 2024', students: 110, avg: 8.5, completion: 81 },
];

interface Props { user: User }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AdminDashboard({ user: _user }: Props) {
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
          Admin Console
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          System-wide overview · MIT WPU Portfolio Platform
        </p>
      </div>

      {/* System stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value="481"  icon={Users}      color="text-brand-600 dark:text-brand-400"   bg="bg-brand-50 dark:bg-brand-800" />
        <StatCard label="Teachers"       value="38"   icon={BookOpen}   color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" />
        <StatCard label="Active Cohorts" value="8"    icon={Building2}  color="text-amber-600 dark:text-amber-400"  bg="bg-amber-50 dark:bg-amber-900/20" />
        <StatCard label="Avg Completion" value="69%"  icon={TrendingUp} color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-900/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Student Enrollment Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enrollmentTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis dataKey="month" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 20', 'dataMax + 20']} />
                    <Tooltip contentStyle={{ backgroundColor: chartColors.tooltip.bg, borderColor: chartColors.tooltip.border, color: chartColors.tooltip.color }} itemStyle={{ color: '#3b82f6' }} />
                    <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} name="Students" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle>Cohort Overview</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {cohorts.map((c, i) => (
                  <li key={i} className={`pb-4 ${i < cohorts.length - 1 ? 'border-b border-slate-100 dark:border-brand-800' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200 leading-tight">{c.name}</p>
                      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">{c.students} students</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-brand-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${c.completion}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{c.completion}%</span>
                    </div>
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
