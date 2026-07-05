import { useState, useEffect } from 'react';
import { getAssignedStudents } from '../../api/services/teacher';
import type { StudentSummary } from '../../api/entities/teacher';
import { Card } from '../../shared/ui/card';
import { Skeleton } from '../../shared/ui/loading-skeleton';
import {
  Check, ChevronLeft, ChevronRight, Copy, GraduationCap, Code2,
  FolderGit2, Award, Briefcase, GitBranch, ShieldCheck, Link2, RotateCcw,
} from 'lucide-react';

const STEPS = ['Select Students', 'Choose Data', 'Generate Link'];

const DATA_OPTIONS = [
  { key: 'academics',    label: 'Academic Summary',       desc: 'Overall CGPA & percentile — detailed exam marks stay redacted.', icon: GraduationCap },
  { key: 'skills',       label: 'Skills & Proficiency',   desc: 'Technical and soft skills with Likert levels.',                   icon: Code2 },
  { key: 'projects',     label: 'Projects',               desc: 'Portfolio projects with live and repo links.',                    icon: FolderGit2 },
  { key: 'certificates', label: 'Certificates',           desc: 'Verified certifications and credentials.',                        icon: Award },
  { key: 'experience',   label: 'Internships & Experience', desc: 'Internships, jobs and co-curricular record.',                   icon: Briefcase },
  { key: 'github',       label: 'GitHub & Portfolio',     desc: 'Public code repositories and portfolio links.',                   icon: GitBranch },
] as const;

type DataKey = typeof DATA_OPTIONS[number]['key'];

export function ShareProfilesWizard() {
  const [step, setStep] = useState(0);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dataSel, setDataSel] = useState<Record<DataKey, boolean>>({
    academics: true, skills: true, projects: true, certificates: true, experience: true, github: false,
  });
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getAssignedStudents().then(setStudents).catch(console.error).finally(() => setLoading(false));
  }, []);

  const toggleStudent = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const dataCount = Object.values(dataSel).filter(Boolean).length;
  const canNext = step === 0 ? selected.size > 0 : step === 1 ? dataCount > 0 : true;

  const next = () => {
    if (step === 1) {
      const token = Math.random().toString(36).slice(2, 10);
      setLink(`https://portfolio.mitwpu.edu.in/share/${token}`);
    }
    setStep(s => Math.min(2, s + 1));
  };
  const back = () => setStep(s => Math.max(0, s - 1));
  const restart = () => { setStep(0); setSelected(new Set()); setLink(null); };

  const copy = () => {
    if (!link) return;
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-primary">Share Profiles Wizard</h1>
        <p className="text-on-surface-variant mt-1">Bundle verified student profiles into a secure, recruiter-friendly link.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-3 shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                i < step ? 'bg-primary-container text-on-primary'
                : i === step ? 'bg-primary-container text-on-primary'
                : 'border-2 border-outline-variant text-on-surface-variant'
              }`}>
                {i < step ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`text-sm font-semibold uppercase tracking-wide hidden sm:inline ${
                i <= step ? 'text-on-surface' : 'text-on-surface-variant'
              }`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-3 rounded-full ${i < step ? 'bg-primary-container' : 'bg-outline-variant/50'}`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <div className="p-6 sm:p-8 min-h-[22rem]">
          {/* ---- STEP 1: Select Students ---- */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Choose the Students</h2>
                  <p className="text-on-surface-variant mt-1">Select which student profiles you want to bundle for the recruiter.</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/60 text-sm font-medium text-on-surface-variant">Year 2024</span>
                  <span className="px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/60 text-sm font-medium text-on-surface-variant">All Divisions</span>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {students.map(s => {
                    const isSel = selected.has(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleStudent(s.id)}
                        className={`flex items-center justify-between gap-4 p-4 rounded-xl border text-left transition-all ${
                          isSel ? 'border-primary bg-primary-fixed/40 ring-1 ring-primary' : 'border-outline-variant/60 bg-surface-container-low hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                            {s.avatar ? <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface truncate">{s.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant">{s.prn}</span>
                              <span className="text-xs text-on-surface-variant">CGPA: {s.cgpa.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSel ? 'bg-primary-container border-primary-container' : 'border-outline-variant'
                        }`}>
                          {isSel && <Check className="w-4 h-4 text-on-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ---- STEP 2: Choose Data ---- */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Choose Data to Share</h2>
                <p className="text-on-surface-variant mt-1">Pick what the recruiter can see. Detailed continuous-assessment marks are always redacted.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DATA_OPTIONS.map(opt => {
                  const on = dataSel[opt.key];
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setDataSel(p => ({ ...p, [opt.key]: !p[opt.key] }))}
                      className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                        on ? 'border-primary bg-primary-fixed/40' : 'border-outline-variant/60 bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${on ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface">{opt.label}</p>
                        <p className="text-sm text-on-surface-variant mt-0.5">{opt.desc}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${on ? 'bg-primary-container border-primary-container' : 'border-outline-variant'}`}>
                        {on && <Check className="w-4 h-4 text-on-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/50">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-on-surface-variant">
                  The recruiter view is a redacted resume — internal exam itemisations (CCA/LCA) never appear, per institution policy.
                </p>
              </div>
            </div>
          )}

          {/* ---- STEP 3: Generate Link ---- */}
          {step === 2 && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Your secure link is ready</h2>
                  <p className="text-on-surface-variant">Anyone with this link can view the selected redacted profiles.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 pl-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <Link2 className="w-4 h-4 text-on-surface-variant shrink-0" />
                <input readOnly value={link ?? ''} className="flex-1 bg-transparent text-sm text-on-surface focus:outline-none truncate" />
                <button onClick={copy} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-sm font-medium transition-colors shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/50">
                  <p className="text-2xl font-bold text-primary">{selected.size}</p>
                  <p className="text-sm text-on-surface-variant">Students bundled</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/50">
                  <p className="text-2xl font-bold text-primary">{dataCount}</p>
                  <p className="text-sm text-on-surface-variant">Data categories</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/50">
                  <p className="text-2xl font-bold text-primary">30d</p>
                  <p className="text-sm text-on-surface-variant">Link expires in</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-outline-variant/50">
          {step > 0 && step < 2 ? (
            <button onClick={back} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <span />}

          {step < 2 ? (
            <button
              onClick={next}
              disabled={!canNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary-container hover:bg-primary text-on-primary font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {step === 1 ? 'Generate Link' : 'Next Step'} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={restart} className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-outline-variant text-on-surface hover:bg-surface-container font-medium transition-colors">
              <RotateCcw className="w-4 h-4" /> Share Another Bundle
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
