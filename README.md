# Academos

Academos is a Next.js app that fetches academic data from the Newton MCP server, stores the normalized snapshot in Supabase, and then sends the stored record to Claude for JSON-only reasoning in the UI.

Current runtime flow:

`Newton MCP -> Next.js backend -> Supabase -> Claude -> UI`

## What The App Does

- Fetches academic data from Newton through the backend.
- Normalizes the data into a structured snapshot.
- Stores that snapshot in Supabase before any LLM reasoning happens.
- Sends the stored database record to Claude.
- Returns JSON-only academic reasoning to the chat UI.
- Prevents fabricated academic data from being shown in the dashboard.

## Features

- MCP-backed academic snapshot generation.
- Supabase persistence for fetched academic records.
- Claude reasoning over stored data only.
- JSON-only response contract.
- Separation of assignments, contests, and quizzes.
- Setup-status preflight in the UI before chat submission.

## Project Structure

```text
app/
  api/
    route.js          # Runtime/config status endpoint
    ask/route.js      # Main academic reasoning API
  chat/
    ChatClient.js     # Chat UI and setup preflight
    page.js           # Chat page
  dashboard/
    page.js           # System-readiness dashboard
  page.js             # Home page
lib/
  claude.js           # Claude API wrapper
  newton-mcp.js       # Newton MCP client + snapshot builder
  supabase.js         # Minimal Supabase REST client
supabase/
  schema.sql          # Required database schema
```

## Runtime Workflow

### 1. User asks a question

The chat page submits a request to `/api/ask`.

### 2. Backend fetches Newton data

The backend uses the Newton MCP client in `lib/newton-mcp.js` to fetch the relevant academic data.

Examples of supported data areas:

- courses
- attendance
- assignments
- contests
- quizzes / assessments
- subject performance
- schedule
- calendar
- recent lecture timeline
- arena
- leaderboard
- question of the day

### 3. Backend stores the snapshot in Supabase

The normalized snapshot is inserted into the `academic_snapshots` table through `lib/supabase.js`.

### 4. Claude reasons over stored data only

Claude receives the stored database record, not the live MCP fetch result directly.

### 5. UI renders JSON response

The response shape is:

```json
{
  "summary": "",
  "tasks": [],
  "insights": [],
  "source": "supabase-claude",
  "snapshotId": ""
}
```

If the data is missing, the reasoning layer should return:

```json
{
  "summary": "Data not found",
  "tasks": [],
  "insights": []
}
```

If the reasoning layer reports an error, the API returns:

```json
{
  "error": "..."
}
```

## Environment Variables

Create `.env.local` from `.env.example` and set:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-6
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_ACADEMIC_SNAPSHOTS_TABLE=academic_snapshots
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is required because inserts and updates happen server-side.
- `SUPABASE_ACADEMIC_SNAPSHOTS_TABLE` is optional if you use the default table name `academic_snapshots`.

## Supabase Setup

Apply the SQL in `supabase/schema.sql` to your Supabase project before using the chat flow.

This creates:

- `public.academic_snapshots`
- a `created_at` index
- an `updated_at` trigger

Main stored fields:

- `query`
- `intent`
- `source`
- `tools_used`
- `snapshot`
- `reasoning_response`
- `reasoning_model`
- timestamps

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Then fill in the real Claude and Supabase credentials.

### 3. Apply the Supabase schema

Run the SQL in `supabase/schema.sql` in your Supabase SQL editor.

### 4. Start the app

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

### 5. Open the app

```text
http://127.0.0.1:3000
```

## Runtime Status Behavior

When Claude and Supabase are configured:

- `/api` returns `status: "ok"`
- chat submission is enabled
- the backend stores a snapshot and then calls Claude

When configuration is missing:

- `/api` returns `status: "setup-required"`
- the chat button is disabled
- the UI shows the missing setup instead of submitting a broken request

Example current unconfigured `/api` response:

```json
{
  "status": "setup-required",
  "message": "Academos requires Supabase and Claude configuration before academic reasoning can run.",
  "config": {
    "claudeConfigured": false,
    "supabaseConfigured": false
  },
  "links": ["/dashboard", "/chat"]
}
```

## Routes

### `/`

Home page describing the pipeline and main navigation.

### `/dashboard`

System-readiness dashboard.

Important:

- It does **not** show fabricated academic data.
- It only shows system readiness and data-integrity guidance.

### `/chat`

Academic reasoning UI.

Behavior:

- checks setup status from `/api`
- blocks submission if Supabase or Claude is missing
- displays `snapshotId` after a successful reasoning pass

### `/api`

Status/config endpoint.

### `/api/ask`

Main reasoning endpoint.

High-level behavior:

1. validate the user query
2. fetch Newton MCP data
3. store the snapshot in Supabase
4. read the stored row back
5. send the stored row to Claude
6. store Claude’s reasoning result in Supabase
7. return normalized JSON to the UI

## Build And Verification

Production build:

```bash
npm run build
```

### Browser verification

This repo was checked locally with Playwright against:

- `/`
- `/dashboard`
- `/chat`
- `/api`

What was verified:

- local server starts
- chat setup preflight works
- `/api` reports missing configuration correctly
- dashboard no longer renders fake academic data
- production build succeeds

## Data Integrity Rules

The app is designed around these constraints:

- academic data must come from Newton MCP
- Claude reasons over stored data only
- contests stay separate from assignments
- quizzes / assessments stay separate from both contests and assignments
- if requested data is unavailable, the app should return `Data not found`

## Known Constraints

- The full end-to-end reasoning flow requires valid Claude and Supabase credentials.
- Without those credentials, the app can still run locally, but chat stays in setup-required mode.
- The backend expects the Newton MCP package to be available through `npx` at runtime.

## Useful Commands

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Build for production:

```bash
npm run build
```

## Summary

Academos is now structured as a backend-first academic reasoning pipeline:

`Newton MCP -> backend -> Supabase -> Claude -> UI`

That keeps academic data fetch, persistence, reasoning, and rendering clearly separated and avoids fabricated student data in the interface.
