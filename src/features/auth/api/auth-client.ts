import { createClient } from '@/lib/supabase/client'
import type { LoginCredentials, RegisterCredentials, ResetPasswordCredentials, NewPasswordCredentials } from '../types'

export async function login(credentials: LoginCredentials) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function register(credentials: RegisterCredentials) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      emailRedirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function resetPassword(credentials: ResetPasswordCredentials) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(credentials.email, {
    redirectTo: `${window.location.origin}/new-password`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function updatePassword(credentials: NewPasswordCredentials) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.updateUser({
    password: credentials.password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

export async function getSession() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return data.session
}

export async function getUser() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  return data.user
}
