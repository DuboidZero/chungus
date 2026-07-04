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
          <CardTitle className="text-on-surface-variant">Active Guidance Cases</CardTitle>
        </CardHeader>
        <div className="p-6 text-center text-on-surface-variant text-sm">
          You have no active guidance cases.
        </div>
      </Card>
    );
  }

  const statusColors = {
    'Open': 'bg-amber-100 text-amber-700 border-amber-200',
    'Assigned': 'bg-blue-100 text-blue-700 border-blue-200',
    'In Progress': 'bg-purple-100 text-purple-700 border-purple-200',
    'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Closed': 'bg-surface-container text-on-surface-variant border-outline-variant',
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
      <CardHeader className="border-b border-outline-variant/40 pb-4">
        <CardTitle className="flex items-center gap-2 text-on-surface">
          <Briefcase className="w-5 h-5 text-primary" />
          Guidance Cases
        </CardTitle>
      </CardHeader>
      <div className="divide-y divide-outline-variant/40">
        {cases.map(c => (
          <div 
            key={c.id} 
            className="p-4 hover:bg-surface-container transition-colors flex items-center justify-between group cursor-pointer"
            onClick={() => onViewStudent(c.studentId)}
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-medium text-on-surface">{c.studentName}</span>
                <span className={`flex items-center text-xs px-2 py-0.5 rounded border ${statusColors[c.status]}`}>
                  {statusIcons[c.status]}
                  {c.status}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mt-1">{c.triggerSignal}</p>
              <p className="text-xs text-on-surface-variant/70 mt-1">Opened {new Date(c.dateOpened).toLocaleDateString()}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-on-surface-variant/60 group-hover:text-primary transition-colors" />
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
