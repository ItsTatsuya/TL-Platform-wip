# Tella Learning Platform (local)

Production-oriented Moodle plugin plus Django backend for university skill-enhancement workshops. Phase 1 delivers the Business Mathematics multivariable modelling workshop.

## Local stack (this checkout)

- Moodle 4.5 at `http://localhost:8080`
- Django API at `http://127.0.0.1:8000`
- PostgreSQL 16 databases `moodle` and `tella_dev`
- PHP 8.3 NTS (portable, under `tools/php`)
- Python 3.12 virtualenv in `venv/`

This environment uses a **native Windows install**, not Docker.

## Launch the demo

From the project directory (double-click `launch-demo.cmd`, or run):

```powershell
.\launch-demo.ps1
```

This starts PostgreSQL if needed, Moodle on port 8080, Django on port 8000, then opens the Modelling tab in your browser.

Or in two terminals:

```powershell
# Moodle
$env:Path = "D:\prod\TL-Platform\tools\php;" + $env:Path
cd D:\prod\TL-Platform\moodle
php -S localhost:8080 router.php

# Django
cd D:\prod\TL-Platform\tella_backend
..\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
```

## Logins

| Surface | URL | Credentials |
| --- | --- | --- |
| Moodle | http://localhost:8080 | `admin` / `Admin123!` |
| Django admin | http://127.0.0.1:8000/admin/ | `admin@example.com` / `Admin123!` |
| Modelling tab | http://localhost:8080/local/tella_workshop/index.php | Moodle session (no second login) |

Content manager: `content@example.com` / `Admin123!`

## Useful commands

```powershell
# Moodle caches / plugin install
cd moodle
php admin/cli/purge_caches.php
php admin/cli/upgrade.php --non-interactive

# Django
cd tella_backend
..\venv\Scripts\python.exe manage.py migrate
..\venv\Scripts\python.exe manage.py seed_workshop
..\venv\Scripts\python.exe manage.py test

# Workshop math (JS)
node --test moodle/local/tella_workshop/tests/math.test.js
node moodle/local/tella_workshop/build-amd.js
```

SSO secret (Moodle plugin setting and Django `MOODLE_SSO_SECRET`) defaults to `tella-dev-sso-secret-change-me`.

See `docs/` for API notes, Moodle admin install, and known limitations.

## Admin curriculum workspace

The Next.js administration app lives in `admin-platform/`. See `admin-platform/README.md` for setup and supported scope.
