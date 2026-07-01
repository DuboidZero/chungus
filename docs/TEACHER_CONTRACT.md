# Teacher API Contract — MIT WPU Portfolio System

> **Version**: 1.1.0-draft
> **Last Updated**: 2026-06-29
> **Base URL**: `/api/v1` 

## Teacher Portal

### `GET /teacher/dashboard`

Returns aggregated data for the teacher dashboard view.

**Response** `200 OK`
```json
{
  "stats": {
    "totalAssignedStudents": 45,
    "highPerformingCount": 10,
    "midTierCount": 30,
    "underperformingCount": 5,
    "activeGuidanceCases": 8
  },
  "supportNeeded": [
    {
      "id": "uuid-v4",
      "studentId": "uuid-v4",
      "studentName": "Rahul Sharma",
      "studentPrn": "1032210001",
      "studentCgpa": 5.8,
      "urgencyLabel": "Critical",
      "reasonTags": ["CGPA Declining", "No Recent Interaction"],
      "isActiveSupport": false,
      "createdAt": "2026-06-25T10:00:00.000Z"
    }
  ],
  "guidanceCases": [
    {
      "id": "uuid-v4",
      "studentId": "uuid-v4",
      "studentName": "Amit Kumar",
      "studentPrn": "1032210002",
      "studentCgpa": 6.5,
      "triggerSignal": "CGPA dropped below 7.0",
      "owningTeacherId": "uuid-v4",
      "owningTeacherName": "Dr. Smith",
      "status": "Open",
      "resolutionNote": null,
      "dateOpened": "2026-06-26T14:00:00.000Z",
      "dateResolved": null,
      "createdAt": "2026-06-26T14:00:00.000Z",
      "updatedAt": "2026-06-26T14:00:00.000Z"
    }
  ],
  "cgpaDistribution": [
    { "range": "9.0-10.0", "count": 2 },
    { "range": "8.0-8.9", "count": 8 },
    { "range": "7.0-7.9", "count": 12 },
    { "range": "6.0-6.9", "count": 18 },
    { "range": "< 6.0", "count": 5 }
  ],
  "gpaTrend": [
    { "semester": "Sem 1", "averageGpa": 7.8 },
    { "semester": "Sem 2", "averageGpa": 7.9 }
  ],
  "skillHeatmap": [
    { "skill": "React", "studentCount": 12, "averageProficiency": 3.5 }
  ],
  "domainInterests": [
    { "domain": "Web Development", "count": 18 }
  ],
  "achievementVolume": [
    { "category": "Technical", "level": "National", "count": 4 }
  ],
  "projectActivity": [
    { "domain": "Web Development", "techStack": "React", "count": 8 }
  ],
  "internshipPreferences": [
    { "preference": "online", "count": 15 },
    { "preference": "offline", "count": 20 },
    { "preference": "none", "count": 10 }
  ]
}
```

### `GET /teacher/students`

Returns a lightweight list of assigned students for case management.

**Query Parameters**

| Param | Type | Description |
|---|---|---|
| `search` | `string` | PRN or name match |
| `batch` | `string` | e.g. `"2022-2026"` |
| `department` | `string` | e.g. `"Computer Engineering"` |
| `performanceTier` | `string` | `"High Performing"` \| `"Average - Guidable"` \| `"Underperforming"` |
| `guidanceStatus` | `string` | `"Open"` \| `"Assigned"` \| `"In Progress"` \| `"Resolved"` |
| `skill` | `string` | Filter by skill name |
| `domain` | `string` | Filter by domain interest |
| `supportNeeded` | `boolean` | `true` to show only students in Support Needed panel |

**Response** `200 OK`
```json
[
  {
    "id": "uuid-v4",
    "prn": "1032210001",
    "name": "Rahul Sharma",
    "cgpa": 8.5,
    "performanceTier": "High Performing",
    "guidanceStatus": null,
    "lastInteractionDate": "2026-06-20T10:00:00.000Z"
  }
]
```

### `GET /teacher/students/:id/overview`

Returns full profile and individual analytics for a specific student.

