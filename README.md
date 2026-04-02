# Academos

Academos is an AI-powered student assistant built with Next.js that turns academic records into clear, structured guidance. It fetches verified student data through Newton MCP, optionally stores a snapshot in Supabase, and uses Gemini to generate readable responses such as summaries, recommended tasks, and useful academic insights. The product is designed to help students quickly understand attendance, assignments, schedule, and overall academic status without manually checking multiple views.

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
  Navbar.js
lib/
  gemini.js             # Gemini integration
  newton-mcp.js         # Newton MCP client and snapshot builder
  runtime-status.js     # Local setup / runtime checks
  supabase.js           # Snapshot persistence helpers
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

## Environment Variables

Use the placeholder values from `.env.example` only:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_ACADEMIC_SNAPSHOTS_TABLE=academic_snapshots
```

Notes:

- `GEMINI_API_KEY` is required for Gemini-powered responses.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are optional unless you want persistence.
- `SUPABASE_ACADEMIC_SNAPSHOTS_TABLE` can stay at the default placeholder value unless you use a custom table name.

## Run Locally

Start the development server:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Then open:

```text
http://127.0.0.1:3000
```

Optional production build check:

```bash
npm run build
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
