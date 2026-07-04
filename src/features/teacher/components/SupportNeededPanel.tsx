import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { AlertCircle, ArrowRight } from 'lucide-react';
import type { SupportSignal } from '../../../api/entities/teacher';

interface Props {
  signals: SupportSignal[];
  onViewStudent: (id: string) => void;
}

export function SupportNeededPanel({ signals, onViewStudent }: Props) {
  if (!signals || signals.length === 0) {
    return (
      <Card className="border-emerald-100 bg-emerald-50/50">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-sm font-medium text-emerald-900">No urgent support needed</h3>
          <p className="text-xs text-emerald-600 mt-1">All your assigned students are on track.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 overflow-hidden">
      <CardHeader className="bg-red-50 border-b border-red-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          Support Needed
        </CardTitle>
      </CardHeader>
      <div className="divide-y divide-outline-variant/40">
        {signals.map(signal => (
          <div 
            key={signal.id} 
            className="p-4 hover:bg-surface-container transition-colors flex items-center justify-between group cursor-pointer"
            onClick={() => onViewStudent(signal.studentId)}
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-medium text-on-surface">{signal.studentName}</span>
                <span className="text-xs font-mono text-on-surface-variant">{signal.studentPrn}</span>
                <span className="text-xs font-bold text-red-600 px-2 py-0.5 bg-red-50 rounded-full">
                  CGPA {signal.studentCgpa.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {signal.reasonTags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-on-surface-variant/60 group-hover:text-primary transition-colors" />
          </div>
        ))}
      </div>
    </Card>
  );
}
