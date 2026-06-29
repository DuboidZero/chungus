import { StudentDashboardView } from '../../dashboard/StudentDashboard';
import type { StudentDashboardResponse } from '../../../api/contracts/dashboard';

interface Props {
  data: StudentDashboardResponse | null;
}

export function OverviewTab({ data }: Props) {
  if (!data) {
    return <div className="text-center text-slate-500 py-12">No overview data available.</div>;
  }

  return <StudentDashboardView data={data} />;
}
