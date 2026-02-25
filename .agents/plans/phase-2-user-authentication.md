# Feature: User Authentication Completion

## Feature Description

Complete the user authentication system for Yatra finance tracker. The basic authentication flow (login/register) is already implemented, but several critical pieces are missing for a production-ready auth system:

1. **Auth callback handler** - Handles email confirmation links from Supabase
2. **Password reset functionality** - Allows users to reset their password
3. **Session sync hook** - Provides real-time auth state to client components
4. **Loading states** - Shows loading UI during auth checks
5. **Supabase RLS policies** - Database-level security for user data isolation
6. **User profile** - Shows current user info in the dashboard

## User Story

As a user
I want to sign up, log in, log out, and recover my password
So that I can securely access my private finance data

## Problem Statement

The current authentication implementation is incomplete:
- No auth callback route to handle email confirmation
- No password reset flow
- No way to sync auth state to client components in real-time
- No loading states during authentication checks
- Database Row Level Security (RLS) policies not configured
- User profile information not displayed

## Solution Statement

Implement missing authentication components:
1. Create `/api/auth/callback` route handler for email confirmation
2. Add password reset page and flow
3. Create `useSession` hook for client-side auth state
4. Add loading UI component and states
5. Provide Supabase SQL for RLS policies
6. Add user info to dashboard header

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: 
- Authentication flow
- Database security
- UI components
**Dependencies**: 
- @supabase/ssr
- @supabase/supabase-js
- Supabase project

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ THESE BEFORE IMPLEMENTING!

- `src/app/(auth)/login/page.tsx` (lines 1-84) - Existing login page pattern to follow
- `src/app/(auth)/register/page.tsx` (lines 1-105) - Existing register page pattern to follow  
- `src/app/(auth)/layout.tsx` (lines 1-13) - Auth layout structure
- `src/lib/supabase/client.ts` (lines 1-9) - Browser client creation
- `src/lib/supabase/server.ts` (lines 1-28) - Server client creation
- `src/middleware.ts` (lines 1-51) - Route protection pattern
- `src/app/(dashboard)/layout.tsx` (lines 1-72) - Dashboard layout with logout
- `prisma/schema.prisma` (lines 16-25) - User model structure

### New Files to Create

- `src/app/api/auth/callback/route.ts` - Auth callback handler
- `src/app/(auth)/reset-password/page.tsx` - Password reset page
- `src/hooks/use-session.ts` - Client-side session hook
- `src/components/ui/skeleton.tsx` - Loading skeleton (if not exists)
- `supabase/migrations/001_rls_policies.sql` - RLS policies SQL

### Relevant Documentation

