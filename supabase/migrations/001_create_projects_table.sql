-- Migration: Create projects table
-- Stores user-owned website projects with their current specifications

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CONSTRAINT projects_name_max_length CHECK (char_length(name) <= 80),
    description TEXT CONSTRAINT projects_description_max_length CHECK (char_length(description) <= 240),
    project_spec JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient owner-based lookups
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- No ID change expected for projects, but enforce it anyway
CREATE OR REPLACE TRIGGER validate_projects_id_unchanged
    BEFORE UPDATE ON projects
    FOR EACH ROW
    WHEN (OLD.id IS DISTINCT FROM NEW.id)
    EXECUTE FUNCTION raise_exception('Project ID cannot be changed');

CREATE OR REPLACE FUNCTION raise_exception(msg TEXT)
RETURNS TEXT AS $$
BEGIN
    RAISE EXCEPTION '%', msg;
END;
$$ LANGUAGE plpgsql;