**Response** `200 OK`
```json
{
  "profile": { "...": "same shape as GET /me/profile" },
  "cgpa": 8.65,
  "cgpaTrend": [{ "semester": "Sem 1", "cgpa": 8.5 }],
  "radarSkills": [{ "domain": "Web Dev", "score": 80 }],
  "activeProjectsCount": 2,
  "totalAchievements": 3
}
```

### `GET /teacher/students/:id/academic-records`

Returns academic records for a specific assigned student.  
Same response shape as `GET /me/academic-records`.

### `GET /teacher/students/:id/timeline`

Returns merged, chronological student development timeline. All activity types are aggregated.

**Query Parameters**

| Param | Type | Description |
|---|---|---|
| `type` | `string` | Filter by event type: `NOTE` \| `MARK` \| `PROJECT_MILESTONE` \| `ACHIEVEMENT` \| `SKILL_ADD` \| `GUIDANCE_CASE` \| `SYSTEM_UPDATE` |
| `from` | `string` | ISO 8601 date — filter from this date |
| `to` | `string` | ISO 8601 date — filter to this date |
| `teacher` | `string` | Teacher name — filter by author |
| `semester` | `number` | Academic semester number |

**Response** `200 OK`
```json
[
  {
    "id": "uuid-v4",
    "type": "NOTE",
    "date": "2026-06-28T10:00:00.000Z",
    "title": "Private Note Added",
    "description": "Student is improving in Web Dev.",
    "author": "Dr. Anand Patel",
    "isTeacherInitiated": true,
    "metadata": {}
  },
  {
    "id": "uuid-v4",
    "type": "MARK",
    "date": "2026-06-20T10:00:00.000Z",
    "title": "Assessment: Mid-Semester Viva",
    "description": "Excellent understanding of core concepts.",
    "author": "Dr. Anand Patel",
    "isTeacherInitiated": true,
    "metadata": { "score": 45, "maxScore": 50, "projectId": null }
  },
  {
    "id": "uuid-v4",
    "type": "PROJECT_MILESTONE",
    "date": "2026-06-15T00:00:00.000Z",
    "title": "Milestone: Completed frontend architecture",
    "description": "Status: Completed",
    "author": "Dr. Anand Patel",
    "isTeacherInitiated": true,
    "metadata": { "projectId": "uuid-v4", "status": "Completed" }
  },
  {
    "id": "uuid-v4",
    "type": "ACHIEVEMENT",
    "date": "2026-05-10T00:00:00.000Z",
    "title": "Achievement Added: 1st Place, Smart India Hackathon",
    "description": "National level — Technical",
    "author": "Student",
    "isTeacherInitiated": false,
    "metadata": { "level": "National", "category": "Technical" }
  },
  {
    "id": "uuid-v4",
    "type": "SKILL_ADD",
    "date": "2026-04-02T00:00:00.000Z",
    "title": "Skill Added: React",
    "description": "Proficiency level 4/5 — Web Development",
    "author": "Student",
    "isTeacherInitiated": false,
    "metadata": { "domain": "Web Development", "proficiency": 4 }
  },
  {
    "id": "uuid-v4",
    "type": "GUIDANCE_CASE",
    "date": "2026-06-15T10:00:00.000Z",
    "title": "Guidance Case Opened",
    "description": "Trigger: CGPA dropped below 7.0. Assigned to Dr. Anand Patel.",
    "author": "System",
    "isTeacherInitiated": false,
    "metadata": { "caseId": "uuid-v4", "status": "Open" }
  }
]
```

### `POST /teacher/students/:id/notes`

Add a private note. Teacher name and timestamp are auto-populated by the backend.

**Request**
```json
{ "content": "Student is showing great progress in the project phase." }
```
**Response** `201 Created`
```json
{
  "id": "uuid-v4",
  "studentId": "uuid-v4",
  "teacherId": "uuid-v4",
  "teacherName": "Dr. Anand Patel",
  "content": "Student is showing great progress in the project phase.",
  "createdAt": "2026-06-28T10:00:00.000Z",
  "updatedAt": "2026-06-28T10:00:00.000Z"
}
```

### `PATCH /teacher/students/:id/notes/:noteId`

Edit a note. Only the creating teacher or Admin may edit.

