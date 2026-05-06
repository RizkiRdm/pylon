# Pylon

Pylon is a cloud-based AI-powered universal application builder. It allows users to generate production-ready applications (CLI, Web) from natural language prompts. Pylon acts as the execution platform, managing everything from AI API integration to ephemeral cloud sandbox environments.

## Core Features
- **Ephemeral Sandbox:** Automated generation of isolated environments on Fly.io for every project.
- **AI-Powered:** Generates code using your choice of model (OpenAI, Anthropic, Gemini, etc.).
- **Modular Monorepo:** Structured for scalability and clean separation of concerns.
- **Secure:** API keys are AES-256 encrypted at rest.
- **Automated Workflow:** Built-in task planning, memory management, and Git-based project history.

## Architecture
Pylon follows a strict Modular Monolith architecture enforced by a monorepo structure. All operations adhere to a strict dependency direction:
`Presentation → API → Service → Repository → Database`

## Development Setup
This project uses [Bun](https://bun.sh/) and [Turborepo](https://turbo.build/repo).

1. Clone the repository.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Initialize environment variables using `.env.example`.
4. Run development mode:
   ```bash
   bun dev
   ```

## Documentation
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Design Principles](docs/DESIGN.md)
- [Development Plan](docs/PLAN.md)
