# Phase 3 — Moodle Plugin Structure & Isolation

**Goal:** Produce a clean, maintainable Moodle local plugin (`local_tella_workshop`) that can host the four-screen workshop, load configuration from the Django API, and render modern UI without fighting Moodle’s default styles.

## 3.1 Final Folder Layout

```
local/tella_workshop/
├── version.php
├── lib.php
├── settings.php
├── db/
│   ├── access.php
│   ├── install.xml          # optional capabilities / custom tables if any
│   └── upgrade.php
├── classes/
│   ├── external/            # web service definitions if needed
│   └── privacy/
├── amd/
│   ├── src/
│   │   ├── workshop.js      # main entry
│   │   ├── math.js          # the six expressions (Phase 2)
│   │   ├── screenA.js
│   │   ├── screenB.js
│   │   ├── screenC.js
│   │   ├── screenD.js
│   │   ├── chart3d.js       # or contour renderer
│   │   └── report.js
│   └── build/               # generated
├── templates/
│   ├── workshop_container.mustache
│   ├── screen_a.mustache
│   ├── screen_b.mustache
│   ├── screen_c.mustache
│   └── screen_d.mustache
├── styles/
│   └── workshop.css         # all styles under .tella-workshop namespace
├── lang/
│   └── en/
│       └── local_tella_workshop.php
└── pix/                     # icons if required
```

## 3.2 AMD Module Pattern

Moodle 4.x expects AMD modules. Every screen is an AMD module that receives configuration and a DOM root.

Example `amd/src/math.js` (export the pure functions from Phase 2).

Main entry `amd/src/workshop.js` orchestrates the four screens and navigation state.

## 3.3 CSS Isolation Strategy (critical for modern look)

All styles live under a single root class:

```css
.tella-workshop {
  --tella-primary: #2563eb;
  --tella-success: #16a34a;
  --tella-warning: #d97706;
  --tella-surface: #ffffff;
  --tella-background: #f8fafc;
  --tella-text: #0f172a;
  --tella-muted: #64748b;
  --tella-radius: 12px;
  --tella-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.07);
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  /* … */
}
```

Never style global Moodle elements. Use modern CSS (flex, grid, custom properties, container queries where supported). Keep the visual language consistent with a clean SaaS product.

## 3.4 Plugin Entry Point

A simple page or activity view that:

1. Authenticates the Moodle user
2. Obtains a short-lived token / session for the Django API (or uses Moodle’s existing session via SSO bridge)
3. Fetches the activity configuration (WorkshopModel)
4. Renders the Mustache container and initialises the AMD workshop module

## 3.5 Acceptance Criteria

- [ ] Plugin installs cleanly and appears in Plugins overview
- [ ] AMD modules load without 404s after `grunt amd` (or equivalent)
- [ ] Styles are completely isolated; no Moodle theme leakage into the workshop chrome
- [ ] A stub four-screen navigation shell renders with modern spacing and typography
- [ ] Configuration can be loaded from a hard-coded JSON object (Django API wired in later phase)

Proceed to Screen A only after the shell is stable.