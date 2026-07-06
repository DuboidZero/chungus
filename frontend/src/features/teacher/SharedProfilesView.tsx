/**
 * SharedProfilesView — Teacher's management page for all generated recruiter share links.
 * Shows status (Active / Expired / Revoked), included sections, student count,
 * and provides Copy / Open / Deactivate actions.
 */
import { useState, useEffect, useCallback } from 'react';
import { mockDriver } from '../../api/mock';
import { Card } from '../../shared/ui/card';
import {
  Copy, ExternalLink, XCircle, Check, Users, Calendar,
  Clock, Link2, Filter, FolderGit2, Code2, GraduationCap,
  Award, Briefcase, GitBranch,
} from 'lucide-react';

type BundleStatus = 'active' | 'expired' | 'revoked';
type FilterType = 'all' | BundleStatus;

interface BundleEntry {
  token: string;
  studentIds: string[];
  sections: string[];
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  status: string;
  studentCount: number;
}

const STATUS_CONFIG: Record<BundleStatus, { label: string; dot: string; bg: string; text: string }> = {
  active:  { label: 'Active',  dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  expired: { label: 'Expired', dot: 'bg-amber-500',   bg: 'bg-amber-50',    text: 'text-amber-700' },
  revoked: { label: 'Revoked', dot: 'bg-red-500',     bg: 'bg-red-50',      text: 'text-red-700' },
};

const SECTION_META: Record<string, { label: string; icon: typeof Users }> = {
  academics:    { label: 'Academics',     icon: GraduationCap },
  skills:       { label: 'Skills',        icon: Code2 },
  projects:     { label: 'Projects',      icon: FolderGit2 },
  certificates: { label: 'Certificates', icon: Award },
  experience:   { label: 'Experience',    icon: Briefcase },
  github:       { label: 'GitHub',        icon: GitBranch },
};

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',     label: 'All' },
  { key: 'active',  label: 'Active' },
  { key: 'expired', label: 'Expired' },
  { key: 'revoked', label: 'Revoked' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function truncateUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}/share/${u.pathname.split('/share/')[1]?.slice(0, 10)}…`;
  } catch {
    return url.slice(0, 40) + '…';
  }
}

export function SharedProfilesView() {
  const [bundles, setBundles] = useState<BundleEntry[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const all = mockDriver.listTeacherShareBundles();
    // Most recent first
    setBundles(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard?.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleOpen = (token: string) => {
    window.open(`${window.location.origin}/share/${token}`, '_blank');
  };

  const handleRevoke = async (token: string) => {
    setRevoking(token);
    mockDriver.revokeShareBundle(token);
    // Small delay for visual feedback
    await new Promise(r => setTimeout(r, 300));
    refresh();
    setRevoking(null);
  };

  const filtered = filter === 'all' ? bundles : bundles.filter(b => b.status === filter);

  const counts = {
    all: bundles.length,
    active: bundles.filter(b => b.status === 'active').length,
    expired: bundles.filter(b => b.status === 'expired').length,
    revoked: bundles.filter(b => b.status === 'revoked').length,
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-primary">Shared Profiles</h1>
        <p className="text-on-surface-variant mt-1">Manage all recruiter share links you've generated.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-on-surface-variant" />
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/50'
            }`}
          >
            {f.label}
            <span className="ml-1.5 opacity-70">({counts[f.key]})</span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <Link2 className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-on-surface">
              {bundles.length === 0 ? 'No shared links yet' : `No ${filter} links`}
            </h3>
            <p className="text-on-surface-variant mt-1 max-w-sm mx-auto">
              {bundles.length === 0
                ? 'Generate a recruiter link from the Share Profiles wizard to get started.'
                : 'Try a different filter to see other links.'}
            </p>
          </div>
        </Card>
      )}

      {/* Bundle cards */}
      <div className="grid gap-4">
        {filtered.map(bundle => {
          const st = STATUS_CONFIG[bundle.status as BundleStatus] ?? STATUS_CONFIG.active;
          const shareUrl = `${window.location.origin}/share/${bundle.token}`;
          const isCopied = copiedToken === bundle.token;
          const isRevoking = revoking === bundle.token;

          return (
            <Card key={bundle.token}>
              <div className="p-5 sm:p-6">
                {/* Top row: status + token */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium uppercase tracking-wide">Students</span>
                    </div>
                    <p className="text-lg font-bold text-on-surface">{bundle.studentCount}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium uppercase tracking-wide">Created</span>
                    </div>
                    <p className="text-sm font-semibold text-on-surface">{formatDate(bundle.createdAt)}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium uppercase tracking-wide">Expires</span>
                    </div>
                    <p className="text-sm font-semibold text-on-surface">
                      {bundle.expiresAt ? formatDate(bundle.expiresAt) : 'Never'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <Link2 className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium uppercase tracking-wide">Link</span>
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant truncate" title={shareUrl}>
                      {truncateUrl(shareUrl)}
                    </p>
                  </div>
                </div>

                {/* Sections included */}
                {bundle.sections && bundle.sections.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant mb-2">Sections Included</p>
                    <div className="flex flex-wrap gap-2">
                      {bundle.sections.map(sec => {
                        const meta = SECTION_META[sec];
                        if (!meta) return null;
                        const Icon = meta.icon;
                        return (
                          <span key={sec} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/50 text-xs font-medium text-on-surface-variant">
                            <Icon className="w-3 h-3" />
                            {meta.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-outline-variant/40">
                  <button
                    onClick={() => handleCopy(bundle.token)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => handleOpen(bundle.token)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open
                  </button>
                  {bundle.status === 'active' && (
                    <button
                      onClick={() => handleRevoke(bundle.token)}
                      disabled={isRevoking}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {isRevoking ? 'Revoking…' : 'Deactivate'}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
