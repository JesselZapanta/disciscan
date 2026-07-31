# AGENTS.md

## Project Overview

DisciScan — QR-code-based disciplinary records and monitoring system for schools. Two user roles: Admin and Security Guard. Students and Visitors are passive (no login, identified via QR).

**Status**: Frontend has all 7 mockup views implemented (Landing, Login, Dashboard, Records, GuardConsole, ViolationForm, VisitorRegistration). Backend is stock Laravel 12 — only default User model, no controllers, no Inertia.

## Structure

- `backend/` — Laravel 12 (PHP 8.2+), SQLite default, Pest tests, Tailwind CSS 4
- `frontend/` — React 19 + Vite 8, standalone SPA with react-router-dom, Tailwind CSS 4, shadcn (base-mira style), @phosphor-icons
- Monorepo with no shared workspace config — `backend/` and `frontend/` are independent
- Dark Sentinel theme defined in `frontend/src/index.css` — activated via `class="dark"` on `<html>` in `frontend/index.html`

## Commands

All backend commands run from `backend/`:

```bash
composer install          # install PHP deps
composer setup           # full setup: install + .env + key + migrate + npm install + build
composer dev              # starts artisan serve + queue + vite concurrently
composer test             # clears config cache then runs `php artisan test`
vendor/bin/pint --dirty --format agent  # format modified PHP files (required before finalizing changes)
```

All frontend commands run from `frontend/`:

```bash
npm install              # install JS deps
npm run dev              # Vite dev server
npm run build            # production build
npm run lint             # oxlint (NOT eslint)
```

## Key Facts

- **Database**: SQLite by default (`backend/database/database.sqlite`). Tests use in-memory SQLite (phpunit.xml overrides).
- **Testing**: Pest 3 (`composer test` from `backend/`). Test suites: `Unit` and `Feature` in `backend/tests/`. RefreshDatabase trait is commented out in `tests/Pest.php` — tests share state unless manually isolated.
- **Linting**: Frontend uses **oxlint** (not ESLint). Config at `frontend/.oxlintrc.json`. No ESLint or Prettier.
- **Formatting**: PHP files must be run through `vendor/bin/pint --dirty --format agent` after modifications. No `--test` flag — just run it to fix.
- **Styling**: Backend uses Tailwind CSS 4 via `@tailwindcss/vite` plugin. `resources/css/app.css` has `@source` directives scanning Blade views, JS files, and vendor pagination views. Frontend also uses Tailwind CSS 4.
- **No Inertia yet**: The repo name suggests Inertia integration, but it is not installed. The frontend is a vanilla React SPA; the backend has no Inertia middleware or controllers.
- **No CI**: No GitHub Actions workflows exist.
- **Laravel Boost MCP**: Configured in `backend/opencode.json`. Run `php artisan boost:mcp` to start. Use Boost tools (`search-docs`, `database-schema`, `database-query`, `browser-logs`) before manual alternatives.
- **Dev server**: `composer dev` in `backend/` runs artisan serve, queue listener, and Vite together via `concurrently`.
- **Vite config** (backend): ignores `storage/framework/views/**` from watch to prevent rebuild loops.
- **`composer setup`** handles the full first-run sequence (install, .env, key, migrate, npm, build).
- **Laravel 12 structure**: No `app/Http/Kernel.php` or `app/Console/Kernel.php`. Middleware configured in `bootstrap/app.php`. Console commands auto-discovered. Only `AppServiceProvider` registered.

## Frontend Conventions

- shadcn components in `frontend/src/components/ui/` (base-mira style). Use `@/components/ui` alias for imports. `components.json` has full alias config.
- Custom components: `CornerBracket` (CSS border-segment viewfinder brackets), `ScannerVisual` (shared QR scanner panel), `StatusChip` (pill status indicators), `Logo`.
- Guard console and visitor registration are standalone routes (no layout wrapper). Admin pages are nested under `AdminLayout` with sidebar.
- Pages with data tables use card-based mobile views on small screens (see Users, Violations, Attendance pages).
- Frontend has no test suite — verify with `npm run build` and `npm run lint`.

## Backend Conventions

- Backend code style: follow existing Laravel/Pest patterns. Use Pest for tests, not raw PHPUnit.
- Only two route files exist: `routes/web.php` and `routes/console.php`. No `routes/api.php`.
- No `@extends` or Blade components beyond the default `welcome.blade.php` — expect to build from scratch.
