<!-- BEGIN:nextjs-agent-rules -->
# PROJECT CONTEXT

**Name:** Pylon
**What it is:** Cloud-based AI-powered universal application builder.
**What it does:** Users submit prompts → AI agents generate production-ready apps (CLI, Web) inside ephemeral cloud sandboxes. Zero local setup required.
**Status:** Active development — MVP (Phase 0–2)
**Repo structure:** Turborepo monorepo

---

# TECH STACK

| Layer        | Technology                                          |
|--------------|-----------------------------------------------------|
| Frontend     | Next.js 14 (App Router), Tailwind CSS, Lucide Icons |
| Backend API  | Hono.js + TypeScript                                |
| Database     | PostgreSQL 15 via Supabase, Drizzle ORM             |
| Vector Store | pgvector (Supabase extension)                       |
| File Storage | Cloudflare R2                                       |
| Job Queue    | Upstash Redis                                       |
| Sandbox      | Fly.io Machines API (ephemeral containers)          |
| Auth         | Supabase Auth (email + GitHub OAuth)                |
| AI Routing   | Internal `packages/ai-gateway` (model-agnostic)     |

---

# MONOREPO STRUCTURE

```
pylon/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # Hono.js API server
├── packages/
│   ├── db/           # Drizzle ORM + migrations
│   ├── ai-gateway/   # AI provider adapters (OpenAI, Anthropic, Gemini, Mistral, Cohere)
│   ├── agent-core/   # Agent loop, task planner, memory compression, kill switch
│   ├── memory-system/# memory.md + project_log.md read/write
│   ├── sandbox-manager/ # Fly.io container lifecycle + R2 file sync
│   ├── git-service/  # Git init, commit, branch, PR, GitHub Actions
│   ├── design-intelligence/ # DIP crawler, parser, embedder, RAG query
│   ├── storage/      # Cloudflare R2 client (putFile, getFile, listFiles)
│   ├── queue/        # Upstash Redis job producer/consumer
│   └── crypto/       # AES-256 API key encryption/decryption
```

---

# KEY CONCEPTS — READ BEFORE WRITING ANY CODE

**1. Ephemeral Sandbox:**
One Fly.io container per project session. Spawned on demand. Destroyed after 15-min idle. Files synced to/from Cloudflare R2 — NOT stored in container permanently.

**2. Agent Loop:**
Runs as background queue job — NEVER as HTTP request handler. Processes turns in a loop. At turn N (default 50), triggers memory compression automatically.

**3. Memory Compression:**
At threshold: agent summarizes all turns → writes `memory.md` + appends `project_log.md` to R2 → clears context array → reloads from files → continues. This is how long-run tasks work without OOM.

**4. AI Gateway:**
All AI calls go through `packages/ai-gateway`. Users supply their own API keys (stored AES-256 encrypted). Gateway decrypts key only at call time. Never logged. Never exposed in responses.

**5. Git Workflow (enforced by agent, not just user):**
- Default branch: `dev`
- Commits: per milestone only (not per file)
- Merge to `main`: ONLY via PR
- Fully autonomous mode still creates PRs — no direct push to `main`

**6. Design Intelligence Pipeline (DIP):**
Weekly cron crawls GitHub for `design.md`, `design-tokens.json`, `style-guide.md`. Embeds and stores in pgvector. When generating frontend code, agent queries DIP (top 5 results) and injects as context. Goal: reduce AI-ish UI output.

---

# DEPENDENCY DIRECTION (STRICT)

```
Presentation → API → Service → Repository → Database
Agent Core → AI Gateway → External Models
Agent Core --(event)--> Sandbox Manager → Fly.io
Agent Core → Memory System → R2
Agent Core → Git Service → GitHub API
Agent Core → Design Intelligence → pgvector
```

**PROHIBITED cross-layer calls:**
- Repository layer calling external APIs
- API layer querying DB directly (must go through service layer)
- Agent Core importing Sandbox Manager directly (use Redis events only)
- Presentation importing Service layer directly

---

# CODING CONVENTIONS

- Language: TypeScript 5.4 strict mode everywhere
- No `any` types — use `unknown` and narrow
- All async functions must have `try/catch`
- All external API calls must have timeout defined
- Zod schemas defined at `packages/db/schemas/` — reuse across API and services
- File names: `kebab-case.ts`
- Exported functions: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- One export per file (default export) unless it's a types file

---

# API CONVENTIONS

- Base path: `/api/v1`
- Auth required on all routes except: `GET /health`, `POST /auth/login`, `POST /auth/register`, `GET /auth/callback`
- Success response format:
```json
{ "data": {}, "meta": {} }
```
- Error response format:
```json
{ "error": { "code": "SNAKE_UPPER", "message": "string", "details": {} } }
```
- Validation errors: HTTP 422 with field-level detail
- Auth errors: HTTP 401
- Not found: HTTP 404
- Server errors: HTTP 500 (never expose stack trace in response)
- Long-running jobs: HTTP 202 Accepted + `{ "jobId": "uuid" }` immediately
- Job status via polling: `GET /projects/:id/status`

