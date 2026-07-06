/**
 * RecruiterLanding — Public recruiter-facing talent pool page.
 * Accessible at /share/:token (no auth required).
 *
 * Shows a searchable, filterable list of students in the bundle.
 */
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, ArrowUpDown, Star, Briefcase,
  GraduationCap, Users, ArrowRight, AlertTriangle, Building2
} from 'lucide-react';
import { mockDriver } from '../../api/mock';
import { USE_MOCK } from '../../api/mock';
import { apiClient } from '../../api/client';

interface BundleStudent {
  id: string;
  name: string;
  department: string;
  batch: string;
  avatar: string | null;
  cgpa: number | null;
  topSkills: string[];
  featuredProjectCount: number;
  hasExperience: boolean;
}

interface Bundle {
  token: string;
  createdAt: string;
  expiresAt: string;
  studentCount: number;
  students: BundleStudent[];
}

type SortKey = 'name' | 'cgpa' | 'projects';

async function fetchBundle(token: string): Promise<Bundle | null> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    return mockDriver.getShareBundle(token) as Bundle | null;
  }
  try {
    const res = await apiClient.get<Bundle>(`/share/${token}`);
    return res.data;
  } catch {
    return null;
  }
}

function cgpaColor(cgpa: number) {
  if (cgpa >= 9) return 'text-emerald-600';
  if (cgpa >= 7) return 'text-amber-600';
  return 'text-red-600';
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function RecruiterLanding() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('cgpa');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterExp, setFilterExp] = useState(false);
  const [filterFeatured, setFilterFeatured] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchBundle(token)
      .then(b => {
        if (!b) setNotFound(true);
        else setBundle(b);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const displayed = useMemo(() => {
    if (!bundle) return [];
    let list = [...bundle.students];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.topSkills.some(sk => sk.toLowerCase().includes(q)),
      );
    }
    if (filterExp) list = list.filter(s => s.hasExperience);
    if (filterFeatured) list = list.filter(s => s.featuredProjectCount > 0);

    list.sort((a, b) => {
      let val = 0;
      if (sortKey === 'cgpa') val = (b.cgpa ?? 0) - (a.cgpa ?? 0);
      if (sortKey === 'name') val = a.name.localeCompare(b.name);
      if (sortKey === 'projects') val = b.featuredProjectCount - a.featuredProjectCount;
      return sortAsc ? -val : val;
    });

    return list;
  }, [bundle, search, sortKey, sortAsc, filterExp, filterFeatured]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(false); }
  };

  const expiryDate = bundle ? new Date(bundle.expiresAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-variant text-sm">Loading talent pool…</p>
        </div>
      </div>
    );
  }

  if (notFound || !bundle) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-6">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold text-on-surface">Link not found</h1>
          <p className="text-on-surface-variant">This share link is invalid or has expired. Please contact the person who shared it with you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-container-low">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-on-surface leading-none">MIT-WPU Talent Pool</h1>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Shared profile bundle · Expires {expiryDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Users className="w-4 h-4" />
            <span className="font-semibold text-on-surface">{bundle.studentCount}</span> students
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ── Controls ── */}
        <div className="bg-surface rounded-2xl border border-outline-variant/60 p-4 space-y-4 shadow-sm">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, department, or skill…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
          </div>

          {/* Sort + Filters row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
            </div>

            {/* Filter chips */}
            <button
              onClick={() => setFilterExp(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterExp ? 'bg-primary-container border-primary text-primary' : 'bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              <Briefcase className="w-3 h-3" /> Has Experience
            </button>

            <button
              onClick={() => setFilterFeatured(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterFeatured ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              <Star className="w-3 h-3" /> Has Featured Projects
            </button>

            <div className="ml-auto flex items-center gap-1.5 text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </div>

            {(['cgpa', 'name', 'projects'] as SortKey[]).map(key => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${sortKey === key ? 'bg-primary-container border-primary text-primary' : 'bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {key === 'cgpa' ? 'CGPA' : key === 'name' ? 'Name' : 'Projects'}
                {sortKey === key && <span className="ml-1">{sortAsc ? '↑' : '↓'}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results count ── */}
        <p className="text-sm text-on-surface-variant px-1">
          Showing <span className="font-semibold text-on-surface">{displayed.length}</span> of {bundle.studentCount} students
        </p>

        {/* ── Student cards ── */}
        {displayed.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">
            <p className="font-medium">No students match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map(student => (
              <button
                key={student.id}
                onClick={() => navigate(`/share/${token}/${student.id}`)}
                className="group text-left bg-surface rounded-2xl border border-outline-variant/60 p-5 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {/* Top row: avatar + name + CGPA */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden">
                    {student.avatar
                      ? <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                      : initials(student.name)
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-on-surface text-sm leading-tight group-hover:text-primary transition-colors truncate">
                      {student.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant truncate">{student.department} · {student.batch}</p>
                  </div>
                  {student.cgpa !== null && (
                    <span className={`text-xl font-extrabold shrink-0 ${cgpaColor(student.cgpa)}`}>
                      {student.cgpa.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Top Skills */}
                {student.topSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {student.topSkills.map(sk => (
                      <span key={sk} className="px-2 py-0.5 text-[11px] font-medium bg-surface-container rounded text-on-surface-variant">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {student.featuredProjectCount > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Star className="w-3 h-3" fill="currentColor" />
                      {student.featuredProjectCount} Featured Project{student.featuredProjectCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {student.hasExperience && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Building2 className="w-3 h-3" /> Experienced
                    </span>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-end mt-3 text-on-surface-variant/40 group-hover:text-primary transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
