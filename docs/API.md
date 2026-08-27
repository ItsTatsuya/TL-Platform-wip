# Tella Backend API Reference

This document tracks the implemented Django REST API. Django is the source of truth; Moodle consumes these APIs and must not reproduce authorization, curriculum, progress, or scoring rules.

## Environments and conventions

Local base URL:

```text
http://127.0.0.1:8000/api/v1/
```

All routes below are relative to `/api/v1/`. UUIDs are serialized as strings and timestamps use ISO 8601. Send and accept JSON unless an endpoint states otherwise.

Authenticated requests use:

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

Collection endpoints currently return JSON arrays. Pagination will be introduced before large production datasets are exposed.

## Authentication

### Login

```http
POST /api/v1/auth/login/
```

Request:

```json
{
  "email": "student@example.com",
  "password": "your-password"
}
```

Response:

```json
{
  "refresh": "<refresh-token>",
  "access": "<access-token>"
}
```

Access-token lifetime defaults to 15 minutes. Refresh-token lifetime defaults to seven days.

### Refresh

```http
POST /api/v1/auth/refresh/
```

```json
{
  "refresh": "<refresh-token>"
}
```

Refresh tokens rotate. The old token is blacklisted after a successful refresh.

### Logout

```http
POST /api/v1/auth/logout/
Authorization: Bearer <access-token>
```

```json
{
  "refresh": "<refresh-token>"
}
```

Successful logout returns `204 No Content` and blacklists the refresh token.

### Current user

```http
GET /api/v1/auth/me/
```

Response shape:

```json
{
  "id": "3af22e2c-58a7-4a6d-88e6-cb20ad501d55",
  "email": "teacher@example.com",
  "username": "teacher",
  "first_name": "Ada",
  "last_name": "Lovelace",
  "display_name": "Ada Lovelace",
  "is_active": true,
  "date_joined": "2026-08-27T12:00:00Z",
  "groups": ["TEACHER"],
  "permissions": ["accounts.view_user", "curriculum.view_course"]
}
```

### Moodle SSO exchange

```http
POST /api/v1/auth/moodle/exchange/
```

Request:

```json
{
  "moodle_user_id": "42",
  "email": "student@example.com",
  "first_name": "Student",
  "last_name": "Example",
  "timestamp": 1787822400,
  "signature": "<hex-hmac-sha256>"
}
```

The signature payload is:

```text
{moodle_user_id}|{lowercase_email}|{timestamp}
```

Sign it with `MOODLE_SSO_SECRET`. The timestamp must be within five minutes. A successful exchange returns `access`, `refresh`, and the serialized user. Django resolves or creates an `ExternalUserMapping` for provider `MOODLE`.

## Authorization summary

- `SUPER_ADMIN` receives all current Django permissions.
- `ADMIN` can manage users and operational curriculum data but cannot manage permissions or grant `SUPER_ADMIN`.
- `ACADEMIC_MANAGER` can create and edit the curriculum and has publishing permissions.
- `CONTENT_MANAGER` can edit permitted content but cannot publish.
- `TEACHER` reads only StudentGroups assigned to them and students belonging to those groups.
- `STUDENT` only receives published curriculum for actively enrolled courses.

Unsafe curriculum methods require the corresponding Django model permission. Publishing is checked separately in the API and service layer.

## Curriculum resources

The hierarchy is:

```text
Program
└── Course
    └── CourseVersion
        └── Chapter
            └── Subtopic
                └── LearningActivity
```

Supported publication statuses are:

```text
DRAFT
IN_REVIEW
APPROVED
PUBLISHED
ARCHIVED
```

### Programs

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/programs/` | List accessible programs with nested courses. |
| `POST` | `/programs/` | Create a program. Requires `curriculum.add_program`. |
| `GET` | `/programs/{id}/` | Retrieve a program. |
| `PUT/PATCH` | `/programs/{id}/` | Update a program. |
| `DELETE` | `/programs/{id}/` | Delete where protected academic relationships allow it. |

Create request:

```json
{
  "name": "Grade 9 Mathematics",
  "code": "grade-9-mathematics",
  "description": "Core mathematics curriculum.",
  "grade": "9",
  "status": "DRAFT"
}
```

### Courses

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/courses/` | List accessible courses and their permitted hierarchy. |
| `POST` | `/courses/` | Create a course. |
| `GET` | `/courses/{id}/` | Retrieve a course, versions, and nested structure. |
| `PUT/PATCH` | `/courses/{id}/` | Update a course. |
| `DELETE` | `/courses/{id}/` | Delete where protected history allows it. |
| `GET` | `/courses/{id}/chapters/` | List accessible chapters across the course's visible versions. |
| `POST` | `/courses/{id}/publish/` | Publish a selected course version. |
| `POST` | `/courses/{id}/duplicate/` | Duplicate the complete course hierarchy as drafts. |

