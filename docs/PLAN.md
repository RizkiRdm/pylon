# PLAN.md — Pylon
<!-- AI-READABLE: YES. Tasks are dependency-ordered. Each task is atomic and verifiable. -->
<!-- VERSION: 1.0 | DATE: 2026-05-04 -->
<!-- Cross-reference: PRD.md (capabilities), ARCHITECTURE.md (technical specs) -->

---

# VERSION A — IMPLEMENTATION CHECKLIST

Tasks are ordered by dependency. Do not start a task before its prerequisites are complete.

---

## PHASE 0 — FOUNDATION

### 0.1 Repository & Infrastructure Setup
- [ ] Initialize Turborepo monorepo with `apps/web`, `apps/api`, `packages/` structure
- [ ] Configure TypeScript 5.4 with strict mode across all packages
- [ ] Set up ESLint + Prettier with shared config package
- [ ] Configure Turborepo pipeline (build, dev, test, lint)
- [ ] Create `.env.example` files for all apps and packages
- [ ] Set up GitHub repository with branch protection on `main` and `dev`
- [ ] Configure GitHub Actions: lint + typecheck on all PRs to `dev` and `main`

### 0.2 Database Setup
- [ ] Create Supabase project (PostgreSQL 15)
- [ ] Enable pgvector extension on Supabase
- [ ] Install and configure Drizzle ORM in `packages/db`
- [ ] Write migration: `users` table
- [ ] Write migration: `api_keys` table
- [ ] Write migration: `projects` table
- [ ] Write migration: `agent_sessions` table
- [ ] Write migration: `agent_turns` table
- [ ] Write migration: `memory_snapshots` table
- [ ] Write migration: `design_embeddings` table with GIST vector index
- [ ] Write migration: `skills` table
- [ ] Apply all migrations to development database
- [ ] Write seed script for local development
- [ ] Enable Supabase Row Level Security on all tables
- [ ] Write RLS policy: users can only access their own rows on all tables

### 0.3 API Server Bootstrap
- [x] Bootstrap Hono.js app in `apps/api`
- [x] Configure Pino structured JSON logger
- [x] Implement health check endpoint: `GET /health`
- [x] Implement Zod validation middleware (request body + query params)
- [ ] Implement Supabase JWT auth middleware
- [x] Implement rate limiter middleware (Redis token bucket, 100 req/min per user)
- [x] Implement standardized error response format
- [x] Configure CORS (whitelist `apps/web` origin only)

### 0.4 Authentication
- [ ] Implement email/password registration endpoint
- [ ] Implement email/password login endpoint
- [ ] Implement GitHub OAuth callback endpoint
- [ ] Implement session refresh endpoint
- [ ] Implement logout endpoint
- [ ] Implement `GET /auth/me` endpoint (current user)
- [ ] Write integration tests for all auth flows

### 0.5 API Key Management
- [x] Implement AES-256 encryption utility in `packages/crypto`
- [x] Implement `POST /api-keys` (store encrypted key + hint)
- [x] Implement `GET /api-keys` (list by user — return hint only, never plaintext)
- [x] Implement `DELETE /api-keys/:id`
- [x] Write unit tests for encryption/decryption round trip
- [x] Verify encrypted keys are never present in any API response or log

### 0.6 Frontend Bootstrap
- [ ] Bootstrap Next.js 14 app in `apps/web`
- [ ] Install and configure Tailwind CSS
- [ ] Install Lucide Icons
- [ ] Implement dark theme CSS variables (from DESIGN.md color palette)
- [ ] Implement Inter + JetBrains Mono font loading
- [ ] Build reusable component library: Button (all variants)
- [ ] Build reusable component library: Input, Textarea
- [ ] Build reusable component library: Card, Panel
- [ ] Build reusable component library: Badge (all status variants)
- [ ] Build reusable component library: Skeleton loader
- [ ] Implement layout: authenticated shell (sidebar + main content)
- [ ] Implement auth pages: Login, Register
- [ ] Implement GitHub OAuth redirect flow in Next.js
- [ ] Implement API key management page (list, add, delete)

### 0.7 Ephemeral Sandbox System
- [ ] Create Fly.io application for sandbox containers
- [ ] Build base Docker image: Node.js 20 (minimal, < 200MB)
- [ ] Build base Docker image: Python 3.12 (minimal, < 200MB)
- [ ] Build base Docker image: Go 1.22 (minimal, < 200MB)
- [ ] Push all base images to Fly.io registry
- [ ] Implement `packages/sandbox-manager`:
  - [ ] `spawnSandbox(project_id, runtime)` — POST to Fly.io Machines API
  - [ ] `destroySandbox(sandbox_id)` — DELETE to Fly.io Machines API
  - [ ] `executeinSandbox(sandbox_id, operations[])` — run file writes + commands
  - [ ] `runLSP(sandbox_id, filePaths[])` — syntax validation
  - [ ] `idleWatcher()` — destroy sandbox after 15min idle
  - [ ] `syncFilesFromR2(project_id, sandbox_id)` — load on start
  - [ ] `syncFilesToR2(project_id, sandbox_id)` — save on stop
