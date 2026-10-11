# Supabase Setup for Elora

This directory contains database migrations and configuration for Supabase.

## Prerequisites

Before running these migrations, you need:

1. A Supabase project (free tier is sufficient)
2. Supabase CLI installed (`npm install -g supabase`)
3. Access to your Supabase project's API keys

## Quick Setup

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose a name and password
4. Select the free tier
5. Wait for the project to be created

### 2. Get Your Credentials

From your Supabase project dashboard:

1. Go to **Settings → API**
2. Copy the **Project URL** (e.g., `https://xyz.supabase.co`)
3. Copy the **anon public** key
4. Copy the **service_role** key (keep this secure!)

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Then edit `.env`:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ Important:** Never commit `.env` to version control.

### 4. Run Migrations

```bash
# Link your local project to Supabase
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

Or apply migrations manually via the Supabase dashboard:

1. Go to **SQL Editor**
2. Copy and run each migration file from `supabase/migrations/`

## Database Schema

### projects table

Stores user-owned website projects.

| Column       | Type        | Description                                     |
| ------------ | ----------- | ----------------------------------------------- |
| id           | UUID        | Primary key (auto-generated)                    |
| owner_id     | UUID        | Foreign key to `auth.users`                     |
| name         | TEXT        | Project name (max 80 chars)                     |
| description  | TEXT        | Project description (max 240 chars)             |
| project_spec | JSONB       | Website specification (validated by Zod schema) |
| created_at   | TIMESTAMPTZ | Creation timestamp                              |
| updated_at   | TIMESTAMPTZ | Last update timestamp (auto-updated)            |

### project_versions table

Stores version snapshots for project history.

| Column         | Type        | Description                                            |
| -------------- | ----------- | ------------------------------------------------------ |
| id             | UUID        | Primary key (auto-generated)                           |
| project_id     | UUID        | Foreign key to `projects`                              |
| owner_id       | UUID        | Foreign key to `auth.users` (must match project owner) |
| version_number | INTEGER     | Version number (auto-incremented)                      |
| spec_snapshot  | JSONB       | Website specification at this version                  |
| change_summary | TEXT        | Description of changes (max 240 chars)                 |
| created_at     | TIMESTAMPTZ | Version creation timestamp                             |

### generation_logs table

Stores minimal generation metadata for troubleshooting.

| Column      | Type        | Description                            |
| ----------- | ----------- | -------------------------------------- |
| id          | UUID        | Primary key (auto-generated)           |
| owner_id    | UUID        | Foreign key to `auth.users` (nullable) |
| provider    | TEXT        | AI provider used ('mock' or 'gemini')  |
| model       | TEXT        | Model name used                        |
| status      | TEXT        | Generation status                      |
| duration_ms | INTEGER     | Generation duration in milliseconds    |
| error_code  | TEXT        | Error code if failed                   |
| created_at  | TIMESTAMPTZ | Log creation timestamp                 |

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### projects

- Users can SELECT, INSERT, UPDATE, DELETE their own projects
- Users cannot access other users' projects

### project_versions

- Users can SELECT, INSERT, DELETE versions of their own projects
- Version ownership must match project ownership
- Versions are immutable (no UPDATE policy)

### generation_logs

- Users can SELECT their own logs
- Service role can INSERT logs (server-side only)

## API Keys Security

### anon key (public)

- Safe to expose in frontend code
- Used for user-facing operations
- Restricted by RLS policies

### service_role key (private)

- **NEVER** expose to browser/frontend
- Used only in server-side code (API routes, Cloudflare Workers)
- Has full access to all tables
- Should be stored in server environment variables only

## Testing

To test the database integration locally without a live Supabase project:

1. Use the mock Supabase client in tests
2. See `src/lib/db/__tests__/projectRepository.test.ts` for examples

## Troubleshooting

### Migration failures

If a migration fails:

1. Check the error message in the Supabase dashboard
2. Ensure you're running migrations in the correct order
3. Verify your Supabase project has the latest schema

### Authentication errors

If you get authentication errors:

1. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
2. Ensure the user is signed in before making authenticated requests
3. Check RLS policies haven't been modified

### Free-tier project pausing

Supabase free-tier projects may pause after inactivity. To resume:

1. Log into the Supabase dashboard
2. Click "Resume Project"
3. Wait for the project to become active

See: https://supabase.com/docs/guides/platform/free-project-pausing

## Related Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
