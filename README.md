# DisciScan

A QR-code-based **digital disciplinary records and monitoring system** for schools. DisciScan lets security guards record student attendance, log violations, track visitor entry/exit, and monitor office/classroom compliance — all by scanning QR codes — while admins manage accounts, review records, and generate reports from a single dashboard.

> Web-based, mobile-first, and accessible from desktop browsers and phones. No offline mode — internet connectivity is required.

---

## Table of Contents

- [Roles](#roles)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Run in development](#run-in-development)
  - [Production build](#production-build)
- [Configuration](#configuration)
- [Default Accounts](#default-accounts)
- [Testing & Code Quality](#testing--code-quality)
- [API Overview](#api-overview)
- [Access on the Same Network](#access-on-the-same-network)
- [Known Caveats](#known-caveats)
- [Project Conventions](#project-conventions)

---

## Roles

| Role | Login | Description |
|------|-------|-------------|
| **Admin** | Yes | Full system access — manages users, settings, and records; no scanning duties |
| **Security Guard** | Yes | Main field operator — does all QR scanning and recording |
| **Student** | No | Passive user; identified only via QR code when scanned |
| **Visitor** | No | Self-registers online through a QR code; identified via the generated QR on campus |

## Features

### Admin
- Manage user accounts (add / update / delete, role assignment)
- Role-based access control (JWT) and password reset flows
- View, search, and filter records: student violations, attendance (student logs), visitor logs, compliance
- Generate, filter, print/export reports (disciplinary, attendance, visitor, compliance)
- Manage reference data: academic years, violation types, rooms, issues
- Admin dashboard with summary statistics

### Security Guard
- Scan student QR codes → auto time-in / time-out attendance logging
- Scan visitor QR codes → entry / exit logging
- Scan student QR codes → record violations (select type, auto-timestamp)
- Resolve recorded violations (mark as resolved)
- Register new visitors on site (visitor registration module)
- Monitor compliance: record room/office observations with photo evidence and required issues
- Print the **Safety and Security Monitoring Slip** (noted by the Security Office / admin)
- Guard dashboard with daily summary
- Audio feedback (success / failure beeps) on all scanner results

### Student (passive)
- Identified by QR code for attendance and violation recording
- Profile info (name, photo, details) shown for verification when scanned

### Visitor (self-service)
- Scans a registration QR → fills an online form (name, purpose of visit, etc.)
- System validates input and auto-generates a unique personal QR code
- That QR is used by guards for entry / exit scanning

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | PHP 8.2+, **Laravel 12**, JWT auth (`tymon/jwt-auth`), Laravel Pint, Pest 3 |
| Database | SQLite by default (MySQL supported — see `.env`) |
| Frontend | **React 19**, Vite 8, React Router 7 |
| Styling | **Tailwind CSS 4** + **shadcn/ui** (base-ui) + **lucide-react** icons |
| Scanning | `html5-qrcode` (camera) + `qrcode` (QR generation) |
| HTTP | Axios |
| Linting | oxlint (frontend), Laravel Pint (backend) |
| Imports/Exports | `phpoffice/phpspreadsheet` (student import/export) |

## Repository Structure

```
disciscan/
├── backend/                  # Laravel 12 REST/JSON API
│   ├── app/
│   │   ├── Http/Controllers/Api/    # Admin/, Guard/ + public endpoints
│   │   ├── Http/Requests/           # Form requests (validation)
│   │   ├── Http/Resources/          # API resources
│   │   ├── Models/                  # Eloquent models
│   │   └── Middleware/              # EnsureUserIsAdmin / EnsureUserIsGuard
│   ├── database/
│   │   ├── migrations/              # users, students, violations, visitors,
│   │   │                            # rooms, issues, compliances, academic years…
│   │   ├── seeders/                 # demo users + reference data
│   │   └── database.sqlite
│   ├── routes/api.php               # all API routes
│   ├── tests/                       # Pest 3 (Unit + Feature)
│   └── composer.json                # `setup`, `dev`, `test` scripts
├── frontend/                 # React 19 SPA
│   ├── src/
│   │   ├── pages/                   # admin/, guard/, auth/, public/
│   │   ├── layouts/                 # AdminLayout, GuardLayout, PublicLayout
│   │   ├── components/ui/           # shadcn/ui components (base-ui)
│   │   ├── services/                # API clients per module
│   │   ├── contexts/                # Auth, Theme
│   │   └── utils/                   # image compression, scanner sounds
│   ├── public/sounds/               # scanner beeps (success.wav / failure.wav)
│   └── package.json                 # `dev`, `build`, `lint` scripts
├── audit/                    # audit log — newest first (see audit/README.md)
└── README.md
```

`backend/` and `frontend/` are **independent** — there is no shared workspace configuration.

## Getting Started

### Prerequisites

- PHP **8.2+** with Composer
- Node.js **20+** with npm
- SQLite (bundled with PHP) — or MySQL/MariaDB if you prefer

### Installation

Clone the repo, then run the full first-time setup from `backend/`:

```bash
cd backend
composer setup
```

`composer setup` performs the complete sequence: `composer install` → `.env` from `.env.example` → `APP_KEY` generation → database migration → `npm install` → frontend production build.

If you use a **MySQL** database (instead of the default SQLite), edit `backend/.env` first:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=disciscanDb
DB_USERNAME=root
DB_PASSWORD=
```

Then create the database and re-run migrations.

To seed demo users and reference data (rooms, issues, violation types, students, etc.):

```bash
php artisan db:seed
```

### Run in development

From `backend/`, one command starts everything (Laravel server + queue listener + Vite):

```bash
composer dev
```

| Service | URL |
|---------|-----|
| Frontend (Vite dev server) | http://localhost:5173 |
| Backend API (artisan serve) | http://localhost:8000/api |

If you prefer to run them separately:

```bash
# terminal 1 — backend
cd backend
php artisan serve --host=0.0.0.0 --port=8000

# terminal 2 — queue worker (handles password-reset emails, etc.)
cd backend
php artisan queue:listen --tries=1

# terminal 3 — frontend
cd frontend
npm run dev
```

### Production build

```bash
cd frontend
npm run build    # outputs to frontend/dist/
```

## Configuration

### Backend — `backend/.env`

| Variable | Purpose |
|----------|---------|
| `APP_URL` | Public URL of the API (e.g. `http://192.168.123.4:8000`) |
| `FRONTEND_URL` | Public URL of the SPA — used for password-reset links |
| `DB_*` | Database connection (SQLite by default) |
| `JWT_SECRET` | JWT signing key (`php artisan jwt:secret` if missing) |

### Frontend — `frontend/.env`

```bash
VITE_API_URL=http://localhost:8000/api
```

If `VITE_API_URL` is not set, the SPA falls back to `http://localhost:8000/api` in development and `https://disciscan-api.jezyk.me/api` in production.

## Default Accounts

Seeded users use the password **`password`**:

| Role | Email |
|------|-------|
| Admin | `kenley.bronola@example.com` |
| Guard | `kimberly.magsayo@example.com` (and ~20 more guards — see `backend/database/seeders/UserSeeder.php`) |

## Testing & Code Quality

```bash
cd backend
composer test          # clears config cache, runs the full Pest suite
vendor/bin/pint --dirty --format agent   # auto-format modified PHP files
```

```bash
cd frontend
npm run lint           # oxlint (NOT eslint)
npm run build          # production build
```

- Backend tests use **in-memory SQLite** (override in `phpunit.xml`).
- Frontend has no test suite — verify with `npm run lint` + `npm run build`.

## API Overview

All routes live in `backend/routes/api.php` and are JSON-only.

| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/login`, `POST /api/logout`, `GET /api/me`, `PUT|POST /api/profile`, forgot/reset password |
| Public | `POST /api/visitor-registrations` (self-registration) |
| Admin | `GET /api/admin/dashboard` · CRUD for `/users`, `/violation-types`, `/rooms`, `/issues`, `/academic-years`, `/students` · records: `/student-violations`, `/student-logs`, `/visitor-registrations`, `/compliance` · `GET /api/admin/reports/{type}` |
| Guard | `GET /api/guard/dashboard` · scanners: `/student/scan`, `/visitor/scan`, `/violations` · CRUD `/compliances`, `/visitor-registrations` · `GET /api/guard/reports/{type}` |

Role enforcement is handled by the `admin` / `guard` middleware groups.

## Access on the Same Network

Both dev servers already bind to all interfaces — **no port forwarding is required** on a LAN:

| Service | LAN URL |
|---------|---------|
| Frontend | `http://<PC-IP>:5173` (find it with `ipconfig`) |
| Backend | `http://<PC-IP>:8000` |

If a phone can't connect, allow the ports through Windows Firewall (elevated PowerShell):

```powershell
New-NetFirewallRule -DisplayName "DisciScan Dev" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5173,8000
```

## Known Caveats

- **Camera scanning requires HTTPS**: browsers only allow `getUserMedia` on `localhost` or secure origins. Scanning on a phone via a LAN IP (plain HTTP) will fail — use `localhost` or serve over HTTPS (e.g. `@vitejs/plugin-basic-ssl`).
- **Scanner audio** is subject to device volume (iPhone silent switch / Android media volume) and browser autoplay rules — the app unlocks audio on the first tap anywhere on the page.
- No biometric auth, GPS tracking, or offline mode — by design.

## Project Conventions

- **Audit log**: every change is recorded in `audit/` (newest first, indexed in `audit/README.md`).
- **Formatting**: PHP must pass `vendor/bin/pint`; JSX is checked with `oxlint`.
- **Frontend patterns**: mobile-first Tailwind utility styling, shadcn/ui components, lucide-react icons, API calls through `frontend/src/services/`.
