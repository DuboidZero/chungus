import { Card } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import { GraduationCap, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const COURSES = [
  { code: 'CS-402',  title: 'Advanced Machine Learning', credits: 4, tags: ['AI/ML', 'Python', 'Mathematics'], faculty: 'Dr. Sarah Chen',
    desc: 'Deep dive into neural networks, reinforcement learning, and generative models with industry-standard frameworks.' },
  { code: 'DES-210', title: 'Visual Design Systems', credits: 3, tags: ['UI/UX', 'Figma', 'Typography'], faculty: 'Prof. Marc Elias',
    desc: 'Core principles of building scalable design systems for digital products — atomic design, accessibility, tokenisation.' },
  { code: 'EC-105',  title: 'Macroeconomic Principles', credits: 3, tags: ['Finance', 'Policy', 'Global Markets'], faculty: 'Dr. Alan Turing',
    desc: 'An introductory look at national income, employment, and inflation and how fiscal/monetary policy impacts growth.' },
  { code: 'DA-300',  title: 'Data Visualization Art', credits: 4, tags: ['D3.js', 'Storytelling', 'Analytics'], faculty: 'Prof. Lisa Ray',
    desc: 'The intersection of complex data and aesthetic representation — build interactive dashboards that tell stories.' },
  { code: 'BIO-120', title: 'Genetics & Bioethics', credits: 4, tags: ['Science', 'Ethics', 'Research'], faculty: 'Dr. Helena Vogt',
    desc: 'Moral implications of genetic engineering and biotechnology through contemporary case studies.' },
  { code: 'PY-201',  title: 'Cognitive Psychology', credits: 3, tags: ['Cognition', 'Mind', 'Testing'], faculty: 'Prof. James Mori',
    desc: 'How people perceive, remember, think, and solve problems — attention, memory systems, language acquisition.' },
];

export function CourseCatalog() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Course Catalog</h1>
          <p className="text-on-surface-variant mt-1">Explore and register for upcoming semester modules.</p>
        </div>
        <div className="flex gap-3">
          <Card><div className="px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">Open Courses</p>
            <p className="text-2xl font-bold text-primary">142</p>
          </div></Card>
          <Card><div className="px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">Registration Ends</p>
            <p className="text-2xl font-bold text-error">12 Days</p>
          </div></Card>
        </div>
      </div>

      {/* Filter bar */}
      <Card>
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <SlidersHorizontal className="w-4 h-4" /><span className="text-sm font-medium">Filters:</span>
          </div>
          {['All Departments', 'Credit Value', 'Level'].map(f => (
            <button key={f} className="px-4 py-2 rounded-md bg-surface-container-low border border-outline-variant/60 text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
              {f}
            </button>
          ))}
          <div className="relative ml-auto min-w-[16rem] flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input placeholder="Search courses, codes, or faculty..." className="w-full h-10 pl-10 pr-3 rounded-md bg-surface-container-low border border-outline-variant/60 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </Card>

      {/* Course grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {COURSES.map(c => (
          <Card key={c.code} className="flex flex-col">
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="default">{c.code}</Badge>
                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <GraduationCap className="w-4 h-4" /> {c.credits} Cr.
                </span>
              </div>
              <h3 className="text-lg font-bold text-on-surface leading-snug">{c.title}</h3>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {c.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">{t}</span>)}
              </div>
              <p className="text-sm text-on-surface-variant mt-3 flex-1">{c.desc}</p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-outline-variant/40">
                <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {c.faculty.split(' ').slice(-1)[0].charAt(0)}
                </div>
                <span className="text-sm text-on-surface-variant truncate flex-1">{c.faculty}</span>
                <button className="px-3 py-1.5 rounded-md border border-primary text-primary text-sm font-medium hover:bg-primary-fixed/50 transition-colors">Syllabus</button>
                <button className="px-3 py-1.5 rounded-md bg-primary-container hover:bg-primary text-on-primary text-sm font-medium transition-colors">Register</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">Showing 6 of 142 courses</p>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-md border border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:bg-surface-container"><ChevronLeft className="w-4 h-4" /></button>
          <button className="w-9 h-9 rounded-md bg-primary-container text-on-primary text-sm font-medium">1</button>
          <button className="w-9 h-9 rounded-md border border-outline-variant/60 text-on-surface-variant text-sm hover:bg-surface-container">2</button>
          <button className="w-9 h-9 rounded-md border border-outline-variant/60 text-on-surface-variant text-sm hover:bg-surface-container">3</button>
          <button className="w-9 h-9 rounded-md border border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:bg-surface-container"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
