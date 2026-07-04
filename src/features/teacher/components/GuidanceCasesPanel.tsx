import { Card, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Briefcase, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import type { GuidanceCase } from '../../../api/entities/teacher';

interface Props {
  cases: GuidanceCase[];
  onViewStudent: (id: string) => void;
}

export function GuidanceCasesPanel({ cases, onViewStudent }: Props) {
  if (!cases || cases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-700 dark:text-slate-300">Active Guidance Cases</CardTitle>
        </CardHeader>
        <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
          You have no active guidance cases.
        </div>
      </Card>
    );
  }

  const statusColors = {
    'Open': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
    'Assigned': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
    'In Progress': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-900/50',
    'Resolved': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
    'Closed': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  };

  const statusIcons = {
    'Open': <AlertCircleIcon className="w-3 h-3 mr-1" />,
    'Assigned': <Briefcase className="w-3 h-3 mr-1" />,
    'In Progress': <Clock className="w-3 h-3 mr-1" />,
    'Resolved': <CheckCircle className="w-3 h-3 mr-1" />,
    'Closed': <CheckCircle className="w-3 h-3 mr-1" />,
  };

  return (
    <Card>
      <CardHeader className="border-b border-slate-100 dark:border-outline-variant pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Briefcase className="w-5 h-5 text-primary" />
          Guidance Cases
        </CardTitle>
      </CardHeader>
      <div className="divide-y divide-slate-100 dark:divide-outline-variant">
        {cases.map(c => (
          <div 
            key={c.id} 
            className="p-4 hover:bg-slate-50 dark:hover:bg-surface-container transition-colors flex items-center justify-between group cursor-pointer"
            onClick={() => onViewStudent(c.studentId)}
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-medium text-slate-900 dark:text-slate-100">{c.studentName}</span>
                <span className={`flex items-center text-xs px-2 py-0.5 rounded border ${statusColors[c.status]}`}>
                  {statusIcons[c.status]}
                  {c.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{c.triggerSignal}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Opened {new Date(c.dateOpened).toLocaleDateString()}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function AlertCircleIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
}
