/**
 * Mock Driver
 * Dynamically loads JSON files from frontend/mock-api using Vite's import.meta.glob.
 * In-memory mutations (create/update/delete) are stored in runtime Maps so they
 * survive navigation within a session but reset on page refresh — exactly right
 * for mock development.
 */

/** Loads all mock data fixtures synchronously into the driver context. */
const studentModules = import.meta.glob('../../../mock-api/students/*.json', { eager: true });
const teacherModules = import.meta.glob('../../../mock-api/teacher/*.json', { eager: true });
const adminModules   = import.meta.glob('../../../mock-api/admin/*.json',   { eager: true });

const getMockData = (modules: Record<string, any>) =>
  Object.values(modules).map(mod => mod.default || mod);

/** Performs a deep clone to prevent in-memory mutations from polluting the Vite module cache. */
const allStudents: any[] = getMockData(studentModules).map(s => JSON.parse(JSON.stringify(s)));
const allTeachers: any[] = getMockData(teacherModules).map(t => JSON.parse(JSON.stringify(t)));
const allAdmins:   any[] = getMockData(adminModules).map(a => JSON.parse(JSON.stringify(a)));

const mockMilestones: any[] = [];

// ─── Share Bundle Persistence ────────────────────────────────────────────────
// Bundles are stored in localStorage to simulate server-side persistence.
// In production, the backend stores these so they can be listed, revoked, and audited.

interface ShareBundle {
  token: string;
  studentIds: string[];
  sections: string[];       // e.g. ['academics','skills','projects']
  createdAt: string;
  expiresAt: string | null; // null = never expires
  revokedAt: string | null; // null = not revoked
}

const BUNDLES_KEY = 'mit_share_bundles';

