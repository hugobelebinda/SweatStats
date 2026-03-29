# SweatStats — migration context (Svelte + Express/Mongo → Next.js + Supabase)

This document explains how the **current** codebase works, what must be preserved in the migration, and how the **target** stack fits together. Use it as the single reference while refactoring.

---

## 1. Current data flow (as implemented today)

### 1.1 Backend (`Backend/server.js` + Mongoose)

1. **MongoDB** is connected on startup via `Database/connect.js` (`MONGO_URI`).

2. **Strava OAuth — start**  
   - `GET /auth` builds the Strava authorize URL with `CLIENT_ID`, `REDIRECT_URI`, `scope=activity:read`, and redirects the browser there.

3. **Strava OAuth — callback**  
   - `GET /exchange_token?code=...`  
   - POSTs to `https://www.strava.com/oauth/token` with `client_id`, `client_secret`, `code`, `grant_type=authorization_code`.  
   - Receives `access_token`, `refresh_token`, `expires_at`, and `athlete`.  
   - **Upserts** a `User` document keyed by `stravaId` (= `athlete.id`), storing names, profile picture, and all tokens.  
   - Redirects to the Svelte app: `http://localhost:5173?stravaId=<user.stravaId>`.

4. **Activities sync + API**  
   - `GET /activities?stravaId=<id>`  
   - Loads the user by `stravaId`; returns 404 if missing.  
   - Calls Strava `GET https://www.strava.com/api/v3/athlete/activities` with `Authorization: Bearer <accessToken>` and `per_page: 30`.  
   - For each activity, **upserts** into MongoDB by Strava `activity.id`, linking to the user’s `_id`, fields: `name`, `type`, `distance` (meters), `moving_time` (seconds), `start_date`, `map_polyline` (optional).  
   - Responds with the **raw Strava JSON array** (same shape the frontend expects).

### 1.2 Frontend (`Frontend/src/App.svelte`)

- Reads `stravaId` from the query string.  
- **No `stravaId`:** shows a login screen; “Connect with Strava” sends the user to `http://localhost:5000/auth`.  
- **With `stravaId`:** on mount, `GET http://localhost:5000/activities?stravaId=...` and stores the result in `activities`.  
- **Weekly stats** are computed **entirely on the client** in `calculateWeeklyStats` — these formulas must be ported **verbatim** to React (or shared `lib/stats.ts`):

  | Metric | Logic |
  |--------|--------|
  | Window | `oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)`; include activities where `new Date(a.start_date) >= oneWeekAgo`. |
  | Weekly distance | Sum `distance` (meters) → `(totalMeters / 1000).toFixed(1)` km. |
  | Weekly time | Sum `moving_time` (seconds) → `hrs = floor(total/3600)`, `mins = floor((total % 3600) / 60)` → `` `${hrs}h ${mins}m` ``. |
  | Average pace | If `totalDistMeters > 0`: `paceSecondsPerKm = totalSeconds / (totalDistMeters / 1000)`; `paceMins = floor(paceSecondsPerKm / 60)`; `paceSecs = floor(paceSecondsPerKm % 60)`; format `` `${paceMins}:${paceSecs < 10 ? '0' : ''}${paceSecs}` `` (minutes per km). |

- **Last workout** (when `data.length > 0`): uses `data[0]` — **Strava returns newest first**, so this is the most recent activity. Shows `type`, weekday name from `start_date`, and `(distance / 1000).toFixed(1)` km.

### 1.3 Other Svelte pieces

- **`ActivityCard.svelte`:** presentational card for one activity (emoji by type, name, km, `moving_time` as `mm:ss`, short date). **Not currently imported in `App.svelte`** — still part of the design system to convert.  
- **`WeeklyChart.svelte`:** Chart.js (`chart.js/auto`) bar chart: takes **first 7** activities (`slice(0, 7)`), **reverses** for left-to-right chronological bars, labels = weekday short name, values = km with `#e94560` bars. **Not wired into `App.svelte` today** — preserve behavior when integrating into the Next.js dashboard.

### 1.4 Visual system (must not regress)

