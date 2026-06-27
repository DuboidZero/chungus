/** 
 * Root Dashboard Component.
 * Acts as a router to render the appropriate dashboard view based on the user's role.
 */
import { useAuth } from '../../auth/useAuth';
import { StudentDashboard } from './StudentDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { AdminDashboard } from './AdminDashboard';

export function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === 'teacher') return <TeacherDashboard user={user} />;
  if (user.role === 'admin')   return <AdminDashboard user={user} />;
  return <StudentDashboard user={user} />;
}
