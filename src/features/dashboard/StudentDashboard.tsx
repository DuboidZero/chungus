// Student Dashboard — personal academic + portfolio view
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/card';
import { Activity, BookOpen, Briefcase, Trophy, Code } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../shared/providers/ThemeProvider';
import type { User } from '../../shared/permissions/roles';
import { useAcademic } from '../academic/AcademicContext';
import { calculatePercentage } from '../academic/types';

interface Props { user: User }

export function StudentDashboard({ user }: Props) {
  const { theme } = useTheme();
  const { semesters } = useAcademic();
  
  const sortedSemesters = [...semesters].sort((a, b) => a.semesterNumber - b.semesterNumber);
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  const cgpaData = sortedSemesters.map((sem, idx) => {
    totalPoints += sem.gpa * sem.totalCredits;
    totalCredits += sem.totalCredits;
    const cgpa = Number((totalPoints / totalCredits).toFixed(2));
    
    // Add projection to the last real semester
    const isLast = idx === sortedSemesters.length - 1;
    return {
      semester: `Sem ${sem.semesterNumber}`,
      cgpa,
      projected: isLast ? cgpa : undefined
    };
  });

  // If there's data, calculate projection using the formula:
  // Projected Marks = ((CGPA * 9.5) / 100) * Total Marks
  if (cgpaData.length > 0) {
    const last = cgpaData[cgpaData.length - 1];
    
    // Estimate total marks for next semester based on the last actual semester
    const lastSem = sortedSemesters[sortedSemesters.length - 1];
    const estimatedTotalMarks = lastSem ? lastSem.subjects.reduce((sum, sub) => sum + sub.maxMarks, 0) : 1000;
    
    // The exact formula provided:
    const projectedMarks = ((last.cgpa * 9.5) / 100) * estimatedTotalMarks;
    
    // Convert projected marks back to CGPA for the chart (mathematically equals last.cgpa, which is correct for a trend projection)
    const projectedCGPA = estimatedTotalMarks > 0 
      ? Number(((projectedMarks / estimatedTotalMarks) * (100 / 9.5)).toFixed(2))
      : last.cgpa;

    cgpaData.push({
      semester: `Sem ${sortedSemesters.length + 1} (Proj)`,
      cgpa: undefined as any,
      projected: projectedCGPA
    });
  }

  const overallCgpa = cgpaData.length > 1 ? cgpaData[cgpaData.length - 2].cgpa : 0;
  const overallPercentage = calculatePercentage(overallCgpa);
  
  const chartColors = {
    grid: theme === 'dark' ? '#29315A' : '#e2e8f0',
    axis: theme === 'dark' ? '#94a3b8' : '#64748b',
    tooltip: {
      bg: theme === 'dark' ? '#1a1e3a' : '#ffffff',
      border: theme === 'dark' ? '#29315A' : '#e2e8f0',
      color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here is a summary of your academic and portfolio progress.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="CGPA / %" value={`${overallCgpa.toFixed(2)} / ${overallPercentage.toFixed(1)}%`} icon={Activity} trendUp />
        <StatCard title="Credits"      value={totalCredits.toString()} icon={BookOpen} />
        <StatCard title="Projects"     value="4"    icon={Briefcase} />
        <StatCard title="Achievements" value="3"    icon={Trophy} />
        <StatCard title="Skills"       value="12"   icon={Code} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* CGPA Trend */}
          <Card>
            <CardHeader><CardTitle>CGPA Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cgpaData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis dataKey="semester" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                    <Tooltip contentStyle={{ backgroundColor: chartColors.tooltip.bg, borderColor: chartColors.tooltip.border, color: chartColors.tooltip.color }} itemStyle={{ color: '#3b82f6' }} />
                    <Line type="monotone" dataKey="cgpa" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} name="CGPA" connectNulls />
                    <Line type="monotone" dataKey="projected" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#94a3b8', strokeWidth: 0 }} activeDot={{ r: 6 }} name="Projected" connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio completion nudge */}
          <Card>
            <CardHeader><CardTitle>Portfolio Completion</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Profile', pct: 60 },
                  { label: 'Skills', pct: 80 },
                  { label: 'Projects', pct: 50 },
                  { label: 'Work Experience', pct: 33 },
                  { label: 'Achievements', pct: 75 },
                ].map(({ label, pct }) => (
                  <div key={label} className="flex items-center gap-4">
                    <span className="text-sm text-slate-600 dark:text-slate-300 w-36 shrink-0">{label}</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-brand-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: deadlines */}
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Upcoming Deadlines</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-brand-800">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Mini Project Submission</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Software Engineering</p>
                  </div>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded shrink-0">2 Days</span>
                </li>
                <li className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Internship Report</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Professional Elective</p>
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-brand-800 px-2 py-1 rounded shrink-0">Next Week</span>
                </li>
              </ul>
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
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
            {trend && (
              <span className={`text-xs font-medium ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className="p-3 bg-brand-50 dark:bg-brand-800 rounded-lg text-brand-600 dark:text-brand-400">
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
}
