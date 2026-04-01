# Academos Project Report

## Overview

Academos is a local-first Next.js App Router application that answers academic questions by fetching Newton data through MCP, optionally storing a normalized snapshot in Supabase, and then asking Gemini to reason over the available academic snapshot.

The live pipeline is:

`Newton MCP -> Next.js backend -> Gemini -> UI`

Optional persistence flow:

`Newton MCP -> Next.js backend -> Supabase -> Gemini -> UI`

This architecture is intentional. The app is designed to avoid showing fabricated academic data in the UI. The dashboard only reports readiness and policy, while the chat route performs the actual fetch-store-reason workflow.

## Tech Stack

- Next.js 16.2.1
- React 19.2.4
- React DOM 19.2.4
- Newton MCP, launched locally through `npx`
- Supabase REST API
- Gemini Developer API

Defined scripts:

- `npm run dev`
- `npm run build`
- `npm run start`

## User-Facing Routes

### `/`

The home page is a simple entry point that explains the data pipeline and links to the two main sections:

- `Dashboard`
- `Chat`

Source files:

- [`app/page.js`](./app/page.js)
- [`components/Navbar.js`](./components/Navbar.js)
- [`app/layout.js`](./app/layout.js)

### `/dashboard`

The dashboard is a readiness page, not a student-data dashboard. It exists to show:

- whether Newton MCP is configured
- whether Supabase is configured
- whether Gemini is configured
- the rule that academic answers must come from Newton data only

It explicitly avoids rendering invented attendance, assignments, or performance data.

Source file:

- [`app/dashboard/page.js`](./app/dashboard/page.js)

### `/chat`

This is the operational UI for the full academic reasoning flow. It:

- checks local setup status
- blocks submission if setup is incomplete
- submits a user query to `/api/ask`
- renders `summary`, `tasks`, `insights`, `source`, and `snapshotId`

Source files:

- [`app/chat/page.js`](./app/chat/page.js)
- [`app/chat/ChatClient.js`](./app/chat/ChatClient.js)

### `/api`

This endpoint returns runtime setup status. It is the preflight endpoint used by the chat UI.

Source file:

- [`app/api/route.js`](./app/api/route.js)

### `/api/ask`

This is the main backend endpoint. It validates the query, checks readiness, fetches Newton data, optionally stores the snapshot in Supabase, calls Gemini with the available academic snapshot, optionally persists the reasoning response, and returns the final UI payload.

Source file:

- [`app/api/ask/route.js`](./app/api/ask/route.js)

## End-To-End Runtime Workflow

### 1. Local setup must exist

Before academic reasoning is allowed, the backend expects:

- Newton MCP added to Codex
- Newton authentication completed if required
- `.env.local` to include Gemini credentials
- optional Supabase credentials if persistence is desired
- the Supabase `academic_snapshots` table to exist if persistence is enabled

The readiness check is implemented in [`lib/runtime-status.js`](./lib/runtime-status.js).

The backend marks the app as ready when these required items are true:

- Newton configured
- Gemini configured

If not ready, the app returns `setup-required` and the chat UI stays disabled.

### 2. The chat UI loads preflight status

`ChatClient` receives an initial server-side setup snapshot from `app/chat/page.js`, then refreshes it on the client by calling `/api`.

If setup is incomplete:

- the submit button changes to `Finish Local Setup`
- the missing steps are shown in the UI
- no broken request is sent to `/api/ask`

If setup is complete:

- the submit button becomes `Run Academic Reasoning`

### 3. The user submits a question

The chat UI sends:

```json
{
  "query": "..."
}
```

This is a single-turn request model. The current implementation does not maintain conversational history in the backend.

### 4. `/api/ask` validates and gates the request

The route:

- parses JSON
- requires a non-empty `query`
- checks runtime readiness again
- returns `503` if setup is incomplete

This prevents the backend from partially executing a flow that cannot finish.

### 5. The backend opens a Newton MCP client

`getNewtonSnapshot(query)` creates a local MCP client that:

