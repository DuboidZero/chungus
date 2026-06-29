import { Card, CardHeader, CardTitle } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import type { SemesterRecord } from './types';

interface Props {
  semester: SemesterRecord;
}

export function SemesterCard({ semester }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50 dark:bg-brand-900/50 border-b border-slate-100 dark:border-brand-800 flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg">Semester {semester.semesterNumber}</CardTitle>
        <div className="flex gap-4 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            GPA: <span className="font-bold text-slate-900 dark:text-slate-100">{semester.gpa.toFixed(2)}</span>
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            Credits: <span className="font-bold text-slate-900 dark:text-slate-100">{semester.totalCredits}</span>
          </span>
        </div>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-brand-950/20 border-b border-slate-100 dark:border-brand-800">
            <tr>
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium text-center">Marks</th>
              <th className="px-6 py-3 font-medium text-center">Grade</th>
              <th className="px-6 py-3 font-medium text-right">Credits</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-brand-800">
            {semester.subjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-brand-900/20 transition-colors">
                <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-slate-100">{sub.name}</td>
                <td className="px-6 py-3.5 text-center text-slate-600 dark:text-slate-300">
                  {sub.marksObtained} / {sub.maxMarks}
                </td>
                <td className="px-6 py-3.5 text-center">
                  <Badge variant={
                    sub.grade === 'F' || sub.grade === 'NA' ? 'warning'
                    : sub.grade === 'P' || sub.grade === 'C' ? 'info'
                    : 'success'
                  }>{sub.grade}</Badge>
                </td>
                <td className="px-6 py-3.5 text-right text-slate-600 dark:text-slate-300">{sub.credits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
