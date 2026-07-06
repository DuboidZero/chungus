import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import type { SkillHeatmapData } from '../../../api/contracts/dashboard';

interface Props {
  data: SkillHeatmapData[];
  onSkillClick?: (skillName: string) => void;
}

/** Maps average proficiency (0–5) to a progress-bar color class. */
function getBarColor(avg: number): string {
  if (avg >= 4.0) return 'bg-emerald-500';
  if (avg >= 3.0) return 'bg-amber-400';
  if (avg >= 2.0) return 'bg-orange-500';
  return 'bg-red-500';
}

/** Maps average proficiency to a human-readable label. */
function getLabel(avg: number): string {
  if (avg >= 4.0) return 'High';
  if (avg >= 3.0) return 'Medium';
  if (avg >= 2.0) return 'Low';
  return 'Critical';
}

export function SkillHeatmap({ data, onSkillClick }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  /** Flatten domain → skills into a single list for filtering */
  const allSkills = useMemo(
    () =>
      (data ?? []).flatMap(domain =>
        (domain.skills ?? []).map(skill => ({
          ...skill,
          domain: domain.domain,
        })),
      ),
    [data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSkills;
    return allSkills.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q),
    );
  }, [allSkills, query]);

  const handleClick = (skillName: string) => {
    if (onSkillClick) {
      onSkillClick(skillName);
    } else {
      navigate(`/students?skill=${encodeURIComponent(skillName)}`);
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-on-surface-variant text-center py-8">No skill data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col" style={{ height: '420px' }}>
      <CardHeader className="shrink-0 pb-3">
        <CardTitle>Skill Coverage</CardTitle>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Click any skill to filter students by that skill.
        </p>

        {/* Sticky Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/70 pointer-events-none" />
          <input
            type="text"
            placeholder="Search skills..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-surface-container border border-outline-variant text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </CardHeader>

      {/* Scrollable skill list */}
      <CardContent className="overflow-y-auto flex-1 pr-3 space-y-3 pb-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-6">No skills match your search.</p>
        ) : (
          filtered.map(skill => {
            const pct = Math.round((skill.avgProficiency / 5) * 100);
            const barColor = getBarColor(skill.avgProficiency);
            const label = getLabel(skill.avgProficiency);

            return (
              <button
                key={`${skill.domain}-${skill.name}`}
                onClick={() => handleClick(skill.name)}
                className="w-full text-left group rounded-lg p-3 hover:bg-surface-container transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {/* Skill name + meta row */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate block">
                      {skill.name}
                    </span>
                    <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-wider">
                      {skill.domain}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4 text-right">
                    <span className="text-xs font-bold text-on-surface">{pct}%</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      skill.avgProficiency >= 4 ? 'bg-emerald-100 text-emerald-700' :
                      skill.avgProficiency >= 3 ? 'bg-amber-100 text-amber-700' :
                      skill.avgProficiency >= 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {label}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Student count */}
                {skill.studentCount !== undefined && (
                  <p className="text-[10px] text-on-surface-variant/60 mt-1">
                    {skill.studentCount} student{skill.studentCount !== 1 ? 's' : ''}
                  </p>
                )}
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
