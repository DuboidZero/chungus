import { useState, useEffect } from 'react';
import { UserX, UserCheck, KeyRound, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Modal } from '../../../shared/ui/modal';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Select } from '../../../shared/ui/select';
import { getTeachers, getStudents, updateUser, resetUserPassword, toggleUserStatus } from '../../../api/services/users';
import { getCohorts, updateCohortMentor } from '../../../api/services/admin';
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
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

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
      const s = await getStudents();
      setStudents(s as any);
      let c: any[] = [];
      try { c = await getCohorts(); } catch { c = []; }
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
        setStudents(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
      } else {
        setTeachers(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
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
        const refreshed = await getCohorts();
        setCohorts(refreshed);
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
    setIsResetting(true);
    try {
      const temp = await resetUserPassword(resettingUser.id);
      setTempPassword(temp);   // keep modal open, show the password
    } catch (err) {
      console.error(err);
      alert('Failed to reset password.');
      setResettingUser(null);
    } finally {
      setIsResetting(false);
    }
  };

  const closeResetModal = () => {
    setResettingUser(null);
    setTempPassword(null);
  };

  const confirmDeactivate = async () => {
    if (!deactivatingUser) return;
    try {
      const updated = await toggleUserStatus(deactivatingUser.id);
      if (deactivatingUser.role === 'student') {
        setStudents(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
      } else {
        setTeachers(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
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
          <h1 className="text-2xl font-bold text-on-surface">User Management</h1>
          <p className="text-on-surface-variant mt-1">
            Manage students and teacher accounts across the institution.
          </p>
        </div>
        {/* Add User deferred — students onboard via Bulk Import; single-user add TBD */}
      </div>

      <div className="flex gap-4 border-b border-outline-variant pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-2 px-4 font-medium transition-colors border-b-2 ${
            activeTab === 'students'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Students ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`pb-2 px-4 font-medium transition-colors border-b-2 ${
            activeTab === 'teachers'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Teachers ({teachers.length})
        </button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-on-surface-variant">Loading users...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-xs uppercase font-semibold text-on-surface-variant">
                  <th
                    className="p-4 cursor-pointer hover:bg-surface-container transition-colors"
                    onClick={() => requestSort('name')}
                  >
                    Name {renderSortIcon('name')}
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-surface-container transition-colors"
                    onClick={() => requestSort('identifier')}
                  >
                    {activeTab === 'students' ? 'PRN / Email' : 'Email'} {renderSortIcon('identifier')}
                  </th>
                  {activeTab === 'students' && (
                    <th
                      className="p-4 cursor-pointer hover:bg-surface-container transition-colors"
                      onClick={() => requestSort('department')}
                    >
                      Department / Cohort {renderSortIcon('department')}
                    </th>
                  )}
                  {activeTab === 'teachers' && (
                    <th
                      className="p-4 cursor-pointer hover:bg-surface-container transition-colors"
                      onClick={() => requestSort('department')}
                    >
                      Department {renderSortIcon('department')}
                    </th>
                  )}
                  <th
                    className="p-4 cursor-pointer hover:bg-surface-container transition-colors"
                    onClick={() => requestSort('status')}
                  >
                    Status {renderSortIcon('status')}
                  </th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((u, i) => (
                  <tr key={u.id || i} className="border-b border-outline-variant/40 hover:bg-surface-container transition-colors">
                    <td className="p-4 font-medium text-on-surface">{u.name}</td>
                    <td className="p-4 text-on-surface-variant">
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
                      <td className="p-4 text-on-surface-variant">
                        <div className="flex flex-col">
                          <span>{u.department}</span>
                          <span className="text-xs">{u.batch} {u.academicYear && `(${u.academicYear})`}</span>
                        </div>
                      </td>
                    )}
                    {activeTab === 'teachers' && (
                      <td className="p-4 text-on-surface-variant">
                        {u.department}
                      </td>
                    )}
                    <td className="p-4">
                      {u.deactivated ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <UserX className="w-3 h-3" /> Deactivated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <UserCheck className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="p-2 text-on-surface-variant/70 hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors" title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setResettingUser(u)}
                          className="p-2 text-on-surface-variant/70 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeactivatingUser(u)}
                          className="p-2 text-on-surface-variant/70 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title={u.deactivated ? "Reactivate" : "Deactivate"}
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">
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
                  <div className="space-y-2 border border-outline-variant rounded-md p-3 max-h-[150px] overflow-y-auto">
                    {cohorts.map(c => (
                      <label key={c.id} className="flex items-center gap-2 text-sm text-on-surface-variant">
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
                          className="rounded border-outline-variant text-primary focus:ring-primary bg-white"
                        />
                        {c.academicYear} - {c.department}
                      </label>
                    ))}
                    {cohorts.length === 0 && <span className="text-on-surface-variant text-sm">No cohorts available.</span>}
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
          onClose={closeResetModal}
          title="Reset Password"
        >
          <div className="space-y-4">
            {tempPassword ? (
              <>
                <p className="text-on-surface-variant">
                  Password for <strong>{resettingUser.name}</strong> has been reset. Share this temporary
                  password with them — it won't be shown again:
                </p>
                <div className="flex items-center gap-2 p-3 bg-surface-container border border-outline-variant rounded-lg">
                  <code className="flex-1 text-lg font-mono text-on-surface break-all">{tempPassword}</code>
                  <Button variant="outline" onClick={() => navigator.clipboard.writeText(tempPassword)}>Copy</Button>
                </div>
                <p className="text-xs text-on-surface-variant">The user will be asked to change it on their next login.</p>
                <div className="flex justify-end mt-6">
                  <Button onClick={closeResetModal}>Done</Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-on-surface-variant">
                  Are you sure you want to reset the password for <strong>{resettingUser.name}</strong>?
                  A new temporary password will be generated and shown to you once.
                </p>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={closeResetModal}>Cancel</Button>
                  <Button variant="danger" onClick={confirmReset} disabled={isResetting}>
                    {isResetting ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </>
            )}
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
            <p className="text-on-surface-variant">
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