- [ ] Write integration tests: spawn → execute → sync → destroy cycle
- [ ] Verify container isolation (no cross-user file access)

### 0.8 AI Gateway
- [ ] Implement `packages/ai-gateway`:
  - [ ] `ProviderAdapter` interface (TypeScript)
  - [ ] `OpenAIAdapter` (completion + embedding)
  - [ ] `AnthropicAdapter` (completion)
  - [ ] `GeminiAdapter` (completion)
  - [ ] `MistralAdapter` (completion)
  - [ ] `CohereAdapter` (completion)
  - [ ] `AIGateway` router (selects adapter by provider)
  - [ ] Token usage tracker (write to `agent_turns`)
  - [ ] Circuit breaker (5 failures / 60s threshold)
  - [ ] API key decryption at call time only
- [ ] Write unit tests for each adapter (mocked HTTP)
- [ ] Write integration tests for key validation
- [ ] Verify API keys never appear in logs

### 0.9 Cloudflare R2 Integration
- [ ] Create R2 bucket: `pylon-projects`
- [ ] Configure bucket CORS for server-side access only
- [ ] Implement `packages/storage` with:
  - [ ] `putFile(projectId, path, content)`
  - [ ] `getFile(projectId, path)`
  - [ ] `listFiles(projectId)`
  - [ ] `deleteFile(projectId, path)`
  - [ ] `getProjectSize(projectId)` — enforce 500MB limit
- [ ] Write unit tests for all storage operations

### 0.10 Job Queue
- [ ] Configure Upstash Redis queue in `packages/queue`
- [ ] Implement job producer: `pushAgentJob(payload)`
- [ ] Implement job consumer: `consumeAgentJobs(handler)`
- [ ] Implement job status updates: `updateJobStatus(jobId, status)`
- [ ] Write integration test: push → consume → acknowledge

---

## PHASE 1 — CORE PRODUCT

### 1.1 Agent Loop Engine Core
- [ ] Implement `packages/agent-core`:
  - [ ] `TaskPlanner` — decompose user prompt into ordered milestones
  - [ ] `ExecutionLoop` — turn-based state machine
  - [ ] `TurnCounter` — tracks turns, triggers compression at threshold
  - [ ] `KillSwitch` — handles abort signal from user
  - [ ] `CheckpointManager` — saves/restores execution state
- [ ] Write unit tests for turn counting and compression trigger
- [ ] Write unit tests for kill switch behavior
- [ ] Write integration test: complete 5-turn agent session

### 1.2 Memory System
- [ ] Implement `packages/memory-system`:
  - [ ] `MemoryCompressor` — LLM-based summarization using AI Gateway
  - [ ] `MemoryWriter` — writes `memory.md` to R2
  - [ ] `LogWriter` — appends to `project_log.md` in R2
  - [ ] `MemoryReader` — reads memory files for context reload
  - [ ] `checkCompressionNeeded(session_id, turn_count)` — threshold check
  - [ ] `compress(session_id, turns[])` — full compression cycle (atomic with DB)
- [ ] Write unit tests for compression formatting
- [ ] Write integration test: compress → reload → verify context correctness
- [ ] Write test: memory.md write failure → graceful degradation

### 1.3 CLI App Generation
- [ ] Implement agent system prompt for CLI generation (Node.js, Python, Go)
- [ ] Implement agent tool: `write_file` (write to sandbox)
- [ ] Implement agent tool: `read_file` (read from sandbox)
- [ ] Implement agent tool: `run_command` (execute in sandbox)
- [ ] Implement agent tool: `install_dependencies` (npm install / pip install / go get)
- [ ] Implement LSP feedback loop (send LSP errors back to agent for correction)
- [ ] Test end-to-end: prompt → CLI project generated and runs in sandbox

### 1.4 Web App Generation
- [ ] Implement agent system prompt for web app generation (React + Vite, Express, FastAPI)
- [ ] Implement sandbox dual-runtime spawn (Node.js + Python in same container)
- [ ] Implement preview URL routing (`*.pylon.run` → active sandbox port via Cloudflare Tunnel)
- [ ] Implement DIP context injection in web generation system prompt
- [ ] Test end-to-end: prompt → web app with preview URL accessible

### 1.5 Git Integration
- [ ] Implement `packages/git-service`:
  - [ ] `initRepo(project_id)` — git init + set GitHub remote
  - [ ] `commitMilestone(project_id, message)` — add + commit
  - [ ] `createBranches()` — create main + dev branches
  - [ ] `pushBranch(project_id, branch)` — push to GitHub
  - [ ] `createPR(project_id, title, body)` — GitHub API PR creation
  - [ ] `setupCICD(project_id)` — generate + commit GitHub Actions workflow
