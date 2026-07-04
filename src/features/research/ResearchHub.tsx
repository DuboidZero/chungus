import { Card } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import {
  FlaskConical, FilePlus2, ChevronRight, BookOpen, CalendarClock,
  Clock, TrendingUp, CreditCard, FileCheck, Plus,
} from 'lucide-react';

const STATS = [
  { label: 'Active Projects',      value: '24',    hint: '+3 this month',    icon: FlaskConical, tone: 'text-primary' },
  { label: 'Total Funding',        value: '$1.4M', hint: 'Across 5 grants',  icon: CreditCard,   tone: 'text-primary' },
  { label: 'Pending Peer Reviews', value: '12',    hint: 'Due this week',    icon: FileCheck,    tone: 'text-primary' },
  { label: 'Success Rate',         value: '88%',   hint: 'High performance', icon: TrendingUp,   tone: 'text-emerald-600' },
];

const PROJECTS = [
  { title: 'Cognitive Load Analysis in VR Learning', status: 'In Progress', variant: 'primary' as const, tags: ['Psychology', 'Human-Computer Interaction'], lead: 'Dr. Elena Vance', funding: '$450k', progress: 65, cta: 'View Details' },
  { title: 'Renewable Bio-Polymers for Urban Use',   status: 'Peer Review', variant: 'info' as const,    tags: ['Sustainability', 'Materials Science'],       lead: 'Prof. Julian Marsh', funding: '$1.2M', progress: 82, cta: 'View Details' },
  { title: 'Quantum Tunneling in 2D Semiconductors', status: 'Published',   variant: 'success' as const, tags: ['Quantum Physics', 'Nanotechnology'],         lead: 'Dr. Sarah Kong',    funding: '$800k', progress: 100, cta: 'Read Paper' },
];

const GRANTS = [
  { mon: 'OCT', day: '24', title: 'National Science Foundation (NSF)', sub: 'Core Research Fellowship', left: '4 Days Remaining', urgent: true },
  { mon: 'NOV', day: '12', title: 'TechInnovation Grant 2024',        sub: 'Industrial Partnership',    left: '22 Days Remaining', urgent: false },
  { mon: 'DEC', day: '01', title: 'EU Horizon Europe',                sub: 'Sustainability Cluster',    left: '40 Days Remaining', urgent: false },
];

const PUBLICATIONS = [
  { when: 'Just now',  title: 'Neural Correlates of Multitasking: A Longitudinal Study', journal: 'Nature Neuroscience',      authors: 'Vance, E., et al.' },
  { when: 'Yesterday', title: 'Graphene-based Filter Efficiency in Saline Conditions',   journal: 'Journal of Material Science', authors: 'Marsh, J., et al.' },
  { when: '2 days ago', title: 'AI in Primary Education: Ethical Considerations',        journal: 'EduTech Quarterly',        authors: 'Thorne, A.' },
];

export function ResearchHub() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Research Hub</h1>
          <p className="text-on-surface-variant mt-1">Accelerating breakthrough discoveries through collaborative innovation.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-primary-container hover:bg-primary text-on-primary font-semibold transition-colors shadow-sm">
          <FilePlus2 className="w-4 h-4" /> Start New Proposal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Card key={s.label}><div className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{s.label}</p>
              <s.icon className={`w-5 h-5 ${s.tone}`} />
            </div>
            <p className="text-3xl font-bold text-on-surface mt-3">{s.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{s.hint}</p>
          </div></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-on-surface">Active Research Projects</h2>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-md bg-surface-container-low border border-outline-variant/60 text-sm text-on-surface-variant hover:bg-surface-container">Filter</button>
              <button className="px-3 py-1.5 rounded-md bg-surface-container-low border border-outline-variant/60 text-sm text-on-surface-variant hover:bg-surface-container">Latest</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PROJECTS.map(p => (
              <Card key={p.title} className="flex flex-col overflow-hidden">
                <div className="h-28 bg-gradient-to-br from-primary-container/30 to-tertiary/20 flex items-center justify-center relative">
                  <FlaskConical className="w-8 h-8 text-primary/40" />
                  <div className="absolute top-3 right-3"><Badge variant={p.variant}>{p.status}</Badge></div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-on-surface leading-snug">{p.title}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">{t}</span>)}
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <span className="text-on-surface-variant">Lead: <span className="text-on-surface font-medium">{p.lead}</span></span>
                    <span className="font-bold text-primary">{p.funding}</span>
                  </div>
                  <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-primary-container rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                  <button className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-container mt-4 self-start">
                    {p.cta} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}

            {/* New proposal card */}
            <button className="rounded-xl border border-dashed border-outline-variant flex flex-col items-center justify-center text-center p-6 bg-surface-container-low/40 hover:bg-surface-container-low transition-colors min-h-[16rem]">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-on-surface">New Project Proposal</p>
              <p className="text-sm text-on-surface-variant mt-1">Submit your research draft for department review.</p>
            </button>
          </div>
        </div>

        {/* Right: grants + publications */}
        <div className="space-y-8">
          <Card><div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="w-5 h-5 text-error" />
              <h2 className="text-lg font-bold text-on-surface">Grant Deadlines</h2>
            </div>
            <div className="space-y-3">
              {GRANTS.map(g => (
                <div key={g.title} className="flex items-start gap-3">
                  <div className={`w-12 shrink-0 rounded-lg text-center py-1.5 ${g.urgent ? 'bg-error-container' : 'bg-surface-container-high'}`}>
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant">{g.mon}</p>
                    <p className={`text-lg font-bold leading-none ${g.urgent ? 'text-error' : 'text-on-surface'}`}>{g.day}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-on-surface text-sm leading-tight">{g.title}</p>
                    <p className="text-sm text-on-surface-variant">{g.sub}</p>
                    <p className={`flex items-center gap-1 text-xs mt-0.5 ${g.urgent ? 'text-error' : 'text-on-surface-variant'}`}>
                      <Clock className="w-3 h-3" /> {g.left}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 rounded-md border border-primary text-primary text-sm font-medium hover:bg-primary-fixed/50 transition-colors">View All Grants</button>
          </div></Card>

          <Card><div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-on-surface">Recent Publications</h2>
            </div>
            <div className="space-y-4">
              {PUBLICATIONS.map(pub => (
                <div key={pub.title} className="pl-4 border-l-2 border-primary-container/50">
                  <p className="text-xs text-on-surface-variant">{pub.when}</p>
                  <p className="font-semibold text-on-surface text-sm leading-tight mt-0.5">{pub.title}</p>
                  <p className="text-sm text-primary mt-0.5">{pub.journal}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{pub.authors}</p>
                </div>
              ))}
            </div>
          </div></Card>
        </div>
      </div>
    </div>
  );
}
