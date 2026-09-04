## 1. Backend Enrollment Semantics

- [x] 1.1 Add service-level tests for assigning a course version to populated and empty groups, preserving matching enrollments, and rolling back the full operation on a version conflict; verify the focused Django student tests fail before and pass after implementation.
- [x] 1.2 Refactor course-assignment creation to return or expose backward-compatible created/already-enrolled outcome counts while preserving atomic assignment and enrollment creation; verify existing API payload fields and assignment tests remain compatible.
- [x] 1.3 Add tests for adding a member to a group with active assignments, including matching enrollment, multiple assignments, and conflicting-version rollback cases; verify membership and enrollment counts assert atomic behavior.
- [x] 1.4 Make group membership creation atomically synchronize all active group assignments and produce actionable conflict validation; verify both membership creation endpoints exercise the shared service behavior.
- [x] 1.5 Add deletion coverage proving that removing a group membership leaves existing enrollments unchanged; verify the student-domain API test passes.
- [x] 1.6 Add safe `student_group` filtering and any non-breaking display/outcome fields needed by the assignment and group-detail APIs; verify API tests reject invisible data and return only assignments for the requested visible group.

## 2. Admin API Boundary

- [x] 2.1 Define typed student, membership, student-group, assignment, and assignment-outcome contracts plus a student-domain client; verify client tests cover list, detail, create, update, add-member, remove-member, and assign-course request shapes.
- [x] 2.2 Add a dedicated authenticated learners proxy route using the existing cookie refresh/session helper; verify expired-session and backend-error behavior matches the curriculum proxy.
- [x] 2.3 Implement a strict learners proxy allowlist for only the required methods and resource paths; verify policy tests accept intended student-domain requests and reject auth paths, traversal, unrelated endpoints, and unsupported mutations.
- [x] 2.4 Support filtered assignment reads through the typed client and proxy without broadening arbitrary query forwarding; verify a group detail request cannot retrieve assignments outside the signed-in user's backend scope.

## 3. Student-Group Directory

- [x] 3.1 Add permission-aware Learners navigation with active-route styling for desktop and mobile shells; verify users without student-group view permission do not receive the navigation item.
- [x] 3.2 Add the protected `/student-groups` route and responsive directory component with group context, member counts, loading, empty, error, and retry states; verify component tests cover each observable state.
- [x] 3.3 Add a permission-gated create-group dialog with retained values and actionable API validation feedback; verify successful creation navigates to the canonical group detail and unauthorized users have no create control.

## 4. Group Detail and Membership

- [x] 4.1 Add the protected `/student-groups/[groupId]` route with responsive metadata, member, and assignment sections; verify unknown or inaccessible group responses render a safe error and return path.
- [x] 4.2 Add permission-gated group detail/status editing with canonical reload after save; verify client-side tests cover successful save and server validation retention.
- [x] 4.3 Add an eligible-student selector that excludes displayed members and a member list with useful identity context; verify keyboard interaction and duplicate-member handling in component tests.
- [x] 4.4 Add permission-gated member removal confirmation that explicitly states enrollment preservation; verify success refreshes the group and failure leaves the member visible with an actionable error.

## 5. Group Course Assignment

- [x] 5.1 Add a permission-gated assignment form that selects a course, filters its versions, prefers a published version, accepts an optional due date, and retains selections on failure; verify mismatched course/version submission is prevented in the UI and rejected by the API.
- [x] 5.2 Display assignment success outcomes for new, existing, and zero-member enrollments and actionable conflict feedback; verify component tests distinguish success from rolled-back failure.
- [x] 5.3 Add group assignment history showing course, version, status, assigned time, optional due date, and available assigner context; verify active and historical states remain distinguishable on narrow and wide layouts.

## 6. Verification and Documentation

- [x] 6.1 Add accessibility coverage for the group directory, create dialog, member controls, removal confirmation, and assignment form; verify automated checks report no serious or critical violations and keyboard focus behavior is asserted.
- [x] 6.2 Run the focused Django student tests and the full Django test suite; verify no regression in existing enrollment, permission, or assignment behavior.
- [x] 6.3 Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` in `admin-platform`; verify all admin-panel checks succeed.
- [x] 6.4 Update the admin-platform and API documentation with routes, permissions, group-assignment semantics, future-member synchronization, and non-revoking removal behavior; verify examples match the delivered request and response contracts.
