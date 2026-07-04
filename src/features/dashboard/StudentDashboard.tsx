/**
 * Student Dashboard — personal academic + portfolio view.
 *
 * All data is sourced from the API contract.
 */
import { useState, useEffect } from 'react';
import { getStudentDashboard } from '../../api/services/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/card';
import { Activity, BookOpen, Briefcase, Trophy, Code } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../shared/providers/ThemeProvider';
import type { User } from '../../shared/permissions/roles';
import type { StudentDashboardResponse } from '../../api/contracts/dashboard';
import { Skeleton } from '../../shared/ui/loading-skeleton';

interface Props { user: User }

export function StudentDashboard({ user }: Props) {
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <StudentDashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-surface">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="text-on-surface-variant mt-1">
          Here is a summary of your academic and portfolio progress.
        </p>
      </div>
      <StudentDashboardView data={data} />
    </div>
  );
}

export function StudentDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-8 pb-6 px-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card><CardContent className="p-6"><Skeleton className="h-72 w-full" /></CardContent></Card>
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    </div>
  );
}

export function StudentDashboardView({ data }: { data: StudentDashboardResponse }) {
  const { theme } = useTheme();

  const chartColors = {
    grid: theme === 'dark' ? '#29315A' : '#E4E1EE',
    axis: theme === 'dark' ? '#94a3b8' : '#787585',
    tooltip: {
      bg: theme === 'dark' ? '#1a1e3a' : '#ffffff',
      border: theme === 'dark' ? '#29315A' : '#E4E1EE',
      color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
    },
  };

  return (
    <div className="space-y-8">

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="CGPA / %" value={data ? `${data.stats.cgpa.toFixed(2)} / ${data.stats.percentage.toFixed(1)}%` : '—'} icon={Activity} trendUp />
        <StatCard title="Credits"      value={data ? data.stats.totalCredits.toString() : '—'} icon={BookOpen} />
        <StatCard title="Projects"     value={data ? data.stats.projectCount.toString() : '—'} icon={Briefcase} />
        <StatCard title="Achievements" value={data ? data.stats.achievementCount.toString() : '—'} icon={Trophy} />
        <StatCard title="Skills"       value={data ? data.stats.skillCount.toString() : '—'} icon={Code} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* CGPA Trend */}
          <Card>
            <CardHeader><CardTitle>CGPA Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                {data && data.cgpaTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.cgpaTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                      <XAxis dataKey="semester" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                      <Tooltip contentStyle={{ backgroundColor: chartColors.tooltip.bg, borderColor: chartColors.tooltip.border, color: chartColors.tooltip.color }} itemStyle={{ color: '#6152D1' }} />
                      <Line type="monotone" dataKey="cgpa" stroke="#6152D1" strokeWidth={3} dot={{ r: 4, fill: '#6152D1', strokeWidth: 0 }} activeDot={{ r: 6 }} name="CGPA" connectNulls />
                      <Line type="monotone" dataKey="projected" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#94a3b8', strokeWidth: 0 }} activeDot={{ r: 6 }} name="Projected" connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-on-surface-variant/70">
                    No academic data available yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio completion */}
          <Card>
            <CardHeader><CardTitle>Portfolio Completion</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-on-surface-variant/70 text-center py-4">
                  (Portfolio completion metric is calculated dynamically on the client.)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: deadlines */}
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Upcoming Deadlines</CardTitle></CardHeader>
            <CardContent>
              {data && data.upcomingDeadlines.length > 0 ? (
                <ul className="space-y-4">
                  {data.upcomingDeadlines.map((deadline, i) => (
                    <li key={deadline.id} className={`flex justify-between items-start ${i < data.upcomingDeadlines.length - 1 ? 'pb-4 border-b border-outline-variant/40' : ''}`}>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{deadline.title}</p>
                        <p className="text-xs text-on-surface-variant">{deadline.subject}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${
                        deadline.urgency === 'urgent'
                          ? 'text-orange-600 bg-orange-50'
                          : 'text-on-surface-variant bg-surface-container'
                      }`}>{deadline.urgencyLabel}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-on-surface-variant/70 text-center py-4">
                  No upcoming deadlines.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp }: {
  title: string; value: string; icon: typeof Activity; trend?: string; trendUp?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-8 pb-6 px-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-on-surface-variant mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-on-surface">{value}</h3>
            {trend && (
              <span className={`text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className="p-3 bg-surface-container-low rounded-lg text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
}
