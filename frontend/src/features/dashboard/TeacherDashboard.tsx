/** 
 * Teacher Dashboard View.
 * Implements case management layout for assigned students.
 */
import { useState, useEffect } from 'react';
import { getTeacherDashboard } from '../../api/services/dashboard';
import { getMentoredProjects } from '../../api/services/teacher';
import { Card, CardContent } from '../../shared/ui/card';

import type { User } from '../../shared/permissions/roles';
import type { TeacherDashboardResponse } from '../../api/contracts/dashboard';
import { Skeleton } from '../../shared/ui/loading-skeleton';
import { useNavigate } from 'react-router-dom';

import { SearchFilterBar, type FilterState } from '../teacher/components/SearchFilterBar';
import { SupportNeededPanel } from '../teacher/components/SupportNeededPanel';
import { GuidanceCasesPanel } from '../teacher/components/GuidanceCasesPanel';
import { Users, TrendingUp, AlertTriangle, FileCode2 } from 'lucide-react';
import type { Project } from '../../api/entities/project';

interface Props { user: User }

export function TeacherDashboard({ user }: Props) {
  const navigate = useNavigate();

  const [data, setData] = useState<TeacherDashboardResponse | null>(null);
  const [mentoredProjects, setMentoredProjects] = useState<(Project & { studentName: string; studentPrn: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTeacherDashboard(),
      getMentoredProjects()
    ])
      .then(([dashData, projects]) => {
        setData(dashData);
        setMentoredProjects(projects);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFilterChange = (filters: FilterState) => {
    // Navigate to My Students when dropdown filters change
    const params = new URLSearchParams();
    if (filters.batch) params.append('batch', filters.batch);
    if (filters.department) params.append('department', filters.department);
    if (filters.performanceTier) params.append('performanceTier', filters.performanceTier);
    if (filters.guidanceStatus) params.append('guidanceStatus', filters.guidanceStatus);
    if (Array.from(params.keys()).length > 0) {
      navigate(`/students?${params.toString()}`);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/students?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleViewStudent = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  if (loading || !data) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-9 w-72 mb-2" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-on-surface">
          Good morning, {user.name.split(' ').slice(0, 2).join(' ')}
        </h1>
        <p className="text-on-surface-variant mt-1">
          Here's an overview of your assigned students and active cases.
        </p>
      </div>

      {/* 1. Search & Filters */}
      <SearchFilterBar onFilterChange={handleFilterChange} onSearch={handleSearch} />

      {/* 2. Support Needed Panel (Priority Intervention) */}
      <SupportNeededPanel signals={data.supportNeeded} onViewStudent={handleViewStudent} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Guidance Cases (Case Management) */}
        <div className="lg:col-span-2">
          <GuidanceCasesPanel cases={data.guidanceCases} onViewStudent={handleViewStudent} />
        </div>

        {/* 4. Performance Summary */}
        <div className="stagger-in space-y-4">
          <StatCard label="Assigned Students" value={data.stats.totalAssignedStudents.toString()} icon={Users} color="text-primary" bg="bg-surface-container-low" onClick={() => navigate('/students')} />
          <StatCard label="High Performing" value={data.stats.highPerformingCount.toString()} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" onClick={() => navigate('/students?performanceTier=High+Performing')} />
          <StatCard label="Needs Guidance" value={data.stats.midTierCount.toString()} icon={Users} color="text-amber-600" bg="bg-amber-50" onClick={() => navigate('/students?performanceTier=Average+-+Guidable')} />
          <StatCard label="Underperforming" value={data.stats.underperformingCount.toString()} icon={AlertTriangle} color="text-red-600" bg="bg-red-50" onClick={() => navigate('/students?performanceTier=Underperforming')} />
        </div>
      </div>

      {/* 5. Mentored Projects */}
      <Card>
        <div className="px-6 py-5 border-b border-outline-variant/40 flex items-center gap-3">
          <div className="p-2 bg-surface-container-low text-primary rounded-lg">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">Mentored Projects</h2>
            <p className="text-sm text-on-surface-variant">College projects where you are the assigned Project Mentor.</p>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          {mentoredProjects.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-xs uppercase font-semibold text-on-surface-variant">
                  <th className="p-4">Project Name</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {mentoredProjects.map((p, i) => (
                  <tr key={p.id || i} className="border-b border-outline-variant/40 hover:bg-surface-container transition-colors">
                    <td className="p-4 font-medium text-on-surface">{p.name}</td>
                    <td className="p-4 text-on-surface-variant">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface">{p.studentName}</span>
                        <span className="text-xs">{p.studentPrn}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        p.status === 'Completed' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-on-surface-variant">
              No mentored projects currently assigned.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, onClick }: {
  label: string; value: string; icon: typeof Users; color: string; bg: string; onClick?: () => void;
}) {
  return (
    <Card className={`transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-outline-variant' : ''}`} onClick={onClick}>
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
