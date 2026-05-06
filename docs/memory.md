# Memory: Pylon

## Project Context
Pylon is a cloud-based AI application builder. It generates production-ready CLI and Web apps inside ephemeral Fly.io containers. Files are persisted in Cloudflare R2, and AI agents run as background jobs via Upstash Redis.

## Architecture Highlights
- **Monorepo:** Turborepo with Next.js (web), Hono.js (api), and shared packages.
- **Data Layer:** PostgreSQL (Supabase) with Drizzle ORM.
- **Security:** AES-256 encryption for user API keys; RLS on all tables.
- **Agent Loop:** Background queue-based execution with turn-based memory compression (threshold: 50).

## Current State
- Monorepo scaffolded.
- API server (`apps/api`) bootstrapped with Hono.js, Pino logging, and health checks.
- Encryption package (`packages/crypto`) implemented with AES-256-GCM.
- Database schema (`packages/db`) defined for `users` and `api_keys`.
- Repository pattern implemented for `api_keys` to decouple API from DB.
- Rate limiting (Upstash Redis) and global Auth (placeholder) middleware active.
- API endpoints for managing AI provider keys (`GET`, `POST`, `DELETE /api-keys`) functional.

## Decisions Made
- **Fail-Open Rate Limiting:** If Redis is down, the API remains available but logs errors to prevent system-wide outages.
- **Repository Pattern:** Enforced at the package level (`packages/db`) to comply with strict dependency direction rules.
- **UUID Validation:** All path parameters for database IDs must be validated as UUIDs at the API boundary.
- **Development Scope:** Ephemeral sandbox (Fly.io) and cloud storage (R2) moved to future scope. Focus is local filesystem persistence for MVP.

## Next Planned Actions
- Build local filesystem storage adapter.
- Implement the AI Gateway with provider adapters.
- Build local execution sandbox system.
