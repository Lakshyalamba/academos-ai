# Academos

Academos is an AI-powered student assistant built with Next.js that turns academic records into clear, structured guidance. It fetches verified student data through Newton MCP, optionally stores a snapshot in Supabase, and uses Gemini to generate readable responses such as summaries, recommended tasks, and useful academic insights. The product is designed to help students quickly understand attendance, assignments, schedule, and overall academic status without manually checking multiple views.

The app now keeps the landing page public and places the dashboard, chat, and contest workspace behind Supabase Auth.

## Problem Statement

Students often have to piece together their academic status from multiple sources such as attendance records, upcoming classes, assignments, and academic summaries. That workflow is slow, fragmented, and easy to miss important signals in. A student may know the data exists, but still struggle to answer simple questions like:

- What should I focus on today?
- Do I have any overdue work?
- Is my attendance becoming a risk?
- What is coming up next in my schedule?

## Solution Summary

Academos provides a single student-facing interface where a user can ask natural-language academic questions and receive a structured response grounded in verified academic data. Instead of surfacing raw records directly, the app organizes the answer into:

- a concise summary
- recommended tasks
- key insights

This keeps the experience simple for students while preserving a reliable backend data flow.

## Architecture

### High-level flow

Without persistence:

`Next.js UI -> Next.js API -> Newton MCP -> Gemini -> UI`

With optional persistence:

`Next.js UI -> Next.js API -> Newton MCP -> Supabase -> Gemini -> UI`

### Request lifecycle

1. A student asks a question from the chat UI.
2. The Next.js backend calls Newton MCP to fetch relevant academic data.
3. If Supabase is configured, the backend stores a normalized snapshot.
4. Gemini receives the available snapshot context and generates a structured response.
5. The frontend renders the result as summary, tasks, and insights.

### Core backend rule

Academic answers are intended to be grounded in Newton-backed data. Gemini formats and explains the response, but it is not the source of record.

## MCP Role in the System

Newton MCP is the verified academic data bridge in Academos.

- It is responsible for fetching live academic information for the student query.
- It acts as the source-of-truth layer for attendance, assignments, schedule, and academic summaries.
- It keeps the backend decoupled from direct platform-specific academic API logic.
- It makes the app safer by ensuring the assistant reasons over retrieved academic context rather than inventing student data.

In short, MCP is what allows Academos to stay product-friendly on the surface while remaining grounded in real academic records under the hood.

## Tech Stack

- Next.js 16
- React 19
- JavaScript
- CSS Modules
- Newton MCP
- Gemini
- Supabase
- Node.js / npm

## Project Structure

```text
app/
  api/
    route.js            # Runtime status endpoint
    ask/route.js        # Main academic reasoning API
  auth/
    AuthForm.js         # Login and signup form
    page.js             # Dedicated auth route
  chat/
    ChatClient.js       # Chat UI and response rendering
    chat.module.css     # Chat page styles
    page.js             # Chat route
  dashboard/
    dashboard.module.css
    page.js             # Readiness and trust dashboard
  globals.css           # Shared app styling
  home.module.css       # Landing page styles
  layout.js             # Root layout
  page.js               # Landing page
components/
  AuthProvider.js
  Navbar.js
lib/
  auth-routes.js        # Protected-route helpers
  gemini.js             # Gemini integration
  newton-mcp.js         # Newton MCP client and snapshot builder
  runtime-status.js     # Runtime mode and demo fallback checks
  supabase-auth-config.js
  supabase.js           # Snapshot persistence helpers
proxy.js                # Route protection and auth redirects
supabase/
  schema.sql            # Optional Supabase schema
```

## Setup Instructions

### 1. Clone and install

```bash
git clone <your-repo-url>
cd academos
npm install
```

### 2. Configure environment variables

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

Fill in the placeholder values in `.env.local`.

### 3. Register Newton MCP in Codex

```bash
codex mcp add newton -- npx -y @newtonschool/newton-mcp@latest
```

If login is required later:

```bash
npx -y @newtonschool/newton-mcp@latest login
```

### 4. Optional Supabase setup

If you want persisted snapshots, apply the SQL in `supabase/schema.sql` to your Supabase project before running the app.

