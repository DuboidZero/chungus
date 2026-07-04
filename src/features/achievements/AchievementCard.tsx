import { Edit2, Trash2, Trophy, Award, Target, Star, Globe, Building, Flag, MapPin } from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import type { AchievementEntry } from './types';

interface Props {
  achievement: AchievementEntry;
  onEdit: () => void;
  onDelete: () => void;
}

export function AchievementCard({ achievement, onEdit, onDelete }: Props) {
  /** Map achievement categories to specific visual icons for quick recognition. */
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Academic': return <Star className="w-5 h-5" />;
      case 'Technical': return <Target className="w-5 h-5" />;
      case 'Sports': return <Trophy className="w-5 h-5" />;
      case 'Cultural': return <Award className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  /** Map achievement levels to distinct color variants. */
  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'International': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'National': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'State': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'College': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-surface-container-high dark:text-slate-300 border-slate-200 dark:border-outline-variant';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'International': return <Globe className="w-3 h-3" />;
      case 'National': return <Flag className="w-3 h-3" />;
      case 'State': return <MapPin className="w-3 h-3" />;
      case 'College': return <Building className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <Card className="h-full flex flex-col group hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${getLevelStyle(achievement.level)}`}>
              {getCategoryIcon(achievement.category)}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Badge variant="info" className="text-[10px] uppercase tracking-wider">{achievement.type}</Badge>
                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getLevelStyle(achievement.level)}`}>
                  {getLevelIcon(achievement.level)} {achievement.level}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-container">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">{achievement.title}</h3>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 flex-1">
          {achievement.description}
        </p>

        <div className="pt-4 mt-auto border-t border-slate-100 dark:border-outline-variant flex justify-between items-center text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>{new Date(achievement.date).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
          <div className="flex items-center gap-3">
            {achievement.certificateUrl && (
              <a
                href={achievement.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary dark:text-primary hover:underline font-semibold"
                onClick={e => e.stopPropagation()}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                Certificate
              </a>
            )}
            <span>{achievement.category}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
