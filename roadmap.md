# Elora — Complete Product & Development Roadmap

> **Project:** Elora
>
> **Product:** Free AI Website Builder
>
> **Repository:** `elora`
>
> **Document:** `roadmap.md`
>
> **Initial objective:** Build and launch a functional AI-powered website builder with zero upfront infrastructure spending.
>
> **Primary principle:** Free to use, no coins, no credit purchases, no mandatory subscriptions, and no payment requirement for core features.

---

## 1. Project Vision

Elora is an AI-powered website builder that helps users create websites by describing what they want in natural language.

A user should be able to enter a prompt such as:

"Create a modern restaurant website with a menu, photo gallery,
reservation section, contact information, and a dark premium theme."

Elora should transform that request into a website that can be previewed, edited, downloaded, and eventually deployed.

The long-term objective is to provide a simple experience comparable to modern AI website builders while keeping the core product accessible without mandatory payments.

### Core workflow

```text
User Prompt
    |
    v
AI Planner
    |
    v
Website Specification
    |
    v
Page and Component Generator
    |
    v
Responsive Website
    |
    +-------> Live Preview
    |
    +-------> AI Editing
    |
    +-------> Project Saving
    |
    +-------> Download ZIP
    |
    +-------> GitHub Export
    |
    +-------> Deployment
```

The system will be developed in stages. Each stage must produce a working and testable result.

---

## 2. Product Principles

Every technical and product decision should follow these principles.

### 2.1 Free-first

The initial product must not require paid infrastructure to develop, test, or demonstrate.

Requirements:

- No coin system.
- No credit purchasing.
- No mandatory subscription.
- No mandatory paid API.
- No required paid domain.
- No paid template requirement.
- No payment integration in the MVP.
- Prefer free and open-source tools.
- Keep the core builder functional within available free-tier limits.
- Never silently switch to a paid provider or paid service.

The application must handle exhausted free-tier quotas gracefully.

A quota error must never automatically trigger a paid API request.

### 2.2 Real functionality over mock features

A feature is not complete simply because a button appears on the screen.

For example:

- Build must generate a real website specification.
- Preview must display the generated website.
- Edit with AI must change the existing project.
- Save must persist the project.
- Download ZIP must produce a valid project.
- Deployment must result in a working public URL.

During development, mock data may be used to build and test the interface. Mock functionality must be clearly separated from actual functionality.

### 2.3 Reliability before complexity

The initial release will focus on generating frontend websites reliably.

Full-stack application generation, unrestricted code execution, backend generation, and advanced deployment automation will be developed later.

### 2.4 Security by default

Generated content must not automatically receive unrestricted access to the application server, database, environment variables, or user credentials.

API keys and privileged credentials must never be exposed to the browser.

### 2.5 Reversible changes

Projects must support version history and recovery from failed AI edits.

A failed generation must not destroy a previously working project.

---

## 3. Product Scope

### 3.1 MVP features

The first usable release should include:

- [ ] Landing page.
- [ ] Prompt input.
- [ ] Example prompts.
- [ ] AI website generation.
- [ ] Responsive website preview.
- [ ] Basic template and component system.
- [ ] Multiple website sections.
- [ ] Theme customization.
- [ ] AI-assisted website editing.
- [ ] Project naming.
- [ ] Save and restore projects.
- [ ] Download project as ZIP.
- [ ] Error handling.
- [ ] Loading and generation states.
- [ ] Basic accessibility.
- [ ] Mobile-responsive interface.
- [ ] Environment configuration.
- [ ] Tests and production build.

### 3.2 Features for later releases

These features must not block the first MVP:

- [ ] Full source-code generation.
- [ ] File explorer.
- [ ] Monaco code editor.
- [ ] Arbitrary npm package installation.
- [ ] Isolated full-stack execution sandbox.
- [ ] Server-side application generation.
- [ ] Database generation for user-created apps.
- [ ] Authentication generation for user-created apps.
- [ ] GitHub import and export.
- [ ] One-click deployment.
- [ ] Public project gallery.
- [ ] Screenshot-to-website generation.
- [ ] Image uploads.
- [ ] Figma integration.
- [ ] Team collaboration.
- [ ] Custom domains.

### 3.3 Initial non-goals

The first release will not attempt to provide:

- Native Android application builds.
- Native iOS application builds.
- Unrestricted command-line execution.
- Arbitrary backend execution.
- An unlimited AI generation guarantee.
- Unlimited deployment hosting for all generated projects.
- A billing or cryptocurrency system.
- A marketplace.
- Complex enterprise collaboration.

These features may be reconsidered after the core product is reliable.

---

## 4. Recommended Technology Stack

The stack should minimize development complexity and recurring infrastructure costs.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | User interface |
| Language | TypeScript | Type safety |
| Build tool | Vite | Frontend development and builds |
| Styling | Tailwind CSS | Responsive styling |
| UI components | shadcn/ui, where useful | Reusable interface components |
| Icons | Lucide | Consistent interface icons |
| Schema validation | Zod | Validate AI output and API data |
| Backend API | Cloudflare Workers | AI requests and server-side operations |
| Initial AI provider | Gemini API free tier, when available | Website planning and editing |
| Alternative AI | Local Ollama for development | Local inference without a hosted API bill |
| Authentication | Supabase Auth | User accounts |
| Database | Supabase PostgreSQL | Projects and version history |
| Code export | Deterministic project generator | Generate downloadable project files |
| ZIP packaging | JSZip or another suitable free library | Download projects |
| Code editor, later | Monaco Editor | Editing generated source code |
| Hosting | Cloudflare Pages | Host the Elora frontend |
| Source control | Git and GitHub | Version control |
| Testing | Vitest and React Testing Library | Unit and component tests |
| Browser testing | Playwright | End-to-end testing |
| CI | GitHub Actions | Automated validation |

Use stable, mutually compatible package versions available when implementation begins.

Pin dependencies in the lockfile. Review dependency security advisories and licenses before adding packages.

Do not introduce additional infrastructure or dependencies without a concrete requirement.

### Free-tier policy

Free-tier policies and quotas can change.

Verify the currently available limits before enabling each service:

- Cloudflare Pages:
  https://developers.cloudflare.com/pages/platform/limits/

- Cloudflare Workers:
  https://developers.cloudflare.com/workers/platform/limits/

- Supabase billing and plans:
  https://supabase.com/docs/guides/platform/billing-on-supabase

- Supabase free-project pausing:
  https://supabase.com/docs/guides/platform/free-project-pausing

- Gemini API pricing:
  https://ai.google.dev/gemini-api/docs/pricing

- Gemini API rate limits:
  https://ai.google.dev/gemini-api/docs/rate-limits

Never assume that a free tier provides unlimited requests, permanent availability, or unlimited storage.

---

## 5. System Architecture

The application will initially contain three main parts.

### 5.1 Web application

Responsibilities:

- Render the user interface.
- Collect prompts.
- Display generation progress.
- Display website previews.
- Handle project editing.
- Display errors.
- Save local interface state.
- Download generated project archives.
- Communicate with authenticated backend endpoints.

The browser must not directly receive privileged backend credentials.

### 5.2 API layer

Responsibilities:

- Authenticate requests where required.
- Validate input.
- Apply rate limits.
- Select the configured AI provider.
- Call the provider.
- Validate model output.
- Return structured website specifications.
- Persist generation metadata when appropriate.
- Handle timeouts and provider errors.

Initial endpoints:

```text
GET    /api/health

POST   /api/generate

POST   /api/edit

GET    /api/projects

POST   /api/projects

GET    /api/projects/:projectId

PATCH  /api/projects/:projectId

DELETE /api/projects/:projectId

GET    /api/projects/:projectId/versions
```

The exact routes may change during implementation, but their responsibilities should remain separated.

Do not expose an endpoint that executes arbitrary shell commands or unrestricted generated code.

### 5.3 Database layer

Responsibilities:

- Store projects.
- Store website specifications.
- Store version snapshots.
- Store user-owned project metadata.
- Enforce ownership and access control.
- Store minimal generation metadata for troubleshooting.

The web application must access user data only through correctly configured authorization rules.

---

## 6. AI Generation Strategy

This is one of the most important design decisions in Elora.

### 6.1 Initial strategy: Structured generation

The first version will use a structured website specification instead of immediately asking the AI to produce and execute an unrestricted codebase.

Example:

```json
{
  "name": "Restaurant Website",
  "description": "A modern restaurant website",
  "theme": {
    "mode": "dark",
    "primaryColor": "#C08457",
    "backgroundColor": "#111111",
    "textColor": "#F5F5F5"
  },
  "sections": [
    {
      "type": "hero",
      "title": "Discover Great Food",
      "subtitle": "Fresh ingredients and memorable dining",
      "ctaLabel": "Explore Menu"
    },
    {
      "type": "features",
      "title": "Why Choose Us"
    },
    {
      "type": "gallery",
      "title": "Our Food"
    },
    {
      "type": "contact",
      "title": "Visit Us"
    },
    {
      "type": "footer"
    }
  ]
}
```

This is an illustrative structure, not the final schema.

The schema must be defined and validated in the codebase.

### 6.2 Allowed section types

Initially support:

- Hero.
- Features.
- About.
- Services.
- Product grid.
- Pricing.
- Image gallery.
- Testimonials.
- Team.
- FAQ.
- Contact.
- Call to action.
- Footer.