- spawns `npx -y @newtonschool/newton-mcp@latest`
- initializes JSON-RPC
- calls Newton tools over stdio
- parses JSON payloads from tool responses

This is implemented in [`lib/newton-mcp.js`](./lib/newton-mcp.js).

### 6. The backend resolves context from the query

The first Newton call is always `list_courses`.

The returned course list is used to resolve:

- primary course
- best matching course from the query
- best matching subject from the query

The matching strategy is heuristic:

- try subject alias matches first
- then try course name or semester matches
- otherwise fall back to the primary course

### 7. The backend detects user intent

The project uses regex-based intent detection to classify the query into one of these types:

- `courses`
- `attendance`
- `assignments`
- `contests`
- `quizzes`
- `subject_performance`
- `next_class`
- `calendar`
- `timeline`
- `arena`
- `qotd`
- `expert_sessions`
- `rank`
- `performance`
- `today`
- `resume`
- `concerns`

The result determines which Newton tools are called.

### 8. The backend fetches only the required Newton data

After intent detection, the backend conditionally calls Newton tools.

Currently wired tools:

- `list_courses`
- `get_course_overview`
- `get_assignments`
- `get_upcoming_schedule`
- `get_subject_progress`
- `get_leaderboard`
- `get_assessments`
- `get_calendar`
- `get_recent_lectures`
- `get_arena_stats`
- `get_question_of_the_day`
- `get_qotd_history`

Examples:

- attendance/performance/rank queries may fetch overview data
- assignment queries fetch pending assignments and contests
- schedule and next-class queries fetch upcoming schedule
- quiz queries fetch assessments
- QOTD queries fetch current QOTD and QOTD history

### 9. Newton data is normalized into one snapshot

The raw Newton responses are simplified into a single structured snapshot object. The code normalizes:

- course metadata
- subject metadata
- assignments and contests
- schedule entries
- leaderboard entries
- assessments
- calendar events
- recent lectures
- arena stats
- QOTD data
- attendance aggregates

Dates are formatted in the `Asia/Kolkata` timezone.

The snapshot also records:

- `intent`
- `query`
- `toolsUsed`
- the resolved course and subject context

### 10. The snapshot can be stored in Supabase

If Supabase is configured, the backend inserts the normalized snapshot into the `academic_snapshots` table.

The insert includes:

- `query`
- `intent`
- `source`
- `tools_used`
- `snapshot`

After insert, the backend reads the row back by `id`.

This is implemented through a minimal REST client in [`lib/supabase.js`](./lib/supabase.js).

### 11. Gemini reasons over the academic snapshot

Gemini is not expected to use live tools directly.

Instead, the backend builds a strict prompt containing either:

- the stored row id
- the original query
- the stored snapshot when Supabase is enabled
- or the in-memory Newton snapshot when Supabase is disabled
- the recorded tool list

The prompt instructs Gemini to:

- use only the provided academic data
- not fetch tools
- not use general knowledge
- keep contests separate from assignments
- keep quizzes and assessments separate from both
- return JSON only
- return `Data not found` if the provided data does not contain the answer

This is built in `buildAcademicReasoningPrompt()`.

### 12. The backend validates Gemini output

The API expects one of these shapes:

```json
{
  "summary": "",
  "tasks": [],
  "insights": []
}
```

or

```json
{
  "error": ""
}
```

If Gemini returns invalid JSON, the route throws an error.

If Gemini returns an `error`, the backend stores that error in Supabase when persistence is enabled and returns an HTTP 500 response.

Otherwise the backend:

- normalizes `tasks`
- normalizes `insights`
- stores `reasoning_response`
- stores `reasoning_model`
- returns the final response to the browser

### 13. The UI renders the final answer

The chat client renders:

- `Summary`
- `Tasks`
- `Insights`

It also shows:

- `source`, which is currently expected to be `gemini` or `supabase-gemini`
- `snapshotId`, which identifies the stored record used for reasoning

## Supabase Schema

The required schema is defined in [`supabase/schema.sql`](./supabase/schema.sql).

The table is:

- `public.academic_snapshots`

Stored columns:

