-- Migration: Create project_versions table
-- Stores version snapshots for project history and recovery

CREATE TABLE IF NOT EXISTS project_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    spec_snapshot JSONB NOT NULL,
    change_summary TEXT CONSTRAINT project_versions_change_summary_max_length CHECK (char_length(change_summary) <= 240),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT project_versions_unique_version_per_project UNIQUE (project_id, version_number),
    CONSTRAINT project_versions_owner_matches_project CHECK (
        EXISTS (
            SELECT 1 FROM projects p WHERE p.id = project_versions.project_id AND p.owner_id = project_versions.owner_id
        )
    )
);

-- Index for efficient version lookup by project
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);

-- Index for efficient version ordering
CREATE INDEX IF NOT EXISTS idx_project_versions_version_number ON project_versions(project_id, version_number DESC);

-- Trigger to validate owner matches project on insert
CREATE OR REPLACE TRIGGER validate_project_versions_owner
    BEFORE INSERT OR UPDATE ON project_versions
    FOR EACH ROW
    EXECUTE FUNCTION validate_project_version_owner();

CREATE OR REPLACE FUNCTION validate_project_version_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Verify the owner_id matches the project's owner
    IF NOT EXISTS (
        SELECT 1 FROM projects p WHERE p.id = NEW.project_id AND p.owner_id = NEW.owner_id
    ) THEN
        RAISE EXCEPTION 'Owner ID does not match project owner';
    END IF;
    
    -- Auto-increment version number if not provided
    IF NEW.version_number IS NULL THEN
        SELECT COALESCE(MAX(version_number), 0) + 1 INTO NEW.version_number
        FROM project_versions
        WHERE project_id = NEW.project_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
