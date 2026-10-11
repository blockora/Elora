# Elora

Elora is a free-first AI website builder in an early prototype stage. The current responsive landing page introduces the prototype, and the builder has an assistant panel, examples, and a labeled sample preview. Submitting a prompt updates sample text locally; it does not generate a real website, use AI, save data, or send prompts over the network. No AI provider or credentials are required.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Setup

```bash
npm ci
npm run dev
```

The dev server includes a development-only mock API: `GET /api/health` and `POST /api/generate` with `{ "prompt": "..." }`. The mock fixture validates against `WebsiteSpec` but is not real AI generation. Production builds do not include a backend API; hosted providers and credentials are not configured.

Vite prints a local URL (by default `http://localhost:5173`). No `.env` file is needed for the prototype. Copy `.env.example` only when environment configuration is introduced in a later milestone.

## Checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

## Current scope

- React + TypeScript + Vite static prototype
- Responsive assistant and preview panels, prompt examples, and accessible idle/loading/success/error local demo feedback
- A validated `WebsiteSpec` data contract and sample fixture exist; the builder displays its validated sample through trusted React section components; prompt changes update only local demo data
- A development-only mock API exposes `/api/health` and `/api/generate`; generated fixtures are deterministic and are not AI output
- No production API, hosted AI provider, frontend API connection, AI editing, persistence, or export is implemented yet

The roadmap in [`roadmap.md`](./roadmap.md) is the source of truth for scope and sequencing. AI-generated content will be validated and rendered through trusted components; arbitrary generated code will not run on the application server.
