# Elora

Elora is a free-first AI website builder. The project is at its foundation stage: this repository currently contains a responsive static UI prototype only. The prompt form does not generate a website yet; no AI provider or credentials are required.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Setup

```bash
npm ci
npm run dev
```

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
- Accessible prompt input and responsive landing layout
- Generation, preview, AI editing, persistence, and export are not implemented yet

The roadmap in [`roadmap.md`](./roadmap.md) is the source of truth for scope and sequencing. AI-generated content will be validated and rendered through trusted components; arbitrary generated code will not run on the application server.
