import { createClient, type Session, type User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: Error | null
}

export interface AuthService {
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>
  signUpWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  getCurrentUser: () => Promise<User | null>
  getSession: () => Promise<Session | null>
  onAuthStateChange: (callback: (state: AuthState) => void) => () => void
}

export interface AuthConfig {
  supabaseUrl: string
  supabaseAnonKey: string
}

export function createAuthService(config: AuthConfig): AuthService {
  const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)

  return {
    signInWithEmail: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    },

    signUpWithEmail: async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    },

    getCurrentUser: async () => {
      const { data } = await supabase.auth.getUser()
      return data.user
    },

    getSession: async () => {
      const { data } = await supabase.auth.getSession()
      return data.session
    },

    onAuthStateChange: (callback: (state: AuthState) => void) => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_, session) => {
        callback({
          user: session?.user ?? null,
          session,
          isLoading: false,
          error: null,
        })
      })

      return () => subscription.unsubscribe()
    },
  }
}

export function validateAuthConfig(config: AuthConfig): void {
  if (!config.supabaseUrl) {
    throw new Error('Supabase URL is required for authentication')
  }
  if (!config.supabaseAnonKey) {
    throw new Error('Supabase anon key is required for authentication')
  }
}