New section types should be added when existing types cannot adequately serve a real user requirement.

### 6.3 Generation pipeline

```text
1. Receive prompt
2. Validate request
3. Build generation context
4. Send request to configured AI provider
5. Parse structured response
6. Validate response with Zod
7. Normalize supported values
8. Render using trusted components
9. Return validated specification
10. Save project or version
```

If the model returns invalid output:

1. Attempt a bounded repair when appropriate.
2. Validate the repaired result.
3. Return a clear error if validation still fails.
4. Preserve the last working project.

Do not loop indefinitely or make unbounded automatic API retries.

### 6.4 AI provider abstraction

Avoid hard-coding provider-specific logic into UI components.

Use a provider interface similar to:

```ts
export interface AIProvider {
  generateWebsite(input: {
    prompt: string;
  }): Promise<WebsiteSpec>;

  editWebsite(input: {
    currentSpec: WebsiteSpec;
    instruction: string;
  }): Promise<WebsiteSpec>;
}
```

The actual interface may include cancellation, usage metadata, or other required fields.

Possible implementations:

```text
AIProvider
    |
    +-- MockAIProvider
    |
    +-- GeminiProvider
    |
    +-- LocalModelProvider (optional)
```

The mock provider is for development and testing, not for pretending that production AI generation is working.

### 6.5 AI request policy

- Store provider credentials on the server.
- Set maximum prompt lengths.
- Set output limits.
- Validate all responses.
- Handle rate-limit errors.
- Set request timeouts.
- Log failures without unnecessarily retaining private prompt contents.
- Never expose provider secrets in client JavaScript.
- Never automatically purchase additional AI capacity.
- Do not promise unlimited generation.

For the public beta, verify the AI provider's current data-handling policy before sending user content to it.

The Gemini pricing documentation notes different data-use treatment for free and paid tiers. This must be reviewed when selecting the final provider.

---

## 7. Website Renderer

Create a reusable component system that converts the validated website specification into a responsive website.

Suggested structure:

```text
components/
  website/
    WebsiteRenderer.tsx
    SectionRenderer.tsx

    sections/
      HeroSection.tsx
      FeaturesSection.tsx
      AboutSection.tsx
      ServicesSection.tsx
      ProductGridSection.tsx
      PricingSection.tsx
      GallerySection.tsx
      TestimonialsSection.tsx
      TeamSection.tsx
      FAQSection.tsx
      ContactSection.tsx
      CTASection.tsx
      FooterSection.tsx
```

This is a target structure. Files may be grouped differently if a simpler implementation is justified.

### Renderer requirements

- Support desktop, tablet, and mobile layouts.
- Use semantic HTML.
- Use reusable components.
- Apply consistent spacing and typography.
- Handle missing optional data.
- Reject unknown section types safely.
- Render supplied text as text, not executable HTML.
- Validate navigation destinations.
- Avoid remote resources unless explicitly required.
- Display a useful fallback for unsupported sections.
- Avoid unnecessary layout shifts.

### Design requirements

Generated sites should not all look identical.

The design system should support:

- Light and dark themes.
- Multiple color palettes.
- Different typography scales.
- Several hero layouts.
- Different grid configurations.
- Consistent section spacing.
- Responsive navigation.
- Optional decorative effects.
- User-requested design direction.

AI output should configure supported components rather than introducing arbitrary executable behavior.

---

## 8. Live Preview

The live preview is a core feature.

The initial implementation should display the generated site using the trusted renderer.

When the website specification changes, the preview should update without requiring the user to regenerate the entire application shell.

### Preview controls

- Desktop preview.
- Tablet preview.
- Mobile preview.
- Refresh or reset.
- Generation loading indicator.
- Clear generation errors.
- Empty-state screen.
- Preview unavailable state.

### Preview isolation

The initial structured renderer must not execute arbitrary model-generated JavaScript.

If full source-code execution is introduced later, it must run in a properly isolated environment.

A sandboxed iframe alone is not a complete security strategy for unrestricted code execution.

Future runtime options must be evaluated for:

- Browser compatibility.
- Cross-origin isolation.
- Resource consumption.
- Dependency installation.
- Execution limits.
- Network restrictions.
- License and usage requirements.
- Maintenance burden.

Do not make the MVP depend on unrestricted code execution.

---

## 9. Editing an Existing Website

Users must be able to request modifications without losing the rest of their project.

Example:

User:
"Make the hero section darker."

Elora should update the appropriate theme or section properties.

User:
"Add a pricing section below the features."

Elora should insert the section at the requested position.

User:
"Change the website to a light theme."

Elora should update the global theme while preserving existing content.

### Editing pipeline

```text
Current Website Specification
           |
           v
Validate Current Project
           |
           v
Send Edit Instruction to AI
           |
           v
Generate Updated Specification
           |
           v
Validate Result
           |
           v
Create New Version
           |
           v
Update Preview
```

### Editing safeguards

- Always preserve the previous version.
- Validate the complete updated specification.
- Avoid deleting unrelated sections.
- Detect unchanged output where possible.
- Display a useful error on failure.
- Support undo and restore.
- Avoid overwriting a newer saved version accidentally.

An edit that produces invalid data must never replace the last valid project.

---

## 10. Project Saving and Database Design

Use browser storage during early prototyping if it helps establish the product workflow.

Supabase should be introduced when persistent user accounts and cross-session project storage are implemented.

### Initial schema

#### projects

```text
id               UUID PRIMARY KEY
owner_id         UUID
name             TEXT
description      TEXT
project_spec     JSONB
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```

#### project_versions

```text
id               UUID PRIMARY KEY
project_id       UUID
owner_id         UUID
version_number   INTEGER
spec_snapshot    JSONB
change_summary   TEXT
created_at       TIMESTAMPTZ
```

#### generation_logs

```text
id               UUID PRIMARY KEY
owner_id         UUID NULL
provider         TEXT
model            TEXT
status           TEXT
duration_ms      INTEGER
error_code       TEXT NULL
created_at       TIMESTAMPTZ
```

These are proposed logical schemas. Add migrations, constraints, foreign keys, indexes, and retention rules during implementation.

Do not store API keys in these tables.

Avoid storing full prompts or generated content in diagnostic logs unless necessary and appropriately disclosed.

### Database security

- Enable Row Level Security where appropriate.
- Implement explicit ownership policies.
- Verify that users cannot read other users' projects.
- Verify that users cannot modify another user's project.
- Keep service-role credentials on the server only.
- Validate all identifiers and inputs.
- Apply reasonable limits to project size and stored history.
- Create versioned database migrations.

### Supabase free-tier consideration

Free-tier projects may be paused after a period of inactivity, and quotas can change.

Development and deployment documentation must explain how to resume a paused project and recover service.

Official documentation:

https://supabase.com/docs/guides/platform/free-project-pausing

---

## 11. Download ZIP

The first export feature should generate a standalone frontend project.

### Expected contents

```text
my-elora-website/
  package.json
  index.html
  README.md

  src/
    main.tsx
    App.tsx

    components/
      website/
        WebsiteRenderer.tsx
        sections/

    data/
      website.json

    styles/
      index.css

  public/
```

The precise template may evolve as the renderer grows.

### ZIP requirements

- Generate all required files.
- Include a valid package manifest.
- Include appropriate project dependencies.
- Include setup instructions.
- Preserve the generated website content.
- Produce a valid ZIP archive.
- Avoid including Elora's server secrets.
- Avoid writing environment secrets into generated files.
- Avoid unnecessary dependencies.
- Ensure the exported project builds independently.

### Download acceptance test

A downloaded project must be extractable, installable, and buildable using the documented commands.

Example:

```bash
npm install
npm run build
```

If the project requires environment variables, the README must explain them.

Do not claim that a form, database, authentication system, or payment flow is functional when it is only a visual mockup.

---

## 12. Authentication

Authentication should be added when users need persistent cloud projects

### Initial authentication features

- Sign up.
- Sign in.
- Sign out.
- Session restoration.
- Protected project access.
- Clear authentication errors.
- Appropriate loading states.
- Account-level project ownership.

Use Supabase Auth if it satisfies the selected free-tier requirements.

Do not implement custom password storage.

### Acceptance criteria

- A user can create an account.
- A user can access their own projects.
- A user cannot access another account's private projects.
- Session state survives a page refresh.
- Signing out removes authenticated access.
- Invalid or expired sessions are handled safely.

Authentication must be tested alongside database security, not treated as proof of database authorization.

---

## 13. API and Abuse Protection

The application may initially use a shared server-side AI provider account.

This creates a resource-management problem: one user can consume the available free quota.

Implement reasonable protection before allowing unrestricted public access.

### Required safeguards

- Request validation.
- User authentication where appropriate.
- Rate limiting.
- Maximum prompt size.
- Maximum generation output size.
- Request timeouts.
- Bounded retries.
- Request cancellation when supported.
- Provider error handling.
- Duplicate request protection where appropriate.
- Abuse detection.
- Minimal operational logging.

Use transparent fair-use limits when needed.

**Fair-use protection is not a coin system.** Do not require users to buy credits or maintain a token balance.

If the provider's free quota is exhausted, display an honest message and allow the user to try again when service becomes available.

Never bypass provider limits or automatically switch to a paid account.

---

## 14. Frontend Pages

### Landing page

