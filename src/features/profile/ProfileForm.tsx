import { useState, useRef } from 'react';
import { Camera, Mail, Phone, MapPin, Briefcase, ChevronDown, Save } from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/card';
import { Label } from '../../shared/ui/label';
import { Textarea } from '../../shared/ui/textarea';
import { Progress } from '../../shared/ui/progress';
import type { StudentProfileData, InternshipPreference } from './types';
import { calcCompletion, DOMAIN_OPTIONS } from './types';
import { uploadFile } from '../../api/services/upload';

interface Props {
  initial: StudentProfileData;
  name: string;
  department: string;
  onSave: (data: StudentProfileData) => void;
}

const PREF_OPTIONS: { value: InternshipPreference; label: string }[] = [
  { value: 'online',  label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'none',    label: 'No Preference' },
];

export function ProfileForm({ initial, name, department, onSave }: Props) {
  const [data, setData] = useState<StudentProfileData>(initial);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const completion = calcCompletion(data);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof StudentProfileData>(key: K, val: StudentProfileData[K]) =>
    setData(prev => ({ ...prev, [key]: val }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB.');
      return;
    }
    setUploadingAvatar(true);
    try {
      const url = await uploadFile(file);   // real Supabase URL
      set('avatarUrl', url);
    } catch (err) {
      console.error('Avatar upload failed', err);
      alert('Photo upload failed. Try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-on-surface">Complete your Profile</h1>
        <p className="text-on-surface-variant mt-1">
          Your profile is the foundation of your portfolio.
        </p>
      </div>

      {/* Completion bar */}
      <Card>
        <CardContent className="p-5">
          <Progress value={completion} showLabel />
          <p className="text-xs text-on-surface-variant mt-2">
            {completion < 50
              ? 'A few more details and your profile will stand out.'
              : completion < 80
              ? "You're more than halfway there — keep going!"
              : 'Almost complete! Fill in the last few fields.'}
          </p>
        </CardContent>
      </Card>

      {/* ── Section: Personal ── */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-on-surface">Personal</h2>
          </div>

          {/* Avatar placeholder */}
          <div className="flex items-center gap-5">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-white shadow-sm" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-2xl font-bold text-white shrink-0">
                {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <div>
              <p className="font-semibold text-on-surface">{name}</p>
              <p className="text-sm text-on-surface-variant">{department}</p>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="mt-2 text-xs text-primary hover:underline font-medium disabled:opacity-50"
              >
                {uploadingAvatar ? 'Uploading...' : 'Upload photo'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* About Me */}
          <div>
            <Label htmlFor="aboutMe">About Me</Label>
            <Textarea
              id="aboutMe"
              rows={4}
              placeholder="Write a short bio — your interests, goals, and what drives you..."
              value={data.aboutMe ?? ''}
              onChange={e => set('aboutMe', e.target.value.slice(0, 500))}
            />
            <p className={`text-xs mt-1 text-right transition-colors ${(data.aboutMe ?? '').length >= 450 ? 'text-amber-500' : 'text-on-surface-variant/70'}`}>
              {(data.aboutMe ?? '').length} / 500
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Section: Contact ── */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-on-surface">Contact</h2>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
              <input
                id="email"
                type="email"
                placeholder="your.email@mitwpu.edu.in"
                value={data.email ?? ''}
                onChange={e => set('email', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-outline-variant bg-white text-on-surface placeholder:text-on-surface-variant/70 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
              <input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={data.phone ?? ''}
                onChange={e => set('phone', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-outline-variant bg-white text-on-surface placeholder:text-on-surface-variant/70 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
              <input
                id="location"
                type="text"
                placeholder="Pune, Maharashtra"
                value={data.location ?? ''}
                onChange={e => set('location', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-outline-variant bg-white text-on-surface placeholder:text-on-surface-variant/70 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section: Domain Interest ── */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-on-surface">Domain Interest</h2>
          </div>
          <div>
            <Label htmlFor="domainInterest">Primary Domain</Label>
            <p className="text-xs text-on-surface-variant mb-2">
              Your main area of technical interest. This helps your teacher understand your goals.
            </p>
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70 pointer-events-none" />
              <select
                id="domainInterest"
                value={data.domainInterest ?? ''}
                onChange={e => set('domainInterest', e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-9 rounded-lg border border-outline-variant bg-white text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="">Select your primary domain...</option>
                {DOMAIN_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section: Internship Preferences ── */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-on-surface">Internship Preferences</h2>
          </div>

          {/* Toggle buttons */}
          <div>
            <Label>Preferred Mode</Label>
            <div className="flex gap-2">
              {PREF_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('internshipPreference', opt.value)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
                    data.internshipPreference === opt.value
                      ? 'bg-primary-container border-primary text-white shadow-sm'
                      : 'bg-white border-outline-variant text-on-surface-variant hover:border-outline-variant'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progressive disclosure — only show if Offline */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              data.internshipPreference === 'offline' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="pt-1">
              <Label htmlFor="radius">
                <MapPin className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                Preferred Radius
              </Label>
              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70 pointer-events-none" />
                <select
                  id="radius"
                  value={data.preferredRadius ?? ''}
                  onChange={e => set('preferredRadius', e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 pr-9 rounded-lg border border-outline-variant bg-white text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                >
                  <option value="">Select radius...</option>
                  <option value="5km">Within 5 km</option>
                  <option value="10km">Within 10 km</option>
                  <option value="25km">Within 25 km</option>
                  <option value="50km">Within 50 km</option>
                  <option value="anywhere">Anywhere in city</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <button
        onClick={() => onSave(data)}
        disabled={uploadingAvatar}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary-container hover:bg-primary text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        Save Profile
      </button>
    </div>
  );
}