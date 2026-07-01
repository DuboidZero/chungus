import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './shared/providers/ThemeProvider';
import { AuthProvider } from './auth/AuthContext';
import { useAuth } from './auth/useAuth';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { FirstLoginGuard } from './auth/FirstLoginGuard';

import { AppLayout } from './shared/layout/AppLayout';
import { studentNavigation } from './shared/layout/navigation/student';
import { teacherNavigation } from './shared/layout/navigation/teacher';
import { adminNavigation } from './shared/layout/navigation/admin';

import { LoginPage } from './features/auth/pages/LoginPage';
import { ChangePasswordPage } from './features/auth/pages/ChangePasswordPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { UnauthorizedPage } from './features/auth/pages/UnauthorizedPage';
import { TeacherDashboard } from './features/dashboard/TeacherDashboard';
import { Dashboard } from './features/dashboard/Dashboard';
import { AdminDashboard } from './features/admin/pages/AdminDashboard';
import { UsersPage } from './features/admin/pages/UsersPage';
import { CohortsPage } from './features/admin/pages/CohortsPage';
import { BulkUploadPage } from './features/admin/pages/BulkUploadPage';
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

/**
 * Role-based routing component.
 * Conditionally renders routes based on the authenticated user's role.
 * Note: React Router v6 requires exact <Route> hierarchy, hence the inline conditions.
 */
function RoleRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Teacher Portal Routes */}
      {user?.role === 'teacher' && (
        <Route
          element={
            <ProtectedRoute roles={['teacher']}>
              <FirstLoginGuard>
                <AppLayout navigation={teacherNavigation} role="teacher" />
              </FirstLoginGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard user={user!} />} />
          <Route path="students"    element={<MyStudentsView />} />
          <Route path="students/:id" element={<StudentDetailView />} />
          <Route path="students/:studentId/projects/:projectId" element={<ProjectDetail />} />
          <Route path="assessments" element={<AssessmentsView />} />
          <Route path="analytics"   element={<AnalyticsDashboard />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Route>
      )}

      {/* Administrator Dashboard Routes */}
      {user?.role === 'admin' && (
        <Route
          element={
            <ProtectedRoute roles={['admin']}>
              <FirstLoginGuard>
                <AppLayout navigation={adminNavigation} role="admin" />
              </FirstLoginGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users"       element={<UsersPage />} />
          <Route path="cohorts"     element={<CohortsPage />} />
          <Route path="bulk-upload" element={<BulkUploadPage />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Route>
      )}

      {/* Student Portfolio Routes (Default) */}
      {(!user || user.role === 'student') && (
        <Route
          element={
            <ProtectedRoute roles={['student']}>
              <FirstLoginGuard>
                <AcademicProvider>
                  <ProjectsProvider>
                    <AppLayout navigation={studentNavigation} role="student" />
                  </ProjectsProvider>
                </AcademicProvider>
              </FirstLoginGuard>
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
