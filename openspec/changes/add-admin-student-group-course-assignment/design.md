## Context

See `proposal.md` for motivation. The Next.js admin platform currently proxies a narrow allowlist of curriculum resources through HTTP-only JWT cookies and exposes only course navigation. Django already owns `StudentGroup`, `StudentGroupMember`, `CourseAssignment`, and `Enrollment`, plus their permissions and API viewsets.

The current assignment service atomically enrolls members present when an assignment is created. Membership creation does not apply earlier assignments, membership deletion does not revoke enrollments, and assignment responses do not summarize enrollment outcomes. The browser must continue talking only to same-origin Next.js routes; Django remains the authorization and validation authority.

## Goals / Non-Goals

**Goals:**

- Extend the existing authenticated proxy pattern to the minimum student-domain operations required by the workspace.
- Add a responsive group directory and a focused group-detail experience for membership and course assignment.
- Make membership creation and inherited enrollment synchronization atomic.
- Preserve backward compatibility for existing Django API consumers.
- Make permission boundaries and partial/conflicting outcomes clear in the UI and tests.

**Non-Goals:**

- Bulk import, CSV upload, or automatic cohort generation.
- Creating student or teacher accounts from the group workspace.
- Direct enrollment cancellation or reassignment between course versions.
- Student progress, assessment, or reporting views.
- Automatically revoking access when group membership or an assignment ends.
- Replacing Django permissions with client-side authorization.

## Decisions

### 1. Use a Learners workspace with list and detail routes

Add `/student-groups` for the directory and `/student-groups/[groupId]` for group details. The detail route owns three coherent sections: group metadata, members, and course assignments. On narrow screens these stack vertically; on wide screens metadata and actions can sit beside the primary member/assignment content.

This is preferred over adding assignment controls to the curriculum editor because delivery is cohort-centered, while the editor is authoring-centered. A single modal from the course library was also rejected because it provides too little membership and assignment-history context.

### 2. Add a separate typed student-domain client and narrowly scoped proxy route

Create a student-domain client/types module rather than expanding curriculum types. Add a same-origin route such as `/api/learners/[...path]` backed by the existing authenticated request helper. Its policy will enumerate allowed methods and shapes for `students`, `student-groups`, `student-group-members`, and `course-assignments`; curriculum reads required by the assignment form continue through the existing curriculum proxy.

This preserves the current credential boundary and makes proxy exposure auditable. A generic pass-through proxy is rejected because it would broaden reachable Django operations unnecessarily.

### 3. Treat Django permissions as authoritative and mirror them for affordances

Navigation requires the relevant view permission. Create/edit/member actions require `students.manage_student_groups`; assignment controls require `students.assign_course`. The UI reads these from the existing authenticated user payload to hide unavailable affordances, but every request is still authorized by Django.

This avoids misleading controls without trusting the browser as a security boundary.

### 4. Synchronize inherited enrollments inside membership creation

Extend the domain service used by both membership endpoints so it locks the student/group assignment context, validates every active assignment, creates missing matching enrollments, and creates the membership within one database transaction. A conflict with an active enrollment in another version of the same course aborts the entire operation.

This gives an active group assignment durable meaning for future members. Asynchronous synchronization was rejected because it introduces a window where membership exists without access and there is no worker infrastructure currently in scope.

### 5. Keep removal non-destructive

Deleting `StudentGroupMember` removes only cohort membership. Existing enrollments remain until an explicit enrollment workflow changes them. This avoids unexpectedly removing course access that may also be justified by an individual assignment or another group.

Automatic revocation was rejected because the enrollment model does not record assignment provenance, so safe ownership cannot be determined.

### 6. Preserve assignment creation compatibility while adding outcome metadata

Keep the current assignment resource fields and endpoint. Add a backward-compatible, read-only outcome representation if needed—for example counts of newly created and already-existing enrollments in the create response—without requiring existing callers to send new fields. The service returns an explicit result object internally so the API can communicate outcomes while retaining transactional behavior.

The UI filters a selected course's versions client-side and defaults to a published version when available. Django continues validating course/version correspondence. Draft versions may remain selectable only when returned to and permitted for the signed-in administrator, avoiding a new publication policy in this change.

### 7. Load group details from existing resources instead of introducing a composite endpoint

Use the group detail (including serialized memberships), filtered assignment collection, student directory, and curriculum collections. Where supported, pass resource filters such as `student_group=<id>`; if the current viewsets do not honor them, add explicit safe filtering rather than downloading unrelated assignments.

A bespoke dashboard endpoint is deferred because existing resources can support the screen and remain useful independently.

## Risks / Trade-offs

- **[Enrollment can outlive group membership]** -> State this behavior in removal confirmation and leave cancellation to an explicit future enrollment-management workflow.
- **[One conflicting member blocks assignment for the full group]** -> Preserve atomicity and return actionable conflict context so the administrator can resolve the enrollment before retrying.
- **[Large embedded membership arrays can make group lists expensive]** -> Use compact list serialization or defer full memberships to detail retrieval if observed payloads become large; tests should prevent accidental unbounded detail in directory rendering.
- **[Concurrent assignment and membership mutations can race]** -> Use transactions and row-level locks around relevant memberships, assignments, and active enrollment checks, while retaining database uniqueness constraints as the final guard.
- **[UI permission data can become stale]** -> Treat it only as an affordance hint and surface backend 403 responses consistently.
- **[Teacher names may not be available from current group serialization]** -> Display teacher identity only when the API supplies safe detail; the group form may initially allow no teacher unless an eligible teacher source is available.

## Migration Plan

1. Deploy backward-compatible backend service, filtering, response, and test changes first; no data migration is expected.
2. Deploy the Next.js proxy allowlist, typed client, routes, components, and tests.
3. Run the idempotent permission-group synchronization if deployed environments have not already received `students.manage_student_groups` and `students.assign_course`.
4. Verify with an authorized admin, a read-only user, an empty group, a populated group, and a conflicting enrollment case.
5. Roll back the admin routes independently if needed. Backend synchronization changes can be rolled back without schema changes; memberships and enrollments already created remain valid records.
