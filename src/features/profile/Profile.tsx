import { useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { ProfileForm } from './ProfileForm';
import { ProfileView } from './ProfileView';
import type { StudentProfileData } from './types';

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
  /** Mode toggle: Default to editing if profile is empty to encourage onboarding. */
  const [isEditing, setIsEditing] = useState(true);

  if (!user) return null;

  const handleSave = (data: StudentProfileData) => {
    setProfileData(data);
    setIsEditing(false);
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
