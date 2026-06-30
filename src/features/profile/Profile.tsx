import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/useAuth';
import { ProfileForm } from './ProfileForm';
import { ProfileView } from './ProfileView';
import type { StudentProfileData } from './types';
import { getProfile, updateProfile } from '../../api/services/profile';
import { Skeleton } from '../../shared/ui/loading-skeleton';

/**
 * Generator for a pristine profile state.
 * Auth email is automatically hydrated to encourage completion flow.
 */
const EMPTY_PROFILE = (email: string): StudentProfileData => ({
  aboutMe: '',
  email,
  phone: '',
  location: '',
  internshipPreference: 'none',
  preferredRadius: '',
});

export function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<StudentProfileData>(
    EMPTY_PROFILE(user?.email ?? '')
  );
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    getProfile()
      .then(res => {
        setProfileData(res as unknown as StudentProfileData);
        // If they have a profile, default to view mode instead of edit mode
        if (res && res.aboutMe !== '') {
          setIsEditing(false);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const handleSave = async (data: StudentProfileData) => {
      try {
        const saved = await updateProfile(data);
        setProfileData(saved as unknown as StudentProfileData);
        setIsEditing(false);
      } catch (err) {
        console.error('Failed to save profile', err);
      }
    };

  return isEditing ? (
    <ProfileForm
      initial={profileData}
      name={user.name}
      department={user.department ?? ''}
      onSave={handleSave}
    />
  ) : (
    <ProfileView
      data={profileData}
      name={user.name}
      department={user.department ?? ''}
      onEdit={() => setIsEditing(true)}
    />
  );
}
