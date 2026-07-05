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
      <div className="pt-6 mt-6 border-t border-outline-variant">
        <h3 className="text-lg font-bold text-on-surface mb-4">Project Timeline</h3>
        <p className="text-sm text-on-surface-variant">No activity recorded yet.</p>
      </div>
    );
  }

  const getStatusColor = (status?: MilestoneStatus) => {
    if (status === 'Completed') return 'text-emerald-600';
    if (status === 'Delayed') return 'text-red-600';
    return 'text-blue-600';
  };

  return (
    <div className="pt-6 mt-6 border-t border-outline-variant">
      <h3 className="text-lg font-bold text-on-surface mb-6">Project Timeline</h3>
      
      <div className="relative pl-4 border-l-2 border-outline-variant/40 ml-2 space-y-6">
        {events.map(event => (
          <div key={event.id} className="relative">
            <div className={`absolute -left-[21px] top-1 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center 
              ${event.type === 'MARK' ? 'border-emerald-200' : 'border-purple-200'}`}
            >
              {event.type === 'MARK' ? (
                <CheckSquare className="w-4 h-4 text-emerald-500" />
              ) : (
                <Flag className="w-4 h-4 text-purple-500" />
              )}
            </div>
            
            <div className="pl-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-on-surface">{event.title}</span>
                <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                  {new Date(event.date).toLocaleDateString()}
                </span>
                {event.type === 'MARK' && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Score: {event.score}/{event.maxScore}
                  </span>
                )}
                {event.type === 'MILESTONE' && event.status && (
                  <span className={`text-xs font-bold bg-surface-container-low px-2 py-0.5 rounded ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                )}
              </div>
              <p className="text-sm text-on-surface-variant mt-1">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
