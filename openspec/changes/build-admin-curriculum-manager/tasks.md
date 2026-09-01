## 1. Backend Activity Content Contract

- [x] 1.1 Extend the learning-activity API representation with a nullable structured `content_record` while retaining the existing `content` field, and verify serializer tests cover activities with and without content.
- [x] 1.2 Update curriculum querysets to fetch activity content without per-activity queries, and verify query-count or prefetch assertions cover a nested course response.
- [x] 1.3 Add API coverage confirming authorized content managers can create and patch an activity-content record while unauthorized users receive the existing permission response.

## 2. Admin Session and API Foundation

- [x] 2.1 Add documented admin-platform environment configuration for the Django API base URL and secure-cookie behavior, and verify startup reports a clear configuration error when required production values are missing.
- [x] 2.2 Implement Next.js login, refresh, logout, and current-user route handlers using HTTP-only cookies, and verify route tests cover successful login, one refresh-and-retry, logout, invalid credentials, and expired refresh tokens.
- [x] 2.3 Implement the restricted curriculum API proxy with normalized DRF error handling and an allowlist of required routes and methods, and verify tests reject arbitrary proxy targets while preserving 400, 403, and 404 semantics.
- [x] 2.4 Add TypeScript models and a typed API client for programs, courses, versions, chapters, subtopics, activities, content records, reorder actions, and publication; verify the TypeScript check succeeds without unsafe response casts in feature code.

## 3. Application Shell and Authentication UI

- [x] 3.1 Add the restrained responsive admin shell using shadcn primitives, navigation, status feedback, and accessible focus treatment; verify it renders at desktop and narrow viewport sizes without horizontal overflow.
- [x] 3.2 Implement the sign-in form and protected-route behavior, and verify valid credentials open the course library while invalid credentials and expired sessions show the specified outcomes.
- [x] 3.3 Add current-user context and permission-aware action presentation without treating client checks as authorization, and verify a 403 mutation leaves the session and unsaved editor values intact.

## 4. Course Library and Hierarchy

- [x] 4.1 Implement the course library with program, status, version context, loading/error/empty states, and create-course flow; verify successful creation selects or links to the canonical returned course.
- [x] 4.2 Implement the typed Course -> Version -> Chapter -> Subtopic -> Activity hierarchy in API display order, and verify nested fixtures render each resource once with stable UUID-based selection.
- [x] 4.3 Implement responsive master-detail behavior so wide screens show hierarchy and inspector together and narrow screens use a drill-in/back flow; verify selection survives layout changes.
- [x] 4.4 Add dirty-state protection for hierarchy selection and route changes, and verify users can cancel navigation, discard edits, or remain on the current inspector.

## 5. Curriculum Inspector and CRUD

- [x] 5.1 Implement reusable validated inspector forms for course versions, chapters, subtopics, and activities, including required parent context, statuses, completion rules, objectives, and estimated time; verify field mappings against representative API fixtures.
- [x] 5.2 Implement child creation with draft defaults and automatic parent UUIDs, and verify each created resource reloads the hierarchy and becomes selected.
- [x] 5.3 Implement explicit update and cancel actions with field-level and form-level DRF errors, and verify rejected submissions retain entered values while successful saves show canonical API values.
- [x] 5.4 Implement confirmed deletion with nearest-parent selection and protected-record error handling, and verify both accepted and rejected delete responses leave the hierarchy consistent.

## 6. Content, Ordering, and Publication

- [x] 6.1 Implement activity-content create/edit controls using `content_record`, including content type and a validated JSON fallback that preserves unknown keys; verify round-trip tests cover existing, absent, and extended content objects.
- [x] 6.2 Implement chapter, subtopic, and activity reordering with drag or move controls plus keyboard alternatives, and verify every request contains each sibling UUID exactly once and a failed request restores server order.
- [x] 6.3 Implement permission-aware course-version publication with explicit confirmation and backend validation feedback, and verify the UI never displays an optimistic published state after a rejected request.

## 7. Verification and Handover

- [x] 7.1 Add frontend accessibility coverage for labels, focus order, dialogs, hierarchy controls, and status announcements, and verify the automated accessibility suite reports no serious violations on sign-in, library, and editor routes.
- [x] 7.2 Run Django curriculum/content tests and frontend lint, type-check, component tests, and production build; record commands and verify all checks pass in the supported environment.
- [x] 7.3 Update project documentation with admin-platform setup, environment variables, development commands, authentication behavior, and the supported MVP scope; verify a fresh local setup can reach the course library using the documented steps.
- [x] 7.4 Perform role-based smoke tests as an administrator and content manager for login, authoring, content editing, reorder, permission denial, and publication, and record the observed results for handover.
