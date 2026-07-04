import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { getCohorts, updateCohortMentor } from '../../../api/services/admin';
import { getTeachers } from '../../../api/services/users';
import type { Cohort } from '../../../api/entities/cohort';

export function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track selected mentor per cohort id
  const [selectedMentors, setSelectedMentors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, 'success' | 'error'>>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [c, t] = await Promise.all([getCohorts(), getTeachers()]);
        setCohorts(c);
        setTeachers(t);
        
        // Initialize selected mentors
        const initialSelections: Record<string, string> = {};
        c.forEach(cohort => {
          if (cohort.academicMentorId) {
            initialSelections[cohort.id] = cohort.academicMentorId;
          }
        });
        setSelectedMentors(initialSelections);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMentorChange = (cohortId: string, mentorId: string) => {
    setSelectedMentors(prev => ({ ...prev, [cohortId]: mentorId }));
    setSaveStatus(prev => ({ ...prev, [cohortId]: undefined as any })); // Clear status
  };

  const handleSave = async (cohortId: string) => {
    const mentorId = selectedMentors[cohortId];
    if (!mentorId) return;

    setIsSaving(prev => ({ ...prev, [cohortId]: true }));
    try {
      const updated = await updateCohortMentor(cohortId, { academicMentorId: mentorId });
      setCohorts(prev => prev.map(c => c.id === cohortId ? updated : c));
      setSaveStatus(prev => ({ ...prev, [cohortId]: 'success' }));
      setTimeout(() => setSaveStatus(prev => ({ ...prev, [cohortId]: undefined as any })), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus(prev => ({ ...prev, [cohortId]: 'error' }));
    } finally {
      setIsSaving(prev => ({ ...prev, [cohortId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cohort Management</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Assign Academic Mentors to student cohorts. Students inherit their mentor from their assigned cohort.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Loading cohorts...</div>
        ) : (
          cohorts.map((cohort) => (
            <Card key={cohort.id} className="flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {cohort.academicYear} {cohort.department}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Students: {cohort.studentCount}
                  </p>
                </div>

                <div className="mt-auto space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Academic Mentor
                  </label>
                  <select
                    value={selectedMentors[cohort.id] || ''}
                    onChange={(e) => handleMentorChange(cohort.id, e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-surface-container-lowest border border-slate-300 dark:border-outline-variant rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a Mentor...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex-1">
                      {saveStatus[cohort.id] === 'success' && (
                        <span className="flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Saved
                        </span>
                      )}
                      {saveStatus[cohort.id] === 'error' && (
                        <span className="flex items-center text-xs text-red-600 dark:text-red-400">
                          <AlertCircle className="w-3 h-3 mr-1" /> Error
                        </span>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => handleSave(cohort.id)}
                      disabled={isSaving[cohort.id] || selectedMentors[cohort.id] === cohort.academicMentorId}
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving[cohort.id] ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        
        {!isLoading && cohorts.length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-500">
            No cohorts found. Please use the Bulk Upload center to import students and create cohorts.
          </div>
        )}
      </div>
    </div>
  );
}