Create request:

```json
{
  "program": "<program-uuid>",
  "name": "Grade 9 Mathematics",
  "code": "math-9",
  "description": "Mathematics course",
  "thumbnail": null,
  "status": "DRAFT",
  "display_order": 0
}
```

Publish request:

```json
{
  "version_id": "<course-version-uuid>"
}
```

The parent Program must already be published, and the version must contain at least one Chapter. Publication sets `published_at` and publishes the parent Course.

Duplicate request:

```json
{
  "name": "Grade 9 Mathematics Copy",
  "code": "math-9-copy"
}
```

`code` is required and globally unique.

### Course versions

| Method | Route | Purpose |
| --- | --- | --- |
| `GET/POST` | `/course-versions/` | List or create versions. |
| `GET/PUT/PATCH/DELETE` | `/course-versions/{id}/` | Retrieve or modify a version. |
| `POST` | `/course-versions/{id}/reorder_chapters/` | Transactionally reorder every Chapter. |

Create request:

```json
{
  "course": "<course-uuid>",
  "version_number": 2026,
  "name": "2026 Curriculum",
  "status": "DRAFT"
}
```

Historical progress remains attached to its CourseVersion. The combination of Course and `version_number` is unique.

### Chapters

| Method | Route | Purpose |
| --- | --- | --- |
| `GET/POST` | `/chapters/` | List or create chapters. |
| `GET/PUT/PATCH/DELETE` | `/chapters/{id}/` | Retrieve or modify a chapter. |
| `GET` | `/chapters/{id}/subtopics/` | List accessible Subtopics. |
| `POST` | `/chapters/{id}/reorder_subtopics/` | Transactionally reorder every Subtopic. |

Create request:

```json
{
  "course_version": "<course-version-uuid>",
  "title": "Algebra",
  "slug": "algebra",
  "description": "Introduction to algebra.",
  "chapter_number": 1,
  "estimated_minutes": 90,
  "is_required": true,
  "status": "DRAFT",
  "display_order": 0,
  "completion_rule": {
    "required_subtopics": true,
    "case_study_required": true,
    "learning_check_required": true,
    "learning_check_pass_percentage": 70
  }
}
```

Chapter slugs and chapter numbers are unique within a CourseVersion.

### Subtopics

| Method | Route | Purpose |
| --- | --- | --- |
| `GET/POST` | `/subtopics/` | List or create Subtopics. |
| `GET/PUT/PATCH/DELETE` | `/subtopics/{id}/` | Retrieve or modify a Subtopic. |
| `GET` | `/subtopics/{id}/activities/` | List accessible activities. |
| `POST` | `/subtopics/{id}/reorder_activities/` | Transactionally reorder every activity. |

Create request:

```json
{
  "chapter": "<chapter-uuid>",
  "title": "Variables",
  "slug": "variables",
  "description": "Using variables in expressions.",
  "learning_objectives": ["Identify variables", "Evaluate expressions"],
  "estimated_minutes": 30,
  "display_order": 0,
  "is_required": true,
  "status": "DRAFT"
}
```

### Learning activities

| Method | Route | Purpose |
| --- | --- | --- |
| `GET/POST` | `/activities/` | List or create activities. |
| `GET/PUT/PATCH/DELETE` | `/activities/{id}/` | Retrieve or modify an activity. |
| `GET` | `/activities/{id}/workshop/` | Retrieve an activity with workshop configuration. |

Create request:

```json
{
  "subtopic": "<subtopic-uuid>",
  "activity_type": "CONCEPT_VIDEO",
  "title": "Understanding variables",
  "description": "Concept introduction.",
  "display_order": 0,
  "is_required": true,
  "estimated_minutes": 10,
  "completion_rule": {"watch_percentage": 90},
  "status": "DRAFT"
}
```

Current activity types:

```text
CONCEPT_VIDEO, EXPERIMENT, CONCEPT_OVERVIEW, OBSERVE_LEARN_PRACTICE,
HOMEWORK, INTERACTIVE_WORKSHOP, SIMULATION, READING, PDF, INTERACTIVE,
ASSIGNMENT, PROJECT, LIVE_CLASS, FLASHCARD
```

### Reordering payload

All reorder actions require every child UUID exactly once:

```json
{
  "ids": [
    "<first-child-uuid>",
    "<second-child-uuid>"
  ]
}
```

Missing, duplicate, or unrelated IDs are rejected. Reordering locks the affected rows and updates them transactionally.

## Student curriculum filtering

For users in the `STUDENT` Django Group, the backend automatically enforces:

1. an active Enrollment for the Course;
2. a published Program and Course;
3. a published CourseVersion;
4. published Chapters, Subtopics, and LearningActivities.

Inaccessible objects return `404`; Moodle must not receive hidden curriculum and then decide whether to render it.

## Content and media resources

Phase 3 separates flexible activity content and object-storage metadata from the curriculum hierarchy.

| Resource | Collection route | Purpose |
| --- | --- | --- |
| Activity content | `/activity-content/` | Flexible JSON content for a LearningActivity. |
| Videos | `/videos/` | Media reference, transcript, captions, duration, and completion rule. |
| Experiments | `/experiments/` | Interactive or embedded experiment configuration. |
| Practice sets | `/practice-sets/` | Observe-Learn-Practice sequence definition. |
| Practice items | `/practice-items/` | Ordered video/question/practice entries. |
| Media assets | `/media-assets/` | Storage path/CDN metadata for local or object storage. |

Each collection supports standard `GET`/`POST` operations and each `/{id}/` route supports `GET`, `PUT`, `PATCH`, and `DELETE`, subject to Django permissions and protected relationships.

## Students, cohorts, enrollment, and assignments

`StudentGroup` is a real class/cohort and is distinct from the Django authentication `Group` used for RBAC.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/students/` and `/students/{id}/` | Scoped student directory. Teachers see assigned groups; students see themselves. |
| `GET/POST` | `/student-groups/` | List or create cohorts. |
| `GET/PUT/PATCH/DELETE` | `/student-groups/{id}/` | Manage a cohort. |
| `POST` | `/student-groups/{id}/members/` | Add a Django `STUDENT` user with `{"student": "<uuid>"}`. |
| `GET/POST` | `/student-group-members/` | List or create memberships. |
| `GET/POST` | `/enrollments/` | List or create version-pinned enrollments. |
| `GET/POST` | `/course-assignments/` | Assign a course version to exactly one cohort or student. |
| `GET/POST` | `/external-user-mappings/` | Manage provider-to-Django-user identities. |

Enrollment statuses are `ACTIVE`, `COMPLETED`, `SUSPENDED`, `EXPIRED`, and `CANCELLED`. Student curriculum access requires `ACTIVE`, an unexpired `expires_at`, and the exact CourseVersion containing the requested content. Assignment and enrollment creation are atomic; group assignment creates enrollments for current members and refuses to overwrite an active enrollment in another version.

Enrollment request:

```json
{
  "student": "<user-uuid>",
  "course": "<course-uuid>",
  "course_version": "<course-version-uuid>",
  "status": "ACTIVE",
  "expires_at": null
}
```

Course assignment requires exactly one of `student_group` or `student`.

## Workshop and legacy progress endpoints

These routes support the current Business Mathematics Moodle workshop while the later progress and assessment phases are developed.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET/POST` | `/workshop-models/` | List or save the authenticated learner's models. |
| `GET/PUT/PATCH` | `/workshop-models/{id}/` | Retrieve or update an owned model. |
| `POST` | `/progress/` | Upsert current workshop activity progress. |
| `GET` | `/gamification/me/` | Return the current user's points and badges. |
| `GET` | `/career/opportunities/` | Return published career-opportunity stubs. |
| `GET` | `/health/` | Public service health response: `{"ok": true}`. |

Progress request:

```json
{
  "activity": "<activity-uuid>",
  "status": "in_progress",
  "extra": {"screen": "B"},
  "event": "explore_slopes"
}
```

Supported workshop events are `load_sample`, `explore_slopes`, `reach_peak`, and `export_report`.

## Common status codes

| Code | Meaning |
| --- | --- |
| `200` | Successful read or update. |
| `201` | Resource created. |
| `204` | Successful logout or reorder with no body. |
| `400` | Invalid request or domain validation failure. |
| `401` | Missing, expired, or invalid authentication. |
| `403` | Authenticated but missing the required permission. |
| `404` | Resource does not exist or is inaccessible to this user. |
| `409` | Reserved for future explicit conflict responses. |

## Maintenance rule

Update this file in the same change whenever an API route, payload, permission requirement, status, or response shape changes. API implementation and tests remain authoritative if this document becomes inconsistent.
