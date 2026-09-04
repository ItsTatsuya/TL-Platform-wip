# Tella Platform API

Version: `v1` · Base URL: `http://127.0.0.1:8000/api/v1/`

Django is the source of truth. Moodle and other clients consume this API and must not implement authorization, enrollment, progress, or scoring rules locally.

For step-by-step data creation with portal/API examples, see [DATA_ENTRY_GUIDE.md](DATA_ENTRY_GUIDE.md).

## Conventions

- IDs are UUIDs unless noted otherwise; timestamps are ISO-8601 UTC.
- Send JSON with `Content-Type: application/json`.
- Authenticated requests use `Authorization: Bearer <access-token>`.
- Collections currently return JSON arrays (pagination is not enabled yet).
- `404` is also used for inaccessible objects to avoid resource-discovery leaks.
- Errors use DRF's `detail` field; validation errors may return field-keyed arrays.

```json
{"detail": "You are not enrolled in this course."}
```

## Authentication

### Login

`POST /auth/login/`

```json
{"email": "student@example.com", "password": "your-password"}
```

Returns `access` and `refresh`. Access tokens default to 15 minutes; refresh tokens default to seven days and rotate with blacklist protection.

### Refresh and logout

- `POST /auth/refresh/` with `{"refresh":"<refresh-token>"}`.
- `POST /auth/logout/` (Bearer token required) with the same refresh payload. Returns `204` and blacklists the token.

### Current user

`GET /auth/me/` (Bearer token required)

```json
{"id":"<uuid>","email":"teacher@example.com","username":"teacher","first_name":"Ada","last_name":"Lovelace","display_name":"Ada Lovelace","is_active":true,"date_joined":"2026-08-28T10:00:00Z","groups":["TEACHER"],"permissions":["accounts.view_user"]}
```

### Moodle exchange

`POST /auth/moodle/exchange/` is an unauthenticated signed bridge. Request fields: `moodle_user_id`, `email`, optional names, Unix `timestamp`, and HMAC-SHA256 `signature`. Sign `{moodle_user_id}|{lowercase_email}|{timestamp}` with `MOODLE_SSO_SECRET`; timestamps older than five minutes are rejected. Django creates/resolves an `ExternalUserMapping` (`MOODLE`) and returns JWTs plus the user.

## Authorization

Roles are Django Groups: `SUPER_ADMIN`, `ADMIN`, `ACADEMIC_MANAGER`, `CONTENT_MANAGER`, `TEACHER`, and `STUDENT`. `StudentGroup` is a separate class/cohort model. Students see only published curriculum for active, unexpired enrollments pinned to the requested CourseVersion. Teachers see only students in assigned StudentGroups. Sensitive writes are checked by API permissions and domain services.

## Curriculum

Hierarchy: `Program → Course → CourseVersion → Chapter → Subtopic → LearningActivity`.

All resources use standard collection `GET`/`POST` and detail `GET`/`PUT`/`PATCH`/`DELETE`, subject to permissions.

| Resource | Routes and actions | Key fields |
| --- | --- | --- |
| Programs | `/programs/`, `/programs/{id}/` | `name`, unique `code`, `description`, `grade`, `status`, nested courses |
| Courses | `/courses/`, `/courses/{id}/`; `/courses/{id}/chapters/`, `/publish/`, `/duplicate/` | `program`, `name`, unique `code`, `status`, `display_order`, nested versions |
| Versions | `/course-versions/`, `/course-versions/{id}/`; `POST /{id}/reorder_chapters/` | unique `(course, version_number)`, `name`, `status`, `published_at` |
| Chapters | `/chapters/`, `/chapters/{id}/`; `/subtopics/`, `/reorder_subtopics/` | `course_version`, title/slug/number, `completion_rule`, nested subtopics |
| Subtopics | `/subtopics/`, `/subtopics/{id}/`; `/activities/`, `/reorder_activities/` | `chapter`, title/slug, objectives, nested activities |
| Activities | `/activities/`, `/activities/{id}/` | `subtopic`, `activity_type`, title, required flag, completion rule, status |

Statuses: `DRAFT`, `IN_REVIEW`, `APPROVED`, `PUBLISHED`, `ARCHIVED`. Publishing never exposes draft records to students.

## Content and media

| Resource | Route | Core fields |
| --- | --- | --- |
| Activity content | `/activity-content/` | `activity`, `content_type`, flexible `content` JSON |
| Videos | `/videos/` | media/thumbnail, title, duration, transcript, captions, completion percentage (default 90) |
| Experiments | `/experiments/` | activity, type (`HTML_INTERACTIVE`, `EMBEDDED`, `SIMULATION`, `QUESTION_BASED`), instructions/configuration |
| Practice sets/items | `/practice-sets/`, `/practice-items/` | ordered video/question/practice sequence |
| Media assets | `/media-assets/` | file metadata, storage path, CDN URL, status |

