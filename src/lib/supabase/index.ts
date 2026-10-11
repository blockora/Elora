/**
 * Supabase client and authentication utilities for Elora
 *
 * This module provides:
 * - Supabase client configuration (server-side and client-side)
 * - Authentication service with sign-in/sign-up/sign-out
 * - Auth state management
 *
 * Environment variables required:
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY (server-side only)
 *
 * See .env.example and supabase/README.md for setup instructions.
 */

export {
  createSupabaseClient,
  createPublicClient,
  createServerClient,
  loadSupabaseEnv,
  type SupabaseEnvironment,
} from './config'
export {
  createAuthService,
  validateAuthConfig,
  type AuthService,
  type AuthState,
  type AuthConfig,
} from './auth'
