# AGENTS.md

## Project Overview

DisciScan — a QR-code-based disciplinary records and monitoring system for schools. Two user roles: Admin and Security Guard. Students and Visitors are passive (no login, identified via QR).

**Status**: Early stage. Backend and frontend are scaffolded but mostly stock Laravel/React. No Inertia adapter installed yet, no controllers beyond the base, only default User model.

## Structure

- `backend/` — Laravel 12 (PHP 8.2+), SQLite default, Pest tests, Tailwind CSS 4
- `frontend/` — React 19 + Vite 8, standalone SPA (not yet connected to backend)
- Monorepo with no shared workspace config — `backend/` and `frontend/` are independent

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
- **Styling**: Backend uses Tailwind CSS 4 via `@tailwindcss/vite` plugin. `resources/css/app.css` has `@source` directives scanning Blade views, JS files, and vendor pagination views. Frontend has no Tailwind.
- **No Inertia yet**: The repo name suggests Inertia integration, but it is not installed. The frontend is a vanilla React SPA; the backend has no Inertia middleware or controllers.
- **No CI**: No GitHub Actions workflows exist.
- **Laravel Boost MCP**: Configured in `backend/opencode.json`. Run `php artisan boost:mcp` to start. Use Boost tools (`search-docs`, `database-schema`, `database-query`, `browser-logs`) before manual alternatives.
- **Dev server**: `composer dev` in `backend/` runs artisan serve, queue listener, and Vite together via `concurrently`.
- **Vite config** (backend): ignores `storage/framework/views/**` from watch to prevent rebuild loops.
- **`composer setup`** handles the full first-run sequence (install, .env, key, migrate, npm, build).
- **Laravel 12 structure**: No `app/Http/Kernel.php` or `app/Console/Kernel.php`. Middleware configured in `bootstrap/app.php`. Console commands auto-discovered. Only `AppServiceProvider` registered.

## Conventions

- Backend code style: follow existing Laravel/Pest patterns. Use Pest for tests, not raw PHPUnit.
- Frontend linting: run `npm run lint` in `frontend/` (oxlint). No ESLint or Prettier configured.
- No `@extends` or Blade components beyond the default `welcome.blade.php` — expect to build from scratch.
- Only two route files exist: `routes/web.php` and `routes/console.php`. No `routes/api.php`.
