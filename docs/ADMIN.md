# Moodle administrator notes

## Install the local plugin

1. Copy `local/tella_workshop` into the Moodle `local/` directory (already present in this checkout).
2. Visit *Site administration → Notifications* or run:

```powershell
php admin/cli/upgrade.php --non-interactive
php admin/cli/purge_caches.php
```

3. Confirm **Tella Workshop** under *Site administration → Plugins → Local plugins*.

## Configure the Django bridge

*Site administration → Plugins → Local plugins → Tella Workshop*

| Setting | Local default |
| --- | --- |
| Django API base URL | `http://127.0.0.1:8000` |
| SSO shared secret | `tella-dev-sso-secret-change-me` (must match Django `MOODLE_SSO_SECRET`) |
| Workshop activity UUID | blank = first published `INTERACTIVE_WORKSHOP` |

Students open `/local/tella_workshop/index.php` while signed into Moodle. The plugin exchanges identity server-side; there is no second login form.

## Rebuild AMD modules after JS edits

```powershell
node moodle/local/tella_workshop/build-amd.js
php moodle/admin/cli/purge_caches.php
```
