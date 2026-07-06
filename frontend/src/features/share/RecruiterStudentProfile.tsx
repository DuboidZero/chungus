/**
 * RecruiterStudentProfile — Public recruiter-facing resume page.
 * Accessible at /share/:token/:studentId (no auth required).
 *
 * STRICTLY shows only hiring-relevant data.
 * NEVER shows: marks, grades, teacher notes, analytics, internal IDs.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, GitBranch, Globe, Link2, FileText, Star,
  Briefcase, Trophy, Code2, Globe2, FolderGit2,
  Calendar, MapPin, ExternalLink, AlertTriangle, GraduationCap,
  Award, Zap, Users,
} from 'lucide-react';
import { mockDriver } from '../../api/mock';
import { USE_MOCK } from '../../api/mock';
import { apiClient } from '../../api/client';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecruiterProject {
  id: string;
  name: string;
  description: string;
  domain: string;
  techStack: string[];
  status: string;
  type: string;
  githubRepo: string | null;
  liveUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  isFeatured: boolean;
}

interface RecruiterSkills {
  technical: { name: string; domain: string; proficiency: number }[];
  soft: { name: string; proficiency: number }[];
  languages: { name: string; proficiency: string | number }[];
}

interface RecruiterExperience {
  id: string;
  organisation: string;
  role: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string | null;
}

interface RecruiterAchievement {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  level: string;
  date: string | null;
  certificateUrl?: string;
}

interface RecruiterProfile {
  id: string;
  name: string;
  department: string;
  batch: string;
  avatar: string | null;
  cgpa: number | null;
  bio: string | null;
  domainInterest: string | null;
  github: string | null;
  portfolio: string | null;
  linkedin: string | null;
  resumePdf: string | null;
  projects: RecruiterProject[];
  skills: RecruiterSkills;
  experience: RecruiterExperience[];
  achievements: RecruiterAchievement[];
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchProfile(token: string, studentId: string): Promise<RecruiterProfile | null> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 500));
    return mockDriver.getRecruiterStudentProfile(token, studentId) as RecruiterProfile | null;
  }
  try {
    const res = await apiClient.get<RecruiterProfile>(`/share/${token}/${studentId}`);
    return res.data;
  } catch {
    return null;
  }
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function cgpaColor(cgpa: number) {
  if (cgpa >= 9) return 'text-emerald-600';
  if (cgpa >= 7) return 'text-amber-600';
  return 'text-red-600';
}

function proficiencyBar(level: number /* 1-5 */) {
  const pct = (level / 5) * 100;
  const color = level >= 4 ? 'bg-emerald-500' : level >= 3 ? 'bg-amber-400' : 'bg-orange-500';
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="h-1.5 flex-1 bg-surface-container-high rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-on-surface-variant/60 w-6 text-right">{level}/5</span>
    </div>
  );
}

function fmtDate(iso: string | null) {
  if (!iso) return 'Present';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function achievementTypeIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'hackathon': return <Zap className="w-4 h-4 text-purple-600" />;
    case 'award':     return <Award className="w-4 h-4 text-amber-600" />;
    case 'certificate': return <Trophy className="w-4 h-4 text-emerald-600" />;
    default:          return <Star className="w-4 h-4 text-primary" />;
  }
}

function experienceTypeColor(type: string) {
  switch (type?.toLowerCase()) {
    case 'internship': return 'bg-blue-100 text-blue-700';
    case 'job':        return 'bg-emerald-100 text-emerald-700';
    case 'volunteer':  return 'bg-purple-100 text-purple-700';
    default:           return 'bg-surface-container text-on-surface-variant';
  }
}

// ─── Main component ────────────────────────────────────────────────────────────

