import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, UploadCloud, UsersRound, BookOpen } from 'lucide-react';
import { Card, CardContent } from '../../../shared/ui/card';
import { getCohorts } from '../../../api/services/admin';
import { getTeachers, getStudents } from '../../../api/services/users';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, teachers: 0, cohorts: 0 });

  useEffect(() => {
    // In a real app, this would be a single GET /admin/dashboard/stats endpoint.
    // Here we piece it together from available endpoints/mock driver.
    const fetchStats = async () => {
      try {
        const teachers = await getTeachers();
        const students = await getStudents();
        let cohorts: any[] = [];
        try { cohorts = await getCohorts(); } catch { cohorts = []; }

        setStats({
          students: students.length,
          teachers: teachers.length,
          cohorts: cohorts.length,
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    fetchStats();
  }, []);

  const navCards = [
    { title: 'Users', description: 'Manage students and teachers', icon: Users, path: '/users', color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Cohorts', description: 'Manage academic cohorts and mentors', icon: Building2, path: '/cohorts', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Bulk Upload', description: 'Import institutional data via Excel/CSV', icon: UploadCloud, path: '/bulk-upload', color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Admin Dashboard</h1>
        <p className="text-on-surface-variant mt-1">System overview and quick actions.</p>
      </div>

      {/* Stats Row */}
      <div className="stagger-in grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
              <UsersRound className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant">Total Students</p>
              <h3 className="text-2xl font-bold text-on-surface">{stats.students}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant">Total Teachers</p>
              <h3 className="text-2xl font-bold text-on-surface">{stats.teachers}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant">Total Cohorts</p>
              <h3 className="text-2xl font-bold text-on-surface">{stats.cohorts}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <h2 className="text-lg font-semibold text-on-surface mt-8">Quick Navigation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {navCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card
              key={i}
              interactive
              className="hover:border-primary"
              onClick={() => navigate(card.path)}
            >
              <CardContent className="p-6 flex items-start gap-4">
                <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface mb-1">{card.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
