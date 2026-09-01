# Tella Admin Platform

Next.js 16 and shadcn/ui curriculum administration for the Tella Learning Platform.

## Local setup

1. Start Django at `http://127.0.0.1:8000` and ensure migrations and `setup_groups` have run.
2. Copy `.env.example` to `.env.local`. Keep `ADMIN_SECURE_COOKIES=false` for local HTTP only.
3. Run `npm install` and `npm run dev`, then open `http://localhost:3000`.

Sign in with a Django staff account in `ADMIN`, `ACADEMIC_MANAGER`, or `CONTENT_MANAGER` with applicable curriculum permissions.

## Environment

| Variable | Purpose |
| --- | --- |
| `DJANGO_API_URL` | Server-only Django API root, including `/api/v1` |
| `ADMIN_SECURE_COOKIES` | Set `true` for HTTPS; production defaults to secure cookies |

Production requests fail clearly when `DJANGO_API_URL` is absent. JWTs remain in HTTP-only, same-site cookies; browser code calls only the allowlisted Next.js proxy.

## MVP scope

- Session login, refresh, current user, and logout
- Course library and draft course creation
- Version, chapter, subtopic, and activity CRUD
- Responsive hierarchy and inspector
- Activity-content JSON with unknown-field preservation
- Keyboard-accessible sibling ordering
- Confirmed course-version publication

Students, cohorts, enrollments, assessments, reporting, and media uploads remain in the Django portal for this release.

## Verification

```bash
npm test
npm run lint
npm run typecheck
npm run build
```
