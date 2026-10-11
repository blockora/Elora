import { describe, expect, it } from 'vitest'
import { validateAuthConfig, type AuthConfig } from '../auth'

describe('Auth configuration validation', () => {
  it('passes validation with valid config', () => {
    const config: AuthConfig = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-anon-key',
    }

    expect(() => validateAuthConfig(config)).not.toThrow()
  })

  it('throws when supabaseUrl is missing', () => {
    const config: AuthConfig = {
      supabaseUrl: '',
      supabaseAnonKey: 'test-anon-key',
    }

    expect(() => validateAuthConfig(config)).toThrow(
      'Supabase URL is required for authentication',
    )
  })

  it('throws when supabaseAnonKey is missing', () => {
    const config: AuthConfig = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: '',
    }

    expect(() => validateAuthConfig(config)).toThrow(
      'Supabase anon key is required for authentication',
    )
  })
})