- [ ] Write integration tests: init → commit → push → PR flow
- [ ] Test: GitHub token expired → graceful queuing + user notification

### 1.6 Project API Endpoints
- [ ] `POST /projects` — create project, push job to queue
- [ ] `GET /projects` — list user's projects (paginated)
- [ ] `GET /projects/:id` — get project detail
- [ ] `GET /projects/:id/status` — polling endpoint for build status
- [ ] `POST /projects/:id/stop` — trigger kill switch
- [ ] `GET /projects/:id/files` — list project files
- [ ] `GET /projects/:id/files/*` — get file content
- [ ] `POST /projects/:id/export/zip` — generate and return ZIP download
- [ ] `POST /projects/:id/export/github` — push to GitHub (new or existing repo)

### 1.7 Frontend — Core Pages
- [ ] Dashboard: project list with status badges
- [ ] New Project page: prompt input + model selector + app type + runtime
- [ ] Project detail page: agent output stream + file tree + status
- [ ] File viewer: code display with syntax highlighting
- [ ] Export modal: ZIP download + GitHub push form
- [ ] Status polling: poll `GET /projects/:id/status` every 3 seconds during build
- [ ] Kill switch button: visible and active during any build

---

## PHASE 2 — AGENT INTELLIGENCE

### 2.1 Autonomous Workflow Engine
- [ ] Implement semi-autonomous mode: pause at decision point, notify user via UI
- [ ] Implement fully autonomous mode toggle (per project setting)
- [ ] Implement decision point detection in agent output parsing
- [ ] Implement approval queue: store pending decisions, deliver to user, resume on approval

### 2.2 Self-Review Module
- [ ] Implement `SelfReviewModule` in `packages/agent-core`
- [ ] Define review system prompt (code quality, security, structure)
- [ ] Implement GitHub issue creation from review findings
- [ ] Implement "no issues" explicit report when review passes
- [ ] Write unit tests for issue formatting

### 2.3 Self-Refactor Module
- [ ] Implement `SelfRefactorModule` in `packages/agent-core`
- [ ] Implement refactor proposal generation from review findings
- [ ] Implement refactor application (write refactored files to sandbox)
- [ ] Implement Git commit after successful refactor
- [ ] Write integration test: review → propose → apply → commit cycle

### 2.4 Tool Extensibility — MCP
- [ ] Implement MCP server config storage (user-supplied JSON configs)
- [ ] Implement MCP server connection manager (start/stop MCP servers)
- [ ] Implement MCP tool routing in agent execution loop
- [ ] `POST /projects/:id/mcp` — add MCP server config
- [ ] `GET /projects/:id/mcp` — list MCP server configs
- [ ] `DELETE /projects/:id/mcp/:mcpId` — remove MCP server config

### 2.5 Tool Extensibility — Skills
- [ ] Implement built-in skill library: `test`, `lint`, `format`, `deploy-dockerfile`
- [ ] Implement agent self-skill creation: detect gap → generate skill → save → register
- [ ] `GET /projects/:id/skills` — list project skills
- [ ] `DELETE /projects/:id/skills/:skillId` — remove skill
- [ ] Write test: agent creates skill, uses it in same session

### 2.6 Design Intelligence Pipeline (DIP)
- [ ] Implement `packages/design-intelligence`:
  - [ ] `GitHubCrawler` — search GitHub API for design files
  - [ ] `ContentFilter` — identify design.md, tokens.json, style-guide.md
  - [ ] `DesignParser` — extract structured patterns (colors, typography, components)
  - [ ] `Embedder` — call AI Gateway embed() per design document
  - [ ] `RAGQueryEngine` — pgvector cosine similarity search
  - [ ] `queryDesignContext(description, topK=5)` — returns relevant patterns
- [ ] Set up weekly cron job for crawl trigger (GitHub Actions or Upstash scheduled job)
- [ ] Write unit tests for parser (known input → known output)
- [ ] Write integration test: query returns relevant results for a known description

### 2.7 Stress Testing
- [ ] Install k6 as dev dependency
- [ ] Write stress test: 50 concurrent sandbox spawns
- [ ] Write stress test: 100 concurrent API requests per endpoint
- [ ] Write stress test: agent session with 500 turns (hard limit hit)
- [ ] Write stress test: memory compression cycle under load
- [ ] Write stress test: R2 concurrent file writes (10 simultaneous projects)
- [ ] Document acceptable thresholds: sandbox spawn < 8s at P95 under 50 concurrent
- [ ] Run all stress tests and fix bottlenecks before marking Phase 2 complete

---

## ONGOING (ALL PHASES)

- [ ] Maintain `AGENTS.md` as single source of truth for AI agent rules
- [ ] Update `memory.md` format documentation when schema changes
- [ ] Run full test suite before every merge to `main`
- [ ] Monitor Fly.io container costs weekly
- [ ] Monitor Upstash Redis usage weekly
- [ ] Monitor R2 storage growth weekly
