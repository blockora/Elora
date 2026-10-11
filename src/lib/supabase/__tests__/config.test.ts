import { describe, expect, it, vi, beforeEach } from 'vitest'
import { loadSupabaseEnv } from '../config'

// Mock environment
beforeEach(() => {
  vi.resetModules()
  process.env.SUPABASE_URL = ''
  process.env.SUPABASE_ANON_KEY = ''
  process.env.SUPABASE_SERVICE_ROLE_KEY = ''
})

describe('Supabase configuration', () => {
  it('throws when SUPABASE_URL is missing', () => {
    expect(() => loadSupabaseEnv()).toThrow('Supabase URL is not configured')
  })

  it('throws when SUPABASE_ANON_KEY is missing', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co'
    expect(() => loadSupabaseEnv()).toThrow(
      'Supabase anon key is not configured',
    )
  })

  it('loads environment correctly when configured', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'test-anon-key'

    const env = loadSupabaseEnv()

    expect(env.url).toBe('https://test.supabase.co')
    expect(env.anonKey).toBe('test-anon-key')
    expect(env.serviceRoleKey).toBeUndefined()
  })

  it('loads service role key when configured', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

    const env = loadSupabaseEnv()

    expect(env.serviceRoleKey).toBe('test-service-key')
  })

  it('trims whitespace from environment variables', () => {
    process.env.SUPABASE_URL = '  https://test.supabase.co  '
    process.env.SUPABASE_ANON_KEY = '  test-anon-key  '

    const env = loadSupabaseEnv()

    expect(env.url).toBe('https://test.supabase.co')
    expect(env.anonKey).toBe('test-anon-key')
  })
})
