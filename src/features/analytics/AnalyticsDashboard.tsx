import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/card';
import { getTeacherDashboard } from '../../api/services/dashboard';
import type { TeacherDashboardResponse } from '../../api/contracts/dashboard';
import { Skeleton } from '../../shared/ui/loading-skeleton';
import { useTheme } from '../../shared/providers/ThemeProvider';
import {
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line,
} from 'recharts';
import { SkillHeatmap } from '../teacher/components/SkillHeatmap';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';

const PALETTE = ['#6152D1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];

export function AnalyticsDashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState<TeacherDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tt = {
    bg:     theme === 'dark' ? '#1a1e3a' : '#ffffff',
    border: theme === 'dark' ? '#29315A' : '#E4E1EE',
    color:  theme === 'dark' ? '#f1f5f9' : '#0f172a',
  };
  const grid  = theme === 'dark' ? '#29315A' : '#E4E1EE';
  const axis  = theme === 'dark' ? '#94a3b8' : '#787585';

  if (loading || !data) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-9 w-72 mb-2" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const stats = data.stats ?? ({} as any);
  const domainInterests = data.domainInterests ?? [];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Cohort Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Cohort-level performance and skill distribution. Click any chart element to drill into matching students.
        </p>
      </div>

      {/* ── Performance Summary Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Assigned Students"  value={(stats.totalAssignedStudents ?? 0).toString()} icon={Users}         color="text-primary dark:text-primary"   bg="bg-surface-container-low dark:bg-surface-container-low/60"   onClick={() => navigate('/students')} />
        <StatCard label="High Performing"    value={(stats.highPerformingCount ?? 0).toString()}   icon={TrendingUp}    color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" onClick={() => navigate('/students?performanceTier=High+Performing')} />
        <StatCard label="Needs Guidance"     value={(stats.midTierCount ?? 0).toString()}          icon={Users}         color="text-amber-600 dark:text-amber-400"   bg="bg-amber-50 dark:bg-amber-900/20"   onClick={() => navigate('/students?performanceTier=Average+-+Guidable')} />
        <StatCard label="Underperforming"    value={(stats.underperformingCount ?? 0).toString()}  icon={AlertTriangle} color="text-red-600 dark:text-red-400"       bg="bg-red-50 dark:bg-red-900/20"       onClick={() => navigate('/students?performanceTier=Underperforming')} />
      </div>

      {/* ── Row 1: Skill Heatmap + Domain Interests ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SkillHeatmap
          data={data.skillHeatmap ?? []}
          onSkillClick={skill => navigate(`/students?skill=${encodeURIComponent(skill)}`)}
        />

        <Card>
          <CardHeader><CardTitle>Domain Interests</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80">
              {domainInterests.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={domainInterests}
                      cx="50%" cy="50%"
                      innerRadius={70} outerRadius={110}
                      paddingAngle={4}
                      dataKey="count" nameKey="domain"
                      isAnimationActive={false}
                      onClick={(entry: any) => navigate(`/students?domain=${encodeURIComponent(entry.domain)}`)}
                      className="cursor-pointer"
                    >
                      {domainInterests.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} className="hover:opacity-75 transition-opacity" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: tt.bg, borderColor: tt.border, color: tt.color }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: CGPA Distribution + GPA Trend ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>CGPA Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              {(data.cgpaDistribution ?? []).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.cgpaDistribution} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                    <XAxis dataKey="range" stroke={axis} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke={axis} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: tt.bg, borderColor: tt.border, color: tt.color }} />
                    <Bar dataKey="count" name="Students" fill="#6152D1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>GPA Trend (Cohort Average)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              {(data.gpaTrend ?? []).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.gpaTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                    <XAxis dataKey="semester" stroke={axis} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke={axis} fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 0.3', 'dataMax + 0.3']} />
                    <Tooltip contentStyle={{ backgroundColor: tt.bg, borderColor: tt.border, color: tt.color }} />
                    <Line type="monotone" dataKey="averageGpa" name="Avg GPA" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Achievement Volume + Internship Preferences ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Achievement Volume</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">By category and level</p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {(data as any).achievementVolume?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(data as any).achievementVolume} margin={{ top: 5, right: 10, bottom: 30, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                    <XAxis dataKey="category" stroke={axis} fontSize={10} tickLine={false} axisLine={false} angle={-30} textAnchor="end" />
                    <YAxis stroke={axis} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: tt.bg, borderColor: tt.border, color: tt.color }} />
                    <Legend />
                    <Bar dataKey="count" name="Achievements" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                      {((data as any).achievementVolume ?? []).map((_: any, i: number) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internship Preferences</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Online vs offline vs no preference</p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {(data as any).internshipPreferences?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(data as any).internshipPreferences}
                      cx="50%" cy="50%"
                      innerRadius={65} outerRadius={100}
                      paddingAngle={4}
                      dataKey="count" nameKey="preference"
                      isAnimationActive={false}
                    >
                      {((data as any).internshipPreferences ?? []).map((_: any, i: number) => (
                        <Cell key={i} fill={['#6152D1', '#10b981', '#94a3b8'][i % 3]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: tt.bg, borderColor: tt.border, color: tt.color }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 4: Project Activity ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Project Activity by Domain</CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Count of projects per domain and tech stack</p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {(data as any).projectActivity?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(data as any).projectActivity} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                  <XAxis dataKey="domain" stroke={axis} fontSize={10} tickLine={false} axisLine={false} angle={-20} textAnchor="end" />
                  <YAxis stroke={axis} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: tt.bg, borderColor: tt.border, color: tt.color }}
                    formatter={(value: any, _: any, props: any) => [value, `${props?.payload?.techStack} projects`]}
                  />
                  <Bar dataKey="count" name="Projects" radius={[4, 4, 0, 0]}>
                    {((data as any).projectActivity ?? []).map((_: any, i: number) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-full text-sm text-slate-400 dark:text-slate-500">
      No data available yet.
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, onClick }: {
  label: string; value: string; icon: typeof Users; color: string; bg: string; onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-outline-variant p-5 flex items-center justify-between shadow-sm transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-outline-variant dark:hover:border-outline-variant' : ''}`}
      onClick={onClick}
    >
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${bg} ${color}`}><Icon className="w-5 h-5" /></div>
    </div>
  );
}