Media stores metadata and supports S3-compatible storage; large videos are not streamed through Django.

## Students and enrollment

| Resource | Routes | Rules |
| --- | --- | --- |
| Students | `/students/`, `/students/{id}/` | Teachers see assigned-cohort students; students see themselves |
| Student groups | `/student-groups/`, `/student-groups/{id}/` | Cohort name/code/grade/year/teacher/status |
| Teachers | `/teachers/` | Active users eligible for optional student-group teacher assignment |
| Memberships | `/student-group-members/`, `/student-group-members/{id}/`; `POST /student-groups/{id}/members/` | Unique `(student_group, student)`; body `{"student":"<uuid>"}` |
| Enrollments | `/enrollments/`, `/enrollments/{id}/` | Exact CourseVersion; `ACTIVE`, `COMPLETED`, `SUSPENDED`, `EXPIRED`, `CANCELLED` |
| Assignments | `/course-assignments/`, `/course-assignments/{id}/` | Exactly one of `student_group` or `student`; atomic enrollment creation |

`GET /course-assignments/?student_group=<uuid>` safely filters the caller's already-scoped assignment queryset. A successful assignment creation may include `enrollment_outcome` with `created`, `existing`, and `targeted` counts. Active group assignments are also applied atomically when a student joins later. A conflicting active enrollment in another version of the same course rolls back the membership or assignment operation. Removing a group membership does not cancel or delete existing enrollments.
| LMS mappings | `/external-user-mappings/`, `/external-user-mappings/{id}/` | Unique `(provider, external_user_id)` |

```json
{"student":"<user-uuid>","course":"<course-uuid>","course_version":"<version-uuid>","status":"ACTIVE","expires_at":null}
```

## Progress

Progress is persisted and propagated: `ActivityProgress → SubtopicProgress → ChapterProgress → CourseProgress`.

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/me/progress/` | Current user's course snapshots |
| `GET` | `/me/courses/{course_id}/progress/` | Course snapshot |
| `GET` | `/me/chapters/{chapter_id}/progress/` | Chapter snapshot |
| `GET` | `/me/activities/{activity_id}/progress/` | Activity snapshot |
| `POST` | `/activities/{activity_id}/start/` | Start enrolled activity |
| `POST` | `/activities/{activity_id}/progress/` | Record percentage/time/metadata |
| `POST` | `/activities/{activity_id}/complete/` | Complete server-side |

```json
{"progress_percentage":75,"time_spent_seconds":420,"metadata":{"player":"moodle"}}
```

Percentages must be 0–100. Writes require an active, unexpired, exact-version enrollment and use transactions/row locks. Legacy workshop clients may continue using `POST /progress/` with `activity`, `status`, `extra`, and `event`.

## Assessments

| Operation | Route |
| --- | --- |
| Question bank/options | `/questions/`, `/question-options/` |
| Case studies/links | `/case-studies/`, `/case-study-questions/` |
| Learning checks | `/learning-checks/`, `/learning-checks/{id}/` |
| Start attempt | `POST /learning-checks/{id}/start/` |
| Submit attempt | `POST /learning-checks/{id}/submit/` |
| Own results | `GET /learning-checks/{id}/results/` |

Question types: `MCQ`, `MULTI_SELECT`, `TRUE_FALSE`, `NUMERIC`, `SHORT_TEXT`, `LONG_TEXT`, `MATH_EXPRESSION`.

```json
{"attempt_id":"<attempt-uuid>","answers":[{"question":"<question-uuid>","answer":"<option-uuid>"}],"time_spent_seconds":95}
```

The server verifies question membership, enrollment, ownership, publication, and `max_attempts`; calculates marks/pass-fail from canonical data; ignores client scores; and updates chapter learning-check progress.

## Workshop compatibility

`GET/POST /workshop-models/`, `GET/PUT/PATCH /workshop-models/{id}/`, `GET /gamification/me/`, `GET /career/opportunities/`, and public `GET /health/` remain available for the existing Moodle workshop.

## Management portal

The Django Template portal is at `/manage/`, separate from `/admin/`. Current screens cover dashboard, programs, courses, student groups, enrollments, questions, learning checks, user/group access, and permission management. Forms use CSRF protection and every view checks Django permissions server-side.

## Status codes and client rules

`200` success · `201` created · `204` no content · `400` validation/domain error · `401` missing/invalid JWT · `403` authenticated but unauthorized · `404` missing or intentionally hidden resource.

Clients must use `/api/v1/`, treat IDs as opaque, send JWTs, never calculate authoritative scores/progress, and never assume course access without a valid enrollment.