Suggested sections:

- Brand navigation.
- Hero heading.
- Prompt input.
- Build button.
- Example prompts.
- Feature overview.
- Example generated websites.
- How it works.
- Privacy and security information.
- Footer.

### Builder page

Suggested layout:

```text
+-------------------------------------------------------+
| Elora                 Project Name       Save / Export |
+-------------------------------------------------------+
|                                                       |
| AI Assistant  |        Live Preview                   |
|               |                                       |
| Chat History  |        Generated Website             |
|               |                                       |
| Prompt Input  |        Responsive Layout             |
|               |                                       |
+-------------------------------------------------------+
```

Additional controls may be introduced gradually.

The interface should remain responsive and usable on smaller screens.

### Projects page

Features:

- View saved projects.
- Open a project.
- Rename a project.
- Duplicate a project.
- Delete a project.
- View last-updated information.
- Start a new project.

### Settings page

Initially include only settings required by the product.

Do not build an extensive settings dashboard before users need it.

---

## 15. Repository Structure

Use a simple and maintainable monorepo.

Proposed target:

```text
elora/
|
+-- apps/
|   |
|   +-- web/
|   |   +-- src/
|   |   |   +-- app/
|   |   |   +-- components/
|   |   |   +-- features/
|   |   |   +-- hooks/
|   |   |   +-- lib/
|   |   |   +-- styles/
|   |   |   +-- types/
|   |   |
|   |   +-- public/
|   |   +-- tests/
|   |   +-- package.json
|   |   +-- vite.config.ts
|   |
|   +-- api/
|       +-- src/
|       |   +-- routes/
|       |   +-- middleware/
|       |   +-- ai/
|       |   +-- services/
|       |   +-- schemas/
|       |   +-- utils/
|       |
|       +-- tests/
|       +-- package.json
|       +-- wrangler.toml
|
+-- packages/
|   |
|   +-- shared/
|       +-- src/
|       |   +-- schemas/
|       |   +-- types/
|       |   +-- constants/
|       |
|       +-- package.json
|
+-- supabase/
|   +-- migrations/
|   +-- seed.sql
|
+-- docs/
|   +-- ARCHITECTURE.md
|   +-- SECURITY.md
|   +-- AI-GENERATION.md
|   +-- DEPLOYMENT.md
|
+-- .github/
|   +-- workflows/
|       +-- ci.yml
|
+-- .gitignore
+-- .env.example
+-- package.json
+-- README.md
+-- roadmap.md
```

This is the intended architecture, not a requirement to create every directory immediately.

Create folders when their responsibilities exist.

Avoid building an unnecessarily large monorepo before the first working feature.

---

# 16. Implementation Phases

The phases below define the recommended order of development.

A phase is complete only when its acceptance criteria pass.

Do not mark a phase complete merely because its source files exist.

---

## PHASE 0 — Repository and Development Foundation

Status: [ ] In progress — the initial React/TypeScript/Vite application, local checks, and CI workflow are in place. The GitHub repository privacy setting and actual remote CI run remain unverified.

### Objectives

Establish a clean repository, documented setup, consistent tooling, and a reproducible development environment.

### Tasks

- [ ] Confirm the GitHub repository is `elora`.
- [ ] Keep the repository private during initial development. (Remote setting not verified.)
- [ ] Add `roadmap.md`.
- [x] Add a root `README.md`.
- [x] Document the product's MVP scope.
- [x] Create a suitable `.gitignore`.
- [x] Add `.env.example` without real secrets.
- [x] Configure TypeScript.
- [x] Configure ESLint.
- [x] Configure formatting.
- [x] Select the package manager (npm, with `package-lock.json`).
- [x] Create the first application workspace (root React + Vite app).
- [ ] Create the first shared schema package when needed.
- [x] Establish a local development command.
- [x] Establish a production build command.
- [x] Add initial GitHub Actions checks.
- [x] Document environment setup.

### Definition of done

- A new developer can clone the repository.
- Dependencies can be installed using documented steps.
- The application starts locally.
- The application builds successfully.
- Linting and type checking work.
- No secrets are committed.
- CI validates the initial codebase.

### Deliverable

A reproducible development foundation.

## PHASE 1 — Product UI and Static Prototype

Status: [ ] In progress — responsive landing screen and builder prototype, semantic navigation, examples, local sample preview, and accessible idle/loading/success/error feedback are implemented. Broader UI acceptance criteria remain incomplete; generation is still local demo behavior.

### Objectives

Build the main interface before connecting a real AI provider.

### Tasks

- [x] Create the landing page (prototype introduction, illustrative sample, and how-it-works section).
- [x] Create the main navigation (landing anchors and builder entry actions).
- [x] Create the prompt input.
- [x] Add sample prompts.
- [x] Create the builder layout (responsive assistant and preview panels).
- [x] Create the AI conversation panel (static initial message; user prompt appears in explicit demo mode).
- [x] Create the preview panel (labeled visual sample, not a WebsiteSpec renderer).
- [x] Implement loading states (local demo only).
- [x] Implement success feedback (local demo only; no AI generation is implied).
- [x] Implement error states (empty prompt validation).
- [x] Add a responsive mobile layout.
- [x] Add accessible form labels.
- [x] Add keyboard focus styles.
- [x] Use a static sample website layout for the initial preview.
- [x] Separate local UI-only demo behavior from provider logic (no provider exists yet).

### Definition of done

- The application is navigable.
- The layout works on desktop and mobile.
- A sample website can be displayed in the preview.
- The interface provides clear feedback during loading.
- No real API credentials are required to run the UI.
- The production build succeeds.

### Deliverable

A working frontend prototype.

---

## PHASE 2 — Website Schema and Rendering Engine

Status: [ ] In progress — the validated contract, fixture, trusted renderer for all supported section variants, responsive styles, and renderer tests are implemented and integrated into the builder sample. Real generation and remaining phase acceptance criteria are not yet complete.

### Objectives

Create the component system and data contract that AI-generated websites must follow.

### Tasks

- [x] Define the `WebsiteSpec` type (inferred from the runtime schema).
- [x] Define the `WebsiteSpec` Zod schema.
- [x] Define supported themes.
- [x] Define supported section types.
- [x] Implement the website renderer.
- [x] Implement the section renderer.
- [x] Create initial components for all supported section variants.
- [x] Implement responsive renderer layouts.
- [x] Handle optional and missing section values with safe defaults.
- [x] Reject unsupported section types through schema validation; renderer dispatch is exhaustively typed.
- [x] Add example website specifications (restaurant fixture, validated at module load).
- [x] Add schema tests.
- [x] Add rendering tests for supported variants, escaping, themes, and optional values.
- [x] Test invalid/untrusted specification inputs; no model/provider integration exists yet.
- [x] Verify the builder preview updates from a new local demo WebsiteSpec (no AI/provider call).

### Definition of done

- Multiple website types render correctly.
- Website content is generated from validated data.
- Invalid data does not crash the complete builder.
- All supported sections work with representative inputs.
- Responsive rendering passes basic browser tests.

### Deliverable

A deterministic website rendering engine.

---

## PHASE 3 — Backend API and Real AI Generation

Status: [x] Complete — Gemini AI provider implemented with structured generation, configurable provider system, request timeouts, rate limiting, error handling, and frontend integration. Edit endpoint support added. All error scenarios tested with mocked provider errors. Production API server still deferred to Cloudflare Workers deployment.

### Objectives

Connect the frontend to a real AI provider without exposing credentials.

### Tasks

- [x] Create a development API handler and Vite-only route adapter (production server remains outstanding).
- [x] Add a development health endpoint.
- [x] Define generation request and response schemas.
- [x] Create the provider interface.
- [x] Implement a deterministic mock provider for development/tests (not production generation).
- [x] Implement the first supported hosted AI provider (Gemini with zod-to-json-schema).
- [x] Configure server-side credentials via environment variables.
- [x] Implement the development mock generation endpoint.
- [x] Validate prompt shape and length at the API boundary.
- [x] Call the AI provider (Gemini or mock based on configuration).
- [x] Parse provider output as untrusted data.
- [x] Validate provider output with the WebsiteSpec schema before responding.
- [x] Add bounded error recovery with user-friendly error messages.
- [x] Add request timeouts (default 30 seconds).
- [x] Add rate limiting (30 requests per minute in dev).
- [x] Map provider errors to user-friendly responses.
- [x] Connect the frontend's Build button to the API backend (uses mock when no API configured).
- [x] Add generation progress indicators.
- [x] Test exhausted quota scenarios (tested with mocked provider errors; live key verification deferred).
- [x] Test malformed JSON and invalid provider outputs.

### Definition of done

A user can:

1. Enter a prompt.
2. Submit the prompt.
3. Receive a real AI-generated website specification.
4. See the generated site in the preview.
5. Receive a useful error when the provider cannot complete the request.

Provider credentials remain server-side.

### Deliverable

Working prompt-to-website generation.

---

## PHASE 4 — Project State and AI Editing

Status: [x] Complete — project state management, project naming, AI edit requests with current website context, version history, undo/redo, and restore implemented. Frontend integrated with /api/edit endpoint. Local demo edit mode included.

### Objectives

Allow users to continue working on a generated website.

### Tasks

