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

Status: [ ] Not started

### Objectives

Give users ownership of a downloadable website project.

### Tasks

- [ ] Create a standalone React project template.
- [ ] Define generated project files.
- [ ] Map the website specification to export files.
- [ ] Include the required dependencies.
- [ ] Include the stylesheet.
- [ ] Include public assets when supported.
- [ ] Create a project README.
- [ ] Generate the ZIP archive.
- [ ] Add download progress and error handling.
- [ ] Add archive validity tests.
- [ ] Test installation and production builds.
- [ ] Verify that secrets are not included.

### Definition of done

The exported project can be downloaded, extracted, installed, and built independently using its README instructions.

### Deliverable

A downloadable website project.

---

## PHASE 7 — Authentication and Cloud Projects

Status: [ ] Not started

### Objectives

Allow projects to persist across sessions and devices.

### Tasks

- [ ] Configure the Supabase project.
- [ ] Implement database migrations.
- [ ] Configure authentication.
- [ ] Create the projects table.
- [ ] Create the project versions table.
- [ ] Add required indexes and constraints.
- [ ] Configure Row Level Security.
- [ ] Implement project creation.
- [ ] Implement project listing.
- [ ] Implement project retrieval.
- [ ] Implement project updates.
- [ ] Implement project deletion.
- [ ] Implement version retrieval.
- [ ] Add duplicate and rename operations.
- [ ] Test unauthorized access.
- [ ] Test session expiration.
- [ ] Document database setup and recovery.

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

Status: [ ] Not started

### Objectives

Move beyond structured page generation toward code-level project generation.

This phase introduces materially greater complexity and must begin only after the schema-based MVP is reliable.

### Tasks

- [ ] Research supported browser execution approaches.
- [ ] Evaluate suitable sandbox technologies.
- [ ] Review licenses and production usage requirements.
- [ ] Define the generated project file format.
- [ ] Introduce a file manifest.
- [ ] Add file creation and modification tools.
- [ ] Add controlled file deletion.
- [ ] Add source-code viewing.
- [ ] Add a code editor.
- [ ] Add change diffs.
- [ ] Add file validation.
- [ ] Add dependency allowlists.
- [ ] Restrict package installation.
- [ ] Add build error reporting.
- [ ] Add bounded repair attempts.
- [ ] Preserve the last working project.
- [ ] Add file-level versioning where appropriate.

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

Status: [ ] Not started

### Objectives

Enable users to take generated websites beyond the Elora editor.

### Initial approach

Prioritize downloadable projects and user-owned GitHub repositories.

These approaches allow users to manage their code and hosting independently.

### Tasks

- [ ] Document the GitHub export workflow.
- [ ] Design GitHub authentication and permissions.
- [ ] Implement repository creation or export where authorized.
- [ ] Ensure users explicitly authorize repository access.
- [ ] Avoid requesting unnecessary GitHub permissions.
- [ ] Test repository creation failures.
- [ ] Document deployment through a supported static host.
- [ ] Add deployment prerequisites.
- [ ] Define deployment status handling.
- [ ] Define rollback behavior.
- [ ] Evaluate platform-hosted publishing separately.

### Important hosting distinction

Hosting Elora itself is different from hosting every website users generate.

The first requires deploying one application.

The second requires handling potentially many independent projects, builds, storage allocations, deployment permissions, and abuse scenarios.

Do not promise unrestricted free hosting for every generated project before these requirements and provider limits have been evaluated.

### Definition of done

A user can export a working website to their own repository or hosting workflow using documented steps.

### Deliverable

GitHub export and a documented deployment workflow.

---

## PHASE 10 — Production Hardening and Public Beta

Status: [ ] Not started

### Objectives

Make Elora reliable enough for users beyond the developer.

### Tasks

- [ ] Review authentication and authorization.
- [ ] Review API key handling.
- [ ] Review database access policies.
- [ ] Add API request limits.
- [ ] Add provider timeout handling.
- [ ] Add abuse protection.
- [ ] Add privacy documentation.
- [ ] Add data deletion behavior.
- [ ] Add error reporting.
- [ ] Add uptime and failure monitoring within available free limits.
- [ ] Test free-tier exhaustion.
- [ ] Test project recovery.
- [ ] Test ZIP export.
- [ ] Test mobile usability.
- [ ] Review accessibility.
- [ ] Check package vulnerabilities.
- [ ] Review third-party licenses.
- [ ] Document known limitations.
- [ ] Create a backup and recovery procedure.
- [ ] Verify deployment configuration.
- [ ] Perform a final end-to-end test.

### Definition of done

The main user journey works reliably, failures are understandable, user data is protected by tested access controls, and deployment procedures are documented.

### Deliverable

An MVP ready for controlled public testing.

---

# 17. Full-Stack Generation — Future Phase

Status: [ ] Not started

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

- [ ] A user can open the landing page.
- [ ] A user can enter a website prompt.
- [ ] The configured AI provider can generate a valid website specification.
- [ ] The website appears in the preview.
- [ ] The user can modify the website through AI instructions.
- [ ] Existing content survives successful edits unless the user requests removal.
- [ ] Invalid edits do not destroy the previous version.
- [ ] A project can be saved and restored.
- [ ] A valid project ZIP can be downloaded.
- [ ] The exported project builds independently.

## Technical quality

- [ ] The application has a reproducible setup.
- [ ] Type checking passes.
- [ ] Linting passes.
- [ ] Automated tests pass.
- [ ] The production build succeeds.
- [ ] API errors are handled.
- [ ] No privileged secrets are exposed to the client.
- [ ] Database authorization is tested when authentication is introduced.
- [ ] Free-tier quota exhaustion is handled.
- [ ] Generated content follows the validated schema.

## Product constraints

- [ ] No coin system exists.
- [ ] No credit purchases are required.
- [ ] No mandatory subscription exists.
- [ ] No automatic paid API fallback exists.
- [ ] Users are informed about functionality that is only simulated.
- [ ] The documented operating model respects the selected providers' limits.

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
- [ ] ZIP export working.
- [ ] Authentication implemented.
- [ ] Cloud project storage working.
- [ ] Security tests passing.
- [ ] End-to-end workflow passing.

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
8. Implement the website schema and renderer.
9. Connect the first real AI provider.
10. Complete the prompt-to-preview workflow. (Done - frontend connected to API with mock fallback.)
11. Implement editing and project recovery. (Edit endpoint ready; frontend integration and versioning pending.)
12. Implement ZIP export.
13. Introduce authentication and persistent projects.
14. Complete security and end-to-end testing.
15. Deploy the Elora application using the verified free-tier configuration.

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
