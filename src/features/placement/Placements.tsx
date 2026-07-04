import { Card } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import { Progress } from '../../shared/ui/progress';
import {
  Briefcase, TrendingUp, CheckCircle2, Clock, Download, Zap,
  Megaphone, Database, Code2, BrainCircuit,
} from 'lucide-react';

const STATS = [
  { label: 'Applications Sent', value: '8',  hint: '+2 this week',       icon: Briefcase,    tone: 'text-primary' },
  { label: 'Interviews',        value: '3',  hint: '1 upcoming',         icon: Clock,        tone: 'text-primary' },
  { label: 'Offers',            value: '1',  hint: 'Review pending',     icon: CheckCircle2, tone: 'text-emerald-600' },
  { label: 'Placement Rank',    value: 'Top 10%', hint: 'in your batch', icon: TrendingUp,   tone: 'text-primary' },
];

const RECOMMENDED = [
  { role: 'Senior UI Architect', company: 'Lumina Tech Systems', location: 'Remote', type: 'Full Time', icon: Code2,        skills: ['React', 'Tailwind', 'TypeScript'] },
  { role: 'Data Science Intern', company: 'Nexa Global Analytics', location: 'Pune', type: 'Internship', icon: Database,     skills: ['Python', 'SQL', 'Pandas'] },
];

const APPLICATIONS = [
  { company: 'CloudScale Solutions', role: 'DevOps Engineer', status: 'Interviewing', next: 'Technical Round (Nov 24)', variant: 'primary' as const },
  { company: 'Vanguard Design',      role: 'UX Designer',     status: 'Applied',      next: 'Awaiting feedback',       variant: 'info' as const },
  { company: 'BlueStar Fintech',     role: 'Systems Analyst', status: 'Offered',      next: 'Review contract',         variant: 'success' as const },
];

const ANNOUNCEMENTS = [
  { title: 'Mock Interview Week',   body: 'Slots open for final-year students. Register by Monday.', time: '2h ago' },
  { title: 'Resume Workshop',       body: 'Mandatory session for summer internship aspirants.',      time: '1d ago' },
  { title: 'Deadline: Nexa Global', body: 'Applications for Nexa close today at 6:00 PM.',            time: '5h ago' },
];

const MASTERY = [
  { label: 'Web Fundamentals', value: 85 },
  { label: 'Algorithms & Logic', value: 62 },
];

export function Placements() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Placements</h1>
          <p className="text-on-surface-variant mt-1">Explore opportunities and track your applications through smart career mapping.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-primary-container hover:bg-primary text-on-primary font-semibold transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Export Resume
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Card key={s.label}>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{s.label}</p>
                <s.icon className={`w-5 h-5 ${s.tone}`} />
              </div>
              <p className="text-3xl font-bold text-on-surface mt-3">{s.value}</p>
              <p className="text-xs text-on-surface-variant mt-1">{s.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recommended */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-on-surface">Recommended for Your Skills</h2>
                <button className="text-sm font-medium text-primary hover:text-primary-container">View All</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {RECOMMENDED.map(job => (
                  <div key={job.role} className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-4 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                        <job.icon className="w-5 h-5" />
                      </div>
                      <Badge variant="default">{job.type}</Badge>
                    </div>
                    <p className="font-semibold text-on-surface">{job.role}</p>
                    <p className="text-sm text-on-surface-variant">{job.company} · {job.location}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills.map(sk => (
                        <span key={sk} className="text-xs px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">{sk}</span>
                      ))}
                    </div>
                    <button className="mt-4 w-full py-2 rounded-md border border-primary text-primary hover:bg-primary-fixed/50 text-sm font-medium transition-colors">
                      Quick Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Application tracker */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-bold text-on-surface mb-4">Active Application Tracker</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/50">
                      <th className="pb-3 font-semibold">Company</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Next Step</th>
                    </tr>
                  </thead>
                  <tbody>
                    {APPLICATIONS.map(a => (
                      <tr key={a.company} className="border-b border-outline-variant/30 last:border-0">
                        <td className="py-3 font-medium text-on-surface">{a.company}</td>
                        <td className="py-3 text-on-surface-variant">{a.role}</td>
                        <td className="py-3"><Badge variant={a.variant}>{a.status}</Badge></td>
                        <td className="py-3 text-on-surface-variant">{a.next}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-on-surface">T&amp;P Announcements</h2>
              </div>
              <div className="space-y-3">
                {ANNOUNCEMENTS.map(a => (
                  <div key={a.title} className="p-3 rounded-xl bg-surface-container-low border-l-2 border-primary-container">
                    <p className="font-semibold text-on-surface text-sm">{a.title}</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">{a.body}</p>
                    <p className="text-xs text-on-surface-variant/70 mt-1">Posted {a.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-bold text-on-surface mb-1">Skill Mastery</h2>
              <p className="text-sm text-on-surface-variant mb-4">Complete assessments to unlock higher-tier roles.</p>
              <div className="space-y-4">
                {MASTERY.map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-on-surface">{m.label}</span>
                      <span className="font-semibold text-primary">{m.value}%</span>
                    </div>
                    <Progress value={m.value} />
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 rounded-xl bg-primary-fixed/50 flex items-center gap-3">
                <BrainCircuit className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-primary-fixed-variant">Next Challenge</p>
                  <p className="text-sm font-medium text-on-surface truncate">Software Engineering Ethics</p>
                </div>
                <Zap className="w-4 h-4 text-primary ml-auto shrink-0" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
