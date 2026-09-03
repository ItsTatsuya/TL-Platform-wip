# Tella Web Platform

Next.js 16 frontend for curriculum administration and the responsive student learning experience.

## Local setup

1. Start Django at `http://127.0.0.1:8000` and ensure migrations and `setup_groups` have run.
2. Set `DJANGO_API_URL=http://127.0.0.1:8000/api/v1` and keep `ADMIN_SECURE_COOKIES=false` for local HTTP only. Put them in your shell environment or an ignored `.env.local` file.
3. Run `npm install` and `npm run dev`, then open `http://localhost:3000`.

Staff sign in at `/login` with an `ADMIN`, `ACADEMIC_MANAGER`, or `CONTENT_MANAGER` account. Students sign in at `/learn/login` with a `STUDENT` account, or arrive through the signed Moodle exchange.

## Environment

| Variable | Purpose |
| --- | --- |
| `DJANGO_API_URL` | Server-only Django API root, including `/api/v1` |
| `ADMIN_SECURE_COOKIES` | Set `true` for HTTPS; production defaults to secure cookies for both isolated session types |

Production requests fail clearly when `DJANGO_API_URL` is absent. JWTs remain in HTTP-only, same-site cookies; browser code calls only the allowlisted Next.js proxy.

## Administration scope

- Session login, refresh, current user, and logout
- Course library and draft course creation
- Version, chapter, subtopic, and activity CRUD
- Responsive hierarchy and inspector
- Activity-content JSON with unknown-field preservation
- Keyboard-accessible sibling ordering
- Confirmed course-version publication

Students, cohorts, enrollments, reporting, and media uploads remain managed in the Django portal. Content managers can upload a local video at `/manage/media-assets/new/` and then attach that MediaAsset to a Video record.

## Learner scope

- Separate student-only session and route allowlist under `/learn`
- Responsive dashboard, course library, and nested curriculum map
- Generic lesson content and external/direct video rendering
- Data-driven experiment adapters for GeoGebra materials, structured linear-programming workspaces, placeholders, legacy response fields, and future renderer fallbacks
- Online progress sync, completion, points, badges, and published career opportunities
- Secure learning-check attempts for all supported question types

No lesson or named experiment is embedded in the frontend. The UI renders published curriculum records and experiment definitions received from Django. See `../docs/STUDENT_FRONTEND.md` for the API mapping and Moodle handoff.

## Verification

```bash
npm test
npm run lint
npm run typecheck
npm run build
```
