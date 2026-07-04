import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAssignedStudents } from '../../api/services/teacher';
import type { StudentSummary, PerformanceTier, GuidanceCaseStatus } from '../../api/entities/teacher';
import { SearchFilterBar, type FilterState } from './components/SearchFilterBar';
import { Card, CardContent } from '../../shared/ui/card';
import { Skeleton } from '../../shared/ui/loading-skeleton';
import { AlertTriangle, TrendingUp, User, ChevronRight } from 'lucide-react';

export function MyStudentsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract initial filters from URL
  const initialFilters: FilterState = {
    search: searchParams.get('search') || '',
    batch: searchParams.get('batch') || '',
    department: searchParams.get('department') || '',
    performanceTier: (searchParams.get('performanceTier') as PerformanceTier) || '',
    guidanceStatus: (searchParams.get('guidanceStatus') as GuidanceCaseStatus) || '',
    skill: searchParams.get('skill') || '',
    domain: searchParams.get('domain') || '',
    supportNeeded: searchParams.get('supportNeeded') === 'true'
  };

  useEffect(() => {
    setLoading(true);
    // Convert to query params for backend API call
    const query: Record<string, string> = {};
    if (initialFilters.search) query.search = initialFilters.search;
    if (initialFilters.batch) query.batch = initialFilters.batch;
    if (initialFilters.department) query.department = initialFilters.department;
    if (initialFilters.performanceTier) query.performanceTier = initialFilters.performanceTier;
    if (initialFilters.guidanceStatus) query.guidanceStatus = initialFilters.guidanceStatus;
    if (initialFilters.skill) query.skill = initialFilters.skill;
    if (initialFilters.domain) query.domain = initialFilters.domain;
    if (initialFilters.supportNeeded) query.supportNeeded = 'true';

    getAssignedStudents(query)
      .then(setStudents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]); // Re-run when URL params change

  const handleFilterChange = (filters: FilterState) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.batch) params.append('batch', filters.batch);
    if (filters.department) params.append('department', filters.department);
    if (filters.performanceTier) params.append('performanceTier', filters.performanceTier);
    if (filters.guidanceStatus) params.append('guidanceStatus', filters.guidanceStatus);
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.domain) params.append('domain', filters.domain);
    if (filters.supportNeeded) params.append('supportNeeded', 'true');
    setSearchParams(params, { replace: true });
  };

  // Helper to remove custom URL-only filters (skill, domain)
  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">My Students</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and monitor all assigned students in your cohort.</p>
      </div>

      <div className="space-y-4">
        <SearchFilterBar onFilterChange={handleFilterChange} initialState={initialFilters} />

        {/* Display active tag filters for URL-only params like skill/domain */}
        {(initialFilters.skill || initialFilters.domain || initialFilters.supportNeeded) && (
          <div className="flex flex-wrap gap-2">
            {initialFilters.skill && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low dark:bg-surface-container-low text-primary dark:text-on-surface-variant text-xs font-medium border border-outline-variant dark:border-outline-variant">
                Skill: {initialFilters.skill}
                <button onClick={() => removeFilter('skill')} className="hover:text-primary dark:hover:text-on-primary">&times;</button>
              </span>
            )}
            {initialFilters.domain && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800">
                Domain: {initialFilters.domain}
                <button onClick={() => removeFilter('domain')} className="hover:text-indigo-900 dark:hover:text-indigo-100">&times;</button>
              </span>
            )}
            {initialFilters.supportNeeded && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800">
                Support Needed
                <button onClick={() => removeFilter('supportNeeded')} className="hover:text-red-900 dark:hover:text-red-100">&times;</button>
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : students.length === 0 ? (
        <div className="py-20 text-center border border-slate-200 dark:border-outline-variant rounded-xl bg-white dark:bg-surface-container-low/60">
          <User className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No students found</h3>
          <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {students.map(student => (
            <StudentCard key={student.id} student={student} onClick={() => navigate(`/students/${student.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentCard({ student, onClick }: { student: StudentSummary, onClick: () => void }) {
  const getTierColor = (tier: PerformanceTier) => {
    switch (tier) {
      case 'High Performing': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Average - Guidable': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Underperforming': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <Card className="hover:shadow-md hover:border-outline-variant dark:hover:border-outline-variant transition-all cursor-pointer group" onClick={onClick}>
      <CardContent className="p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary-fixed dark:bg-surface-container-low flex items-center justify-center text-primary dark:text-on-surface-variant font-bold shrink-0 overflow-hidden">
            {student.avatar ? (
              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              student.name.charAt(0)
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{student.name}</h4>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-mono text-xs bg-slate-100 dark:bg-surface-container-low px-1.5 py-0.5 rounded">{student.prn}</span>
              <span className="flex items-center gap-1 font-medium">
                {student.cgpa >= 8.5 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className={`w-3.5 h-3.5 ${student.cgpa < 6.0 ? 'text-red-500' : 'text-amber-500'}`} />}
                CGPA {student.cgpa.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getTierColor(student.performanceTier)}`}>
                {student.performanceTier}
              </span>
              {student.guidanceStatus && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-fixed text-primary dark:bg-surface-container-low dark:text-on-surface-variant border border-outline-variant dark:border-outline-variant">
                  Case: {student.guidanceStatus}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0 pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </CardContent>
    </Card>
  );
}
