import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseEnvironment {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

export function loadSupabaseEnv(): SupabaseEnvironment {
  const url = process.env.SUPABASE_URL?.trim()
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim()

  if (!url) {
    throw new Error(
      'Supabase URL is not configured. Set SUPABASE_URL environment variable.',
    )
  }

  if (!anonKey) {
    throw new Error(
      'Supabase anon key is not configured. Set SUPABASE_ANON_KEY environment variable.',
    )
  }

  return {
    url,
    anonKey,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined,
  }
}

export function createSupabaseClient(
  env: SupabaseEnvironment,
  options?: { isServerSide?: boolean },
): SupabaseClient {
  if (options?.isServerSide && !env.serviceRoleKey) {
    throw new Error(
      'Service role operations require SUPABASE_SERVICE_ROLE_KEY environment variable.',
    )
  }

  return createClient(
    env.url,
    options?.isServerSide ? env.serviceRoleKey! : env.anonKey,
    {
      auth: {
        persistSession: !options?.isServerSide,
      },
    },
  )
}

export function createPublicClient(): SupabaseClient {
  const env = loadSupabaseEnv()
  return createSupabaseClient(env, { isServerSide: false })
}

export function createServerClient(): SupabaseClient {
  const env = loadSupabaseEnv()
  return createSupabaseClient(env, { isServerSide: true })
}
