# Known limitations and offline behaviour

- Core four screens, sample data, and all arithmetic work without a network connection. Progress and saved models queue in `localStorage` and flush when the browser is online again.
- PDF export is generated in the browser (simple Helvetica PDF). The rupee sign is written as `Rs` so the file stays legible in greyscale print.
- 3-D landscape is an isometric canvas surface, not a WebGL scene. Camera is fixed.
- Moodle LTI 1.3 openssl.cnf warnings during first install are unrelated to this plugin.
- Lowest-spec device performance for Screen B should be re-checked on the university's actual Android target; the implementation caches the surface grid and redraws the plane + slice on each drag frame.
- Industry / career portal is a styled placeholder fed by `GET /api/v1/career/opportunities/`.
- Django 6.1 is used locally; pin a supported LTS before production hardening.
