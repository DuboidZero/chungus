# API Contract — MIT WPU Portfolio System

> **Version**: 1.1.0-draft  
> **Last Updated**: 2026-06-28  
> **Base URL**: `/api/v1`  
> **Auth**: Bearer JWT in `Authorization` header  
> **Content-Type**: `application/json`

This document is the single source of truth for the API that the backend must implement.  
All endpoints return JSON. All timestamps are ISO 8601 strings.

---

## Health

### `GET /health`

**Response** `200 OK`
```json
{ "status": "ok", "timestamp": "2026-06-28T06:00:00.000Z" }
```

---

## Authentication

### `POST /auth/login`

**Request**
```json
{ "prn": "1032210001", "password": "..." }
```

**Response** `200 OK`
```json
{
  "user": {
    "id": "uuid-v4",
    "prn": "1032210001",
    "name": "Dhruv Inamdar",
    "email": "dhruv.inamdar@mitwpu.edu.in",
    "role": "student",
    "department": "Computer Engineering",
    "batch": "2022-2026",
    "avatar": null,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-06-28T06:00:00.000Z"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### `POST /auth/logout`
**Response** `204 No Content`

### `POST /auth/refresh`
**Request** `{ "refreshToken": "eyJ..." }`  
**Response** `200 OK` — `{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }`

### `GET /me`
Returns the currently authenticated user. Same shape as `user` in login response.

---

## Student Dashboard

### `GET /me/dashboard`

**Response** `200 OK`
```json
{
  "stats": {
    "cgpa": 8.65,
    "percentage": 79.0,
    "totalCredits": 46,
    "projectCount": 2,
    "achievementCount": 3,
    "skillCount": 8
  },
  "cgpaTrend": [
    { "semester": "Sem 1", "cgpa": 8.5, "projected": null },
    { "semester": "Sem 2", "cgpa": 8.65, "projected": 8.65 },
    { "semester": "Sem 3 (Proj)", "cgpa": null, "projected": 8.7 }
  ],
  "upcomingDeadlines": [
    {
      "id": "uuid-v4",
      "title": "Mini Project Submission",
      "subject": "Software Engineering",
      "dueDate": "2026-06-30T23:59:59.000Z",
      "urgencyLabel": "2 Days",
      "urgency": "urgent"
    }
  ]
}
```

---

## Profile

### `GET /me/profile`

**Response** `200 OK`
```json
{
  "id": "uuid-v4",
  "userId": "uuid-v4",
  "avatarUrl": null,
  "aboutMe": "",
  "email": "dhruv.inamdar@mitwpu.edu.in",
  "phone": "",
  "location": "",
  "internshipPreference": "none",
  "preferredRadius": "",
  "domainInterest": "Web Development",
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-06-28T06:00:00.000Z"
}
```

### `PATCH /me/profile`

> Students may edit their own profile. Teachers/Admin cannot edit via this endpoint.

**Request** (all fields optional)
```json
{
  "aboutMe": "Aspiring full-stack developer...",
  "phone": "+91 98765 43210",
  "location": "Pune, Maharashtra",
  "internshipPreference": "offline",
  "preferredRadius": "25km",
  "domainInterest": "Web Development"
}
```

> Allowed values for `domainInterest`: `"Web Development"`, `"AI / ML"`, `"Mobile"`, `"Cybersecurity"`, `"IoT"`, `"Cloud & DevOps"`, `"Data Science"`, `"Blockchain"`, `"Game Development"`, `"Other"`

**Response** `200 OK` — Returns the full updated Profile object.

---

## Academic Records

> **READ-ONLY for Students and Teachers.**  
> Only Admin may create, update, or delete academic records.  
> Students access their own records. Teachers access assigned students' records.

### `GET /me/academic-records`

**Response** `200 OK`
```json
[
  {
    "id": "uuid-v4",
    "semesterNumber": 1,
    "gpa": 8.5,
    "totalCredits": 22,
    "subjects": [
      {
        "id": "uuid-v4",
        "name": "Engineering Mathematics I",
        "marksObtained": 85,
        "maxMarks": 100,
        "grade": "A+",
        "credits": 4
      }
    ],
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-06-28T06:00:00.000Z"
  }
]
```

### `GET /teacher/students/:id/academic-records`
Returns academic records for a specific student (teacher/admin only).  
Response is the same array shape as above.

### [Admin Only] `POST /admin/students/:id/academic-records`

**Request**
```json
{
  "semesterNumber": 3,
  "subjects": [
    { "name": "Data Structures", "marksObtained": 92, "maxMarks": 100, "credits": 4 }
  ]
}
```
> `gpa`, `grade`, and `totalCredits` are computed server-side.

**Response** `201 Created` — Returns full Semester object.

### [Admin Only] `PATCH /admin/students/:id/academic-records/:semesterId`

**Request** (all fields optional) — Same shape as POST.  
**Response** `200 OK` — Returns updated Semester object.

### [Admin Only] `DELETE /admin/students/:id/academic-records/:semesterId`
**Response** `204 No Content`

---

## Skills

### `GET /me/skills`

**Response** `200 OK`
```json
{
  "technical": [
    { "id": "uuid-v4", "domain": "Web Development", "name": "React", "proficiency": 4 }
  ],
  "soft": [
    { "id": "uuid-v4", "name": "Leadership", "proficiency": 4 }
  ],
  "languages": [
    { "id": "uuid-v4", "name": "English", "proficiency": "Fluent" }
  ]
}
```

### `POST /me/skills/technical`
```json
{ "domain": "Web Development", "name": "React", "proficiency": 4 }
```
**Response** `201 Created`

### `POST /me/skills/soft`
```json
{ "name": "Leadership", "proficiency": 4 }
```
> `proficiency` is optional for soft skills.

**Response** `201 Created`

### `POST /me/skills/languages`
```json
{ "name": "English", "proficiency": "Fluent" }
```
> Allowed values for `proficiency`: `"Basic"`, `"Conversational"`, `"Proficient"`, `"Fluent"`, `"Native"`

**Response** `201 Created`

### `DELETE /me/skills/:type/:id`
Where `:type` is `technical`, `soft`, or `languages`.  
**Response** `204 No Content`

---

## Projects

### `GET /me/projects`

**Response** `200 OK`
```json
[
  {
    "id": "uuid-v4",
    "name": "Portfolio System",
    "description": "A web application for tracking academic progress.",
    "domain": "Web Development",
    "techStack": ["React", "TypeScript", "TailwindCSS"],
    "imageUrl": null,
    "type": "College Project",
    "mentorName": "Prof. Sharma",
    "status": "Ongoing",
    "startDate": "2024-01-01",
    "endDate": null,
    "githubRepo": null,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-06-28T06:00:00.000Z"
  }
]
```

### `POST /me/projects`
```json
{
  "name": "Smart IoT Home Monitor",
  "description": "Hardware and software solution...",
  "domain": "IoT",
  "techStack": ["Python", "Raspberry Pi", "MQTT"],
  "imageUrl": null,
  "type": "Personal Project",
  "mentorName": null,
  "status": "Completed",
  "startDate": "2023-06-01",
  "endDate": "2023-12-01"
}
```
> Allowed `type`: `"College Project"`, `"Personal Project"`, `"Internship Project"`  
> Allowed `status`: `"Ongoing"`, `"Completed"`  
> `mentorName` required when `type` is `"College Project"`.

**Response** `201 Created`

### `PATCH /me/projects/:id`
**Request** (all fields optional) — Same fields as POST.  
**Response** `200 OK`

### `DELETE /me/projects/:id`
**Response** `204 No Content`

---

## Work Experience

### `GET /me/experience`

**Response** `200 OK`
```json
[
  {
    "id": "uuid-v4",
    "organisationName": "Tech Innovations Pvt Ltd",
    "role": "Frontend Developer Intern",
    "startDate": "2023-06-01",
    "endDate": "2023-08-31",
    "description": "Developed scalable UI components...",
    "type": "Internship",
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-06-28T06:00:00.000Z"
  }
]
```

### `POST /me/experience`
```json
{
  "organisationName": "Google",
  "role": "Software Engineering Intern",
  "startDate": "2024-05-01",
  "endDate": null,
  "description": "Working on...",
  "type": "Internship"
}
```
> Allowed `type`: `"Internship"`, `"Part-time"`, `"Full-time"`  
> `endDate` is `null` when currently working.

**Response** `201 Created`

### `PATCH /me/experience/:id`
**Request** (all fields optional) — Same fields as POST.  
**Response** `200 OK`

### `DELETE /me/experience/:id`
**Response** `204 No Content`

---

## Achievements

### `GET /me/achievements`

**Response** `200 OK`
```json
[
  {
    "id": "uuid-v4",
    "title": "1st Place, Smart India Hackathon",
    "description": "Developed a predictive analytics model...",
    "category": "Technical",
    "type": "Hackathon",
    "level": "National",
    "date": "2023-11-20",
    "certificateUrl": null,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-06-28T06:00:00.000Z"
  }
]
```

### `POST /me/achievements`
```json
{
  "title": "Dean's Merit List",
  "description": "Awarded for securing a CGPA in the top 2%...",
  "category": "Academic",
  "type": "Award",
  "level": "College",
  "date": "2023-08-10",
  "certificateUrl": null
}
```
> Allowed `category`: `"Academic"`, `"Co-curricular"`, `"Sports"`, `"Technical"`, `"Cultural"`, `"Other"`  
> Allowed `type`: `"Competition"`, `"Hackathon"`, `"Award"`, `"Certification"`, `"Publication"`, `"Other"`  
> Allowed `level`: `"College"`, `"State"`, `"National"`, `"International"`

**Response** `201 Created`

### `PATCH /me/achievements/:id`
**Request** (all fields optional) — Same fields as POST.  
**Response** `200 OK`

### `DELETE /me/achievements/:id`
**Response** `204 No Content`

