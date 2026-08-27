# Phase 8 — Gamification, Progress Tracking & Moodle SSO

**Goal:** Make the workshop feel rewarding, persist learner state, and integrate cleanly with university Moodle instances (including the VUV collaboration requirements).

## 8.1 Progress Model

Use the ActivityProgress / SubtopicProgress hierarchy from the PRD.  
For the workshop specifically track:

- Screens visited
- Whether the learner reached the peak (manually or via Solve)
- Number of slope explorations on Screen B
- Saved WorkshopModel instances

## 8.2 Lightweight Gamification

- Points for: loading sample, exploring both slopes, reaching the peak, exporting the report
- Badges: “First Peak”, “Slope Reader”, “Business Optimiser”
- Optional simple ranking within a cohort (teacher-visible only)

Keep the tone professional and adult; avoid childish animations.

## 8.3 Moodle SSO / Authentication Bridge

- Students authenticate with their normal Moodle credentials.
- Plugin obtains a short-lived token or uses Moodle’s web-service token to call the Django API.
- Django side supports token exchange or JWT issued after Moodle validation.
- Single Sign-On experience: no second login form inside the workshop.

## 8.4 Industry / Career Portal Stubs (from FI–VUV proposal)

Prepare a dedicated section or navigation item that can later surface:

- Internship notifications
- Practical projects
- Earn-while-you-learn opportunities
- Job openings

For the current phase a static placeholder + API endpoint is sufficient.

## 8.5 Acceptance Criteria

- [ ] Progress is saved and restored across sessions
- [ ] Points and at least two badges are awarded correctly
- [ ] A Moodle user can open the workshop without a second login
- [ ] Django receives the correct user identity and can associate progress
- [ ] Career portal placeholder is reachable and styled consistently

## 8.6 Future Extension Note

The same progress and gamification framework will be reused for the AI for Business Management track.