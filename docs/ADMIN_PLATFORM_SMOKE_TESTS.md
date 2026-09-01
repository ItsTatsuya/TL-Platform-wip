# Admin platform smoke-test record

Change: `build-admin-curriculum-manager`

## Automated role and workflow evidence

| Workflow | Evidence |
| --- | --- |
| Academic manager reads and authors curriculum | Django `CurriculumApiTests` |
| Content manager creates and updates activity content | Django `ContentApiTests.test_content_manager_can_create_and_patch_activity_content` |
| Student is denied content mutation | Django `ContentApiTests.test_student_cannot_create_or_patch_activity_content` |
| Content manager is denied publication | Django `CurriculumApiTests.test_content_manager_cannot_publish_course_api` |
| Session refresh and expiration | Frontend `session.test.ts` |
| Extended JSON survives authoring | Frontend `api.test.ts` |
| Reorder retains every sibling once | Frontend `ordering.test.ts` |
| Rejected publication stays rejected | Frontend `api.test.ts` |

## Deployment smoke test

1. Sign in as an administrator and open a course.
2. Create a draft version, chapter, subtopic, and activity.
3. Edit activity content, reload, and confirm every JSON key remains.
4. Move the activity using keyboard controls and reload to confirm order.
5. Attempt incomplete publication and confirm the blocking error.
6. Complete prerequisites, publish, and verify returned status.
7. As a content manager, edit content and confirm publication is unavailable or denied.
8. Sign out and confirm protected pages return to sign-in.

Automated tests cover repository roles. Repeat deployment-specific cookies and browser behavior against the target HTTPS origin.
