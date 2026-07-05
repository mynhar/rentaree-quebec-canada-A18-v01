# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` / `ng serve` — dev server at `http://localhost:4200` (development config, no optimization, source maps).
- `npm run build` / `ng build` — production build to `dist/rentaree-quebec-canada-a18-v01` (production is the default configuration).
- `npm run watch` — incremental development build with `--watch`.
- `npm test` / `ng test` — unit tests via Karma + Jasmine in Chrome. Run a single spec with a fdescribe/fit focus or `ng test --include='**/name.spec.ts'`. Note: no `.spec.ts` files exist yet.
- Scaffolding: `ng generate component features/<area>/<name>` (project prefix is `app`).

## Architecture

Angular 18 standalone SPA (no NgModules) backed by Supabase for auth and data. There is no custom backend — the browser talks to Supabase directly via `@supabase/supabase-js`.

**Bootstrap chain:** [main.ts](src/main.ts) → [app.config.ts](src/app/app.config.ts) (`appConfig` providers: router with `withComponentInputBinding()`, `provideHttpClient`, zoneless-ish `eventCoalescing`) → [app.component.ts](src/app/app.component.ts) (just `<router-outlet />`).

**Routing** ([app.routes.ts](src/app/app.routes.ts)) is fully lazy — every route uses `loadComponent`. Protected routes attach `authGuard`. The file contains large commented-out blocks for future routes (`property-form`, `property-detail`, `scanner-dashboard`, `admin`) guarded by `roleGuard`; these are the roadmap, not dead code.

**`core/` = cross-cutting singletons, `features/` = routed screens.**
- [core/supabase/supabase.service.ts](src/app/core/supabase/supabase.service.ts) — single `SupabaseClient` (PKCE flow, `detectSessionInUrl` for OAuth redirects). Everything else reaches Supabase through `inject(SupabaseService).client`.
- [core/auth/auth.service.ts](src/app/core/auth/auth.service.ts) — reactive auth state via **signals** (`session`, `profile`, `loading`) and `computed` (`isAuthenticated`, `role`, `needsProfileCompletion`). Subscribes to `onAuthStateChange` to stay in sync. Exposes `whenReady()` — a promise guards await before deciding, so async guards never race the initial session fetch.
- [core/guards/](src/app/core/guards/) — `authGuard` (requires session → `/auth`) and `roleGuard(allowed[])` factory (session + role check → `/quebec-city`). Both `await auth.whenReady()` first.
- [core/models/database.types.ts](src/app/core/models/database.types.ts) — hand-written interfaces mirroring the Supabase schema (`Profile`, `Property`, `PropertyMedia`, `PropertyDimension`, `ScanRequest`) and union string types (`UserRole`, `PropertyType`, `PropertyStatus`, etc.). Keep these in sync with the DB manually.

**Auth flow specifics:** email/password sign-up passes `first_name`/`last_name`/`phone` as user metadata; Google OAuth users have no phone, so `needsProfileCompletion` gates them into [complete-profile.component.ts](src/app/features/auth/complete-profile.component.ts) before they can publish. A `profiles` table row is expected to exist per auth user (loaded by `loadProfile`).

## Conventions

- **Standalone components only.** Templates and styles are written inline in the `@Component` decorator (see the feature components). Use Angular control-flow syntax (`@if`, `@for`), not `*ngIf`/`*ngFor`.
- **Signals over RxJS for component/service state.** Use `inject()`, not constructor DI.
- **Domain language is Spanish, UI labels for Quebec/Canada are French** ([core/config/constants.ts](src/app/core/config/constants.ts): province names in French, roles/types in Spanish). Method and variable names are frequently Spanish (`salir`, `busy`). Match the surrounding language when editing a file.
- The app is built in numbered phases ("Fase 1…5"); comments reference which phase a stub belongs to. `quebec-city` is currently a placeholder for the Fase 5 property list/map.

## Supabase

Project ref `tynndbmnxeuhqasyppnq`. URL and anon key are committed in [environment.ts](src/environments/environment.ts) / [environment.development.ts](src/environments/environment.development.ts) (the anon key is public by design; rely on Row Level Security for authorization). When changing tables, update both the DB and `database.types.ts`.
