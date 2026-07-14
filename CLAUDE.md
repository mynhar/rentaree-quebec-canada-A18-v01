# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product

**Rentaree** — web app to rent and list properties in **Quebec, Canada**. The differentiator: every
listing shows photos, a **3D walkthrough (Matterport embed)** and the **real dimensions of each room**,
extracted from the scan itself. A 3D scanning service is also offered to property owners.

## Commands

- `npm start` / `ng serve` — dev server at `http://localhost:4200` (development config, no optimization, source maps).
- `npm run build` / `ng build` — production build to `dist/rentaree-quebec-canada-a18-v01` (production is the default configuration).
- `npm run watch` — incremental development build with `--watch`.
- `npm test` / `ng test` — unit tests via Karma + Jasmine in Chrome. Run a single spec with a fdescribe/fit focus or `ng test --include='**/name.spec.ts'`. Note: no `.spec.ts` files exist yet.
- Scaffolding: `ng generate component features/<area>/<name>` (project prefix is `app`).

**After any change, run `ng build` and fix the errors before considering the task done.** There is no linter
configured, so the compiler is the only automated check; the production build also fails on bundle budgets
(initial > 1 MB, component styles > 10 kB — worth knowing before adding a heavy dependency).

## Architecture

Angular 18 standalone SPA (no NgModules) backed by Supabase for auth and data. There is no custom backend — the browser talks to Supabase directly via `@supabase/supabase-js`.

**Bootstrap chain:** [main.ts](src/main.ts) → [app.config.ts](src/app/app.config.ts) (`appConfig` providers: router with `withComponentInputBinding()`, `provideHttpClient`, zoneless-ish `eventCoalescing`) → [app.component.ts](src/app/app.component.ts) (just `<router-outlet />`).

**Routing** ([app.routes.ts](src/app/app.routes.ts)) is fully lazy — every route uses `loadComponent`. Protected routes attach `authGuard`; role-restricted routes (`/escaner`, `/admin`) attach `roleGuard([...])`.

**`core/` = cross-cutting singletons, `features/` = routed screens.**
- [core/supabase/supabase.service.ts](src/app/core/supabase/supabase.service.ts) — single `SupabaseClient` (PKCE flow, `detectSessionInUrl` for OAuth redirects). Everything else reaches Supabase through `inject(SupabaseService).client`.
- [core/auth/auth.service.ts](src/app/core/auth/auth.service.ts) — reactive auth state via **signals** (`session`, `profile`, `loading`) and `computed` (`isAuthenticated`, `role`, `needsProfileCompletion`). Subscribes to `onAuthStateChange` to stay in sync. Exposes `whenReady()` — a promise guards await before deciding, so async guards never race the initial session fetch.
- [core/guards/](src/app/core/guards/) — `authGuard` (requires session → `/auth`) and `roleGuard(allowed[])` factory (session + role check → `/quebec-city`). Both `await auth.whenReady()` first.
- [core/models/database.types.ts](src/app/core/models/database.types.ts) — hand-written interfaces mirroring the Supabase schema (`Profile`, `Property`, `PropertyMedia`, `PropertyDimension`, `ScanRequest`) and union string types (`UserRole`, `PropertyType`, `PropertyStatus`, etc.). Keep these in sync with the DB manually.
- [core/util/](src/app/core/util/) — `format.ts` (`formatCAD()`, `buildAddress()`), `geocoding.service.ts` (Nominatim), `safe-url.pipe.ts` (3D embed allowlist).

**Features:** `landing/`, `auth/`, `properties/` (`quebec-city` list+map+split, `property-form`, `property-detail`), `scanning/` (scanner panel), `admin/` (roles + scanner assignment).

**Map and geocoding are deliberately key-free**, and each choice carries a constraint:
- [property-map.component.ts](src/app/features/properties/quebec-city/property-map.component.ts) uses **maplibre-gl** with the free OpenFreeMap `positron` style. It is the one imperative corner of the app: markers are held in a `Map` and re-rendered by `effect()`s watching the `properties`/`selectedId` inputs, so it must tear itself down in `ngOnDestroy`. It sets `ViewEncapsulation.None` in order to style MapLibre's own DOM, and `maplibre-gl.css` is loaded globally from `angular.json` (build target only, not test).
- [geocoding.service.ts](src/app/core/util/geocoding.service.ts) uses **Nominatim**, which permits at most 1 request/second. That is why the property form only geocodes on an explicit "buscar coordenadas" button press, never on keystroke. Preserve that, or swap the provider.
- Properties with null `latitude`/`longitude` simply have no pin; `DEFAULT_MAP_CENTER` (Montréal) is the fallback center.

**Auth flow specifics:** email/password sign-up passes `first_name`/`last_name`/`phone` as user metadata; Google OAuth users have no phone, so `needsProfileCompletion` gates them into [complete-profile.component.ts](src/app/features/auth/complete-profile.component.ts) before they can publish. A `profiles` table row is expected to exist per auth user (created by a DB trigger, loaded by `loadProfile`).

