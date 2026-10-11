-- Migration: Create generation_logs table
-- Stores minimal generation metadata for troubleshooting
-- Does NOT store full prompts or generated content

CREATE TABLE IF NOT EXISTS generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    provider TEXT NOT NULL CONSTRAINT generation_logs_provider_check CHECK (provider IN ('mock', 'gemini')),
    model TEXT,
    status TEXT NOT NULL CONSTRAINT generation_logs_status_check CHECK (status IN ('success', 'error', 'timeout', 'quota_exceeded', 'rate_limited')),
    duration_ms INTEGER,
    error_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient owner-based queries
CREATE INDEX IF NOT EXISTS idx_generation_logs_owner_id ON generation_logs(owner_id);

-- Index for status-based queries
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON generation_logs(status);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON generation_logs(created_at DESC);

-- Enable RLS
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY generation_logs_select_own ON generation_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = owner_id);

-- Service role can view all logs (for debugging)
CREATE POLICY generation_logs_service_role_all ON generation_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Insert policy for server-side logging
CREATE POLICY generation_logs_insert ON generation_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);