function loadShareBundles(): ShareBundle[] {
  try {
    const raw = localStorage.getItem(BUNDLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveShareBundles(bundles: ShareBundle[]) {
  try { localStorage.setItem(BUNDLES_KEY, JSON.stringify(bundles)); } catch {}
}

/** Get the status of a bundle. */
function getBundleStatus(b: ShareBundle): 'active' | 'expired' | 'revoked' {
  if (b.revokedAt) return 'revoked';
  if (b.expiresAt && new Date(b.expiresAt) < new Date()) return 'expired';
  return 'active';
}


// Admin Cohorts
const allCohorts: any[] = [
  {
    id: 'cohort-1',
    academicYear: 'FY',
    department: 'Computer Engineering',
    studentCount: 82,
    academicMentorId: null,
    academicMentorName: null
  },
  {
    id: 'cohort-2',
    academicYear: 'SY',
    department: 'Computer Engineering',
    studentCount: 75,
    academicMentorId: '1032210000',
    academicMentorName: 'Dr. Anand Patel'
  }
];

// Track auth states in memory: { [userId]: { password, firstLogin } }
const mockAuthStates: Record<string, { password: string; firstLogin: boolean }> = {};

function getAuthState(userId: string) {
  if (!mockAuthStates[userId]) {
    mockAuthStates[userId] = { password: 'password123', firstLogin: false };
  }
  return mockAuthStates[userId];
}

/** UUID Generation Utility */
function mockUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export const mockDriver = {
  // ─── Session ─────────────────────────────────────────────────────────────
  getCurrentUserId(): string | null {
    const s = localStorage.getItem('mit_mock_session');
    if (!s) return null;
    try { return JSON.parse(s)?.user?.id || null; } catch { return null; }
  },

  /** Authorization and User Context */
  login(identifier: string, password: string) {
    const user = allStudents.find(s => s.user.prn === identifier)?.user ||
                 allTeachers.find(t => t.user.email === identifier)?.user ||
                 allAdmins.find(a => a.user.email === identifier)?.user;

    if (!user) throw new Error('Invalid credentials');
    if (user.deactivated) throw new Error('This account has been deactivated. Please contact the administrator.');
    
    const authState = getAuthState(user.id);
    if (authState.password !== password) throw new Error('Invalid credentials');

    return {
      user,
      accessToken: `mock-access-token-${user.id}`,
      refreshToken: `mock-refresh-token-${user.id}`,
      firstLogin: authState.firstLogin
    };
  },

  changePassword(userId: string, current: string, newPass: string) {
    const authState = getAuthState(userId);
    if (authState.password !== current) throw new Error('Invalid current password');
    authState.password = newPass;
    authState.firstLogin = false;
  },

  forgotPassword(identifier: string) {
    const user = allStudents.find(s => s.user.prn === identifier)?.user ||
                 allTeachers.find(t => t.user.email === identifier)?.user ||
                 allAdmins.find(a => a.user.email === identifier)?.user;

    if (!user) throw new Error('User not found');
    if (user.role === 'student') {
      throw new Error('Password reset is unavailable for student accounts. Please contact your administrator.');
    }
    // Simulate sending email
    return true;
  },

  getMe(userId: string) {
    return this.getUserById(userId);
  },

  getUsersByRole(role: 'student' | 'teacher' | 'admin') {
    if (role === 'student') return allStudents.map(s => s.user);
    if (role === 'teacher') return allTeachers.map(t => t.user);
    return allAdmins.map(a => a.user);
  },

  getUserById(id: string) {
    const user = (
      allStudents.find(s => s.user.id === id)?.user ||
      allTeachers.find(t => t.user.id === id)?.user ||
      allAdmins.find(a => a.user.id === id)?.user ||
      null
    );
    if (user?.role === 'student') {
      const cohort = allCohorts[1]; // mock assign SY
      return { ...user, cohortId: cohort.id, academicMentorId: cohort.academicMentorId, academicMentorName: cohort.academicMentorName };
    }
    return user;
  },

  updateUser(id: string, data: any) {
    const user = allStudents.find(s => s.user.id === id)?.user ||
                 allTeachers.find(t => t.user.id === id)?.user ||
                 allAdmins.find(a => a.user.id === id)?.user;
    if (!user) throw new Error('User not found');
    Object.assign(user, data);
    return this.getUserById(id);
  },

  resetUserPassword(id: string) {
    const authState = getAuthState(id);
    authState.password = 'password123'; // DEFAULT_PASSWORD
    authState.firstLogin = true;
    return true;
  },

  toggleUserStatus(id: string) {
    const user = allStudents.find(s => s.user.id === id)?.user ||
                 allTeachers.find(t => t.user.id === id)?.user ||
                 allAdmins.find(a => a.user.id === id)?.user;
    if (!user) throw new Error('User not found');
    user.deactivated = !user.deactivated;
    return this.getUserById(id);
  },

  /** Student Entity Read Operations */
  getProfile(userId: string) {
    return allStudents.find(s => s.user.id === userId)?.profile ?? null;
  },
  getStudentDashboard(userId: string) {
    return allStudents.find(s => s.user.id === userId)?.dashboard ?? null;
  },
  getAcademicRecords(userId: string) {
    return allStudents.find(s => s.user.id === userId)?.academic ?? [];
  },
  getSkills(userId: string) {
    // Return copies — handing out live references lets driver mutations leak
    // into React state and double-add entries on create.
    const skills = allStudents.find(s => s.user.id === userId)?.skills;
    return {
      technical: [...(skills?.technical ?? [])],
      soft: [...(skills?.soft ?? [])],
      languages: [...(skills?.languages ?? [])],
    };
  },
  getProjects(userId: string) {
    const projects = allStudents.find(s => s.user.id === userId)?.projects ?? [];
    // Normalize legacy fixture fields (title/category) to the UI contract
    // (name/domain/type) so cards and edit forms render correctly.
    return projects.map((p: any) => ({
      ...p,
      name: p.name ?? p.title ?? '',
      type: p.type ?? p.category ?? 'Personal Project',
      domain: p.domain ?? p.category ?? '',
    }));
  },

  createProject(userId: string, data: any) {
    const student = allStudents.find(s => s.user.id === userId);
    if (!student) throw new Error('Student not found');
    // Server-style create: the driver owns id/timestamps — client-supplied
    // ids (weak Math.random ids from forms) are discarded to keep keys unique.
    const newProject = {
      ...data,
      id: `proj-${mockUuid()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!student.projects) student.projects = [];
    student.projects.push(newProject);
    return newProject;
  },

  updateProject(userId: string, projectId: string, data: any) {
    const student = allStudents.find(s => s.user.id === userId);
    if (!student) throw new Error('Student not found');
    const idx = student.projects.findIndex((p: any) => p.id === projectId);
    if (idx === -1) throw new Error('Project not found');
    const updated = {
      ...student.projects[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    student.projects[idx] = updated;
    return updated;
  },
  deleteProject(userId: string, projectId: string) {
    const student = allStudents.find(s => s.user.id === userId);
    if (!student) throw new Error('Student not found');
    student.projects = (student.projects ?? []).filter((p: any) => p.id !== projectId);
  },

  toggleFeatured(userId: string, projectId: string) {
    const student = allStudents.find(s => s.user.id === userId);
    if (!student) throw new Error('Student not found');
    const projects: any[] = student.projects ?? [];
    const idx = projects.findIndex((p: any) => p.id === projectId);
    if (idx === -1) throw new Error('Project not found');

    const current = projects[idx].isFeatured ?? false;
    // If trying to feature, enforce max 3
    if (!current) {
      const featuredCount = projects.filter((p: any) => p.isFeatured).length;
      if (featuredCount >= 3) {
        const err: any = new Error('You can feature at most 3 projects on your recruiter profile.');
        err.status = 422;
        throw err;
      }
    }
    projects[idx] = { ...projects[idx], isFeatured: !current, updatedAt: new Date().toISOString() };
    return projects[idx];
  },

  getExperience(userId: string) {
    return [...(allStudents.find(s => s.user.id === userId)?.experience ?? [])];
  },
  createExperience(userId: string, data: any) {
    const student = allStudents.find(s => s.user.id === userId);
    if (!student) throw new Error('Student not found');
    const entry = { ...data, id: `exp-${mockUuid()}`, userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    if (!student.experience) student.experience = [];
    student.experience.push(entry);
    return entry;
  },
  updateExperience(userId: string, id: string, data: any) {
    const student = allStudents.find(s => s.user.id === userId);
    if (!student) throw new Error('Student not found');
    const idx = (student.experience ?? []).findIndex((e: any) => e.id === id);
    if (idx === -1) throw new Error('Experience not found');
    student.experience[idx] = { ...student.experience[idx], ...data, updatedAt: new Date().toISOString() };
    return student.experience[idx];
  },
  deleteExperience(userId: string, id: string) {
    const student = allStudents.find(s => s.user.id === userId);
    if (!student) throw new Error('Student not found');
    student.experience = (student.experience ?? []).filter((e: any) => e.id !== id);
  },

  getAchievements(userId: string) {
    return [...(allStudents.find(s => s.user.id === userId)?.achievements ?? [])];
  },
  createAchievement(userId: string, data: any) {
    const student = allStudents.find(s => s.user.id === userId);
    if (!student) throw new Error('Student not found');
    const entry = { ...data, id: `ach-${mockUuid()}`, userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    if (!student.achievements) student.achievements = [];
    student.achievements.push(entry);
    return entry;
  },
  updateAchievement(userId: string, id: string, data: any) {
    const student = allStudents.find(s => s.user.id === userId);
    if (!student) throw new Error('Student not found');
    const idx = (student.achievements ?? []).findIndex((a: any) => a.id === id);
    if (idx === -1) throw new Error('Achievement not found');
    student.achievements[idx] = { ...student.achievements[idx], ...data, updatedAt: new Date().toISOString() };
    return student.achievements[idx];
  },
  deleteAchievement(userId: string, id: string) {
    const student = allStudents.find(s => s.user.id === userId);
    if (!student) throw new Error('Student not found');
    student.achievements = (student.achievements ?? []).filter((a: any) => a.id !== id);
  },

  createSkill(userId: string, kind: 'technical' | 'soft' | 'languages', data: any) {
    const student = allStudents.find(s => s.user.id === userId);
    if (!student) throw new Error('Student not found');
    if (!student.skills) student.skills = { technical: [], soft: [], languages: [] };
    const entry = { ...data, id: `skill-${mockUuid()}` };
    student.skills[kind].push(entry);
    return entry;
  },
  deleteSkill(userId: string, kind: 'technical' | 'soft' | 'languages', id: string) {
    const student = allStudents.find(s => s.user.id === userId);
    if (!student) throw new Error('Student not found');
    student.skills[kind] = (student.skills[kind] ?? []).filter((s: any) => s.id !== id);
  },

  /** Teacher Dashboard and Aggregation */
  getTeacherDashboard(teacherId: string) {
    const teacher = allTeachers.find(t => t.user.id === teacherId);
    if (!teacher) return null;

    const dash = { ...teacher.dashboard };

    /** Dynamically aggregates domain interests from live student profile data. */
    const studentIds: string[] = teacher.students ?? [];
    const domainCounts: Record<string, number> = {};
    for (const sid of studentIds) {
      const s = allStudents.find(s => s.user.id === sid);
      const domain = s?.profile?.domainInterest;
      if (domain) domainCounts[domain] = (domainCounts[domain] ?? 0) + 1;
    }
    dash.domainInterests = Object.entries(domainCounts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);

    return dash;
  },

  /** Filterable Student Directory Methods */
  getAssignedStudents(teacherId: string, filters?: any) {
    const teacher = allTeachers.find(t => t.user.id === teacherId);
    if (!teacher) return [];

    let students = (teacher.students as string[]).map(studentId => {
      const s = allStudents.find(s => s.user.id === studentId);
      if (!s) return null;
      return {
        id: s.user.id,
        prn: s.user.prn,
        name: s.user.name,
        cgpa: s.dashboard.stats.cgpa,
        performanceTier: s._meta.tier,
        guidanceStatus: null,
        lastInteractionDate: null,
        _raw: s,
      };
    }).filter(Boolean) as any[];

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        students = students.filter(s =>
          s.name.toLowerCase().includes(q) || s.prn.toLowerCase().includes(q)
        );
      }
      if (filters.performanceTier)
        students = students.filter(s => s.performanceTier === filters.performanceTier);
      if (filters.batch)
        students = students.filter(s => s._raw.user.batch === filters.batch);
      if (filters.skill)
        students = students.filter(s =>
          s._raw.skills.technical.some((t: any) => t.name.toLowerCase() === filters.skill.toLowerCase())
        );
      if (filters.domain)
        students = students.filter(s =>
          s._raw.projects.some((p: any) => p.domain?.toLowerCase() === filters.domain.toLowerCase()) ||
          s._raw.skills.technical.some((t: any) => t.domain?.toLowerCase() === filters.domain.toLowerCase())
        );
      if (filters.supportNeeded)
        students = students.filter(s => {
          const hasFailed = s._raw.academic.some((sem: any) =>
            sem.subjects.some((sub: any) => sub.grade === 'F')
          );
          return hasFailed || s.cgpa < 5.0;
        });
    }

    return students.map(({ _raw, ...rest }) => rest);
  },

  /** Detailed Student Analytics and Views */
  getStudentOverview(studentId: string) {
    const s = allStudents.find(s => s.user.id === studentId);
    if (!s) return null;
    return {
      profile: s.profile,
      cgpa: s.dashboard.stats.cgpa,
      cgpaTrend: s.dashboard.cgpaTrend.filter((t: any) => t.cgpa !== null),
      radarSkills: s.skills.technical.map((sk: any) => ({ domain: sk.name, score: sk.proficiency * 20 })),
      activeProjectsCount: s.projects.filter((p: any) => p.status === 'Ongoing').length,
      totalAchievements: s.achievements.length,
    };
  },

  /** Teacher Notes Management Interface */
  getStudentNotes(teacherId: string, studentId: string) {
    const teacher = allTeachers.find(t => t.user.id === teacherId);
    if (!teacher) return [];
    if (!teacher.notes) teacher.notes = {};
    if (!teacher.notes[studentId]) teacher.notes[studentId] = [];
    return teacher.notes[studentId];
  },

  createNote(teacherId: string, studentId: string, content: string) {
    const teacher = allTeachers.find(t => t.user.id === teacherId);
    if (!teacher) throw new Error('Teacher not found');
    if (!teacher.notes) teacher.notes = {};
    if (!teacher.notes[studentId]) teacher.notes[studentId] = [];
    const note = {
      id: mockUuid(),
      studentId,
      teacherId,
      teacherName: teacher.user.name,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    teacher.notes[studentId].unshift(note);
    return note;
  },

  updateNote(teacherId: string, studentId: string, noteId: string, content: string) {
    const teacher = allTeachers.find(t => t.user.id === teacherId);
    if (!teacher) throw new Error('Teacher not found');
    const notes = teacher.notes?.[studentId] ?? [];
    const note = notes.find((n: any) => n.id === noteId && n.teacherId === teacherId);
    if (!note) throw new Error('Note not found or no permission');
    note.content = content;
    note.updatedAt = new Date().toISOString();
    return note;
  },

  deleteNote(teacherId: string, studentId: string, noteId: string) {
    const teacher = allTeachers.find(t => t.user.id === teacherId);
    if (!teacher) throw new Error('Teacher not found');
    const notes = teacher.notes?.[studentId] ?? [];
    const idx = notes.findIndex((n: any) => n.id === noteId && n.teacherId === teacherId);
    if (idx === -1) throw new Error('Note not found or no permission');
    notes.splice(idx, 1);
  },

  /** Assessment Mark Management Interface */
  getStudentMarks(teacherId: string, studentId: string) {
    const teacher = allTeachers.find(t => t.user.id === teacherId);
    if (!teacher) return [];
    if (!teacher.marks) teacher.marks = {};
    if (!teacher.marks[studentId]) teacher.marks[studentId] = [];
    return teacher.marks[studentId];
  },

  createStudentMark(teacherId: string, studentId: string, data: {
    assessmentTitle: string; score: number; maxScore: number; comments: string; date: string;
  }) {
    const teacher = allTeachers.find(t => t.user.id === teacherId);
    if (!teacher) throw new Error('Teacher not found');
    if (!teacher.marks) teacher.marks = {};
    if (!teacher.marks[studentId]) teacher.marks[studentId] = [];
    const mark = {
      id: mockUuid(),
      studentId,
      projectId: null,
      teacherId,
      teacherName: teacher.user.name,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    teacher.marks[studentId].unshift(mark);
    return mark;
  },

  /** Retrieves all assessment marks recorded by the specified teacher across all their assigned students. */
  /** Injects resolved student name and PRN metadata into the response payload. */
  getAllMarks(teacherId: string) {
    const teacher = allTeachers.find(t => t.user.id === teacherId);
    if (!teacher || !teacher.marks) return [];
    const result: any[] = [];
    for (const [studentId, markList] of Object.entries(teacher.marks as Record<string, any[]>)) {
      const student = allStudents.find(s => s.user.id === studentId);
      for (const mark of markList) {
        result.push({ ...mark, studentName: student?.user?.name ?? studentId, studentPrn: student?.user?.prn ?? '' });
      }
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  /** Timeline Aggregator (Notes, Marks, Activity) */
  getStudentTimeline(teacherId: string, studentId: string, filters?: {
    type?: string; from?: string; to?: string;
  }) {
    const teacher = allTeachers.find(t => t.user.id === teacherId);
    const student = allStudents.find(s => s.user.id === studentId);
    if (!teacher || !student) return [];

    const events: any[] = [];

    /** Aggregates teacher-authored private notes. */
    const notes = teacher.notes?.[studentId] ?? [];
    for (const note of notes) {
      events.push({
        id: `tl-note-${note.id}`,
        type: 'NOTE',
        date: note.createdAt,
        title: 'Private Note Added',
        description: note.content,
        author: note.teacherName,
        isTeacherInitiated: true,
        metadata: { noteId: note.id },
      });
    }

    /** Aggregates teacher-authored assessment marks. */
    const marks = teacher.marks?.[studentId] ?? [];
    for (const mark of marks) {
      events.push({
        id: `tl-mark-${mark.id}`,
        type: 'MARK',
        date: mark.createdAt,
        title: `Assessment: ${mark.assessmentTitle}`,
        description: mark.comments,
        author: mark.teacherName,
        isTeacherInitiated: true,
        metadata: { score: mark.score, maxScore: mark.maxScore, projectId: mark.projectId },
      });
    }

    /** Aggregates student-published achievements. */
    for (const ach of (student.achievements ?? [])) {
      events.push({
        id: `tl-ach-${ach.id}`,
        type: 'ACHIEVEMENT',
        date: ach.date ? `${ach.date}T00:00:00.000Z` : ach.createdAt,
        title: `Achievement Added: ${ach.title}`,
        description: `${ach.level} level — ${ach.category}`,
        author: student.user.name,
        isTeacherInitiated: false,
        metadata: { level: ach.level, category: ach.category },
      });
    }

    /** Aggregates student-published skills. */
    for (const skill of (student.skills?.technical ?? [])) {
      events.push({
        id: `tl-skill-${skill.id}`,
        type: 'SKILL_ADD',
        date: skill.createdAt ?? '2025-01-01T00:00:00.000Z',
        title: `Skill Added: ${skill.name}`,
        description: `Proficiency ${skill.proficiency}/5 — ${skill.domain}`,
        author: student.user.name,
        isTeacherInitiated: false,
        metadata: { domain: skill.domain, proficiency: skill.proficiency },
      });
    }

    /** Aggregates system-generated guidance cases. */
    const guidanceCases = teacher.dashboard?.guidanceCases ?? [];
    for (const gc of guidanceCases) {
      if (gc.studentId === studentId) {
        events.push({
          id: `tl-gc-${gc.id}`,
          type: 'GUIDANCE_CASE',
          date: gc.dateOpened,
          title: 'Guidance Case Opened',
          description: `Trigger: ${gc.triggerSignal}. Assigned to ${gc.owningTeacherName}.`,
          author: 'System',
          isTeacherInitiated: false,
          metadata: { caseId: gc.id, status: gc.status },
        });
      }
    }

    /** Applies chronological descending sort. */
    let sorted = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    /** Applies query filters to the aggregated result set. */
    if (filters?.type) sorted = sorted.filter(e => e.type === filters.type);
    if (filters?.from) sorted = sorted.filter(e => new Date(e.date) >= new Date(filters.from!));
    if (filters?.to)   sorted = sorted.filter(e => new Date(e.date) <= new Date(filters.to!));

    return sorted;
  },

  /** Teacher Project and Milestone Management */
  getProjectById(projectId: string) {
    for (const student of allStudents) {
      const p = student.projects?.find((proj: any) => proj.id === projectId);
      if (p) return p;
    }
    return null;
  },

  createProjectMark(teacherId: string, projectId: string, data: any) {
    const teacher = allTeachers.find(t => t.user.id === teacherId);
    if (!teacher) throw new Error("Teacher not found");
    
    let studentId = '';
    for (const student of allStudents) {
      if (student.projects?.find((p: any) => p.id === projectId)) {
        studentId = student.user.id;
        break;
      }
    }
    
    if (!teacher.marks) teacher.marks = {};
    if (!teacher.marks[studentId]) teacher.marks[studentId] = [];
    const newMark = {
      id: `mark-${mockUuid()}`,
      studentId,
      projectId,
      assessmentTitle: data.assessmentTitle,
      score: data.score,
      maxScore: data.maxScore,
      comments: data.comments,
      teacherId,
      teacherName: teacher.user.name,
      date: data.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    teacher.marks[studentId].push(newMark);
    return newMark;
  },

  createProjectMilestone(_teacherId: string, projectId: string, data: any) {
    const ms = {
      id: `ms-${mockUuid()}`,
      projectId,
      description: data.description,
      status: data.status,
      date: data.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockMilestones.push(ms);
    return ms;
  },

  /** Global Data Accessors */
  getAllTeachers() {
    return allTeachers.map(t => ({
      id: t.user.id,
      name: t.user.name,
      email: t.user.email,
      role: t.user.role
    }));
  },

  getAllCohorts() {
    return [...allCohorts];
  },

  updateCohortMentor(cohortId: string, teacherId: string | null) {
    const cohort = allCohorts.find(c => c.id === cohortId);
    if (!cohort) throw new Error('Cohort not found');
    
    if (teacherId === null) {
      cohort.academicMentorId = null;
      cohort.academicMentorName = null;
    } else {
      const teacher = allTeachers.find(t => t.user.id === teacherId);
      if (!teacher) throw new Error('Teacher not found');
      cohort.academicMentorId = teacher.user.id;
      cohort.academicMentorName = teacher.user.name;
    }
    return { ...cohort };
  },

  getProjectMilestones(projectId: string) {
    return mockMilestones.filter(m => m.projectId === projectId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getProjectMarks(_teacherId: string, projectId: string) {
    /** Aggregates all marks associated with this project across the teacher corpus. */
    let projectMarks: any[] = [];
    for (const teacher of allTeachers) {
      if (teacher.marks) {
        for (const marksArray of Object.values(teacher.marks as Record<string, any[]>)) {
          projectMarks = projectMarks.concat(marksArray.filter((m: any) => m.projectId === projectId));
        }
      }
    }
    return projectMarks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getMentoredProjects(teacherId: string) {
    const mentoredProjects: any[] = [];
    for (const student of allStudents) {
      if (student.projects) {
        for (const p of student.projects) {
          if (p.mentorId === teacherId) {
            mentoredProjects.push({
              ...p,
              studentName: student.user.name,
              studentPrn: student.user.prn
            });
          }
        }
      }
    }
    return mentoredProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  // ─── Recruiter Share Bundle ───────────────────────────────────────────────
  createShareBundle(
    studentIds: string[],
    sections: string[],
    expiresInDays: number | null,
  ): ShareBundle {
    const token = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const now = new Date();
    const bundle: ShareBundle = {
      token,
      studentIds,
      sections,
      createdAt: now.toISOString(),
      expiresAt: expiresInDays != null
        ? new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null,
      revokedAt: null,
    };
    const all = loadShareBundles();
    all.push(bundle);
    saveShareBundles(all);
    return bundle;
  },

  listTeacherShareBundles(): (ShareBundle & { status: string; studentCount: number })[] {
    const all = loadShareBundles();
    return all.map(b => ({
      ...b,
      status: getBundleStatus(b),
      studentCount: b.studentIds.length,
    }));
  },

  revokeShareBundle(token: string): boolean {
    const all = loadShareBundles();
    const bundle = all.find(b => b.token === token);
    if (!bundle || bundle.revokedAt) return false;
    bundle.revokedAt = new Date().toISOString();
    saveShareBundles(all);
    return true;
  },

  getShareBundle(token: string) {
    // Demo token — always returns all students
    if (token === 'demo1234') {
      const students = allStudents.map(s => {
        const projects: any[] = s.projects ?? [];
        const featured = projects.filter((p: any) => p.isFeatured);
        const techSkills: any[] = s.skills?.technical ?? [];
        return {
          id: s.user.id,
          name: s.user.name,
          department: s.user.department,
          batch: s.user.batch,
          avatar: null,
          cgpa: s.dashboard?.stats?.cgpa ?? null,
          topSkills: techSkills.slice(0, 3).map((sk: any) => sk.name),
          featuredProjectCount: featured.length,
          hasExperience: (s.experience ?? []).length > 0,
        };
      });
      return {
        token: 'demo1234',
        createdAt: new Date('2026-07-01').toISOString(),
        expiresAt: null,
        studentCount: students.length,
        students,
      };
    }

    // Look up persisted bundle
    const all = loadShareBundles();
    const bundle = all.find(b => b.token === token);
    if (!bundle) return null;
    if (getBundleStatus(bundle) !== 'active') return null;

    const students = bundle.studentIds.map(id => {
      const s = allStudents.find(st => st.user.id === id);
      if (!s) return null;
      const projects: any[] = s.projects ?? [];
      const featured = projects.filter((p: any) => p.isFeatured);
      const techSkills: any[] = s.skills?.technical ?? [];
      return {
        id: s.user.id,
        name: s.user.name,
        department: s.user.department,
        batch: s.user.batch,
        avatar: null,
        cgpa: s.dashboard?.stats?.cgpa ?? null,
        topSkills: techSkills.slice(0, 3).map((sk: any) => sk.name),
        featuredProjectCount: featured.length,
        hasExperience: (s.experience ?? []).length > 0,
      };
    }).filter(Boolean);

    return {
      token: bundle.token,
      createdAt: bundle.createdAt,
      expiresAt: bundle.expiresAt,
      studentCount: students.length,
      students,
    };
  },

  getRecruiterStudentProfile(token: string, studentId: string) {
    // Demo token — always allowed
    if (token !== 'demo1234') {
      const all = loadShareBundles();
      const bundle = all.find(b => b.token === token);
      if (!bundle || getBundleStatus(bundle) !== 'active') return null;
      if (!bundle.studentIds.includes(studentId)) return null;
    }
    const s = allStudents.find(st => st.user.id === studentId);
    if (!s) return null;

    const projects: any[] = s.projects ?? [];
    const featured = projects.filter((p: any) => p.isFeatured);
    const displayProjects = featured.length > 0
      ? featured
      : [...projects].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

    return {
      id: s.user.id,
      name: s.user.name,
      department: s.user.department,
      batch: s.user.batch,
      avatar: null,
      cgpa: s.dashboard?.stats?.cgpa ?? null,
      bio: s.profile?.aboutMe ?? null,
      domainInterest: s.profile?.domainInterest ?? null,
      github: s.profile?.github ?? `https://github.com/${s.user.name.toLowerCase().replace(' ', '-')}`,
      portfolio: s.profile?.portfolio ?? null,
      linkedin: s.profile?.linkedin ?? null,
      resumePdf: s.profile?.resumePdf ?? null,
      projects: displayProjects.map((p: any) => ({
        id: p.id,
        name: p.name ?? p.title ?? '',
        description: p.description ?? '',
        domain: p.domain ?? p.category ?? '',
        techStack: p.techStack ?? [],
        status: p.status ?? 'Completed',
        type: p.type ?? p.category ?? 'Personal Project',
        githubRepo: p.repositoryUrl ?? null,
        liveUrl: p.liveUrl ?? null,
        startDate: p.startDate ?? null,
        endDate: p.endDate ?? null,
        isFeatured: p.isFeatured ?? false,
      })),
      skills: {
        technical: (s.skills?.technical ?? []).map((sk: any) => ({ name: sk.name, domain: sk.domain, proficiency: sk.proficiency })),
        soft: (s.skills?.soft ?? []).map((sk: any) => ({ name: sk.name, proficiency: sk.proficiency })),
        languages: (s.skills?.languages ?? []).map((sk: any) => ({ name: sk.name, proficiency: sk.proficiency })),
      },
      experience: (s.experience ?? []).map((ex: any) => ({
        id: ex.id,
        organisation: ex.organisationName,
        role: ex.role,
        type: ex.type,
        description: ex.description,
        startDate: ex.startDate,
        endDate: ex.endDate,
      })),
      achievements: (s.achievements ?? []).map((ach: any) => ({
        id: ach.id,
        title: ach.title,
        description: ach.description,
        category: ach.category,
        type: ach.type,
        level: ach.level,
        date: ach.date,
        certificateUrl: ach.certificateUrl,
      })),
    };
  },
};

