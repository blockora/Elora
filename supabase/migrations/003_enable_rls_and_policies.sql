-- Migration: Enable Row Level Security and define access policies
-- Ensures users can only access their own projects and versions

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Enable RLS on project_versions table
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROJECTS TABLE POLICIES
-- ============================================

-- Users can view their own projects
CREATE POLICY projects_select_own ON projects
    FOR SELECT
    TO authenticated
    USING (auth.uid() = owner_id);

-- Users can insert their own projects
CREATE POLICY projects_insert_own ON projects
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- Users can update their own projects
CREATE POLICY projects_update_own ON projects
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own projects
CREATE POLICY projects_delete_own ON projects
    FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- ============================================
-- PROJECT VERSIONS TABLE POLICIES
-- ============================================

-- Users can view versions of their own projects
CREATE POLICY project_versions_select_own ON project_versions
    FOR SELECT
    TO authenticated
    USING (
        owner_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM projects p WHERE p.id = project_versions.project_id AND p.owner_id = auth.uid()
        )
    );

-- Users can insert versions for their own projects
CREATE POLICY project_versions_insert_own ON project_versions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        owner_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM projects p WHERE p.id = project_versions.project_id AND p.owner_id = auth.uid()
        )
    );

-- Users cannot update versions directly (versions are immutable snapshots)
-- No UPDATE policy = no updates allowed via RLS

-- Users can delete versions of their own projects (e.g., cleanup)
CREATE POLICY project_versions_delete_own ON project_versions
    FOR DELETE
    TO authenticated
    USING (
        owner_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM projects p WHERE p.id = project_versions.project_id AND p.owner_id = auth.uid()
        )
    );

-- ============================================
-- SERVICE ROLE POLICIES (for server-side operations)
-- ============================================
-- Note: Service role bypasses RLS by default, but we add explicit policies
-- for clarity and to document expected server-side operations

-- Service role can perform all operations (used by backend API)
CREATE POLICY projects_service_role_all ON projects
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY project_versions_service_role_all ON project_versions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
