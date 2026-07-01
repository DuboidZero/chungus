import { useState, useEffect } from 'react';
import { UserPlus, UserX, UserCheck, KeyRound, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Modal } from '../../../shared/ui/modal';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Select } from '../../../shared/ui/select';
import { getTeachers, updateUser, resetUserPassword, toggleUserStatus } from '../../../api/services/users';
import { getCohorts, updateCohortMentor } from '../../../api/services/admin';
import { mockDriver } from '../../../api/mock';
import { useSortableTable } from '../../../shared/hooks/useSortableTable';
import type { User } from '../../../api/entities/user';

export function UsersPage() {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null);

  // Edit form state
  const [formData, setFormData] = useState<any>({});
  const [teacherCohorts, setTeacherCohorts] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const t = await getTeachers();
      setTeachers(t as any);
      const s = mockDriver.getUsersByRole('student');
      setStudents(s);
      const c = await getCohorts();
      setCohorts(c);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      prn: u.prn || '',
      email: u.email || '',
      department: u.department || '',
      batch: u.batch || '',
      academicYear: u.academicYear || '',
    });
    if (u.role === 'teacher') {
      const assigned = cohorts.filter(c => c.academicMentorId === u.id).map(c => c.id);
      setTeacherCohorts(assigned);
    }
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const updated = await updateUser(editingUser.id, formData);
      if (editingUser.role === 'student') {
        setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      } else {
        setTeachers(prev => prev.map(t => t.id === updated.id ? updated : t));
        // Update cohorts
        for (const c of cohorts) {
          const wasAssigned = c.academicMentorId === editingUser.id;
          const isAssigned = teacherCohorts.includes(c.id);
          if (wasAssigned && !isAssigned) {
            await updateCohortMentor(c.id, { academicMentorId: null });
          } else if (!wasAssigned && isAssigned) {
            await updateCohortMentor(c.id, { academicMentorId: editingUser.id });
          }
        }
        const c = await getCohorts();
        setCohorts(c);
      }
      setEditingUser(null);
    } catch (err) {
      console.error('Failed to update user', err);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmReset = async () => {
    if (!resettingUser) return;
    try {
      await resetUserPassword(resettingUser.id);
      alert('Password reset successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setResettingUser(null);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivatingUser) return;
    try {
      const updated = await toggleUserStatus(deactivatingUser.id);
      if (deactivatingUser.role === 'student') {
        setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      } else {
        setTeachers(prev => prev.map(t => t.id === updated.id ? updated : t));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeactivatingUser(null);
    }
  };

  const currentData = activeTab === 'students' ? students : teachers;

  const { sortedData, sortConfig, requestSort } = useSortableTable<User>(currentData, [
    { key: 'name' },
    { 
      key: 'identifier', 
      sortFn: (a, b) => {
        if (activeTab === 'students') {
          return (a.prn || '').localeCompare(b.prn || '');
        }
        return (a.email || '').localeCompare(b.email || '');
      }
    },
    { 
      key: 'department',
      sortFn: (a, b) => {
        const deptA = a.department || '';
        const deptB = b.department || '';
        if (deptA !== deptB) return deptA.localeCompare(deptB);
        if (activeTab === 'students') {
          return (a.academicYear || '').localeCompare(b.academicYear || '');
        }
        return 0;
      }
    },
    {
      key: 'status',
      sortFn: (a, b) => {
        const aStatus = a.deactivated ? 1 : 0;
        const bStatus = b.deactivated ? 1 : 0;
        return aStatus - bStatus;
      }
    }
  ]);

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage students and teacher accounts across the institution.
          </p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-brand-800 pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-2 px-4 font-medium transition-colors border-b-2 ${
            activeTab === 'students' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Students ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`pb-2 px-4 font-medium transition-colors border-b-2 ${
            activeTab === 'teachers' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Teachers ({teachers.length})
        </button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading users...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-brand-900/50 border-b border-slate-200 dark:border-brand-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                  <th 
                    className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-brand-900 transition-colors"
                    onClick={() => requestSort('name')}
                  >
                    Name {renderSortIcon('name')}
                  </th>
                  <th 
                    className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-brand-900 transition-colors"
                    onClick={() => requestSort('identifier')}
                  >
                    {activeTab === 'students' ? 'PRN / Email' : 'Email'} {renderSortIcon('identifier')}
                  </th>
                  {activeTab === 'students' && (
                    <th 
                      className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-brand-900 transition-colors"
                      onClick={() => requestSort('department')}
                    >
                      Department / Cohort {renderSortIcon('department')}
                    </th>
                  )}
                  {activeTab === 'teachers' && (
                    <th 
                      className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-brand-900 transition-colors"
                      onClick={() => requestSort('department')}
                    >
                      Department {renderSortIcon('department')}
                    </th>
                  )}
                  <th 
                    className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-brand-900 transition-colors"
                    onClick={() => requestSort('status')}
                  >
                    Status {renderSortIcon('status')}
                  </th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((u, i) => (
                  <tr key={u.id || i} className="border-b border-slate-100 dark:border-brand-800/50 hover:bg-slate-50 dark:hover:bg-brand-900/30 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{u.name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {activeTab === 'students' ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{u.prn}</span>
                          <span className="text-xs">{u.email}</span>
                        </div>
                      ) : (
                        u.email
                      )}
                    </td>
                    {activeTab === 'students' && (
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        <div className="flex flex-col">
                          <span>{u.department}</span>
                          <span className="text-xs">{u.batch} {u.academicYear && `(${u.academicYear})`}</span>
                        </div>
                      </td>
                    )}
                    {activeTab === 'teachers' && (
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {u.department}
                      </td>
                    )}
                    <td className="p-4">
                      {u.deactivated ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          <UserX className="w-3 h-3" /> Deactivated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <UserCheck className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(u)}
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/50 rounded-lg transition-colors" title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setResettingUser(u)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/50 rounded-lg transition-colors" title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeactivatingUser(u)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors" title={u.deactivated ? "Reactivate" : "Deactivate"}
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No {activeTab} found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          title={`Edit ${editingUser.role === 'student' ? 'Student' : 'Teacher'}`}
        >
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            {editingUser.role === 'student' && (
              <>
                <div>
                  <Label>PRN (Immutable)</Label>
                  <Input value={formData.prn} disabled />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input 
                    value={formData.department} 
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Batch</Label>
                    <Input 
                      value={formData.batch} 
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Academic Year</Label>
                    <Select 
                      value={formData.academicYear} 
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    >
                      <option value="">Select Year...</option>
                      <option value="FY">FY</option>
                      <option value="SY">SY</option>
                      <option value="TY">TY</option>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {editingUser.role === 'teacher' && (
              <>
                <div>
                  <Label>Email (Immutable)</Label>
                  <Input value={formData.email} disabled />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input 
                    value={formData.department} 
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Assigned Cohorts</Label>
                  <div className="space-y-2 border border-slate-200 dark:border-brand-800 rounded-md p-3 max-h-[150px] overflow-y-auto">
                    {cohorts.map(c => (
                      <label key={c.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <input 
                          type="checkbox"
                          checked={teacherCohorts.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeacherCohorts([...teacherCohorts, c.id]);
                            } else {
                              setTeacherCohorts(teacherCohorts.filter(id => id !== c.id));
                            }
                          }}
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-600 bg-white dark:bg-brand-950 dark:border-brand-700"
                        />
                        {c.academicYear} - {c.department}
                      </label>
                    ))}
                    {cohorts.length === 0 && <span className="text-slate-500 text-sm">No cohorts available.</span>}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={saveEdit} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <Modal
          isOpen={true}
          onClose={() => setResettingUser(null)}
          title="Reset Password"
        >
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-300">
              Are you sure you want to reset the password for <strong>{resettingUser.name}</strong>? 
              This will reset their password to the system default and force them to change it on their next login.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setResettingUser(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmReset}>Reset Password</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Deactivate/Reactivate Modal */}
      {deactivatingUser && (
        <Modal
          isOpen={true}
          onClose={() => setDeactivatingUser(null)}
          title={deactivatingUser.deactivated ? 'Reactivate User' : 'Deactivate User'}
        >
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-300">
              {deactivatingUser.deactivated 
                ? `Are you sure you want to reactivate ${deactivatingUser.name}? They will be able to sign in again.`
                : `Are you sure you want to deactivate ${deactivatingUser.name}? This user will no longer be able to sign in.`}
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setDeactivatingUser(null)}>Cancel</Button>
              <Button variant={deactivatingUser.deactivated ? 'primary' : 'danger'} onClick={confirmDeactivate}>
                {deactivatingUser.deactivated ? 'Reactivate' : 'Deactivate'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