**Request** `{ "content": "Updated note content." }`  
**Response** `200 OK` — Returns updated PrivateNote object.

### `DELETE /teacher/students/:id/notes/:noteId`

Only the creating teacher or Admin may delete.  
**Response** `204 No Content`

### `GET /teacher/students/:id/projects`

Returns all projects created by a specific student. Response is a list of Project objects.

### `GET /teacher/projects`

Returns all projects where `mentorId` matches the authenticated teacher. Response is a list of Project objects.

### `GET /teacher/projects/:projectId`

Returns full details for a specific project. Response is a single Project object.

### `GET /teacher/marks`

Returns all assessment marks created by the authenticated teacher across all students.

**Response** `200 OK`
```json
[
  {
    "id": "uuid-v4",
    "studentId": "uuid-v4",
    "projectId": null,
    "assessmentTitle": "Mid-Semester Viva",
    "score": 45,
    "maxScore": 50,
    "comments": "Excellent understanding of core concepts.",
    "teacherId": "uuid-v4",
    "teacherName": "Dr. Anand Patel",
    "date": "2026-06-20",
    "createdAt": "2026-06-20T10:00:00.000Z",
    "updatedAt": "2026-06-20T10:00:00.000Z",
    "studentName": "Rahul Sharma",
    "studentPrn": "1032210001"
  }
]
```

### `GET /teacher/students/:id/marks`

Returns all assessment marks for a student (general + project-level).

**Response** `200 OK`
```json
[
  {
    "id": "uuid-v4",
    "studentId": "uuid-v4",
    "projectId": null,
    "assessmentTitle": "Mid-Semester Viva",
    "score": 45,
    "maxScore": 50,
    "comments": "Excellent understanding of core concepts.",
    "teacherId": "uuid-v4",
    "teacherName": "Dr. Anand Patel",
    "date": "2026-06-20",
    "createdAt": "2026-06-20T10:00:00.000Z",
    "updatedAt": "2026-06-20T10:00:00.000Z"
  }
]
```

### `POST /teacher/students/:id/marks`

Log a general student-level assessment mark.

**Request**
```json
{
  "assessmentTitle": "Mid-Semester Viva",
  "score": 45,
  "maxScore": 50,
  "comments": "Excellent understanding of core concepts.",
  "date": "2026-06-20"
}
```
> Teacher name is auto-populated. `projectId` is `null` for general marks.

**Response** `201 Created` — Returns full AssessmentMark object.

### `POST /teacher/projects/:projectId/marks`

Attach an assessment mark to a specific project entry.

**Request**
```json
{
  "assessmentTitle": "Final Viva",
  "score": 88,
  "maxScore": 100,
  "comments": "Strong architecture decisions. Needs better documentation.",
  "date": "2026-06-22"
}
```
**Response** `201 Created` — Returns full AssessmentMark object (with `projectId` populated).

### `GET /teacher/projects/:projectId/marks`

Returns all assessment marks attached to a specific project.  
Response is same array shape as `GET /teacher/students/:id/marks`.

### `POST /teacher/projects/:projectId/milestones`

Add a progress milestone to a project.

**Request**
```json
{
  "description": "Completed frontend architecture and routing setup.",
  "status": "Completed",
  "date": "2026-06-15"
}
```
> Allowed `status`: `"On Track"`, `"Delayed"`, `"Completed"`

**Response** `201 Created`
```json
{
  "id": "uuid-v4",
  "projectId": "uuid-v4",
  "description": "Completed frontend architecture and routing setup.",
  "status": "Completed",
  "date": "2026-06-15",
  "createdAt": "2026-06-28T10:00:00.000Z",
  "updatedAt": "2026-06-28T10:00:00.000Z"
}
```

### `GET /teacher/projects/:projectId/milestones`

Returns all milestones for a project.  
Response is an array of ProjectMilestone objects.

### `PATCH /teacher/guidance-cases/:id`

Update the status or add a resolution note to a guidance case.

**Request**
```json
{
  "status": "Resolved",
  "resolutionNote": "Held 3 mentoring sessions. Student's CGPA improved to 7.2."
}
```
**Response** `200 OK` — Returns updated GuidanceCase object.

---

