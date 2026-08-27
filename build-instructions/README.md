# Grok Build Instructions — Skill Enhancement Learning Platform (Moodle Plugin + Django Backend)

**Target:** Production-grade Moodle plugin and supporting Django backend for European university skill-enhancement modules.  
**Primary Focus (Phase 1 deliverable):** Business Mathematics Multivariable Modelling Workshop (interactive “profit landscape” module).  
**Secondary Track:** AI for Business Management (scaffolded for later phases).  
**Architecture (from PRD):** Django + DRF owns curriculum, content, progress, assessments and business logic. Moodle plugin is the student experience layer only.  
**Style requirement:** Clean, modern, aesthetically pleasing UI within Moodle constraints (isolated CSS, modern typography, subtle shadows, consistent colour system, no heavy Moodle chrome where avoidable).

## Document Index

| File | Purpose |
|------|---------|
| `00_DEVELOPMENT_ENVIRONMENT_SETUP.md` | Clone Moodle, create plugin skeleton, local run commands, verification |
| `01_PHASE1_BACKEND_FOUNDATION.md` | Django project, custom user, core domain models (adapted for skill modules) |
| `02_PHASE2_WORKSHOP_DATA_MODEL_AND_MATH.md` | Exact profit / slope / optimum formulas, validation, sample data, storage shape |
| `03_PHASE3_MOODLE_PLUGIN_STRUCTURE.md` | Plugin folder layout, version.php, lib.php, AMD modules, CSS isolation |
| `04_PHASE4_SCREEN_A_ENTER_BUSINESS.md` | Input table + 3-D / contour landscape rendering |
| `05_PHASE5_SCREEN_B_HOLD_ONE_STILL.md` | **Highest priority** — linked cutting plane + 2-D curve + live slope sentences |
| `06_PHASE6_SCREEN_C_WALK_UPHILL.md` | Dual sliders, live profit counter, uphill arrow, solve animation |
| `07_PHASE7_SCREEN_D_REPORT_EXPORT.md` | Recommendation sentence, sensitivity, PDF export (client-side preferred) |
| `08_PHASE8_GAMIFICATION_PROGRESS_SSO.md` | Points, badges, progress tracking, Moodle SSO, industry portal stubs |
| `09_PHASE9_UI_POLISH_AND_ACCESSIBILITY.md` | Modern visual system, responsive behaviour, keyboard support, offline notes |
| `10_PHASE10_TESTING_VERIFICATION_AND_HANDOVER.md` | Exact acceptance criteria, verification dataset, device testing order |

## Guiding Principles (must be followed by every build agent)

1. **Moodle is presentation only.** All curriculum hierarchy, student progress, saved workshop models and scoring live in Django.
2. **Client-side arithmetic only** for the workshop math (see Phase 2). No numerical solvers, no external math libraries required at runtime.
3. **Screen B is non-negotiable.** If scope must be cut, cut 3-D surface depth and report polish first; never cut the freeze-and-slice + slope sentence.
4. **Learner-facing language.** Never expose mathematical terms (partial derivative, stationary point, Lagrange, etc.). Use “slope”, “top of the hill”, “what one more unit does”.
5. **Offline-first for the workshop core.** Sessions frequently run without reliable Wi-Fi. Core interaction must work offline; only PDF export and progress sync may require network.
6. **Modern UI within Moodle.** Isolate styles under a unique namespace (e.g. `.tella-workshop`). Prefer CSS custom properties, system fonts + one modern display font, generous whitespace, soft elevation.

## Recommended Build Order

Follow the numbered phase files strictly. Each phase ends with concrete acceptance criteria that the next phase assumes are green.

## Sample Data (must reproduce exactly)

See `02_PHASE2_WORKSHOP_DATA_MODEL_AND_MATH.md` and the verification table in Phase 10.  
Key values: profit(200,150) = 1475, slopeX = −4.00, slopeY = +3.50, best = (150,250), peak profit = 1750.

## Contact / Questions for Product

- Lowest-spec target device (critical for Screen B animation budget)
- Preferred charting approach already present in the organisation’s Moodle plugins (or free to choose Plotly / Chart.js / pure Canvas)
- Offline policy for report export

These instructions are written so a capable build agent can execute them sequentially with minimal clarification.