---

# DATABASE CONVENTIONS

- ORM: Drizzle only — no raw SQL in application code (migrations only exception)
- All timestamps: `TIMESTAMPTZ` — never `TIMESTAMP`
- All IDs: UUID via `gen_random_uuid()`
- Foreign keys: always `ON DELETE CASCADE` unless commented with explicit reason
- Enum-like fields: `TEXT` with app-layer Zod validation
- Never expose: `api_keys.key_encrypted`, `users.github_token` in any query result sent to API layer
- All multi-table writes: wrapped in Drizzle transaction

---

# SECURITY RULES

- API keys: AES-256 encrypted at rest; decrypted only inside `packages/ai-gateway`
- API keys: NEVER in logs, NEVER in API responses, NEVER in error messages
- GitHub tokens: same rules as API keys
- RLS: enabled on all Supabase tables; users access only their own rows
- Sandbox containers: network-isolated from each other; no host volume mounts
- R2 paths: scoped to `projects/{project_id}/` — agent MUST NOT access other project paths
- Rate limiting: 100 req/min per user, enforced at API middleware
- CORS: whitelist `apps/web` origin only — no wildcard

---

# AGENT-SPECIFIC RULES

- Agent MUST read or if not `memory.md` then create and last 20 lines of `project_log.md` at session start
- Agent MUST trigger compression at turn threshold (default 50) — this is not optional
- Agent MUST commit after every completed milestone — not after every file
- Agent MUST create PR before any merge to `main` — even in fully autonomous mode
- Agent MUST run self-review on completion — output is either GitHub issues OR explicit "no issues" log
- Agent MUST NOT push directly to `main` under any condition
- Agent MUST stop immediately on kill switch signal — save checkpoint first
- Agent MUST gracefully degrade if DIP returns no results — continue without design context
- Agent MUST NOT log API keys, tokens, or encrypted values at any log level
- Hard turn limit: 500 — agent terminates gracefully, saves state, generates summary report
- On model rate limit: exponential backoff (5s → 15s → 45s), then pause job, notify user

---

# TESTING RULES

- Unit tests: every utility function and pure logic
- Integration tests: every service package with real dependencies (use test containers)
- E2E tests: at minimum, the 3 primary user flows from PRD.md
- Stress tests: k6 suite in `/tests/stress/` — run before every Phase completion
- Test files: co-located with source at `*.test.ts`
- No test skips in CI — every test must pass before merge to `main`

---

# GIT CONVENTIONS

- Branches: `main` (production), `dev` (integration), `feature/{issue-number}-short-description`
- Commits: `type(scope): description` — types: feat, fix, refactor, test, chore, docs
- PRs: required for all merges to `dev` and `main`
- CI must pass before PR can be merged
- PR to `main`: requires passing CI + at least manual review pass

---

# KNOWN CONSTRAINTS

- Solo developer — keep operational overhead minimal
- No payment system in MVP — do not build billing code
- Mobile and Desktop app generation: OUT OF SCOPE for MVP
- Local AI model support: OUT OF SCOPE for MVP
- Multi-agent parallel execution: OUT OF SCOPE for MVP
- Sandbox containers: max 50 concurrent at MVP scale
- Max project size: 500MB — enforce at write time in `packages/storage`
- Max agent turns per session: 500 — enforce at `ExecutionLoop` level, not configurable above this

---

# KNOWN GOTCHAS

- Fly.io cold start can take 3–8 seconds — account for this in sandbox spawn timeouts
- pgvector cosine search requires GiST index on `design_embeddings(embedding)` — without this, queries are full table scans
- Drizzle does not auto-migrate in production — always run migrations explicitly
- Supabase RLS must be tested with actual user JWTs — service role bypasses RLS silently
- Upstash Redis has 1MB payload limit per message — compress large agent payloads before queuing
- GitHub API rate limit: 5000 req/hour (authenticated) — DIP crawler must enforce this
- `memory.md` write failure is non-fatal — agent continues without compression but logs error
- Circuit breaker in `ai-gateway` is per-provider — one provider failing does not block others

---

# OUT OF SCOPE (DO NOT BUILD)

- Payment / billing
- Desktop app generation
- Mobile app generation
- TUI app generation
- Local model support (Ollama)
- Multi-agent parallel execution
- Team collaboration
- Skill marketplace
- Real-time collaborative editing
- Multi-tenancy / white-label

<!-- END:nextjs-agent-rules -->
