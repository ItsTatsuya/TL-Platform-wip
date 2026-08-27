# Phase 0 — Development Environment Setup

**Goal:** A reproducible local environment containing a clean Moodle instance, the empty plugin skeleton, and the Django backend project, ready for subsequent phases.

**Estimated time:** 45–90 minutes (depending on machine and network).

## 0.1 Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose) recommended for isolation  
- OR native LAMP/LEMP stack (PHP 8.1+, MySQL/MariaDB or PostgreSQL, Apache/Nginx)  
- Git, Node.js 18+ (for AMD build tooling later), Composer, Python 3.11+, PostgreSQL 15+  
- At least 8 GB free RAM for comfortable Moodle + Django concurrent development

## 0.2 Recommended: Docker-based Moodle (fastest clean start)

```bash
# Create working directory
mkdir -p ~/tella-platform && cd ~/tella-platform

# Clone official Moodle (use a supported stable branch — currently MOODLE_405_STABLE or MOODLE_404_STABLE)
git clone -b MOODLE_405_STABLE --depth 1 https://github.com/moodle/moodle.git moodle
cd moodle

# Quick local config using Docker (community docker-compose example)
# Alternative: use bitnami/moodle or bitnami/moodle + bitnami/mariadb images
```

If you prefer a minimal Docker Compose, create `docker-compose.yml` in `~/tella-platform`:

```yaml
version: "3.8"
services:
  moodle:
    image: bitnami/moodle:4.5
    ports:
      - "8080:8080"
      - "8443:8443"
    environment:
      - MOODLE_USERNAME=admin
      - MOODLE_PASSWORD=Admin123!
      - MOODLE_EMAIL=admin@example.com
      - MOODLE_SITE_NAME=Tella Learning Dev
      - ALLOW_EMPTY_PASSWORD=yes
    volumes:
      - ./moodle-data:/bitnami/moodle
      - ./moodledata:/bitnami/moodledata
    depends_on:
      - mariadb
  mariadb:
    image: bitnami/mariadb:11.4
    environment:
      - MARIADB_USER=bn_moodle
      - MARIADB_DATABASE=bitnami_moodle
      - ALLOW_EMPTY_PASSWORD=yes
    volumes:
      - mariadb_data:/bitnami/mariadb
volumes:
  mariadb_data:
```

```bash
docker compose up -d
# Wait ~2–3 minutes for first boot. Access http://localhost:8080
# Default credentials: admin / Admin123!
```

## 0.3 Native Moodle installation (if Docker is unavailable)

```bash
# Clone
git clone -b MOODLE_405_STABLE --depth 1 https://github.com/moodle/moodle.git ~/moodle
cd ~/moodle

# Create config.php (copy from config-dist.php and edit)
cp config-dist.php config.php
# Edit: $CFG->dbtype, $CFG->dbname, $CFG->dbuser, $CFG->dbpass, $CFG->wwwroot, $CFG->dataroot

# Create data directory
mkdir -p ~/moodledata
chmod 777 ~/moodledata

# Install via CLI (recommended)
php admin/cli/install.php \
  --non-interactive \
  --agree-license \
  --fullname="Tella Learning Dev" \
  --fullname-short="Tella" \
  --adminuser=admin \
  --adminpass=Admin123! \
  --adminemail=admin@example.com \
  --wwwroot=http://localhost/moodle \
  --dataroot=/home/$(whoami)/moodledata \
  --dbtype=mysqli \
  --dbname=moodle \
  --dbuser=root \
  --dbpass= \
  --fullname="Tella Learning Dev"
```

## 0.4 Create the Moodle Plugin Skeleton

Moodle plugins for activities live under `mod/`. For a pure skill-enhancement / workshop experience that is not a traditional “course activity” graded by Moodle’s gradebook, we still place it as a local plugin or a custom activity module.  

**Recommended location for maximum control and future LTI / SSO flexibility:**

```bash
# From Moodle root
cd ~/moodle   # or the path where Moodle is installed

# Create local plugin (recommended for non-gradebook skill modules)
mkdir -p local/tella_workshop
cd local/tella_workshop

# Minimal required files
touch version.php
touch lib.php
touch settings.php
mkdir -p amd/src amd/build classes db lang/en templates styles
touch db/access.php db/install.xml db/upgrade.php
touch lang/en/local_tella_workshop.php
touch styles/workshop.css
```

**version.php** (starter content):

```php
<?php
defined('MOODLE_INTERNAL') || die();

$plugin->component = 'local_tella_workshop';
$plugin->version   = 2026082300;          // YYYYMMDDXX
$plugin->requires  = 2024100700;          // Moodle 4.5
$plugin->maturity  = MATURITY_ALPHA;
$plugin->release   = '0.1.0';
```

**lang/en/local_tella_workshop.php**:

```php
<?php
$string['pluginname'] = 'Tella Workshop';
$string['tella_workshop:view'] = 'View Tella Workshop modules';
$string['privacy:metadata'] = 'The Tella Workshop plugin stores progress via the external Django backend.';
```

After creating the skeleton, purge caches and verify the plugin appears:

```bash
# From Moodle root
php admin/cli/purge_caches.php
# Or visit Site administration → Plugins → Plugins overview and confirm local_tella_workshop is listed
```

## 0.5 Django Backend Project Scaffold

```bash
cd ~/tella-platform
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install django djangorestframework psycopg2-binary django-cors-headers python-dotenv

django-admin startproject tella_backend
cd tella_backend
python manage.py startapp curriculum
python manage.py startapp workshops
python manage.py startapp accounts
python manage.py startapp progress
```

Create a PostgreSQL database:

```bash
createdb tella_dev
# or via psql
```

Minimal `.env` and settings additions will be detailed in Phase 1.

## 0.6 Verification Checklist (must all pass before Phase 1)

- [ ] Moodle loads at the configured wwwroot and admin can log in
- [ ] `local_tella_workshop` appears under Site administration → Plugins → Local plugins
- [ ] Django project starts: `python manage.py runserver` (even with empty models)
- [ ] PostgreSQL accepts connections from the Django settings
- [ ] Git repository initialised in `~/tella-platform` with sensible .gitignore (node_modules, __pycache__, moodledata, venv, .env)

## 0.7 Useful Daily Commands

```bash
# Moodle
cd ~/moodle
php admin/cli/purge_caches.php
php admin/cli/upgrade.php --non-interactive

# Django
cd ~/tella-platform/tella_backend
source ../venv/bin/activate
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8000

# Later — AMD rebuild (Phase 3+)
cd ~/moodle/local/tella_workshop
npx grunt amd   # or the organisation’s preferred AMD build pipeline
```

Once the above checklist is green, proceed to `01_PHASE1_BACKEND_FOUNDATION.md`.