## Business rules (do not break)

- **The expediente (`EXP-YYYYMM-DD-NNNN`) is generated by a DB trigger.** Never send it from Angular.
- **Real security lives in RLS, not in the guards.** Guards are UX only. Every operation must be safe
  even if someone calls the Supabase API directly. The `role` column on `profiles` is protected by a
  trigger: only an admin can change it.
- **3D walkthrough URLs are allowlisted** (Matterport, Kuula, Polycam) both when saving and when
  rendering ([safe-url.pipe.ts](src/app/core/util/safe-url.pipe.ts)). Angular blocks external iframe
  `[src]` by design — do not blanket-bypass it.
- Roles: **Cliente** (default on sign-up) → **Escáner** → **Administrador**.
- Room dimensions come from the 3D scan and are entered by the Escáner; the total area is written back
  to `properties.area`. It is **derived, never typed in** — `ScanService.saveDimensions()` recomputes it
  as the sum of the rooms (in `m2`).
- `saveDimensions()` and `saveTour()` are **delete-then-insert**: the incoming set replaces the stored one
  rather than merging into it. Callers must always submit the complete set.
- Assigning a scanner writes `properties.scanned_by` as well as `scan_requests.scanner_id` — that column
  is what grants the scanner edit rights through RLS, so the two must move together
  (`ScanService.assignScanner()`).
- Because RLS is the authorization layer, the services intentionally issue **unscoped** queries
  (`listRequests()` selects all of `scan_requests`, `search()` all of `properties`) and let the database
  narrow the rows. Don't "fix" that by adding client-side owner filtering; it would be redundant and would
  mask a missing policy.

## Visual system

Tokens live in [src/styles.css](src/styles.css). **Always use them; never invent colors or fonts.**

- Palette: cool paper (`--paper`), graphite ink (`--ink`), a single **slate-blue accent `#1F4E6B`**
  (`--accent`) used **sparingly** (primary buttons and little else).
- Fonts: **Space Grotesk** (headings), **Inter** (body), **Space Mono** (data: prices, expedientes, dimensions).
- **Architectural** aesthetic: line floor plans, dimension ticks, measurement marks. Sober and minimal.
- **Hard rule: nothing that looks templated or "AI-generated."** Avoid the cliché of cream background +
  high-contrast serif + terracotta accent, purple gradients, and emoji-as-icons.
- Reusable classes already defined: `.btn`, `.btn--primary`, `.btn--ghost`, `.btn--block`, `.input`.

## Quebec market

- Prices in **CAD**, Canadian formatting (`1 650 $`) — use `formatCAD()` from `core/util/format.ts`.
- Reference cities: **Montréal**, **Laval**. Default city `Montréal`, default province `QC`.
- Canadian postal codes (`H2J 2J5`). All 13 provinces/territories are in `core/config/constants.ts`.

## Conventions

- **Standalone components only.** Templates and styles are written inline in the `@Component` decorator. Use Angular control-flow syntax (`@if`, `@for`, `@switch`), not `*ngIf`/`*ngFor`.
- **Signals over RxJS for component/service state.** Use `inject()`, not constructor DI. Use `input()`/`output()`, not the `@Input()`/`@Output()` decorators.
- Reactive forms. For `disabled` controls, read with `getRawValue()` — `.value` omits them.
- **Domain language is Spanish, UI labels for Quebec/Canada are French** ([core/config/constants.ts](src/app/core/config/constants.ts): province names in French, roles/types in Spanish). Method and variable names are frequently Spanish (`salir`, `busy`). Match the surrounding language when editing a file.
- The app was built in numbered phases ("Fase 1…8"); some comments still reference them.

## Supabase

Project ref `tynndbmnxeuhqasyppnq`. URL and anon key are committed in [environment.ts](src/environments/environment.ts) / [environment.development.ts](src/environments/environment.development.ts) (the anon key is public by design; rely on Row Level Security for authorization). When changing tables, update both the DB and `database.types.ts`.

Tables: `profiles`, `properties`, `property_media`, `property_dimensions`, `scan_requests`, `expediente_counters`.
Storage buckets: `property-photos`, `property-videos`, `floor-plans`.

## Roadmap

Each of these is already specced in [prompts-claude-code.md](prompts-claude-code.md); read the relevant
section there before starting one. They are ordered on purpose — the i18n pass touches every template, so
it wants the rest to be stable first.

1. **Photo upload** to Supabase Storage (`property-photos`), recorded in `property_media` with
   `media_type='photo'` and `sort_order`. Until this exists, cards fall back to a line-drawing placeholder.
2. **i18n to French** (FR default + EN). In Quebec, French is the default language of commerce by law —
   this is not cosmetic. Decide Angular i18n vs Transloco before implementing.
3. **Editing existing properties** (owner edits their own; admin edits any).
