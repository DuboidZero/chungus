import { Card, CardHeader, CardTitle } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import type { SemesterRecord } from './types';

interface Props {
  semester: SemesterRecord;
}

export function SemesterCard({ semester }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-surface-container-low border-b border-outline-variant/40 flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg">Semester {semester.semesterNumber}</CardTitle>
        <div className="flex gap-4 text-sm">
          <span className="text-on-surface-variant">
            GPA: <span className="font-bold text-on-surface">{semester.gpa.toFixed(2)}</span>
          </span>
          <span className="text-on-surface-variant">
            Credits: <span className="font-bold text-on-surface">{semester.totalCredits}</span>
          </span>
        </div>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-low/60 border-b border-outline-variant/40">
            <tr>
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium text-center">Marks</th>
              <th className="px-6 py-3 font-medium text-center">Grade</th>
              <th className="px-6 py-3 font-medium text-right">Credits</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {semester.subjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-surface-container transition-colors">
                <td className="px-6 py-3.5 font-medium text-on-surface">{sub.name}</td>
                <td className="px-6 py-3.5 text-center text-on-surface-variant">
                  {sub.marksObtained} / {sub.maxMarks}
                </td>
                <td className="px-6 py-3.5 text-center">
                  <Badge variant={
                    sub.grade === 'F' || sub.grade === 'NA' ? 'warning'
                    : sub.grade === 'P' || sub.grade === 'C' ? 'info'
                    : 'success'
                  }>{sub.grade}</Badge>
                </td>
                <td className="px-6 py-3.5 text-right text-on-surface-variant">{sub.credits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
