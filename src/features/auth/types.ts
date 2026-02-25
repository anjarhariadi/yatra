import { type User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  loading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
}

export interface ResetPasswordCredentials {
  email: string
}

export interface NewPasswordCredentials {
  password: string
  confirmPassword: string
}
