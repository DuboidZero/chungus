/**
 * Teacher Portal Services.
 * Wraps API endpoints with typed axios calls.
 */
import { apiClient } from '../client';
import { API } from '../endpoints';
import type { 
  GetAssignedStudentsRequest, GetAssignedStudentsResponse,
  StudentOverviewResponse, StudentTimelineResponse,
  CreateNoteRequest, CreateNoteResponse,
  CreateStudentMarkRequest, CreateProjectMarkRequest, CreateMarkResponse,
  CreateMilestoneRequest, CreateMilestoneResponse,
  UpdateGuidanceCaseRequest, UpdateGuidanceCaseResponse
} from '../contracts/teacher';
import type { PrivateNote, AssessmentMark, ProjectMilestone } from '../entities/teacher';
import type { Project } from '../entities/project';
import { USE_MOCK, mockDriver } from '../mock';

export async function getStudentUser(studentId: string): Promise<{ id: string; name: string; prn: string; role: string } | null> {
  if (USE_MOCK) {
    const user = mockDriver.getUserById(studentId);
    await new Promise(resolve => setTimeout(resolve, 100));
    return user as any;
  }
  // Real backend: GET /users/:id — for teacher context
  return null;
}

export async function getAssignedStudents(params?: GetAssignedStudentsRequest): Promise<GetAssignedStudentsResponse> {
  if (USE_MOCK) {
    const teacherId = mockDriver.getCurrentUserId();
    if (!teacherId) throw new Error("No mocked teacher session");
    const data = mockDriver.getAssignedStudents(teacherId, params);
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get<GetAssignedStudentsResponse>(API.TEACHER.STUDENTS, { params });
  return response.data;
}

export async function getStudentOverview(studentId: string): Promise<StudentOverviewResponse> {
  if (USE_MOCK) {
    const data = mockDriver.getStudentOverview(studentId);
    if (!data) throw new Error("Student overview not found");
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get<StudentOverviewResponse>(API.TEACHER.STUDENT_OVERVIEW(studentId));
  return response.data;
}

export async function getStudentTimeline(studentId: string, filters?: { type?: string; from?: string; to?: string }): Promise<StudentTimelineResponse> {
  if (USE_MOCK) {
    const teacherId = mockDriver.getCurrentUserId();
    if (!teacherId) throw new Error("No mocked teacher session");
    const data = mockDriver.getStudentTimeline(teacherId, studentId, filters);
    await new Promise(resolve => setTimeout(resolve, 300));
    return data;
  }
  const response = await apiClient.get<StudentTimelineResponse>(API.TEACHER.STUDENT_TIMELINE(studentId), { params: filters });
  return response.data;
}

export async function getStudentNotes(studentId: string): Promise<PrivateNote[]> {
  if (USE_MOCK) {
    const teacherId = mockDriver.getCurrentUserId();
    if (!teacherId) throw new Error("No mocked teacher session");
    const data = mockDriver.getStudentNotes(teacherId, studentId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get<PrivateNote[]>(API.TEACHER.STUDENT_NOTES(studentId));
  return response.data;
}

export async function getStudentMarks(studentId: string): Promise<AssessmentMark[]> {
  if (USE_MOCK) {
    const teacherId = mockDriver.getCurrentUserId();
    if (!teacherId) throw new Error("No mocked teacher session");
    const data = mockDriver.getStudentMarks(teacherId, studentId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return data;
  }
  const response = await apiClient.get<AssessmentMark[]>(API.TEACHER.STUDENT_MARKS(studentId));
  return response.data;
}

export async function getAllMarks(): Promise<(AssessmentMark & { studentName: string; studentPrn: string })[]> {
  if (USE_MOCK) {
    const teacherId = mockDriver.getCurrentUserId();
    if (!teacherId) throw new Error("No mocked teacher session");
    const data = mockDriver.getAllMarks(teacherId);
    await new Promise(resolve => setTimeout(resolve, 400));
    return data as any;
  }
  const response = await apiClient.get<(AssessmentMark & { studentName: string; studentPrn: string })[]>('/teacher/marks');
  return response.data;
}

export async function createPrivateNote(studentId: string, data: CreateNoteRequest): Promise<CreateNoteResponse> {
  if (USE_MOCK) {
    const teacherId = mockDriver.getCurrentUserId();
    if (!teacherId) throw new Error("No mocked teacher session");
    const note = mockDriver.createNote(teacherId, studentId, data.content);
    await new Promise(resolve => setTimeout(resolve, 300));
    return note as CreateNoteResponse;
  }
  const response = await apiClient.post<CreateNoteResponse>(API.TEACHER.STUDENT_NOTES(studentId), data);
  return response.data;
}

export async function updatePrivateNote(studentId: string, noteId: string, content: string): Promise<CreateNoteResponse> {
  if (USE_MOCK) {
    const teacherId = mockDriver.getCurrentUserId();
    if (!teacherId) throw new Error("No mocked teacher session");
    const note = mockDriver.updateNote(teacherId, studentId, noteId, content);
    await new Promise(resolve => setTimeout(resolve, 200));
    return note as CreateNoteResponse;
  }
  const response = await apiClient.patch<CreateNoteResponse>(`${API.TEACHER.STUDENT_NOTES(studentId)}/${noteId}`, { content });
  return response.data;
}

export async function deletePrivateNote(studentId: string, noteId: string): Promise<void> {
  if (USE_MOCK) {
    const teacherId = mockDriver.getCurrentUserId();
    if (!teacherId) throw new Error("No mocked teacher session");
    mockDriver.deleteNote(teacherId, studentId, noteId);
    await new Promise(resolve => setTimeout(resolve, 200));
    return;
  }
  await apiClient.delete(`${API.TEACHER.STUDENT_NOTES(studentId)}/${noteId}`);
}

export async function createStudentMark(studentId: string, data: CreateStudentMarkRequest): Promise<CreateMarkResponse> {
  if (USE_MOCK) {
    const teacherId = mockDriver.getCurrentUserId();
    if (!teacherId) throw new Error("No mocked teacher session");
    const mark = mockDriver.createStudentMark(teacherId, studentId, data as any);
    await new Promise(resolve => setTimeout(resolve, 300));
    return mark as CreateMarkResponse;
  }
  const response = await apiClient.post<CreateMarkResponse>(API.TEACHER.STUDENT_MARKS(studentId), data);
  return response.data;
}

export async function getStudentProjects(studentId: string): Promise<Project[]> {
  if (USE_MOCK) {
    const data = mockDriver.getProjects(studentId);
    await new Promise(resolve => setTimeout(resolve, 300));
    return data;
  }
  const response = await apiClient.get<Project[]>(API.TEACHER.STUDENT_PROJECTS(studentId));
  return response.data;
}

export async function getTeacherProjectDetail(projectId: string): Promise<Project> {
  if (USE_MOCK) {
    /** Resolves project references from the central student entity catalog. */
    // We just find it across all students.
    const project = mockDriver.getProjectById(projectId);
    if (!project) throw new Error("Project not found");
    await new Promise(resolve => setTimeout(resolve, 300));
    return project;
  }
  const response = await apiClient.get<Project>(API.TEACHER.PROJECT_DETAIL(projectId));
  return response.data;
}

export async function getMentoredProjects(): Promise<(Project & { studentName: string; studentPrn: string })[]> {
  if (USE_MOCK) {
    const teacherId = mockDriver.getCurrentUserId();
    if (!teacherId) throw new Error("No mocked teacher session");
    const projects = mockDriver.getMentoredProjects(teacherId);
    await new Promise(resolve => setTimeout(resolve, 300));
    return projects as any;
  }
  const response = await apiClient.get<(Project & { studentName: string; studentPrn: string })[]>(API.TEACHER.PROJECTS);
  return response.data;
}

export async function createProjectMark(projectId: string, data: CreateProjectMarkRequest): Promise<CreateMarkResponse> {
  if (USE_MOCK) {
    const teacherId = mockDriver.getCurrentUserId();
    if (!teacherId) throw new Error("No mocked teacher session");
    const mark = mockDriver.createProjectMark(teacherId, projectId, data as any);
    await new Promise(resolve => setTimeout(resolve, 300));
    return mark as CreateMarkResponse;
  }
  const response = await apiClient.post<CreateMarkResponse>(API.TEACHER.PROJECT_MARKS(projectId), data);
  return response.data;
}

export async function createProjectMilestone(projectId: string, data: CreateMilestoneRequest): Promise<CreateMilestoneResponse> {
  if (USE_MOCK) {
    const teacherId = mockDriver.getCurrentUserId();
    if (!teacherId) throw new Error("No mocked teacher session");
    const ms = mockDriver.createProjectMilestone(teacherId, projectId, data as any);
    await new Promise(resolve => setTimeout(resolve, 300));
    return ms as CreateMilestoneResponse;
  }
  const response = await apiClient.post<CreateMilestoneResponse>(API.TEACHER.PROJECT_MILESTONES(projectId), data);
  return response.data;
}

export async function getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
  if (USE_MOCK) {
    const ms = mockDriver.getProjectMilestones(projectId);
    await new Promise(resolve => setTimeout(resolve, 300));
    return ms;
  }
  const response = await apiClient.get<ProjectMilestone[]>(API.TEACHER.PROJECT_MILESTONES(projectId));
  return response.data;
}

export async function getProjectMarks(projectId: string): Promise<AssessmentMark[]> {
  if (USE_MOCK) {
    const teacherId = mockDriver.getCurrentUserId();
    if (!teacherId) throw new Error("No mocked teacher session");
    const marks = mockDriver.getProjectMarks(teacherId, projectId);
    await new Promise(resolve => setTimeout(resolve, 300));
    return marks;
  }
  const response = await apiClient.get<AssessmentMark[]>(API.TEACHER.PROJECT_MARKS(projectId));
  return response.data;
}

export async function updateGuidanceCase(caseId: string, data: UpdateGuidanceCaseRequest): Promise<UpdateGuidanceCaseResponse> {
  /** Initiates a network request to the backend service to perform the specified operation. */
  const response = await apiClient.patch<UpdateGuidanceCaseResponse>(API.TEACHER.GUIDANCE_CASE(caseId), data);
  return response.data;
}