export function RecruiterStudentProfile() {
  const { token, studentId } = useParams<{ token: string; studentId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token || !studentId) return;
    setLoading(true);
    fetchProfile(token, studentId)
      .then(p => { if (!p) setNotFound(true); else setProfile(p); })
      .finally(() => setLoading(false));
  }, [token, studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-variant text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-6">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold text-on-surface">Profile not found</h1>
          <p className="text-on-surface-variant">This profile is not available in the shared bundle.</p>
          <button onClick={() => navigate(-1)} className="text-primary text-sm font-medium hover:underline">← Back to talent pool</button>
        </div>
      </div>
    );
  }

  const hasFeatured = profile.projects.some(p => p.isFeatured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-container-low">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(`/share/${token}`)}
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Talent Pool
          </button>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <GraduationCap className="w-3.5 h-3.5" />
            MIT-WPU Shared Profile
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Identity card ── */}
        <section className="bg-surface rounded-2xl border border-outline-variant/60 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary text-2xl font-bold shrink-0 overflow-hidden">
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                : initials(profile.name)
              }
            </div>

            {/* Core info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold text-on-surface">{profile.name}</h1>
                {profile.cgpa !== null && (
                  <span className={`text-2xl font-extrabold ${cgpaColor(profile.cgpa)}`}>
                    {profile.cgpa.toFixed(2)} CGPA
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.department}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Batch {profile.batch}</span>
                {profile.domainInterest && (
                  <span className="flex items-center gap-1"><Code2 className="w-3.5 h-3.5" />{profile.domainInterest}</span>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">{profile.bio}</p>
              )}

              {/* Social links */}
              <div className="flex flex-wrap gap-3 mt-4">
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-on-surface/40 transition-colors">
                    <GitBranch className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}
                {profile.portfolio && (
                  <a href={profile.portfolio} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-on-surface/40 transition-colors">
                    <Globe className="w-3.5 h-3.5" /> Portfolio
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors">
                    <Link2 className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
                {profile.resumePdf && (
                  <a href={profile.resumePdf} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-primary/40 text-primary hover:bg-primary-fixed/30 transition-colors">
                    <FileText className="w-3.5 h-3.5" /> Resume PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Projects ── */}
        {profile.projects.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FolderGit2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-on-surface">
                {hasFeatured ? 'Featured Projects' : 'Recent Projects'}
              </h2>
              {hasFeatured && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" fill="currentColor" /> Handpicked
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.projects.map(proj => (
                <div key={proj.id} className="bg-surface rounded-xl border border-outline-variant/60 p-5 space-y-3 hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-on-surface text-sm truncate">{proj.name}</h3>
                        {proj.isFeatured && <Star className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" />}
                      </div>
                      <p className="text-xs text-primary">{proj.domain}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.techStack.slice(0, 5).map(t => (
                      <span key={t} className="px-1.5 py-0.5 text-[10px] font-medium bg-surface-container rounded text-on-surface-variant">{t}</span>
                    ))}
                    {proj.techStack.length > 5 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-on-surface-variant/60">+{proj.techStack.length - 5}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 pt-1 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {fmtDate(proj.startDate)} → {fmtDate(proj.endDate)}
                    </span>
                    <div className="ml-auto flex gap-2">
                      {proj.githubRepo && (
                        <a href={proj.githubRepo} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors">
                          <GitBranch className="w-3.5 h-3.5" /> Code
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" /> Live
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Skills ── */}
        {(profile.skills.technical.length > 0 || profile.skills.soft.length > 0 || profile.skills.languages.length > 0) && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-on-surface">Skills</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Technical */}
              {profile.skills.technical.length > 0 && (
                <div className="bg-surface rounded-xl border border-outline-variant/60 p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Technical</h3>
                  {profile.skills.technical.map(sk => (
                    <div key={sk.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-on-surface">{sk.name}</span>
                        <span className="text-[10px] text-on-surface-variant/60">{sk.domain}</span>
                      </div>
                      {proficiencyBar(sk.proficiency)}
                    </div>
                  ))}
                </div>
              )}

              {/* Soft Skills */}
              {profile.skills.soft.length > 0 && (
                <div className="bg-surface rounded-xl border border-outline-variant/60 p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Soft Skills</h3>
                  {profile.skills.soft.map(sk => (
                    <div key={sk.name} className="space-y-1">
                      <span className="text-sm font-medium text-on-surface">{sk.name}</span>
                      {proficiencyBar(sk.proficiency)}
                    </div>
                  ))}
                </div>
              )}

              {/* Languages */}
              {profile.skills.languages.length > 0 && (
                <div className="bg-surface rounded-xl border border-outline-variant/60 p-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"><Globe2 className="w-3.5 h-3.5" /> Languages</h3>
                  {profile.skills.languages.map(sk => (
                    <div key={sk.name} className="flex items-center justify-between py-1 border-b border-outline-variant/30 last:border-0">
                      <span className="text-sm font-medium text-on-surface">{sk.name}</span>
                      <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">{sk.proficiency}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Experience ── */}
        {profile.experience.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-on-surface">Experience</h2>
            </div>
            <div className="space-y-3">
              {profile.experience.map(ex => (
                <div key={ex.id} className="bg-surface rounded-xl border border-outline-variant/60 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-on-surface">{ex.role}</h3>
                      <p className="text-sm text-primary font-medium">{ex.organisation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${experienceTypeColor(ex.type)}`}>
                        {ex.type}
                      </span>
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fmtDate(ex.startDate)} → {fmtDate(ex.endDate)}
                      </span>
                    </div>
                  </div>
                  {ex.description && (
                    <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{ex.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Achievements ── */}
        {profile.achievements.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-on-surface">Achievements</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.achievements.map(ach => (
                <div key={ach.id} className="bg-surface rounded-xl border border-outline-variant/60 p-4 flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                    {achievementTypeIcon(ach.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start gap-2">
                      <h3 className="font-semibold text-on-surface text-sm leading-tight">{ach.title}</h3>
                      {ach.certificateUrl && (
                        <a href={ach.certificateUrl} target="_blank" rel="noopener noreferrer"
                          className="shrink-0 text-primary hover:text-primary/70 transition-colors" title="View certificate">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium text-on-surface-variant capitalize">{ach.type}</span>
                      <span className="text-[10px] text-on-surface-variant/50">·</span>
                      <span className="text-[10px] text-on-surface-variant capitalize">{ach.level}</span>
                      {ach.date && (
                        <>
                          <span className="text-[10px] text-on-surface-variant/50">·</span>
                          <span className="text-[10px] text-on-surface-variant">{fmtDate(ach.date)}</span>
                        </>
                      )}
                    </div>
                    {ach.description && (
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{ach.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state for sparse profiles ── */}
        {profile.projects.length === 0 && profile.experience.length === 0 && profile.achievements.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">This student hasn't added portfolio data yet.</p>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-center py-4">
          <p className="text-xs text-on-surface-variant/50 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            Shared via MIT-WPU Student Portfolio System · Recruiter-only view
          </p>
        </div>

      </main>
    </div>
  );
}
