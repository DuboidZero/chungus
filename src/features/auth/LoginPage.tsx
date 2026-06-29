import { useState, useEffect } from 'react';
import type { Role, User } from '../../api/entities/user';
import { useAuth } from '../../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Shield, ChevronDown, Search, ArrowLeft } from 'lucide-react';
import { mockDriver, USE_MOCK } from '../../api/mock';

interface RoleOption {
  role: Role;
  label: string;
  description: string;
  icon: typeof GraduationCap;
  border: string;
  iconColor: string;
  iconBg: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'student',
    label: 'Continue as Student',
    description: 'Build your portfolio, track academic progress, and manage your achievements.',
    icon: GraduationCap,
    border: 'border-brand-700 hover:border-brand-500',
    iconColor: 'text-brand-400',
    iconBg: 'bg-brand-800 group-hover:bg-brand-700',
  },
  {
    role: 'teacher',
    label: 'Continue as Teacher',
    description: 'View student portfolios, add assessments, and monitor cohort progress.',
    icon: BookOpen,
    border: 'border-brand-700 hover:border-emerald-600',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-brand-800 group-hover:bg-emerald-900/60',
  },
  {
    role: 'admin',
    label: 'Continue as Admin',
    description: 'Manage cohorts, users, system settings, and institutional analytics.',
    icon: Shield,
    border: 'border-brand-700 hover:border-amber-500',
    iconColor: 'text-amber-400',
    iconBg: 'bg-brand-800 group-hover:bg-amber-900/40',
  },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // For the user selector step
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (selectedRole && USE_MOCK) {
      const fetchedUsers = mockDriver.getUsersByRole(selectedRole);
      setUsers(fetchedUsers);
      setSelectedUser(fetchedUsers[0] || null);
      setSearchQuery('');
    }
  }, [selectedRole]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleLogin = () => {
    if (!selectedUser) return;
    
    login({
      user: selectedUser,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    });
    navigate('/', { replace: true });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.prn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStudentExtraDetails = (userId: string) => {
    if (selectedRole !== 'student' || !USE_MOCK) return null;
    const dashboard = mockDriver.getStudentDashboard(userId);
    /** Retrieves extended metadata payload from the authentication response object. */
    /** Utilizes the dashboard aggregated data to populate initial context variables. */
    if (!dashboard) return null;
    
    // Calculate a rough tier based on CGPA for display if we don't have _meta
    let tier = 'Average';
    let stars = '⭐';
    if (dashboard.stats.cgpa >= 8.5) { tier = 'Outstanding'; stars = '⭐⭐⭐'; }
    else if (dashboard.stats.cgpa >= 7.5) { tier = 'High Performing'; stars = '⭐⭐'; }
    else if (dashboard.stats.cgpa < 6.0) { tier = 'Needs Guidance'; stars = '⚠️'; }
    else if (dashboard.stats.cgpa < 5.0) { tier = 'Failing'; stars = '❌'; }

    return {
      tier, stars,
      cgpa: dashboard.stats.cgpa,
      completion: dashboard.stats.percentage
    };
  };

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-6">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#5869c9 1px, transparent 1px), linear-gradient(to right, #5869c9 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-800 border border-brand-700 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-extrabold text-white text-lg">
              M
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">MIT WPU Portfolio</h1>
          <p className="text-slate-400 text-sm">
            {selectedRole ? 'Select a test account to login' : 'Select your role to continue'}
          </p>
        </div>

        {!selectedRole ? (
          /* Step 1: Role Selection */
          <div className="space-y-3">
            {ROLE_OPTIONS.map(({ role, label, description, icon: Icon, border, iconColor, iconBg }) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className={`w-full text-left flex items-start gap-4 p-5 rounded-xl border bg-brand-900/60 backdrop-blur-sm transition-all duration-200 cursor-pointer group ${border}`}
              >
                <div className={`mt-0.5 p-2 rounded-lg transition-colors duration-200 ${iconBg} ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-0.5">{label}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Step 2: User Selection */
          <div className="bg-brand-900/80 border border-brand-700 rounded-xl p-5 space-y-5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedRole(null)}
                className="p-2 -ml-2 rounded-lg hover:bg-brand-800 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-white capitalize">{selectedRole} Login</h2>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select {selectedRole} Account
              </label>
              
              <div 
                className="w-full bg-brand-950 border border-brand-700 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:border-brand-500 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="text-white">
                  {selectedUser ? `${selectedUser.name} (${selectedUser.prn})` : 'Select user...'}
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-brand-800 border border-brand-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                  <div className="sticky top-0 p-2 bg-brand-800 border-b border-brand-700">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search name or PRN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-brand-950 border border-brand-700 rounded-md py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-brand-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400">No users found</div>
                  ) : (
                    <ul className="py-2">
                      {filteredUsers.map(u => {
                        const extra = getStudentExtraDetails(u.id);
                        return (
                          <li 
                            key={u.id}
                            className="px-4 py-3 hover:bg-brand-700 cursor-pointer border-b border-brand-700/50 last:border-0"
                            onClick={() => {
                              setSelectedUser(u);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-white">{u.name}</p>
                                <p className="text-xs text-slate-400">{u.prn}</p>
                              </div>
                              {extra && (
                                <div className="text-right">
                                  <p className="text-xs font-medium text-white">{extra.stars} {extra.tier}</p>
                                  <p className="text-xs text-slate-400">
                                    CGPA: {extra.cgpa} • Portfolio: {extra.completion}%
                                  </p>
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleLogin}
              disabled={!selectedUser}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue as {selectedUser?.name.split(' ')[0]}
            </button>
          </div>
        )}

        <p className="text-center text-xs text-slate-600">
          MIT World Peace University · Internal System · Not for public access
        </p>
      </div>
    </div>
  );
}
