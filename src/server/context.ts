import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import prisma from '@/lib/prisma/client'

export interface Context {
  db: typeof prisma
  supabase: SupabaseClient
  user: User | null
}

export async function createContext(): Promise<Context> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Not needed for tRPC context
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return {
    db: prisma,
    supabase,
    user,
  }
}