- [Supabase Auth with Next.js App Router](https://docs-mwu5dxecz-supabase.vercel.app/docs/guides/auth/auth-helpers/nextjs)
  - Section: Managing session with middleware
  - Section: Creating a client
  - Why: Official guide for Supabase + Next.js auth patterns
  
- [Supabase Auth Callback Example](https://github.com/vercel/next.js/blob/canary/examples/with-supabase/app/auth/callback/route.ts)
  - Code exchange handler
  - Why: Reference implementation for email confirmation

- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
  - Why: Database-level security for user data isolation

### Patterns to Follow

**Component Structure:** (from login/page.tsx)
```typescript
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PageName() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  // ... implementation
}
```

**Server Client Pattern:** (from server.ts)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

**Naming Conventions:**
- Components: PascalCase (`LoginPage`, `ResetPasswordPage`)
- Files: kebab-case (`login/page.tsx`, `use-session.ts`)
- Hooks: camelCase with `use` prefix (`useSession`)
- Types: PascalCase from types.ts imports

---

## IMPLEMENTATION PLAN

### Phase 1: Auth Callback Handler

**Purpose:** Handle email confirmation links from Supabase

**Tasks:**
- Create API route for `/api/auth/callback`
- Implement code exchange from URL params
- Handle success/error states with redirects

### Phase 2: Password Reset Flow

**Purpose:** Allow users to recover forgotten passwords

**Tasks:**
- Create reset password request page
- Create new password page (after email link)
- Update register page to include redirectTo

### Phase 3: Client Session Hook

**Purpose:** Real-time auth state in client components

**Tasks:**
- Create `useSession` hook with Supabase auth listener
- Export session state and methods

### Phase 4: Loading States

**Purpose:** Better UX during auth checks

**Tasks:**
- Add loading skeleton components if needed
- Create auth loading page or suspense boundaries

### Phase 5: Database RLS Policies

**Purpose:** Database-level security

**Tasks:**
- Create SQL migration for RLS policies
- Document how to apply in Supabase dashboard

### Phase 6: User Profile Display

**Purpose:** Show current user in dashboard

**Tasks:**
- Update dashboard layout to show user email
- Add user avatar/icon placeholder

---

## STEP-BY-STEP TASKS

### Task Format Guidelines

Use information-dense keywords for clarity:
- **CREATE**: New files or components
- **UPDATE**: Modify existing files
- **ADD**: Insert new functionality into existing code

---

### CREATE src/app/api/auth/callback/route.ts

- **IMPLEMENT**: Auth callback route that handles email confirmation
- **PATTERN**: Follow Supabase official example at https://github.com/vercel/next.js/blob/canary/examples/with-supabase/app/auth/callback/route.ts
- **IMPORTS**: 
  ```typescript
  import { type EmailOtpType } from '@supabase/supabase-js'
  import { createClient } from '@/lib/supabase/server'
  import { type NextRequest, NextResponse } from 'next/server'
  import { redirect } from 'next/navigation'
  ```
- **GOTCHA**: Must use server client, handle both GET requests, exchange token_hash for session

---

### UPDATE src/app/(auth)/register/page.tsx

- **IMPLEMENT**: Add emailRedirectTo option to signUp call
- **PATTERN**: Add `options: { emailRedirectTo: ${location.origin}/api/auth/callback }`
- **FILE**: `src/app/(auth)/register/page.tsx:37-40`

---

### CREATE src/app/(auth)/reset-password/page.tsx

- **IMPLEMENT**: Password reset request page (send reset email)
- **PATTERN**: Mirror login page structure from `src/app/(auth)/login/page.tsx`
- **IMPORTS**: Same as login plus `Link` from next/link
- **FUNCTIONALITY**: 
  - Single email input field
  - Button to trigger `supabase.auth.resetPasswordForEmail(email, { redirectTo: ... })`
  - Success message after submission

---

### CREATE src/app/(auth)/new-password/page.tsx

- **IMPLEMENT**: New password page (after clicking email link)
- **PATTERN**: Mirror register page structure
- **FUNCTIONALITY**:
  - Password input
  - Confirm password input
  - Submit calls `supabase.auth.updateUser({ password })`
  - Redirect to dashboard on success

---

### CREATE src/hooks/use-session.ts

- **IMPLEMENT**: Client-side session hook with real-time updates
- **PATTERN**:
  ```typescript
  "use client"
  import { useEffect, useState } from "react"
  import { createClient } from "@/lib/supabase/client"
  import { type User } from "@supabase/supabase-js"
  
  export function useSession() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
  
    useEffect(() => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })
      return () => subscription.unsubscribe()
    }, [])
  
    return { user, loading }
  }
  ```
- **FILE**: Create in `src/hooks/` directory (may need to create hooks folder)

---

### CREATE src/components/ui/skeleton.tsx

- **IMPLEMENT**: Loading skeleton component (if not already in shadcn)
- **PATTERN**: Standard shadcn skeleton pattern using cn utility

---

### CREATE supabase/migrations/001_rls_policies.sql

- **IMPLEMENT**: SQL for Row Level Security policies
- **CONTENT**:
  ```sql
  -- Enable RLS on all tables
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
  
  -- Users can only access their own data
  CREATE POLICY "Users can view own users" ON users FOR SELECT USING (auth.uid() = id);
  CREATE POLICY "Users can insert own users" ON users FOR INSERT WITH CHECK (auth.uid() = id);
  CREATE POLICY "Users can update own users" ON users FOR UPDATE USING (auth.uid() = id);
  
  CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can view own wallets" ON wallets FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own wallets" ON wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own wallets" ON wallets FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete own wallets" ON wallets FOR DELETE USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can view own records" ON records FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own records" ON records FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own records" ON records FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete own records" ON records FOR DELETE USING (auth.uid() = user_id);
  ```
- **GOTCHA**: This SQL should be run in Supabase dashboard SQL editor or via migration

---

### UPDATE src/app/(dashboard)/layout.tsx

- **IMPLEMENT**: Show user email in sidebar header
- **PATTERN**: Add user email display near the Yatra logo
- **FILE**: `src/app/(dashboard)/layout.tsx:44-47`
- **IMPORTS**: May need to import User type from @supabase/supabase-js

---

### UPDATE src/app/(auth)/login/page.tsx

- **IMPLEMENT**: Add link to forgot password page
- **FILE**: After password input, add "Forgot password?" link to `/reset-password`
- **PATTERN**: Similar to existing "Don't have an account?" link

---

## TESTING STRATEGY

### Manual Testing

1. **Register Flow:**
   - Navigate to /register
   - Enter email and password
   - Submit and check for redirect to login (if no email confirmation)
   - Or check email for confirmation link (if confirmation enabled)

2. **Login Flow:**
   - Navigate to /login
   - Enter credentials
   - Verify redirect to dashboard
   - Verify user email shown in sidebar

3. **Logout Flow:**
   - Click Sign Out button
   - Verify redirect to login
   - Verify cannot access dashboard without login

4. **Password Reset:**
   - Navigate to /reset-password
   - Enter email
   - Check for success message
   - If email received, click link and set new password

5. **Protected Routes:**
   - Try to access / without login → should redirect to /login
   - Try to access /login while logged in → should redirect to /

---

## VALIDATION COMMANDS

### Level 1: Syntax & Type Check

```bash
npm run typecheck
```

### Level 2: Lint

```bash
npm run lint
```

### Level 3: Build

```bash
npm run build
```

### Level 4: Manual Testing

1. Start dev server: `npm run dev`
2. Test registration flow
3. Test login/logout flow
4. Test password reset (if email configured)
5. Verify RLS policies applied in Supabase

---

## ACCEPTANCE CRITERIA

- [ ] Auth callback route exists at /api/auth/callback
- [ ] Users can register and receive confirmation (if enabled)
- [ ] Users can log in and are redirected to dashboard
- [ ] Users can log out and are redirected to login
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Authenticated users redirected away from login/register
- [ ] Password reset flow works (request + set new password)
- [ ] User email displayed in dashboard sidebar
- [ ] Loading states shown during auth checks
- [ ] RLS policies can be applied to Supabase database
- [ ] All validation commands pass (lint, typecheck, build)

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] No linting or type checking errors
- [ ] Manual testing confirms auth flows work
- [ ] Acceptance criteria all met

---

## NOTES

1. **Email Confirmation**: By default Supabase may require email confirmation. The current register page redirects to /login after signup - this works if email confirmation is disabled. If enabled, users need to confirm via email first.

2. **Password Reset**: Full password reset requires email to be configured in Supabase. In development, you can disable email confirmation in Supabase dashboard.

3. **RLS Policies**: The SQL file should be run manually in Supabase dashboard SQL editor. Document this in the project README.

4. **Environment**: Ensure .env.local has valid Supabase credentials before testing.

5. **Next.js CVE-2025-29927**: There's a known middleware bypass vulnerability in Next.js. Defense-in-depth is already implemented via server-side auth checks in dashboard layout (line 22-24).