- `id`
- `query`
- `intent`
- `source`
- `tools_used`
- `snapshot`
- `reasoning_response`
- `reasoning_model`
- `created_at`
- `updated_at`

The schema also creates:

- an index on `created_at`
- a trigger to update `updated_at` automatically

## Runtime Status Behavior

The app has two major readiness modes.

### Ready

When Newton MCP and Gemini are configured:

- `/api` returns `status: "ok"`
- the chat button is enabled
- `/api/ask` can run the full fetch-store-reason flow

When Supabase is also configured:

- the backend persists snapshots and reasoning responses

### Setup required

When any required part is missing:

- `/api` returns `status: "setup-required"`
- the UI shows missing setup steps
- the chat button remains disabled
- `/api/ask` returns a guarded failure instead of attempting a broken pipeline

## Important Design Decisions

### 1. Newton-grounded reasoning with optional persistence

The project can store Newton data in Supabase before reasoning, but it can also fall back to in-memory reasoning when Supabase is unavailable. In both modes, the answer is still grounded in the fetched Newton snapshot.

### 2. Separation of academic categories

The prompt and docs explicitly preserve boundaries between:

- assignments
- contests
- quizzes and assessments

This avoids mixing different academic task types into one bucket.

### 3. No fabricated dashboard data

The dashboard is a system-readiness page, not a synthetic student dashboard. This is an explicit policy in the code and README.

### 4. Local-machine dependency

The current design assumes the machine running the app also has:

- Codex installed
- Newton MCP available locally
- Newton login completed if needed

This is not a hosted multi-tenant architecture in its current form.

## Current Limitations and Caveats

### Unused local response builders

`lib/newton-mcp.js` contains a large number of helper functions that build deterministic responses for attendance, assignments, contests, schedule, rank, quizzes, QOTD, and more.

At the moment, those builders are not part of the live request path. The real production path is:

`getNewtonSnapshot() -> optional insertAcademicSnapshot() -> buildAcademicReasoningPrompt() -> askGemini()`

That means the local builders currently behave like dormant or future-facing logic rather than active runtime behavior.

### Intent coverage is broader than fetch coverage

The intent detector can return `resume` and `concerns`, but there are no dedicated Newton fetch branches for those intents in the current orchestration path.

That means those intents may not receive purpose-built data collection.

### Query understanding is heuristic

Intent detection and course/subject resolution are both rule-based. This keeps the backend deterministic, but it also means ambiguous wording can route to the wrong intent or the wrong academic scope.

### No explicit test suite in the repo

The current repository does not include a visible automated test suite or CI-oriented validation path.

## File Map

- [`package.json`](./package.json): runtime scripts and dependencies
- [`README.md`](./README.md): project summary and setup instructions
- [`app/page.js`](./app/page.js): landing page
- [`app/dashboard/page.js`](./app/dashboard/page.js): readiness dashboard
- [`app/chat/page.js`](./app/chat/page.js): chat route wrapper
- [`app/chat/ChatClient.js`](./app/chat/ChatClient.js): client-side chat workflow
- [`app/api/route.js`](./app/api/route.js): readiness endpoint
- [`app/api/ask/route.js`](./app/api/ask/route.js): full backend orchestration
- [`lib/runtime-status.js`](./lib/runtime-status.js): setup validation
- [`lib/gemini.js`](./lib/gemini.js): Gemini API wrapper
- [`lib/newton-mcp.js`](./lib/newton-mcp.js): Newton MCP client, intent detection, normalization, and prompt builder
- [`lib/supabase.js`](./lib/supabase.js): Supabase REST persistence
- [`supabase/schema.sql`](./supabase/schema.sql): required database schema

## Summary

Academos is a guarded academic reasoning pipeline rather than a generic chatbot. Its main operating rule is:

1. fetch academic data from Newton
2. normalize it
3. optionally store it
4. ask Gemini to reason over the available academic snapshot
5. render structured JSON back to the UI

That keeps the project grounded in Newton data while allowing the app to run with only Newton MCP and Gemini configured. Supabase remains available as an optional persistence layer.
