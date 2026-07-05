/** Read-only profile view — sections reveal on scroll (see Reveal). */
import { Mail, Phone, MapPin, Briefcase, Edit2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import { Progress } from '../../shared/ui/progress';
import { Reveal } from '../../shared/ui/Reveal';
import type { StudentProfileData } from './types';
import { calcCompletion } from './types';

interface Props {
  data: StudentProfileData;
  name: string;
  department: string;
  batch?: string;
  academicYear?: string;
  academicMentorName?: string | null;
  onEdit: () => void;
}

export function ProfileView({ data, name, department, batch, academicYear, academicMentorName, onEdit }: Props) {
  const completion = calcCompletion(data);
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const prefLabel: Record<string, string> = {
    online:  'Online',
    offline: 'Offline',
    none:    'No Preference',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hero card */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-5 min-w-0">
              {/* Avatar */}
              {data.avatarUrl ? (
                <img src={data.avatarUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-white shadow-sm shadow-primary/20" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-lg shadow-primary/20">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-on-surface">{name}</h1>
                <p className="text-on-surface-variant mt-0.5">
                  {department}
                  {batch && ` • Batch ${batch}`}
                  {academicYear && ` • ${academicYear}`}
                </p>
                {academicMentorName && (
                  <p className="text-primary mt-1 text-sm font-medium">
                    Academic Mentor: {academicMentorName}
                  </p>
                )}

                {/* Quick contact chips */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {data.email && (
                    <span className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full max-w-full">
                      <Mail className="w-3 h-3 shrink-0" /> <span className="break-all">{data.email}</span>
                    </span>
                  )}
                  {data.location && (
                    <span className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
                      <MapPin className="w-3 h-3" /> {data.location}
                    </span>
                  )}
                  {data.phone && (
                    <span className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
                      <Phone className="w-3 h-3" /> {data.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit button */}
            <button
              onClick={onEdit}
              className="press flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-surface-container-low border border-outline-variant transition-colors shrink-0"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>

          {/* Completion bar in hero */}
          <div className="mt-6 pt-6 border-t border-outline-variant/40">
            <Progress value={completion} showLabel />
          </div>
        </CardContent>
      </Card>

      {/* About Me */}
      {data.aboutMe && (
        <Reveal>
          <Card>
            <CardHeader><CardTitle>About Me</CardTitle></CardHeader>
            <CardContent className="pb-6">
              <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {data.aboutMe}
              </p>
            </CardContent>
          </Card>
        </Reveal>
      )}

      {/* Contact */}
      <Reveal delay={60}>
      <Card>
        <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
        <CardContent className="pb-6">
          <dl className="space-y-4">
            <Row icon={Mail} label="Email">
              <span className="text-on-surface break-all">{data.email}</span>
              <Badge variant="success" className="ml-2 shrink-0">
                <CheckCircle className="w-3 h-3 mr-1" />Verified
              </Badge>
            </Row>
            {data.phone ? (
              <Row icon={Phone} label="Phone">
                <span className="text-on-surface">{data.phone}</span>
              </Row>
            ) : (
              <Row icon={Phone} label="Phone">
                <button onClick={onEdit} className="text-sm text-primary hover:underline">Add phone number</button>
              </Row>
            )}
            {data.location ? (
              <Row icon={MapPin} label="Location">
                <span className="text-on-surface">{data.location}</span>
              </Row>
            ) : (
              <Row icon={MapPin} label="Location">
                <button onClick={onEdit} className="text-sm text-primary hover:underline">Add location</button>
              </Row>
            )}
          </dl>
        </CardContent>
      </Card>
      </Reveal>

      {/* Internship Preferences */}
      <Reveal delay={120}>
      <Card>
        <CardHeader><CardTitle>Internship Preferences</CardTitle></CardHeader>
        <CardContent className="pb-6">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-on-surface-variant/70" />
              <span className="text-sm text-on-surface-variant">Mode:</span>
              <Badge variant={data.internshipPreference === 'none' ? 'info' : 'default'}>
                {prefLabel[data.internshipPreference] ?? 'Not set'}
              </Badge>
            </div>
            {data.internshipPreference === 'offline' && data.preferredRadius && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-on-surface-variant/70" />
                <span className="text-sm text-on-surface-variant">Radius:</span>
                <Badge variant="info">{data.preferredRadius}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </Reveal>
    </div>
  );
}

function Row({ icon: Icon, label, children }: {
  icon: typeof Mail; label: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <dt className="flex items-center gap-2 text-sm text-on-surface-variant w-24 shrink-0">
        <Icon className="w-4 h-4" />
        {label}
      </dt>
      <dd className="flex flex-wrap items-center text-sm min-w-0">{children}</dd>
    </div>
  );
}
