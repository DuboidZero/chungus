import { CheckSquare, Flag } from 'lucide-react';
import type { AssessmentMark, ProjectMilestone, MilestoneStatus } from '../../../api/entities/teacher';

interface Props {
  marks: AssessmentMark[];
  milestones: ProjectMilestone[];
}

export function ProjectTimeline({ marks, milestones }: Props) {
  // Merge and sort chronologically (newest first)
  const events = [
    ...marks.map(m => ({
      id: m.id,
      type: 'MARK' as const,
      date: m.date,
      title: m.assessmentTitle,
      description: m.comments,
      author: m.teacherName,
      score: m.score,
      maxScore: m.maxScore
    })),
    ...milestones.map(m => ({
      id: m.id,
      type: 'MILESTONE' as const,
      date: m.date,
      title: 'Milestone Updated',
      description: m.description,
      author: 'Teacher', // In a real app we'd have the author name
      status: m.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (events.length === 0) {
    return (
      <div className="pt-6 mt-6 border-t border-slate-200 dark:border-brand-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Project Timeline</h3>
        <p className="text-sm text-slate-500">No activity recorded yet.</p>
      </div>
    );
  }

  const getStatusColor = (status?: MilestoneStatus) => {
    if (status === 'Completed') return 'text-emerald-600 dark:text-emerald-400';
    if (status === 'Delayed') return 'text-red-600 dark:text-red-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <div className="pt-6 mt-6 border-t border-slate-200 dark:border-brand-800">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Project Timeline</h3>
      
      <div className="relative pl-4 border-l-2 border-slate-100 dark:border-brand-800 ml-2 space-y-6">
        {events.map(event => (
          <div key={event.id} className="relative">
            <div className={`absolute -left-[21px] top-1 w-8 h-8 rounded-full border-2 bg-white dark:bg-brand-950 flex items-center justify-center 
              ${event.type === 'MARK' ? 'border-emerald-200 dark:border-emerald-800' : 'border-purple-200 dark:border-purple-800'}`}
            >
              {event.type === 'MARK' ? (
                <CheckSquare className="w-4 h-4 text-emerald-500" />
              ) : (
                <Flag className="w-4 h-4 text-purple-500" />
              )}
            </div>
            
            <div className="pl-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{event.title}</span>
                <span className="text-xs text-slate-500 bg-slate-100 dark:bg-brand-800/50 px-2 py-0.5 rounded">
                  {new Date(event.date).toLocaleDateString()}
                </span>
                {event.type === 'MARK' && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">
                    Score: {event.score}/{event.maxScore}
                  </span>
                )}
                {event.type === 'MILESTONE' && event.status && (
                  <span className={`text-xs font-bold bg-slate-50 dark:bg-brand-900/20 px-2 py-0.5 rounded ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
