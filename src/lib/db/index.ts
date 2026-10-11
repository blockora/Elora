/**
 * Database layer for Supabase integration
 *
 * This module provides types and utilities for interacting with the Supabase database.
 * Full implementation requires a configured Supabase project with the migrations
 * from supabase/migrations/ applied.
 *
 * For local development and testing, use the mock implementations or
 * the test doubles in the __tests__ directory.
 */

export interface DatabaseSchema {
  // Projects table
  projects: {
    id: string
    owner_id: string
    name: string
    description: string | null
    project_spec: unknown
    created_at: string
    updated_at: string
  }

  // Project versions table
  project_versions: {
    id: string
    project_id: string
    owner_id: string
    version_number: number
    spec_snapshot: unknown
    change_summary: string | null
    created_at: string
  }

  // Generation logs table
  generation_logs: {
    id: string
    owner_id: string | null
    provider: 'mock' | 'gemini'
    model: string | null
    status: 'success' | 'error' | 'timeout' | 'quota_exceeded' | 'rate_limited'
    duration_ms: number | null
    error_code: string | null
    created_at: string
  }
}

// Re-export types from schema
export type { WebsiteSpec } from '../../features/website/schema'