- **Palette:** marine `#16213e`, pink `#e94560`, page bg `#f3f7f9`, white cards, greys `#9ca3af` / `#6b7280`, chat gradient `#16213e` → `#0f3460`.  
- **Layout:** CSS grid `80px | 1fr | 350px`, rounded cards (~25–30px), sidebar nav, glass-style right panel with **rounded, translucent** body image (`opacity`, `border-radius: 180px`, drop-shadow).  
- **Chart.js:** same options (bar, `borderRadius: 4`, hidden legend, tooltip styling, axis colors).

---

## 2. Target architecture (Next.js App Router + Supabase)

### 2.1 Proposed folder structure

```
/
├── app/
│   ├── layout.tsx                 # Root layout: fonts, globals, providers
│   ├── page.tsx                   # Dashboard or redirect (auth-aware)
│   ├── globals.css                # Port of app.css + App.svelte global/body rules
│   ├── auth/
│   │   └── callback/route.ts      # OAuth callback: exchange code (server), upsert user, redirect with session/cookie
│   └── api/                       # Optional: route handlers only if needed (prefer Server Actions)
├── components/
│   ├── dashboard/
│   │   ├── DashboardShell.tsx     # Grid: sidebar + main + right panel (from App.svelte)
│   │   ├── StatCards.tsx
│   │   ├── BodyConditions.tsx
│   │   ├── CoachChat.tsx
│   │   └── RightPanel.tsx
│   ├── ActivityCard.tsx
│   └── WeeklyChart.tsx            # chart.js + react-chartjs-2 or canvas ref + useEffect
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client (createBrowserClient)
│   │   └── server.ts              # Server client + service role only where needed (minimal)
│   ├── supabase.ts                # As requested: main export surface (re-exports or thin wrapper)
│   ├── strava.ts                  # Strava API helpers (fetch activities, token refresh)
│   └── stats.ts                   # calculateWeeklyStats (exact math from Svelte)
├── actions/
│   ├── strava-auth.ts             # Token exchange (Server Action)
│   └── sync-activities.ts         # Fetch 30 + upsert activities (Server Action)
├── types/
│   ├── strava.ts                  # StravaActivity, token response, athlete
│   └── database.ts                # Row types matching Supabase tables
└── middleware.ts                  # Optional: refresh Supabase session / protect routes
```

**Notes:**

- **OAuth:** Strava redirects to a **Next route** (e.g. `app/auth/callback/route.ts` or a dedicated page), not Express. `REDIRECT_URI` in Strava app settings must match this URL (e.g. `https://yourdomain.com/auth/callback`).  
- **Secrets:** `CLIENT_SECRET`, Supabase **service role** (if used server-only), stay in server-only code — **Server Actions** and **Route Handlers** only.  
- **User identification:** Prefer **Supabase Auth** linked to Strava (e.g. store `strava_id` on `profiles` or dedicated table) **or** encrypted session cookie with internal user id after OAuth. The schema below uses a `users` table keyed by Strava id for parity with Mongo; you may merge with `auth.users` via a trigger or manual link — document the chosen approach in code comments.

---

## 3. Supabase database schema

### 3.1 Conceptual model

| Table | Purpose |
|-------|--------|
| **users** (or `strava_accounts`) | One row per Strava athlete: Strava id, profile fields, `access_token`, `refresh_token`, `expires_at` (Unix seconds, same as Strava). |
| **activities** | One row per Strava activity id; FK to user; denormalized activity fields matching current app usage. |

**RLS:** Enable RLS on both tables. Typical pattern:

- Authenticated users can **only read/update rows where** `user_id` matches `auth.uid()` **if** you map Supabase Auth users 1:1 to app users.  
- If OAuth is **only** Strava without Supabase email login initially, you may use a **service role** in Server Actions to read/write by `strava_id` from a signed session you control — then tighten RLS when Auth is unified.

The SQL below creates tables compatible with the old Mongoose shapes; adjust column names to match your TypeScript types.

### 3.2 Raw SQL (run in Supabase SQL Editor)

