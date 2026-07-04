import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import type { SkillHeatmapData } from '../../../api/contracts/dashboard';

interface Props {
  data: SkillHeatmapData[];
  onSkillClick?: (skillName: string) => void;
}

export function SkillHeatmap({ data, onSkillClick }: Props) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Coverage Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-on-surface-variant text-center py-8">No skill data available.</p>
        </CardContent>
      </Card>
    );
  }

  const getSkillColor = (proficiency: number) => {
    if (proficiency >= 4.0) return 'bg-emerald-500';
    if (proficiency >= 3.0) return 'bg-amber-400';
    if (proficiency >= 2.0) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Coverage Heatmap</CardTitle>
        <p className="text-xs text-on-surface-variant mt-1">
          Cell colors indicate cohort's average proficiency. Click a skill to filter students.
        </p>
        <div className="flex items-center gap-4 mt-3 text-xs font-medium text-on-surface-variant">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500"></span>High (≥4.0)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400"></span>Medium (≥3.0)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-500"></span>Low (≥2.0)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500"></span>Critical (&lt;2.0)</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map(domain => (
            <div key={domain.domain}>
              <h4 className="text-sm font-medium text-on-surface-variant mb-3">{domain.domain}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {(domain.skills ?? []).map(skill => {
                  return (
                    <button 
                      key={skill.name}
                      onClick={() => onSkillClick?.(skill.name)}
                      className={`relative overflow-hidden rounded-md border border-outline-variant p-3 h-24 flex flex-col justify-between text-left transition-transform hover:-translate-y-1 hover:shadow-md ${onSkillClick ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {/* Heatmap background block */}
                      <div 
                        className={`absolute inset-0 opacity-80 ${getSkillColor(skill.avgProficiency)}`} 
                      />
                      
                      {/* Content */}
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <span className="text-xs font-medium text-on-surface leading-tight">
                          {skill.name}
                        </span>
                        <div className="flex items-end justify-between">
                          <span className="text-xs font-bold text-on-surface bg-white/60 px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center gap-0.5">
                            {skill.avgProficiency.toFixed(1)} 
                            <span className="text-[10px]">⭐</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