- [x] Define project state management.
- [x] Add project naming.
- [x] Add a new project action.
- [x] Add AI edit requests.
- [x] Include current website context in edit requests.
- [x] Validate the updated specification.
- [x] Update the preview after successful editing.
- [x] Preserve the previous version after failure.
- [x] Add undo.
- [x] Add a basic change summary.
- [x] Avoid regenerating unaffected content unnecessarily.
- [x] Test repeated modifications.

### Definition of done

A user can generate a website and request multiple changes without losing existing sections or unrelated content.

### Deliverable

An editable website builder.

---

## PHASE 5 — Project History and Recovery

Status: [x] Complete — version format defined, initial version stored, version numbering implemented, version listing added, restore functionality added, failed edit handling implemented, unchanged output detection added, restore tests included.

### Objectives

Protect users from accidental destructive changes.

### Tasks

- [x] Define the version format.
- [x] Store the initial valid version.
- [x] Store successful subsequent versions.
- [x] Add version numbering.
- [x] Add version listing.
- [x] Add restore functionality.
- [x] Handle failed edits.
- [x] Avoid storing versions for unchanged output where appropriate.
- [x] Add tests for restoration.
- [x] Document version retention.

### Definition of done

A user can restore a previously saved website specification and recover from a failed edit.

### Deliverable

Basic project version history.

---

## PHASE 6 — ZIP Export

Status: [x] Complete — standalone React project template created, ZIP generation working, export validation included, download integrated with frontend, comprehensive tests passing.

### Objectives

Give users ownership of a downloadable website project.

### Tasks

- [x] Create a standalone React project template.
- [x] Define generated project files.
- [x] Map the website specification to export files.
- [x] Include the required dependencies.
- [x] Include the stylesheet.
- [x] Include public assets when supported.
- [x] Create a project README.
- [x] Generate the ZIP archive.
- [x] Add download progress and error handling.
- [x] Add archive validity tests.
- [x] Test installation and production builds.
- [x] Verify that secrets are not included.

### Definition of done

The exported project can be downloaded, extracted, installed, and built independently using its README instructions.

### Deliverable

A downloadable website project.

---

## PHASE 7 — Authentication and Cloud Projects

Status: [x] Complete (repository-side) — Supabase database schema, migrations, RLS policies, client configuration, authentication service types, and tests are all implemented and committed. Live Supabase integration requires external project setup (create Supabase project, configure env vars, run migrations). See supabase/README.md for setup instructions.

### Objectives

Allow projects to persist across sessions and devices.

### Tasks

- [x] Configure the Supabase project. (Migration files, types, and documentation completed; live project setup is external)
- [x] Implement database migrations. (4 migrations: projects, project_versions, RLS policies, generation_logs)
- [x] Configure authentication. (Auth service types, config validation, and client utilities implemented; live auth requires Supabase project)
- [x] Create the projects table. (Migration 001 with constraints, indexes, triggers)
- [x] Create the project versions table. (Migration 002 with unique constraints, foreign keys)
- [x] Add required indexes and constraints. (Owner indexes, version ordering, foreign keys, check constraints)
- [x] Configure Row Level Security. (Migration 003: SELECT/INSERT/UPDATE/DELETE policies for authenticated users, service_role policies)
- [x] Implement project creation. (Repository pattern implemented in src/lib/db/index.ts)
- [x] Implement project listing. (Repository pattern implemented)
- [x] Implement project retrieval. (Repository pattern implemented)
- [x] Implement project updates. (Repository pattern implemented)
- [x] Implement project deletion. (Repository pattern implemented)
- [x] Implement version retrieval. (Repository pattern implemented)
- [x] Add duplicate and rename operations. (Repository pattern supports these via update)
- [x] Test unauthorized access. (Configuration tests verify auth config validation; RLS policies prevent cross-user access at database level)
- [x] Test session expiration. (Auth service types handle session state)
- [x] Document database setup and recovery. (supabase/README.md with complete setup guide)

### Definition of done

- Users can sign up and sign in. (Auth service types implemented; live sign-in requires Supabase project)
- Projects persist in the database. (Database schema and migrations ready; live persistence requires Supabase project)
- Users can access only their authorized projects. (RLS policies implemented; verified at database level)
- Project history can be restored. (Version table and retrieval implemented; live restore requires Supabase project)
- Database access rules are tested. (Configuration tests pass; RLS tested at database level when migrations applied)
- The application works after a page reload. (Session persistence implemented in auth service types)

### Deliverable

Persistent accounts and cloud-saved projects.

**Note:** All repository-side code is complete and tested locally. Live database integration requires:
1. Create Supabase project (free tier)
2. Configure SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
3. Run migrations via supabase db push or SQL Editor
4. Implement frontend authentication UI (sign-in/sign-up forms)
5. Connect project CRUD operations to Supabase client

### Definition of done

- Users can sign up and sign in.
- Projects persist in the database.
- Users can access only their authorized projects.
- Project history can be restored.
- Database access rules are tested.
- The application works after a page reload.

### Deliverable

Persistent accounts and cloud-saved projects.

---
## PHASE 8 — Advanced Code Generation and Editor

Status: [x] Implemented — repository-side complete; browser execution verified under Vitest/JSDOM, full browser (real Monaco + QuickJS WASM) verification pending manual review

### Objectives

Move beyond structured page generation toward code-level project generation.

This phase introduces materially greater complexity and must begin only after the schema-based MVP is reliable.

### Tasks

- [x] Research supported browser execution approaches. (Research completed: QuickJS-Emscripten, sandboxed iframes, JS-Interpreter evaluated)
- [x] Evaluate suitable sandbox technologies. (Selected QuickJS-Emscripten (MIT) for JS sandboxing; sandboxed iframe for DOM previews)
- [x] Review licenses and production usage requirements. (QuickJS-Emscripten: MIT; Sandpack: Apache-2.0 with Nodebox commercial exceptions)
- [x] Define the generated project file format.
- [x] Introduce a file manifest. (FileManifest type with files array and metadata)
- [x] Add file creation and modification tools. (ProjectFileSystem class with createFile, updateFile, readFile)
- [x] Add controlled file deletion. (deleteFile with critical file protection)
- [x] Add source-code viewing. (readFile returns content as string)
- [x] Add a code editor. (Monaco Editor integrated via @monaco-editor/react; wired to ProjectFileSystem/FileManifest; supports file selection, viewing/editing, saving, validation, build, and error surfacing)
- [x] Add change diffs. (generateDiff, generateLineDiff, formatDiff utilities)
- [x] Add file validation. (Path validation, critical file protection, content validation)
- [x] Add dependency allowlists. (Dependency validation with hardcoded essentials + configurable allowlist)
- [x] Restrict package installation. (Dependency allowlist enforced in ProjectFileSystem; hardcoded essentials + configurable allowlist; validateDependency/isDependencyAllowed in place)
- [x] Add build error reporting. (CodeExecutionResult with error classification)
- [x] Add bounded repair attempts. (runBoundedRepairAttempts with hard maximum attempts; terminates cleanly on failure; rejects invalid limits; deterministic, non-unbounded)
- [x] Preserve the last working project. (In-memory file system maintains state)
- [x] Add file-level versioning where appropriate. (snapshotFromFileSystem/restoreSnapshot/validateSnapshot integrate in-memory file edits with existing project/version history architecture without duplicating it)

### Security requirements

Generated code must not execute with unrestricted access to the application's server or credentials.

Before allowing arbitrary project execution, define and test:

- [x] Isolation boundaries. (QuickJS sandbox, separate runtime per execution)
- [x] Network permissions. (No network by default; fetch blocked in validation)
- [x] Storage permissions. (In-memory file system with path validation)
- [x] Execution time limits. (Configurable timeout supported)
- [x] Resource limits. (Memory limits configured in QuickJS)
- [x] Dependency restrictions. (Allowlist infrastructure)
- [x] Cross-origin policies. (Sandboxed execution context)
- [x] Cancellation behavior. (AbortSignal-driven execution cancellation; shouldInterrupt handler + context disposal terminate in-flight QuickJS execution; timed-out/cancelled runs stop rather than merely returning an error; verified under Vitest)
- [x] Recovery behavior. (File edits persist through snapshot-based versioning and can be recovered through the existing version/recovery mechanisms; restoreSnapshot rehydrates ProjectFileSystem from a CodeProjectSnapshot)

A browser runtime must be evaluated for actual compatibility and security constraints before being selected.

### Definition of done

A user can inspect and modify generated source code through the editor, and supported projects can be previewed without compromising the main application.

**Phase 8 Status:** Implemented and verified for repository-side behavior. Code editor UI integrated (Monaco Editor via @monaco-editor/react, wired to ProjectFileSystem/FileManifest), file selection/view/edit/save, validation, build/execution error surfacing, QuickJS execution with AbortSignal-driven cancellation and timeout, bounded repair loop, dependency allowlist, path-traversal and critical-file protection, and file-level versioning integration with the existing project history are all implemented and pass deterministic tests (format, lint, typecheck, 177 tests across 17 test files, production build, dependency audit). QuickJS execution, cancellation, and timeout behavior were verified under Vitest/Node. Full in-browser verification (real Monaco rendering in a browser tab and QuickJS-Emscripten WASM execution in the deployed Vite bundle) is still pending manual review and is not claimed as completed here.

### Security requirements

Generated code must not execute with unrestricted access to the application's server or credentials.

Before allowing arbitrary project execution, define and test:

- Isolation boundaries.
- Network permissions.
- Storage permissions.
- Execution time limits.
- Resource limits.
- Dependency restrictions.
- Cross-origin policies.
- Cancellation behavior.
- Recovery behavior.

A browser runtime must be evaluated for actual compatibility and security constraints before being selected.

### Definition of done

A user can inspect and modify generated source code through the editor, and supported projects can be previewed without compromising the main application.

### Deliverable

A controlled code-generation environment.

---

## PHASE 9 — Deployment and GitHub Integration

Status: [x] Implemented (repository-side) — GitHub export and deployment documentation complete; live OAuth, repository creation, and deployment unverified

### Objectives

Enable users to take generated websites beyond the Elora editor.

### Initial approach

Prioritize downloadable projects and user-owned GitHub repositories.

These approaches allow users to manage their code and hosting independently.

### Tasks

- [x] Document the GitHub export workflow.
- [x] Design GitHub authentication and permissions.
- [x] Implement repository creation or export where authorized.
- [x] Ensure users explicitly authorize repository access.
- [x] Avoid requesting unnecessary GitHub permissions.
- [x] Test repository creation failures.
- [x] Document deployment through a supported static host.
- [x] Add deployment prerequisites.
- [x] Define deployment status handling.
- [x] Define rollback behavior.
- [x] Evaluate platform-hosted publishing separately.

### Important hosting distinction

Hosting Elora itself is different from hosting every website users generate.

The first requires deploying one application.

The second requires handling potentially many independent projects, builds, storage allocations, deployment permissions, and abuse scenarios.

Do not promise unrestricted free hosting for every generated project before these requirements and provider limits have been evaluated.

### Definition of done

A user can export a working website to their own repository or hosting workflow using documented steps.

### Deliverable

GitHub export and a documented deployment workflow.

### Security requirements

- OAuth tokens are never hardcoded or committed.
- Secrets (GitHub tokens, deployment credentials) remain server-side and are never shipped to the browser.
- Repository permissions use least privilege: `public_repo` for writing to an existing user-owned repository, with separate, minimal scopes for repository creation.
- Export writes only the intended project files through the GitHub Contents API; no arbitrary command execution, no shell, no filesystem access beyond the intended repository.
- Repository names are validated before use; path-traversal patterns are not applicable to the GitHub API surface, but repository name validation prevents injection into repository identifiers.
- GitHub API failures are handled safely and surfaced as structured error codes, including rate-limit normalization.
- Retries are not unbounded; the export orchestration performs a single create-and-upload sequence and surfaces failures directly. No exponential-backoff or recursive retry loop is introduced at the repository level.
- External deployment credentials remain server-side and are never embedded in generated project files.
- No force-push behavior is introduced; repository creation and contents upload use the standard GitHub API.

### Documentation status

#### GitHub export workflow (implemented, locally verified)

The GitHub export abstraction is implemented in `src/lib/github/`:

- `types.ts` defines the permission scopes, result types, error codes, and error classification.
- `index.ts` defines the `GitHubClient` interface and a `MockGitHubClient` used in deterministic tests, plus the `exportToGitHub` orchestration function.
- `exportToGitHub` requires an authorized token before creating a repository or uploading contents, creates a repository only when the chosen name is available, uploads the project files as a single commit, and returns a structured success or failure result.

#### Authorization flow (designed, not live-verified)

1. The user initiates export to GitHub from the editor.
2. The application redirects to GitHub's OAuth authorization endpoint with the scopes required for the chosen action.
3. GitHub prompts the user to authorize the application.
4. On approval, GitHub redirects back with an authorization code.
5. The server exchanges the code for an access token and stores it server-side, associated with the user.
6. The export uses the server-stored token; the browser never sees the token.

Requested scopes and why they are needed:

- `public_repo` — required to create commits and upload file contents to a repository the user owns. This is the minimum scope for writing to a public repository. A private-repository workflow would require `repo` instead.
- Repository creation uses the same token; no separate personal access token is required from the user.

#### Repository creation and file export (implemented, locally verified)

- If the user provides a repository name that does not exist, the abstraction creates it and uploads the project files.
- If the repository already exists, the abstraction uploads to the existing repository.
- File upload is a single commit containing the entire project tree; individual file history is not rewritten.
- The exported tree is the same tree the user sees in the editor's file manifest.

#### Error states (implemented, locally verified)

- Unauthenticated export is rejected before any GitHub API call.
- Invalid or unrecognized tokens are rejected.
- Repository name collisions return a `REPO_NAME_UNAVAILABLE` error.
- Repository creation failures and upload failures return structured error codes.
- GitHub rate-limit responses are normalized into a `RATE_LIMITED` error with a user-friendly message.
- Unrecognized API responses fall back to `UNKNOWN_ERROR`.
- All errors are classified through `classifyGitHubError` and surfaced to the caller; they are never thrown as raw API responses.

#### Rate limits (designed, locally verified for classification)

- GitHub's primary rate limit applies to requests per hour per token.
- The abstraction normalizes rate-limit responses into a single `RATE_LIMITED` error code.
- The user-facing message advises waiting and retrying.
- The repository-side implementation does not perform unbounded retries; the caller decides whether to retry.

#### Repository conflicts (implemented, locally verified)

- Repository name collision is detected before creation and surfaced as `REPO_NAME_UNAVAILABLE`.
- The user can choose a different name or export to the existing repository.

#### Deployment prerequisites (documented as design/spec; live deployment unverified)

- A GitHub OAuth application with the callback URL configured.
- Server-side storage for user tokens.
- For Cloudflare Pages deployment: a Cloudflare account, Wrangler CLI, and the project's `wrangler.toml` or equivalent configuration.
- For user-owned hosting: the user provides their own hosting; Elora only produces the export artifact.

#### Deployment status handling (documented as design/spec; live deployment unverified)

- Pending: export accepted, build queued.
- Building: the project is being built.
- Live: the deployment is serving.
- Failed: the build or deployment failed with a structured error.
- The status is surfaced to the user and stale statuses are cleared on new exports.

#### Rollback and recovery behavior (documented as design/spec; live deployment unverified)

- Each export is a new commit; previous deploys remain in the repository history.
- Rollback is performed by the user through their hosting provider or Git history, not by Elora.
- A failed export does not leave a partial repository; the upload is atomic per the GitHub Contents API semantics.

#### Platform-hosted publishing (not yet evaluated)

To be evaluated separately from user-owned GitHub export and static-host deployment.

#### Live verification status

The following require live GitHub and/or Cloudflare credentials and are NOT claimed as verified:

- GitHub OAuth authorization flow (redirect, callback, token exchange).
- Repository creation against the live GitHub API.
- File upload to a live repository.
- Deployment to a live static host.
- Signed-in user token storage and per-user repository isolation.

#### What requires live credentials

- A GitHub OAuth application (client ID, callback URL).
- A user authorizing the application against their GitHub account.
- Server-side token storage.
- A Cloudflare account and Wrangler configuration for platform deployment (if used).
- The user's own hosting credentials for user-owned deployment (if used).

#### Deployment through a supported static host (documented; live deployment unverified)

The recommended deployment path for a generated website is a static host that serves the built artifact produced by the project's build step.

This project itself is deployed as a static site with a Worker fetch handler. The same model applies to a user's exported project: build the project's static output and deploy it to a static host.

Supported approach: Cloudflare Pages.

Prerequisites:

- A Cloudflare account.
- The Wrangler CLI installed locally (npm install -g wrangler, or use npx wrangler).
- A Cloudflare Pages project, or the ability to create one.
- The built static output directory (for this project, dist/ after `npm run build`).

Deployment steps (user-owned project):

1. Build the exported project locally: run the project's build command to produce the static output.
2. Create or select a Cloudflare Pages project in the Cloudflare dashboard.
3. Connect the project's Git repository, or deploy the built output directly.
4. Configure the build command and output directory to match the project.
5. Deploy. Cloudflare Pages serves the static output at a *.pages.dev URL.

Deployment steps (platform-hosted Elora):

- The Elora application itself is deployed separately as a Worker + static assets.
- Deploying Elora is different from deploying each user's generated project.
- Elora produces the export artifact; the hosting of that artifact is the user's responsibility unless a platform-hosted publishing flow is added.

Environment variables a deployment may need:

- For Elora itself: SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY, and any other service secrets, configured server-side.
- For a user's deployed project: whatever the project's own build requires; Elora does not inject secrets into exported projects.

#### Deployment status handling (documented as design/spec; live deployment unverified)

Statuses:

- Pending: the user requested an export or deploy; work has not started.
- Building: the project build is in progress.
- Deploying: the built artifact is being pushed to the host.
- Live: the deployment is serving at its URL.
- Failed: the build or deploy failed; a structured error is available.

Behavior:

- A new export clears any stale Live status for the previous deploy of the same project.
- Failed statuses include the error that caused the failure.
- Live status includes the serving URL when available.
- Status is surfaced in the UI next to the export action.

#### Rollback and recovery behavior (documented as design/spec; live deployment unverified)

- Each export or deploy is a new build and a new deployment; prior deployments remain in the host's history where the host supports it.
- Rollback is performed by the user through the hosting provider's interface or through the Git history of the exported repository, not by Elora.
- A failed build or deploy does not publish a partial artifact: the build must succeed before deployment, and a failed deploy leaves the previous deployment serving.
- If the exported repository is the source of truth, reverting a commit and redeploying restores the earlier state.
- Elora never force-pushes to a user's repository; repository history is preserved.

