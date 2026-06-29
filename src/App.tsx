import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './shared/providers/ThemeProvider';
import { AuthProvider } from './auth/AuthContext';
import { useAuth } from './auth/useAuth';
import { ProtectedRoute } from './auth/ProtectedRoute';

import { AppLayout } from './shared/layout/AppLayout';
import { studentNavigation } from './shared/layout/navigation/student';
import { teacherNavigation } from './shared/layout/navigation/teacher';
import { adminNavigation } from './shared/layout/navigation/admin';

import { LoginPage } from './features/auth/LoginPage';
import { TeacherDashboard } from './features/dashboard/TeacherDashboard';
import { Dashboard } from './features/dashboard/Dashboard';
import { AnalyticsDashboard } from './features/analytics/AnalyticsDashboard';
import { MyStudentsView } from './features/teacher/MyStudentsView';
import { StudentDetailView } from './features/teacher/StudentDetailView';
import { AssessmentsView } from './features/teacher/AssessmentsView';
import { Profile } from './features/profile/Profile';
import { AcademicRecords } from './features/academic/AcademicRecords';
import { Skills } from './features/skills/Skills';
import { Projects } from './features/projects/Projects';
import { ProjectForm } from './features/projects/ProjectForm';
import { ProjectDetail } from './features/projects/ProjectDetail';
import { WorkExperience } from './features/experience/WorkExperience';
import { Achievements } from './features/achievements/Achievements';
import { AcademicProvider } from './features/academic/AcademicContext';
import { ProjectsProvider } from './features/projects/ProjectsContext';
import { EmptyState } from './shared/ui/empty-state';
import {
  User, Users, BarChart3, Building2, Shield,
} from 'lucide-react';

/** Placeholder components for unfinished feature routes. */
const Stub = ({ icon: I, title }: { icon: typeof User; title: string }) => (
  <EmptyState icon={I} title={title} description="Coming soon." />
);

/**
 * Role-based routing component.
 * Conditionally renders routes based on the authenticated user's role.
 * Note: React Router v6 requires exact <Route> hierarchy, hence the inline conditions.
 */
function RoleRouter() {
  const { user } = useAuth();

  /** Redirect authenticated users away from the login screen. */
  const loginElement = user ? <Navigate to="/" replace /> : <LoginPage />;

  return (
    <Routes>
      <Route path="/login" element={loginElement} />

      {/* Teacher Portal Routes */}
      {user?.role === 'teacher' && (
        <Route
          element={
            <ProtectedRoute>
              <AppLayout navigation={teacherNavigation} role="teacher" />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard user={user!} />} />
          <Route path="students"    element={<MyStudentsView />} />
          <Route path="students/:id" element={<StudentDetailView />} />
          <Route path="students/:studentId/projects/:projectId" element={<ProjectDetail />} />
          <Route path="assessments" element={<AssessmentsView />} />
          <Route path="analytics"   element={<AnalyticsDashboard />} />
          <Route path="settings"    element={<Stub icon={User}     title="Settings" />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Route>
      )}

      {/* Administrator Dashboard Routes */}
      {user?.role === 'admin' && (
        <Route
          element={
            <ProtectedRoute>
              <AppLayout navigation={adminNavigation} role="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users"       element={<Stub icon={Users}     title="Users" />} />
          <Route path="cohorts"     element={<Stub icon={Building2} title="Cohorts" />} />
          <Route path="analytics"   element={<Stub icon={BarChart3} title="Analytics" />} />
          <Route path="permissions" element={<Stub icon={Shield}    title="Roles & Permissions" />} />
          <Route path="settings"    element={<Stub icon={User}      title="Settings" />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Route>
      )}

      {/* Student Portfolio Routes (Default) */}
      {(!user || user.role === 'student') && (
        <Route
          element={
            <ProtectedRoute>
              <AcademicProvider>
                <ProjectsProvider>
                  <AppLayout navigation={studentNavigation} role="student" />
                </ProjectsProvider>
              </AcademicProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile"         element={<Profile />} />
          <Route path="academic-records" element={<AcademicRecords />} />
          <Route path="skills"          element={<Skills />} />
          <Route path="projects"        element={<Projects />} />
          <Route path="projects/new"    element={<ProjectForm />} />
          <Route path="projects/:id"    element={<ProjectDetail />} />
          <Route path="projects/:id/edit" element={<ProjectForm />} />
          <Route path="work-experience" element={<WorkExperience />} />
          <Route path="achievements"    element={<Achievements />} />
          <Route path="settings"        element={<Stub icon={User}          title="Settings" />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
}

/** Root Application Component. Provides global contexts and routing. */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <RoleRouter />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
