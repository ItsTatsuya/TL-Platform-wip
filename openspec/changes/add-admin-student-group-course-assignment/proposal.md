## Why

The Next.js administration workspace currently supports curriculum authoring but gives staff no way to organize learners or deliver a course to a cohort. The Django backend already models student groups, memberships, assignments, and enrollments, so exposing a safe, permission-aware workflow in the admin panel closes a major operational gap.

## What Changes

- Add a Learners section and student-group workspace to the Next.js admin panel.
- Allow authorized staff to list, create, inspect, and update student groups and to add or remove student members.
- Allow authorized staff to assign a specific course version to a student group, with an optional due date, and review the group's assignment history.
- Extend the authenticated Next.js proxy and typed client layer to expose only the required student-domain endpoints.
- Keep group assignments effective for students added after the initial assignment by creating the corresponding active enrollments.
- Preserve a student's enrollment when they are removed from a group; enrollment cancellation remains an explicit administrative action.
- Present assignment outcomes and validation conflicts clearly, including existing enrollment conflicts with another version of the same course.
- Restrict group management and course assignment controls using Django-provided permissions, while retaining backend authorization as the source of truth.

## Capabilities

### New Capabilities

- `admin-student-group-management`: Permission-aware administration of student groups and their membership in the Next.js workspace.
- `student-group-course-assignment`: Assignment of versioned courses to cohorts, including enrollment synchronization and observable assignment outcomes.

### Modified Capabilities

None.

## Impact

- **Admin panel:** navigation, protected routes, responsive group list/detail interfaces, forms, typed API client, proxy allowlist, and tests under `admin-platform/`.
- **Django backend:** student-group membership and course-assignment services, serializers or response contracts where needed, and student-domain tests under `tella_backend/students/`.
- **APIs:** existing `/api/v1/student-groups/`, `/student-group-members/`, `/students/`, `/courses/`, `/course-versions/`, and `/course-assignments/` resources; additions should remain backward compatible.
- **Authorization:** `students.manage_student_groups` governs group and membership mutations, and `students.assign_course` governs assignments.
- **Data behavior:** active group assignments synchronize enrollment when a student joins later; removing membership does not implicitly cancel enrollment.
- No new runtime dependency or database model is expected unless implementation discovers that assignment outcome reporting cannot be represented compatibly.