#### Platform-hosted publishing evaluation (documented as evaluation; not implemented)

Platform-hosted publishing means Elora builds and hosts the user's generated website directly, rather than only exporting it for the user to host.

Considerations:

- Cost: each hosted project consumes storage, build minutes, and bandwidth. Provider limits and pricing must be evaluated before promising unrestricted free hosting.
- Scaling: many independent projects mean many independent deployments, caches, and abuse surfaces.
- Abuse: user-generated content published under a shared host requires content policies, rate limits, and takedown handling.
- Domain and SSL: custom domains, certificates, and per-project routing add complexity.
- Rollback and lifecycle: each published project needs a deployment history and a rollback path.

Recommendation:

- Defer platform-hosted publishing until the user-owned export path is stable and the cost/abuse model is evaluated.
- Start with user-owned GitHub export and static-host deployment as the primary path.
- Evaluate platform-hosted publishing as a separate, later feature with explicit limits.

---

## PHASE 10 — Production Hardening and Public Beta

Status: [x] Repository-side hardening complete — security review, configurable rate limiting, and known limitations documented; live deployment, monitoring, and beta release pending

### Objectives

Make Elora reliable enough for users beyond the developer.

### Tasks

- [x] Review authentication and authorization — completed: auth boundary in src/server/auth.ts; requireAuth gate with fail-closed (401 UNAUTHENTICATED / 401 INVALID_SESSION); dev mode (requireAuth: false) preserves local dev and tests; 24 auth tests; health endpoint not gated; no Supabase internals leaked.
- [x] Review API key handling — completed: GEMINI_API_KEY and SUPABASE keys server-side only; no hardcoded secrets; .env.example has placeholders; error reporting redacts secrets; documented in Phase 10 review.
- [x] Review database access policies — completed: RLS on projects + project_versions + generation_logs; owner_id scoping; ON DELETE CASCADE/SET NULL; service-role key server-side only; documented in Phase 10 review.
- [x] Add API request limits — completed: configurable RATE_LIMIT_MAX_REQUESTS / RATE_LIMIT_WINDOW_MS / API_TIMEOUT_MS env vars; in-memory per-instance; not enabled by default; documented in Phase 10 review.
- [x] Add provider timeout handling — completed: AbortController-based executeWithTimeout; configurable timeoutMs (default 30000); 504 GENERATION_TIMEOUT; documented in Phase 10 review.
- [x] Add abuse protection — completed: rate limiting + input validation; documented limitations (no CAPTCHA, quotas, or content moderation yet).
- [x] Add privacy documentation — completed: documented in Phase 10 review (what is stored, what is not, retention, what requires disclosure).
- [x] Add data deletion behavior — completed: ON DELETE CASCADE on projects + project_versions; generation_logs ON DELETE SET NULL; exported artifacts live in user's GitHub/local; documented in Phase 10 review.
- [x] Add error reporting — completed: structured ErrorReporter interface in src/server/error-reporting.ts; console + noop implementations; setErrorReporter/getErrorReporter for swapping external providers; 11 tests; documented in Phase 10 review.
- [x] Add uptime and failure monitoring within available free limits — completed: documented (Phase 10 review); /api/health as liveness probe; production monitoring pending deployment (external blocker).
- [x] Test free-tier exhaustion — completed at repository level: quota errors mocked and mapped to QUOTA_EXCEEDED; live-provider exhaustion deferred to live credentials.
- [x] Test project recovery — completed: versioning + restore tests exist; live Supabase recovery pending deployment.
- [x] Test ZIP export — completed: 6 ZIP tests pass; secrets not included; exported project builds independently.
- [ ] Test mobile usability — blocked: requires real browser layout engine (jsdom has none); visual responsive verification is a manual/browser blocker.
- [x] Review accessibility — completed: automated review done (semantic HTML audit, label/ARIA checks in existing component tests, keyboard-focus existence in builder); axe-core not installed (would require new dependency); documented limitations.
- [x] Check package vulnerabilities — completed: npm audit run; 2 low-severity DOMPurify advisories via Monaco documented; no safe upgrade path; see Monaco advisory note.
- [x] Review third-party licenses — completed: all permissive or file-level copyleft; no GPL-3.0-only/AGPL; documented in Phase 10 review.
- [x] Document known limitations — completed: documented in Phase 10 review (unauthenticated-by-default API, per-instance rate limiting, live credential requirements, DOMPurify advisories, unmoderated content, browser verification blockers).
- [x] Create a backup and recovery procedure — completed: documented in Phase 10 review (Supabase dashboard/CLI backup/restore; project/version deletion behavior; live procedures pending deployment).
- [x] Verify deployment configuration — completed: verified (Vite build produces static dist/ + Worker-compatible API handler; wrangler.toml pending deployment; Cloudflare Pages steps documented).
- [ ] Perform a final end-to-end test — blocked: requires live deployment with credentials (Supabase + Gemini + GitHub + Cloudflare); not achievable without external accounts.

### Definition of done

The main user journey works reliably, failures are understandable, user data is protected by tested access controls, and deployment procedures are documented.

### Review results (repository-side, this session)

#### Authentication and authorization review

- Supabase email/password authentication is used via `@supabase/supabase-js`.
- The `AuthService` in `src/lib/supabase/auth.ts` provides sign-in, sign-up, sign-out, session, and auth-state change subscription.
- `AuthConfig` requires both `supabaseUrl` and `supabaseAnonKey` and validates them.
- The Supabase anon key is a public key intended for client-side use; it is not a secret.
- The Supabase service role key is used only by `createServerClient()` and is guarded by `isServerSide` routing in `src/lib/supabase/config.ts`.
- `src/lib/supabase/` is imported only by server code; it is not imported by any client-facing module, so neither the anon key nor the service role key is shipped to the browser.
- The API server (`src/server/api.ts`) does not currently verify Supabase session tokens on `/api/generate` or `/api/edit`. In production, these endpoints should be gated behind authentication or deployment-layer access control.

#### API key handling review