### 5. Supabase Auth setup

To use the login and signup flow:

1. Create a Supabase project or reuse the same project already used for persistence.
2. In Supabase Auth, enable the Email provider.
3. Copy the project URL into `SUPABASE_URL`.
4. Copy the Supabase service role key into `SUPABASE_SERVICE_ROLE_KEY`.
5. Set the Supabase Auth site URL to your deployed frontend URL and add `http://localhost:3000` for local development.
6. If you want signup to enter the app immediately, disable email confirmation in Supabase Auth. If you keep confirmation enabled, the app will show a verification message after signup until the email is confirmed.

## Environment Variables

Use the placeholder values from `.env.example` only.

Server-only variables:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta/models
GOOGLE_API_KEY=
GOOGLE_MODEL=
NEWTON_CODEX_SERVER_NAME=newton
NEWTON_MCP_PACKAGE=@newtonschool/newton-mcp@latest
NEWTON_NPX_COMMAND=npx
CODEX_COMMAND=codex
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_ACADEMIC_SNAPSHOTS_TABLE=academic_snapshots
```

Client-safe variables:

```bash
NEXT_PUBLIC_API_BASE_URL=
```

Optional backend-only CORS variables:

```bash
ALLOWED_FRONTEND_ORIGINS=
CORS_ALLOWED_ORIGIN=
```

Notes:

- `GEMINI_API_KEY` or `GOOGLE_API_KEY` is required for Gemini-powered responses.
- `GEMINI_API_BASE_URL` is optional and only needed if you want to override the default Gemini endpoint.
- `NEXT_PUBLIC_API_BASE_URL` is optional. Leave it empty when the frontend and backend are deployed together in the same Next.js app. Set it only if your browser code must call a separate API origin in production.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are required for the server-side email/password auth flow.
- `ALLOWED_FRONTEND_ORIGINS` is optional and preferred. Set it to a comma-separated list of allowed frontend origins when your frontend is hosted on a different origin and must call these API routes from the browser.
- `CORS_ALLOWED_ORIGIN` remains supported as a legacy single-origin alias.
- Variables without `NEXT_PUBLIC_` stay server-only and must never be exposed to the browser.
- `NEWTON_CODEX_SERVER_NAME`, `NEWTON_MCP_PACKAGE`, `NEWTON_NPX_COMMAND`, and `CODEX_COMMAND` are optional runtime overrides for deployment environments.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are required for auth and optional only if you remove the auth flow entirely.
- `SUPABASE_ACADEMIC_SNAPSHOTS_TABLE` can stay at the default placeholder value unless you use a custom table name.

## Deployment Overview

The safest production shape for this repository is a split deployment:

- frontend: Vercel preferred, Netlify also fine
- backend: Render preferred, Railway also fine

Why this split is recommended:

- the frontend pages now fetch live data through API calls at runtime
- the backend still depends on machine-local Newton MCP access, `codex`, and `npx`
- that backend runtime is a better fit for a long-lived Node service than a serverless frontend host

Included deployment files:

- `.nvmrc` pins the project to Node 20
- `render.yaml` defines a minimal Render web service for the backend

Files intentionally not added:

- no `vercel.json` because Vercel already handles Next.js App Router builds correctly
- no `Procfile` because `npm start` and `render.yaml` already define backend startup
- no SPA rewrite config because this is not a Vite or CRA app

## Env Var Setup

Use hosting platform env settings instead of committing secrets.

Frontend host:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.example.com
```

Notes:

- leave `NEXT_PUBLIC_API_BASE_URL` empty only when frontend and backend are served from the same origin
- set it for split frontend/backend deployments