```sql
-- Extensions (uuid if you link to auth.users)
create extension if not exists "uuid-ossp";

-- Users: Strava tokens + profile (mirrors Backend/Database/User.js)
create table public.users (
  id uuid primary key default gen_random_uuid(),
  strava_id bigint not null unique,
  first_name text,
  last_name text,
  profile_pic text,
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_users_strava_id on public.users (strava_id);

-- Activities: mirrors Backend/Database/Activity.js
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  activity_id bigint not null unique,
  name text,
  type text,
  distance double precision not null default 0,
  moving_time integer not null default 0,
  start_date timestamptz not null,
  map_polyline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_activities_user_id on public.activities (user_id);
create index idx_activities_start_date on public.activities (start_date desc);

-- updated_at trigger (optional but useful)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger activities_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

-- RLS
alter table public.users enable row level security;
alter table public.activities enable row level security;

-- Placeholder policies: tighten when auth.uid() is wired to user rows
-- Example: only service role or backend sync — deny anon by default
create policy "Deny all for anon users"
  on public.users for all
  using (false);

create policy "Deny all for anon activities"
  on public.activities for all
  using (false);

-- After you link Supabase auth.users to public.users, replace with policies like:
-- using ( auth.uid() = auth_user_id )
```

**Important:** The deny-all policies above force all access through the **server** (Server Actions with service role or a single locked-down RPC). When you add Supabase Auth and a foreign key from `users` to `auth.users`, replace those policies with real `auth.uid()` checks so the client can read safely with the anon key.

**Type mapping note:** Mongoose used `activityId` as string; Strava ids are numeric — `bigint` is appropriate. `stravaId` in the old User schema was string; you can use `text` for `strava_id` if you prefer exact parity: `strava_id text not null unique`.

---

## 4. `lib/supabase.ts` (what it should do)

- **Browser:** export a `createClient()` using `@supabase/supabase-js` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for any client components that need realtime or user-scoped queries under RLS.  
- **Server:** either re-export `createServerClient` from `@supabase/ssr` in `lib/supabase/server.ts` and keep `lib/supabase.ts` as a barrel file, **or** put the canonical `createBrowserClient` + typed `Database` interface in `lib/supabase.ts` per project convention.  
- **Types:** generate types with Supabase CLI (`supabase gen types typescript`) into `types/database.ts` and use them in Server Actions.

---

## 5. Server Actions vs old Express routes

| Express | Next.js |
|---------|---------|
| `GET /auth` | `redirect()` to Strava from a Server Action or `Link` to a route that redirects |
| `GET /exchange_token` | `app/auth/callback/route.ts` (GET): read `code`, POST token exchange, upsert `users`, set session cookie, `redirect()` to `/` or `/dashboard` |
| `GET /activities` | Server Action `syncActivities()` + optionally `getActivities()` reading from Supabase; **do not** expose Strava tokens to the client |

**Token refresh:** Strava access tokens expire. Add server-side logic: if `expires_at` is past (with small skew), call Strava refresh endpoint and update `users` before calling the activities API.

---

## 6. Strict TypeScript interfaces (sketch)

- **`StravaActivity`:** `id`, `name`, `type`, `distance`, `moving_time`, `start_date` (ISO string), `map?: { summary_polyline?: string }` — align with Strava API v3.  
- **`StravaTokenResponse`:** `access_token`, `refresh_token`, `expires_at`, `athlete`.  
- **`UserSession` / DB row:** match `users` columns; never send tokens to client — use a public `SessionUser` type with `stravaId`, names, profile only.

---

## 7. Checklist for parity

- [ ] Last 7 days filter + weekly distance / time / pace math identical to `calculateWeeklyStats`.  
- [ ] Activities sorted newest-first before `data[0]` last workout.  
- [ ] Chart: 7 most recent, reversed, Chart.js options unchanged.  
- [ ] Marine / white / pink UI and glassmorphism assets preserved.  
- [ ] Supabase RLS finalized after auth strategy is chosen.  
- [ ] Strava redirect URIs updated for production domain.

This file should stay updated as you implement Server Actions, auth linking, and RLS policies so the codebase and database stay in sync.