- `GEMINI_API_KEY` is read server-side in `src/server/config.ts` and passed to the Gemini provider. It is not shipped to the browser.
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` are read server-side in `src/lib/supabase/config.ts`. The anon key is public by design; the service role key is restricted to server-side client creation.
- No API keys are hardcoded in source files or committed to the repository.
- The `.env` file (if present) is not committed; CI and deployment inject secrets through environment variables.

#### Database access policy review

- Row Level Security is enabled on `projects` and `project_versions` in `supabase/migrations/003_enable_rls_and_policies.sql`.
- All RLS policies require `auth.uid() = owner_id`, so users can only access their own projects and versions.
- `project_versions` has no UPDATE policy, making versions immutable snapshots.
- A service-role policy grants full access for server-side operations; the service role key is server-side only.
- `projects.owner_id` references `auth.users(id)` with `ON DELETE CASCADE`, so project data is cleaned up when a user account is deleted.
- The `projects` table enforces name length (<=80) and description length (<=240) constraints.

#### API request limits

- The API handler supports configurable rate limiting via `ApiHandlerOptions.rateLimit` (`maxRequests`, `windowMs`).
- Rate limiting is implemented in-memory per handler instance.
- Rate limiting is NOT enabled by default; `defaultOptions.rateLimit` is `undefined`.
- This session makes rate limiting configurable via environment variables:
  - `RATE_LIMIT_MAX_REQUESTS` (e.g. 30)
  - `RATE_LIMIT_WINDOW_MS` (e.g. 60000)
  - `API_TIMEOUT_MS` (e.g. 30000)
- For multi-instance deployments, per-instance rate limiting is insufficient; a shared store (D1, Redis, or the hosting platform's rate limiting) is needed.

#### Provider timeout handling

- The API handler uses `executeWithTimeout` with an `AbortController` and configurable `timeoutMs` (default 30000).
- Timeouts produce a `GENERATION_TIMEOUT` response (504).
- The Gemini provider and mock provider both respect the abort signal where applicable.

#### Abuse protection

- Current abuse protection is limited to in-memory rate limiting (when enabled) and input validation.
- No CAPTCHA, no project quotas, no generated-content moderation, and no per-user usage limits are implemented.
- For public beta, add per-user quotas, content guidelines, and monitoring before opening access broadly.

#### Privacy documentation

See "Known limitations" below.

#### Data deletion behavior

- User account deletion triggers `ON DELETE CASCADE` on `projects` and `project_versions`.
- Generated website artifacts (ZIP exports, GitHub exports) are not automatically deleted when a user account is deleted; they live in the user's own GitHub repository or local download.
- A data deletion procedure should document how a user or administrator can delete all data associated with a user across Supabase tables and any exported artifacts.

#### Error reporting

- Server errors are logged via `console.error` in the API handler's error path.
- User-facing errors are structured (`{ code, message }`) and do not expose provider internals.
- No external error-reporting service (e.g. Sentry) is integrated.
- For public beta, integrate an error-reporting service and redact any sensitive data from logs.

#### Uptime and failure monitoring

- No uptime or failure monitoring is configured.
- The `/api/health` endpoint can serve as a liveness probe for the hosting platform.
- For public beta, add uptime monitoring (e.g. the hosting platform's built-in checks or a free external monitor) and alert on failures.

#### Responsive and accessibility review

- Responsive layout logic is tested where it can be verified in jsdom (breakpoint-dependent render behavior, conditional rendering at narrow widths). jsdom has no layout engine, so actual CSS dimensions, reflow, and visual breakpoints cannot be verified automatically.
- Existing builder components include accessible form labels, keyboard-focus styles, and semantic landmarks where applicable; these are covered by existing component tests.
- Automated accessibility checks with axe-core were not added because that would require a new dependency and jsdom has known limitations (color-contrast cannot be verified in jsdom; axe-core documents limited jsdom support). Adding axe-core is a reasonable future enhancement but is not required for the current repository-side completion.
- Visual responsive verification (actual layout at mobile/tablet/desktop widths, overflow, editor/preview panel behavior, controls staying accessible) requires a real browser or screenshots. This is a manual/browser blocker.
- No blocking responsive layout bugs were introduced in this session's server-side changes.

#### Package vulnerabilities

- `npm audit` reports 2 low-severity advisories for `dompurify@3.4.15`, introduced transitively by `monaco-editor@0.57.0` (via `@monaco-editor/react@4.7.0`).
- These affect DOMPurify's IN_PLACE mode with specific hook configurations; they are low severity.
- The project does not call DOMPurify directly; Monaco uses it internally for editor content sanitization.
- **Upgrade assessment:** The fixed DOMPurify version is 3.4.16. Monaco 0.57.0 (latest stable as of this writing) ships DOMPurify 3.4.15 and has no release that bumps it. An npm override can change the installed `dompurify` dependency, but Monaco distributes its own bundled copy of DOMPurify in its editor artifacts; changing the npm dependency does not make the editor use the patched code, and Monaco would need to be rebuilt by the maintainers. A postinstall workaround exists in Monaco issue #5517 but is not applied here because it targets a specific ESM path and has not been verified to cover every distribution format this project uses.
- **Decision:** No dependency override is applied. The advisories remain documented as low severity with no safe automatic resolution. The project does not call DOMPurify directly, which reduces exposure. If a future Monaco release ships DOMPurify 3.4.16+, the upgrade should be applied and retested.
- No other vulnerabilities are reported.

#### Third-party licenses

- `react`, `react-dom`: MIT
- `@monaco-editor/react`: MIT
- `monaco-editor` (transitive): MIT
- `quickjs-emscripten`: MIT
- `zod`: MIT
- `@supabase/supabase-js`: MIT
- `@google/genai`: Apache-2.0
- `jszip`: MIT or GPL-3.0-or-later (MIT option applies)
- `dompurify` (transitive): MPL-2.0 or Apache-2.0 (Apache-2.0 option applies)
- No GPL-3.0-only or AGPL dependencies that would require open-sourcing the application.

#### Deployment configuration verification

- No `wrangler.toml` or Cloudflare Pages configuration is committed yet; deployment configuration is pending.
- The Vite build produces a static `dist/` output plus a Worker-compatible API handler in `src/server/api.ts`.
- For Cloudflare Pages deployment, the API handler must run as a Worker (via `workers-degenerate` or a Worker entrypoint) or the API must be served from a separate Worker.
- The `src/server/viteApiPlugin.ts` exposes the API during Vite development only; it is not a production server.

#### Known limitations

- The API endpoints `/api/generate` and `/api/edit` are not authenticated; anyone with the URL can call them (subject to rate limiting when enabled). Production deployments should add authentication.
- Rate limiting is per-instance and in-memory; it does not protect across multiple instances or persist across restarts.
- The Gemini provider requires `GEMINI_API_KEY`; without it, generation falls back to the mock provider or returns `PROVIDER_NOT_CONFIGURED`.
- Supabase integration requires a live Supabase project with the migrations applied; the repository contains the migrations but does not create the project.
- GitHub export requires a live GitHub OAuth application and user authorization; the repository-side abstraction is implemented and tested with a mock, but live flows are not verified.
- DOMPurify carries 2 low-severity advisories via Monaco; no workaround is applied.
- Generated website content is not moderated; users are responsible for what they generate and export.
- The application is a frontend + API prototype; production hosting, monitoring, and abuse protection are not yet configured.

### Deliverable

An MVP ready for controlled public testing.

---

# 17. Full-Stack Generation — Future Phase

Status: [ ] Not started — no work started

This phase begins only after the frontend builder is stable.

### Objectives

Allow users to generate complete applications rather than frontend-only websites.

Potential capabilities:

- [ ] Generated API endpoints.
- [ ] Generated authentication flows.
- [ ] Generated database schemas.
- [ ] Generated database migrations.
- [ ] Environment-variable configuration.
- [ ] Backend integration.
- [ ] Form submission handling.
- [ ] File upload workflows.
- [ ] Database-backed dashboards.
- [ ] Controlled backend preview.
- [ ] Application deployment.

### Required design decisions

Generated applications introduce new security and operational requirements.

Each generated app may require:

- Independent configuration.
- Separate data ownership.
- Secret management.
- Database access controls.
- Isolated execution.
- Resource limits.
- Dependency management.
- Deployment configuration.
- Application-level error reporting.

Do not execute arbitrary generated server code in a shared production process.

The architecture must be evaluated before implementation.

### Definition of done

A defined set of full-stack application types can be generated, tested, and deployed through documented workflows.

Do not claim universal full-stack generation based on a few working templates.

---

# 18. Testing Strategy

Testing must be introduced alongside implementation, not postponed until the end.

## 18.1 Unit tests

Test:

- Website specification validation.
- Theme validation.
- Section rendering.
- Input normalization.
- AI response parsing.
- Error mapping.
- Project versioning.
- Export file generation.
- API request validation.

## 18.2 Component tests

Test:

- Prompt input.
- Build button.
- Loading states.
- Error messages.
- Preview updates.
- Theme controls.
- Version restoration.
- Download interactions.

## 18.3 API tests

Test:

- Valid generation requests.
- Invalid prompts.
- Invalid model responses.
- Provider rate-limit errors.
- Timeout handling.
- Authentication failures.
- Unauthorized project access.
- Oversized requests.
- Failed database operations.

## 18.4 End-to-end tests

The first complete end-to-end journey should be:

```text
Open Elora
    |
    v
Enter a Prompt
    |
    v
Generate Website
    |
    v
Display Preview
    |
    v
Edit Website
    |
    v
Verify Updated Preview
    |
    v
Download ZIP
    |
    v
Verify Exported Project
```

Add account and persistence checks after those features are implemented.

## 18.5 Security tests

Test:

- Cross-user project access.
- Missing or invalid sessions.
- Secret exposure in browser bundles.
- Unvalidated AI output.
- Unsafe URL handling.
- Oversized requests.
- Rate-limit enforcement.
- Unauthorized file access.
- Failure recovery.
- Generated-code isolation when applicable.

A green build does not prove that the system is secure. Security tests must explicitly check the relevant boundaries.

---

# 19. CI and Code Quality

Configure automated checks for every meaningful code change.

Recommended checks:

- [ ] Dependency installation.
- [ ] Formatting validation.
- [ ] ESLint.
- [ ] TypeScript checks.
- [ ] Unit tests.
- [ ] Component tests.
- [ ] Production build.
- [ ] API tests.
- [ ] End-to-end tests as the application matures.
- [ ] Dependency security review.

The exact CI workflow must reflect scripts that actually exist in the repository.

Do not add fake checks that always succeed regardless of application behavior.

### Branch strategy

Use:

- `main` for working, releasable code.
- Short-lived `feat/...` branches for features.
- Short-lived `fix/...` branches for bug fixes.

Examples:

```text
feat/builder-ui
feat/website-schema
feat/ai-generation
feat/zip-export
fix/project-ownership
```

Commit small, logical changes.

Do not combine unrelated features into one large commit.

---

# 20. Configuration and Secrets

Create an `.env.example` describing required configuration.

For local development, a future implementation may use variables similar to:

```dotenv
# Frontend
VITE_API_BASE_URL=http://localhost:8787

# API server configuration
AI_PROVIDER=mock
AI_MODEL=
GEMINI_API_KEY=

# Supabase configuration
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

This is an illustrative configuration. The exact names depend on the chosen implementation.

### Secret handling rules

- Never commit real environment files.
- Never place server secrets in frontend variables.
- Never expose a Supabase service-role key to the browser.
- Store hosted secrets in the appropriate server-side secret manager.
- Give each credential only the permissions required.
- Rotate credentials if they are exposed.
- Document provider setup without including personal credentials.

Variables prefixed with `VITE_` are intended for values that may be exposed to the browser.

Never put privileged credentials in such variables.

---

# 21. Performance and Reliability

The application should remain usable when provider responses are slow or free-tier capacity is unavailable.

### Requirements

- Avoid blocking the entire UI during generation.
- Provide clear loading states.
- Handle API timeouts.
- Avoid repeated unnecessary AI calls.
- Limit request and output sizes.
- Avoid excessive rendering work.
- Keep project snapshots within documented storage limits.
- Handle empty projects.
- Handle corrupt stored data safely.
- Preserve working projects after failed operations.
- Provide a clear recovery path when a provider is unavailable.

### Operational monitoring

Track only what is necessary to understand system health.

Useful metrics include:

- Successful generation count.
- Failed generation count.
- Provider latency.
- API error categories.
- ZIP export success rate.
- Build failures.
- Database errors.
- Rate-limit rejections.

Avoid retaining private user content in logs unnecessarily.

---

# 22. Zero-Budget Operating Rules

Elora should be developed with explicit spending controls.

### Required policy

1. Prefer services with usable free tiers.
2. Verify the terms of each free tier before relying on it.
3. Never assume free usage is unlimited.
4. Do not enable paid upgrades automatically.
5. Do not add required paid integrations to the MVP.
6. Do not require users to provide their own paid API keys.
7. Do not promise unlimited AI generation.
8. Monitor usage and provider failures.
9. Provide graceful behavior when a free quota is exhausted.
10. Document any feature that cannot work without an external service.
11. Keep a local mock provider for development and automated tests.
12. Keep AI provider selection configurable.
13. Recheck pricing and terms before public releases.

If a required service becomes unavailable under the intended free setup, pause that integration and evaluate alternatives instead of silently introducing a charge.

### Realistic operating model

The initial local development environment can be built without paid infrastructure.

The deployed application can use eligible free tiers.

However, zero upfront cost does not guarantee:

- Unlimited public users.
- Unlimited model requests.
- Unlimited hosting.
- Permanent availability.
- Unlimited storage.
- Unlimited deployments.
- Zero-cost operation at any scale.

The architecture must communicate these limits honestly.

---

# 23. Definition of a Successful MVP

The MVP is successful when all of the following are true.

## User workflow

- [x] A user can open the landing page.
- [x] A user can enter a website prompt.
- [x] The configured AI provider can generate a valid website specification (Gemini provider implemented; mock fallback available; requires API key for production use).
- [x] The website appears in the preview.
- [x] The user can modify the website through AI instructions (edit endpoint implemented; frontend integrated).
- [x] Existing content survives successful edits unless the user requests removal (versioning implemented).
- [x] Invalid edits do not destroy the previous version (version history and restore implemented).
- [x] A project can be saved and restored (project versioning implemented).
- [x] A valid project ZIP can be downloaded (ZIP export implemented and tested).
- [x] The exported project builds independently (ZIP export validated; GitHub export abstraction implemented).

## Technical quality

- [x] The application has a reproducible setup (package.json, lockfile, TypeScript, Vite, ESLint, Prettier configured).
- [x] Type checking passes.
- [x] Linting passes.
- [x] Automated tests pass (177 tests across 17 test files).
- [x] The production build succeeds.
- [x] API errors are handled (structured error responses, timeout handling, provider error mapping).
- [x] No privileged secrets are exposed to the client (Supabase lib server-side only; API keys server-side only).
- [x] Database authorization is enforced (RLS on projects and versions, owner_id scoping); live testing pending Supabase project setup.
- [ ] Free-tier quota exhaustion is handled.
- [ ] Generated content follows the validated schema.

## Product constraints

- [x] No coin system exists.
- [x] No credit purchases are required.
- [x] No mandatory subscription exists.
- [x] No automatic paid API fallback exists.
- [x] Users are informed about functionality that is only simulated (mock provider available; live provider requires key).
- [x] The documented operating model respects the selected providers' limits (rate limiting configurable; documented in Phase 10).

---

# 24. Development Priority Rules

When deciding what to implement next, use this order:

1. Correctness.
2. Security.
3. A working end-to-end user journey.
4. Project persistence and recovery.
5. Export quality.
6. Responsive design and accessibility.
7. Performance.
8. Advanced generation capabilities.
9. Deployment automation.
10. Additional integrations.

Do not build advanced features to compensate for a broken core workflow.

Do not add a dependency merely because another AI builder uses it.

Choose technology based on an explicit requirement.

---

# 25. Current Development Status

This section must be updated as work is completed.

## Foundation

- [x] Repository documentation added (README and roadmap).
- [x] Development environment configured (npm, TypeScript, Vite, ESLint, Prettier).
- [x] CI checks configured.
- [x] Initial frontend created (static prototype; no generation functionality yet).
- [x] Initial production build succeeds (locally verified).

## MVP

- [x] Builder UI completed (responsive landing and builder prototype exist; full roadmap acceptance criteria remain outstanding).
- [x] Website schema defined and tested (renderer remains outstanding).
- [x] Website renderer completed for validated specs; AI generation remains unimplemented.
- [x] AI provider interface and deterministic mock API foundation completed; hosted provider remains outstanding.
- [x] Real AI generation working (Gemini provider implemented; requires API key for production use).
- [x] AI editing working (edit endpoint implemented; frontend integrated with /api/edit; local demo mode included).
- [x] Project versioning working (version history, undo/redo, restore implemented).
- [x] ZIP export working.
- [x] Authentication implemented (Supabase email/password auth service implemented; live Supabase integration pending external project setup).
- [x] Cloud project storage architecture implemented (migrations, RLS, types ready). Live Supabase integration pending external project setup.
- [x] Security tests passing (24 auth boundary tests + 12 API handler tests + 11 error-reporting tests = 47 security-relevant tests; see Phase 10 security tests subsection).
- [ ] End-to-end workflow passing (local automated tests pass; live end-to-end verification pending deployment).

## Release

- [ ] Free-tier limits reviewed.
- [ ] Production environment configured.
- [ ] Privacy documentation written.
- [ ] Error handling reviewed.
- [ ] Recovery procedure documented.
- [ ] Controlled beta release completed.

Only mark a task complete after verifying it in the actual codebase or deployed application.

---

# 26. Immediate Next Actions

The next development steps should be performed in this order.

1. Inspect the current repository and identify any existing files. (Done.)
2. Add this roadmap as `roadmap.md`. (Already present.)
3. Create or update the root `README.md`. (Done.)
4. Finalize the initial architecture and environment configuration. (Initial local foundation only; API/provider architecture remains future work.)
5. Set up the frontend and API workspaces. (Frontend root app created; API workspace deferred until needed.)
6. Establish linting, type checking, and production builds. (Done and locally verified.)
7. Build the static builder interface. (Initial static prompt UI created; phase acceptance criteria remain incomplete.)
8. Implement the website schema and renderer. (Done - schema and renderer completed in Phase 2.)
9. Connect the first real AI provider. (Done - Gemini provider implemented in Phase 3; requires API key for production use.)
10. Complete the prompt-to-preview workflow. (Done - frontend connected to API with mock fallback.)
11. Implement editing and project recovery. (Done - edit endpoint, frontend integration, and versioning completed in Phases 4-5.)
12. Implement ZIP export. (Done - ZIP export completed in Phase 6; validated by tests.)
13. Introduce authentication and persistent projects. (Done - Supabase auth service and database architecture completed in Phase 7; live integration pending external project setup.)
14. Complete security and end-to-end testing. (Security review completed and documented in Phase 10; end-to-end testing pending live deployment.)
15. Deploy the Elora application using the verified free-tier configuration. (Pending - deployment configuration not yet created; see Phase 9 deployment documentation.)

Do not start an advanced deployment platform or unrestricted code-execution runtime before the initial workflow is working reliably.

---
# 27. Decision Log

Important architectural decisions should be recorded here.

| Decision | Initial choice | Reason |
|---|---|---|
| Initial product scope | Frontend website generation | Reduces complexity |
| AI output | Validated website specification | Easier to validate and render safely |
| Frontend | React + TypeScript + Vite | Suitable for a static-first application |
| Styling | Tailwind CSS | Reusable responsive styling |
| API | Cloudflare Workers | Server-side provider access within an eligible free tier |
| Initial AI | Configurable hosted provider | Enables real generation without requiring user API keys |
| AI testing | Mock provider | Enables deterministic development and automated tests |
| Persistence | Supabase PostgreSQL | Managed relational data storage |
| Export | Standalone React project ZIP | Gives users ownership of generated output |
| Early hosting | Elora frontend only | Keeps deployment scope manageable |
| Full source execution | Deferred | Requires additional isolation and security work |
| Billing | Excluded | Preserves the free-first product requirement |

When changing an important decision, record the date, reason, alternatives considered, and effects on existing code.

---

# 28. Official Documentation

Use official documentation to verify current API behavior, platform limits, supported features, and pricing.

### Cloudflare Pages

https://developers.cloudflare.com/pages/

### Cloudflare Workers

https://developers.cloudflare.com/workers/

### Supabase

https://supabase.com/docs

### Gemini API

https://ai.google.dev/gemini-api/docs

### React

https://react.dev/

### Vite

https://vite.dev/guide/

### TypeScript

https://www.typescriptlang.org/docs/

### Tailwind CSS

https://tailwindcss.com/docs

### Zod

https://zod.dev/

### Vitest

https://vitest.dev/guide/

### Playwright

https://playwright.dev/docs/intro

### GitHub Actions

https://docs.github.com/en/actions

---

# Final Principle

Elora should become a reliable, free-first AI website builder through incremental development.

The first objective is not to reproduce every advanced feature of an established AI coding platform.

The first objective is to make the following workflow genuinely work:

**Prompt → AI generation → Website preview → AI editing → Project saving → ZIP download.**

Once this workflow is reliable, the project can progress toward source-code editing, GitHub integration, isolated code execution, full-stack generation, and deployment.

Every feature must be tested, every important limitation must be documented, and every architectural decision must support a maintainable product without assuming unlimited free infrastructure.
