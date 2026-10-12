/**
 * Server-side authentication verification for the Elora API.
 *
 * Verifies Supabase user sessions server-side using getClaims() with a
 * server-side Supabase client configured with the anon/publishable key.
 *
 * Design notes:
 * - Uses the anon/publishable key, NOT the service-role key. The anon key
 *   is public by design and safe to use server-side for JWT verification.
 * - Never exposes the service-role key to the browser or to this module's
 *   verification path.
 * - Fails closed: no token or invalid token -> 401 Unauthorized.
 * - Dev/test mode (requireAuth: false) skips verification entirely.
 * - The user's access token is passed via the Authorization header.
 * - getClaims verifies the JWT signature (locally via cached JWKS for
 *   asymmetric keys, via Auth server for symmetric HS256) and returns
 *   decoded claims including the user's sub (UUID).
 *
 * Reference: https://supabase.com/docs/guides/auth/server-side/creating-a-client
 *            https://supabase.com/docs/reference/javascript/auth-getclaims
 */

import { createClient, type Session } from '@supabase/supabase-js'

export interface AuthenticatedContext {
  /** Verified Supabase user ID from the access token claims. */
  userId: string
  /** The full session object, if available. */
  session: Session | null
}

export interface AuthVerificationOptions {
  /**
   * Supabase project URL.
   * Required when requireAuth is enabled.
   */
  supabaseUrl: string
  /**
   * Supabase anon/publishable key.
   * Required when requireAuth is enabled.
   * This is a public key; it is safe to use server-side for JWT verification.
   * It is NOT a JWT signing secret and must never be treated as one.
   */
  supabaseAnonKey: string
  /**
   * When true, API requests must include a valid Supabase access token.
   * When false (development/default), authentication is skipped.
   */
  requireAuth: boolean
}

/**
 * Extract a bearer token from the Authorization header.
 */
export function extractBearerToken(request: Request): string | undefined {
  const authorization = request.headers.get('authorization')
  if (!authorization) return undefined
  // Match "Bearer <token>" case-insensitively
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1]
}

/**
 * Create a server-side Supabase client for token verification.
 *
 * This client uses the anon key and is configured to NOT persist sessions
 * (we verify each request independently). It does NOT use the service-role
 * key anywhere.
 */
function createVerificationClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
): ReturnType<typeof createClient> {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

/**
 * Verify a Supabase access token and return the authenticated context.
 *
 * Returns undefined when the token is missing, expired, invalid, or when
 * verification fails for any reason. Callers should treat undefined as
 * "unauthenticated" and respond with 401.
 */
export async function verifySupabaseToken(
  token: string,
  options: AuthVerificationOptions,
): Promise<AuthenticatedContext | undefined> {
  const supabase = createVerificationClient(
    options.supabaseUrl,
    options.supabaseAnonKey,
  )

  try {
    // getClaims verifies the JWT signature and returns decoded claims.
    // For asymmetric keys, this is local via cached JWKS.
    // For symmetric HS256 keys, it falls back to the Auth server.
    const { data, error } = await supabase.auth.getClaims(token)

    if (error || !data?.claims) {
      return undefined
    }

    const userId = data.claims.sub
    if (!userId) {
      return undefined
    }

    // Also fetch the session for richer context (optional but useful).
    // getUser does an Auth-server round-trip and can detect revoked sessions.
    // We only use it for session detail, not as the primary auth check.
    let session: Session | null = null
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      session = sessionData.session
    } catch {
      // Session fetch is best-effort; don't fail auth if it errors.
    }

    return { userId, session }
  } catch {
    // Any unexpected error during verification -> treat as unauthenticated.
    return undefined
  }
}

/**
 * Middleware-like helper: verify auth if required, otherwise allow the
 * request through (dev/test mode).
 *
 * Returns:
 * - { allowed: true, context: AuthenticatedContext } when auth succeeds
 *   or is not required.
 * - { allowed: false } when auth is required but verification fails.
 */
export async function verifyAuthIfRequired(
  request: Request,
  options: AuthVerificationOptions,
): Promise<
  | { allowed: true; context: AuthenticatedContext }
  | { allowed: false; reason: 'missing_token' | 'invalid_token' }
> {
  if (!options.requireAuth) {
    // Dev/test mode: skip authentication.
    return {
      allowed: true,
      context: undefined as unknown as AuthenticatedContext,
    }
  }

  const token = extractBearerToken(request)
  if (!token) {
    return { allowed: false, reason: 'missing_token' }
  }

  const context = await verifySupabaseToken(token, options)
  if (!context) {
    return { allowed: false, reason: 'invalid_token' }
  }

  return { allowed: true, context }
}
