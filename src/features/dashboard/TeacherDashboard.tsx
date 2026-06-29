/** 
 * Teacher Dashboard View.
 * Implements case management layout for assigned students.
 */
import { useState, useEffect } from 'react';
import { getTeacherDashboard } from '../../api/services/dashboard';
import { Card, CardContent } from '../../shared/ui/card';

import type { User } from '../../shared/permissions/roles';
import type { TeacherDashboardResponse } from '../../api/contracts/dashboard';
import { Skeleton } from '../../shared/ui/loading-skeleton';
import { useNavigate } from 'react-router-dom';

import { SearchFilterBar, type FilterState } from '../teacher/components/SearchFilterBar';
import { SupportNeededPanel } from '../teacher/components/SupportNeededPanel';
import { GuidanceCasesPanel } from '../teacher/components/GuidanceCasesPanel';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface Props { user: User }

export function TeacherDashboard({ user }: Props) {
  const navigate = useNavigate();

  const [data, setData] = useState<TeacherDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherDashboard()
      .then(setData)
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Good morning, {user.name.split(' ').slice(0, 2).join(' ')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
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
        <div className="space-y-4">
          <StatCard label="Assigned Students" value={data.stats.totalAssignedStudents.toString()} icon={Users} color="text-brand-600 dark:text-brand-400" bg="bg-brand-50 dark:bg-brand-900/20" onClick={() => navigate('/students')} />
          <StatCard label="High Performing" value={data.stats.highPerformingCount.toString()} icon={TrendingUp} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" onClick={() => navigate('/students?performanceTier=High+Performing')} />
          <StatCard label="Needs Guidance" value={data.stats.midTierCount.toString()} icon={Users} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-900/20" onClick={() => navigate('/students?performanceTier=Average+-+Guidable')} />
          <StatCard label="Underperforming" value={data.stats.underperformingCount.toString()} icon={AlertTriangle} color="text-red-600 dark:text-red-400" bg="bg-red-50 dark:bg-red-900/20" onClick={() => navigate('/students?performanceTier=Underperforming')} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, onClick }: {
  label: string; value: string; icon: typeof Users; color: string; bg: string; onClick?: () => void;
}) {
  return (
    <Card className={`transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700' : ''}`} onClick={onClick}>
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