Backend host:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
ALLOWED_FRONTEND_ORIGINS=https://your-frontend-domain.example.com
```

Optional backend variables:

```bash
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta/models
GOOGLE_API_KEY=
GOOGLE_MODEL=
SUPABASE_ACADEMIC_SNAPSHOTS_TABLE=academic_snapshots
NEWTON_CODEX_SERVER_NAME=newton
NEWTON_MCP_PACKAGE=@newtonschool/newton-mcp@latest
NEWTON_NPX_COMMAND=npx
CODEX_COMMAND=codex
CORS_ALLOWED_ORIGIN=
ACADEMOS_FORCE_DEMO_MODE=
```

Newton MCP still requires a machine-local runtime with `codex` and `npx`
available on the backend host.

If Newton MCP is unavailable, the app now falls back to a non-fatal demo mode.
In demo mode, `/api` reports degraded runtime status, chat returns clearly labeled
fallback guidance, and dashboard/contest pages remain navigable without pretending
that live academic data exists.

## Frontend Deployment Steps

Recommended host: Vercel

1. Create a new project from this repository.
2. Use the repo root `.` as the root directory.
3. Let the platform detect Next.js automatically.
4. Use Node 20 from `.nvmrc`.
5. Set `NEXT_PUBLIC_API_BASE_URL` if the frontend will call a separate backend origin.
6. Deploy with:

```bash
npm ci
npm run build
```

Notes:

- no custom rewrite is needed on Vercel
- on Netlify, use its Next.js runtime support and do not add `/* -> /index.html`
- the frontend routes `/`, `/chat`, `/dashboard`, and `/contest` are build-safe and fetch live data at runtime

## Backend Deployment Steps

Recommended host: Render

1. Create a Render Web Service from this repository or apply `render.yaml`.
2. Use the repo root `.`.
3. Render will use:
   - build command: `npm ci && npm run backend:build`
   - start command: `npm start`
   - health check path: `/api/health`
4. Set the required backend env vars in the platform dashboard.
5. If using persistence, apply `supabase/schema.sql` in Supabase.
6. Install and authenticate Newton MCP on the backend host:

```bash
codex mcp add newton -- npx -y @newtonschool/newton-mcp@latest
npx -y @newtonschool/newton-mcp@latest login
```

7. Verify the health endpoint after deploy:

```text
GET /api/health
```

If your Render deployment cannot provide Newton MCP, keep Gemini configured and
let the app run in demo fallback mode. You can optionally force that behavior
explicitly with:

```bash
ACADEMOS_FORCE_DEMO_MODE=true
```

Railway can use the same repo root and commands:

- build: `npm run backend:build`
- start: `npm start`

## Post-Deploy Testing Checklist

- frontend home page loads on `/`
- frontend routes `/chat`, `/dashboard`, and `/contest` return `200`
- backend health check returns `200` on `/api/health`
- backend runtime status returns `200` on `/api`
- `POST /api/ask` works with a real Gemini key and Newton setup
- if frontend and backend are split, browser requests succeed without CORS errors
- if Supabase is enabled, snapshot writes succeed after applying `supabase/schema.sql`
- Newton-backed routes work on the deployed backend host after MCP login

## Run Locally

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

Protected routes redirect to `/auth` until a valid Supabase session exists.

Optional production build check:

```bash
npm run build
```

To simulate the deployed demo fallback locally:

```bash
ACADEMOS_FORCE_DEMO_MODE=true npm run dev
```

## Demo Queries

Use questions like these during a project demo:

- What should I focus on this week?
- Do I have any overdue assignments?
- What does my upcoming class schedule look like?
- Give me a summary of my current academic status.
- Is my attendance at risk?
- What are my next important academic tasks?

## Screenshots

Add screenshots before publishing the final GitHub showcase.

- Landing page screenshot placeholder
- Dashboard screenshot placeholder
- Chat page screenshot placeholder

Suggested file locations:

- `docs/screenshots/home.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/chat.png`

## Limitations

- The live experience depends on a working Newton MCP setup in Codex.
- Gemini access is required for structured AI responses.
- Supabase persistence is optional and only works when configured correctly.
- The assistant is focused on academic guidance, not full long-term conversation memory.
- The current product is optimized for structured answers rather than complex workflow automation.

## Future Improvements

- multi-turn academic conversation memory
- richer dashboard analytics and trends
- notifications for attendance or deadline risk
- subject-wise prioritisation views
- better historical comparisons for academic progress
- exportable summaries for mentors or advisors

## Public-Safe Notes

This README intentionally avoids:

- real secrets
- personal student data
- internal runtime outputs
- real snapshot identifiers

It is safe to use as a public GitHub project overview.
