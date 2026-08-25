"use client"

import { authClient } from '../api/auth-client'
import type { User } from 'better-auth'

export function useSession() {
  const { data, isPending } = authClient.useSession()

  return {
    user: (data?.user as User | undefined) ?? null,
    loading: isPending,
  }
}
