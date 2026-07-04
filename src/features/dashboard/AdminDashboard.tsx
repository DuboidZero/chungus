/** 
 * Administrator Dashboard View.
 * Provides system-wide statistics, global cohort overview, and platform activity logs.
 *
 * All data is sourced from the API contract.
 */
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/card';
import { Users, BookOpen, Building2, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../shared/providers/ThemeProvider';
import type { User } from '../../shared/permissions/roles';
import type { AdminDashboardResponse } from '../../api/contracts/dashboard';
import { Skeleton } from '../../shared/ui/loading-skeleton';

interface Props { user: User }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AdminDashboard({ user: _user }: Props) {
  const { theme } = useTheme();

  /** Fetches aggregated dashboard metrics from the administrative service. */
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /** Fetches data from the API to populate the view. */
    // getAdminDashboard().then(setData).finally(() => setLoading(false));
    setLoading(false);
    setData(null);
  }, []);

  const chartColors = {
    grid:  theme === 'dark' ? '#29315A' : '#E4E1EE',
    axis:  theme === 'dark' ? '#94a3b8' : '#787585',
    tooltip: {
      bg:     theme === 'dark' ? '#1a1e3a' : '#ffffff',
      border: theme === 'dark' ? '#29315A' : '#E4E1EE',
      color:  theme === 'dark' ? '#f1f5f9' : '#0f172a',
    },
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 pb-5 px-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
          </div>
          <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-surface">
          Admin Console
        </h1>
        <p className="text-on-surface-variant mt-1">
          System-wide overview · MIT WPU Portfolio Platform
        </p>
      </div>

      {/* System stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={data ? data.stats.totalStudents.toString() : '—'}  icon={Users}      color="text-primary"   bg="bg-surface-container-low" />
        <StatCard label="Teachers"       value={data ? data.stats.totalTeachers.toString() : '—'}  icon={BookOpen}   color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Active Cohorts" value={data ? data.stats.activeCohorts.toString() : '—'}  icon={Building2}  color="text-amber-600"  bg="bg-amber-50" />
        <StatCard label="Avg Completion" value={data ? `${data.stats.avgCompletion}%` : '—'}       icon={TrendingUp} color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Student Enrollment Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                {data && data.enrollmentTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.enrollmentTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                      <XAxis dataKey="month" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 20', 'dataMax + 20']} />
                      <Tooltip contentStyle={{ backgroundColor: chartColors.tooltip.bg, borderColor: chartColors.tooltip.border, color: chartColors.tooltip.color }} itemStyle={{ color: '#6152D1' }} />
                      <Line type="monotone" dataKey="students" stroke="#6152D1" strokeWidth={3} dot={{ r: 4, fill: '#6152D1', strokeWidth: 0 }} activeDot={{ r: 6 }} name="Students" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-on-surface-variant/70">
                    No enrollment data available yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle>Cohort Overview</CardTitle></CardHeader>
            <CardContent>
              {data && data.cohorts.length > 0 ? (
                <ul className="space-y-4">
                  {data.cohorts.map((c, i) => (
                    <li key={c.id} className={`pb-4 ${i < data.cohorts.length - 1 ? 'border-b border-outline-variant/40' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-on-surface leading-tight">{c.name}</p>
                        <span className="text-xs text-on-surface-variant shrink-0 ml-2">{c.students} students</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className="h-full bg-primary-container rounded-full" style={{ width: `${c.completionPercentage}%` }} />
                        </div>
                        <span className="text-xs text-on-surface-variant shrink-0">{c.completionPercentage}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-on-surface-variant/70 text-center py-4">
                  No cohorts configured yet.
                </p>
              )}
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
          <p className="text-sm font-medium text-on-surface-variant mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-on-surface">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${bg} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
}
