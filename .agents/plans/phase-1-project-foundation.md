# Feature: Phase 1 - Project Foundation

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Set up the foundational infrastructure for the Yatra personal finance tracker application. This includes:
- Initializing Next.js 15 project with TypeScript, Tailwind CSS, ESLint
- Configuring shadcn/ui component library
- Setting up Prisma ORM with PostgreSQL schema
- Configuring Supabase authentication (client and server)
- Creating protected route middleware
- Building base layout with sidebar navigation
- Environment configuration

## User Story

As a developer
I want a fully scaffolded project with authentication infrastructure
So that I can implement the finance tracking features on a solid foundation

## Problem Statement

The project has no code - only documentation (AGENTS.md, PRD.md) exists. Need to create the complete project structure with all dependencies, configuration, and base infrastructure before implementing features.

## Solution Statement

Use official CLI tools to scaffold Next.js 15, add shadcn/ui, configure Prisma with the schema from PRD, set up Supabase auth helpers with middleware, and create the initial layout components. This follows the implementation pattern from PRD Phase 1.

## Feature Metadata

**Feature Type**: New Capability (Foundation)
**Estimated Complexity**: High
**Primary Systems Affected**: Project scaffold, dependencies, auth system, layout
**Dependencies**: Node.js 18+, npm/pnpm

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `.opencode/PRD.md` (lines 1-731) - Full PRD with database schema, architecture, tech stack
- `AGENTS.md` (lines 1-156) - Project conventions, commands, structure

### New Files to Create

The following is the complete target structure after Phase 1:

```
yatra/
├── .env.example                    # Environment template
├── package.json                     # Dependencies
├── next.config.ts                   # Next.js config
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts               # Tailwind config (if needed for v3, otherwise skip)
├── postcss.config.mjs               # PostCSS config
├── eslint.config.mjs                # ESLint config
├── prisma/
│   └── schema.prisma                # Database schema
├── public/                          # Static assets
└── src/
    ├── app/
    │   ├── globals.css               # Global styles
    │   ├── layout.tsx                # Root layout
    │   ├── page.tsx                  # Redirect or landing
    │   ├── (auth)/
    │   │   ├── login/
    │   │   │   └── page.tsx          # Login page
    │   │   ├── register/
    │   │   │   └── page.tsx          # Register page
    │   │   └── layout.tsx            # Auth layout
    │   ├── (dashboard)/
    │   │   ├── layout.tsx            # Dashboard layout with sidebar
    │   │   └── page.tsx              # Dashboard home
    │   └── api/
    │       └── auth/
    │           └── [...nextauth]/route.ts  # Auth callback route
    ├── components/
    │   ├── ui/                       # shadcn components
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   └── ...
    │   └── layout/
    │       ├── sidebar.tsx           # Navigation sidebar
    │       └── header.tsx            # Top header
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts              # Browser client
    │   │   ├── server.ts              # Server client
    │   │   └── types.ts               # Supabase types
    │   ├── prisma/
    │   │   └── client.ts              # Prisma client singleton
    │   └── utils.ts                   # Utility functions (cn, formatting)
    └── types/
        └── index.ts                   # Global types
```

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Next.js 15 App Router Setup](https://nextjs.org/docs/app/getting-started)
  - Creating new project with TypeScript and Tailwind
  - Why: Required for project scaffold

- [shadcn/ui Installation](https://ui.shadcn.com/docs/installation/next)
  - `npx shadcn@latest init` command
  - Adding components: `npx shadcn@latest add button card input ...`
  - Why: UI component library for the app

- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
  - Setting up @supabase/ssr package
  - Cookie-based session handling
  - Why: Authentication infrastructure

- [Prisma with Next.js](https://www.prisma.io/docs/guides/authentication/better-auth/nextjs)
  - Setting up Prisma client singleton
  - Database schema and migrations
  - Why: ORM for database operations

---

## IMPLEMENTATION PLAN

### Phase 1: Project Setup

**Tasks:**

- Initialize Next.js 15 project with TypeScript, Tailwind, ESLint
- Install additional dependencies (Prisma, Supabase SSR, shadcn/ui, utilities)
- Configure project settings and environment files
- Initialize shadcn/ui with custom theme
- Add required shadcn components

### Phase 2: Database & ORM

**Tasks:**

- Create Prisma schema based on PRD (User, Category, Wallet, Record models)
- Generate Prisma client
- Create Prisma client singleton for Next.js

### Phase 3: Supabase Authentication

**Tasks:**

- Set up Supabase client (browser)
- Set up Supabase server client with cookie handling
- Create auth middleware for route protection
- Create auth callback route handler

### Phase 4: Layout & Navigation

**Tasks:**

- Create root layout with providers
- Create auth layout (login/register pages)
- Create dashboard layout with sidebar
- Add navigation components

### Phase 5: Core Pages

**Tasks:**

- Create login page with form
- Create register page with form
- Create dashboard home page
- Add auth redirect logic

---

## STEP-BY-Step TASKS

Execute every task in order, top to bottom. Each task is atomic and independently testable.

### Task 1: Initialize Next.js 15 Project

**CREATE package.json and project structure**

```bash
# Run from /home/alphaleonis/Dev/Project/Personal/yatra
npx create-next-app@latest yatra --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**ALTERNATIVE - If prompt issues:** Create manually with these key files:

**IMPLEMENT**: package.json with dependencies:
```json
{
  "name": "yatra",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "15.2.2",
    "@supabase/supabase-js": "^2.48.0",
    "@supabase/ssr": "^0.7.0",
    "@prisma/client": "^6.5.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.8.0",
    "lucide-react": "^0.475.0",
    "recharts": "^2.15.0",
    "react-hook-form": "^7.54.0",
    "zod": "^3.24.0",
    "@hookform/resolvers": "^3.9.0",
    "next-themes": "^0.4.4"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "postcss": "^8.5.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "15.2.2",
    "prisma": "^6.5.0"
  }
}
```

**PATTERN**: Follow standard Next.js 15 project structure from official docs
**GOTCHA**: Tailwind CSS v4 uses different config approach - uses CSS variables in globals.css instead of tailwind.config.ts

---

### Task 2: Configure Environment Files

**CREATE .env.example and .env.local**

**IMPLEMENT**: Create `.env.example`:
```bash
# Supabase - User will need to create their own Supabase project
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database (for Prisma) - Connection string from Supabase
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
```

**PATTERN**: Never commit actual credentials - use .env.example as template

---

### Task 3: Set Up Tailwind CSS v4

**CREATE src/app/globals.css**

**IMPLEMENT**: Tailwind v4 setup with CSS variables:
```css
@import "tailwindcss";

@theme {
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
  
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
  
  @keyframes accordion-down {
    from { height: 0; }
    to { height: var(--radix-accordion-content-height); }
  }
  
  @keyframes accordion-up {
    from { height: var(--radix-accordion-content-height); }
    to { height: 0; }
  }
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    
    --radius: 0.5rem;
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**GOTCHA**: Tailwind v4 uses @import "tailwindcss" and @theme for customization - no tailwind.config.ts needed

---

### Task 4: Initialize shadcn/ui

**RUN shadcn init**

```bash
cd yatra
npx shadcn@latest init -y -d
```

**ADD required components:**
```bash
npx shadcn@latest add button card input label form textarea select dropdown-menu avatar sheet separator toast -y
```

**PATTERN**: Components go in `src/components/ui/` directory

---

### Task 5: Create Prisma Schema

**CREATE prisma/schema.prisma**

**IMPLEMENT**: Database schema from PRD:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum CategoryType {
  IDLE_CASH
  HOT_CASH
  EMERGENCY_FUND
}

model User {
  id         String     @id @default(cuid())
  email      String     @unique
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  wallets    Wallet[]
  categories Category[]
  records    Record[]
}

model Category {
  id        String       @id @default(cuid())
  name      String
  type      CategoryType
  isDefault Boolean      @default(false)
  userId    String
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  wallets   Wallet[]
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  @@unique([name, userId])
  @@index([userId])
}

model Wallet {
  id         String     @id @default(cuid())
  name       String
  notes      String?
  userId     String
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId String
  category   Category   @relation(fields: [categoryId], references: [id])

  records    Record[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  @@index([userId])
  @@index([categoryId])
}

model Record {
  id        String   @id @default(cuid())
  amount    Decimal  @db.Decimal(15, 2)
  date      DateTime
  notes     String?
  walletId  String
  wallet    Wallet   @relation(fields: [walletId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([walletId])
  @@index([date])
}
```

**PATTERN**: Use Decimal for money - never Float
**GOTCHA**: Run `npx prisma generate` after creating schema

---

### Task 6: Create Prisma Client Singleton

**CREATE src/lib/prisma/client.ts**

**IMPLEMENT**: Singleton pattern for Next.js:
```typescript
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
```

**PATTERN**: Prevents multiple Prisma client instances in development

---

### Task 7: Create Supabase Clients

**CREATE src/lib/supabase/client.ts**

**IMPLEMENT**: Browser client:
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**CREATE src/lib/supabase/server.ts**

**IMPLEMENT**: Server client with cookies:
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
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  )
}
```

**CREATE src/lib/supabase/types.ts**

**IMPLEMENT**: TypeScript types (will be generated by Supabase CLI or manual):
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type CategoryType = 'IDLE_CASH' | 'HOT_CASH' | 'EMERGENCY_FUND'

export interface Database {
  public: {
    Tables: {
      user: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      category: {
        Row: {
          id: string
          name: string
          type: CategoryType
          is_default: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: CategoryType
          is_default?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: CategoryType
          is_default?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      wallet: {
        Row: {
          id: string
          name: string
          notes: string | null
          user_id: string
          category_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          notes?: string | null
          user_id: string
          category_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          notes?: string | null
          user_id?: string
          category_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      record: {
        Row: {
          id: string
          amount: number
          date: string
          notes: string | null
          wallet_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          amount: number
          date: string
          notes?: string | null
          wallet_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          amount?: number
          date?: string
          notes?: string | null
          wallet_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}
```

**PATTERN**: Use @supabase/ssr package (not @supabase/auth-helpers) - current maintained version

---

### Task 8: Create Auth Middleware

**CREATE src/middleware.ts**

**IMPLEMENT**: Route protection:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**PATTERN**: Use middleware to check auth state and redirect accordingly
**GOTCHA**: Must handle cookie getAll/setAll properly for server-client communication

---

### Task 9: Create Utility Functions

**CREATE src/lib/utils.ts**

**IMPLEMENT**: Common utilities:
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}
```

---

### Task 10: Create Theme Provider

**CREATE src/components/theme-provider.tsx**

**IMPLEMENT**: Dark mode support:
```typescript
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

---

### Task 11: Create Root Layout

**CREATE src/app/layout.tsx**

**IMPLEMENT**: Root layout with providers:
```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Yatra - Personal Finance Tracker",
  description: "Track your money across multiple wallets",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

### Task 12: Create Auth Layout

**CREATE src/app/(auth)/layout.tsx**

**IMPLEMENT**: Auth pages layout:
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        {children}
      </div>
    </div>
  )
}
```

---

### Task 13: Create Login Page

**CREATE src/app/(auth)/login/page.tsx**

**IMPLEMENT**: Login form with Supabase auth:
```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your email and password to sign in</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-sm text-center">
            Don't have an account?{" "}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
```

---

### Task 14: Create Register Page

**CREATE src/app/(auth)/register/page.tsx**

**IMPLEMENT**: Registration form:
```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/login")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Enter your email and password to sign up</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
          <p className="text-sm text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
```

---

### Task 15: Create Dashboard Layout with Sidebar

**CREATE src/app/(dashboard)/layout.tsx**

**IMPLEMENT**: Dashboard layout with navigation:
```typescript
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  Tags, 
  Download, 
  LogOut,
  Menu
} from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login")
  }

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/accounts", icon: Wallet, label: "Wallets" },
    { href: "/records", icon: Receipt, label: "Records" },
    { href: "/categories", icon: Tags, label: "Categories" },
    { href: "/export", icon: Download, label: "Export" },
  ]

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Yatra</h1>
          <p className="text-sm text-muted-foreground">Finance Tracker</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <form action={handleSignOut}>
            <Button variant="ghost" className="w-full justify-start" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
```

---

### Task 16: Create Dashboard Home Page

**CREATE src/app/(dashboard)/page.tsx**

**IMPLEMENT**: Dashboard with welcome message:
```typescript
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## TESTING STRATEGY

### Manual Testing

- Verify login page loads at /login
- Verify register page loads at /register
- Test user registration flow
- Test login with valid credentials redirects to dashboard
- Test login with invalid credentials shows error
- Test protected routes redirect unauthenticated users to /login
- Verify dashboard layout with sidebar renders
- Verify logout works and redirects to /login

### Validation Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run lint
npm run lint

# Run type check
npm run typecheck

# Build project
npm run build

# Start development server
npm run dev
```

---

## ACCEPTANCE CRITERIA

- [ ] Next.js 15 project scaffolded with TypeScript and Tailwind
- [ ] shadcn/ui components installed and working
- [ ] Prisma schema created with all models (User, Category, Wallet, Record)
- [ ] Prisma client generated and singleton working
- [ ] Supabase client and server client configured
- [ ] Auth middleware protecting routes
- [ ] Login page with form validation
- [ ] Register page with form validation
- [ ] Dashboard layout with sidebar navigation
- [ ] Logout functionality working
- [ ] All pages render without errors
- [ ] npm run lint passes
- [ ] npm run typecheck passes
- [ ] npm run build succeeds

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration)
- [ ] No linting or type checking errors
- [ ] Manual testing confirms feature works
- [ ] Acceptance criteria all met
- [ ] Code reviewed for quality and maintainability

---

## NOTES

- **User Supabase Project**: The user needs to create their own Supabase project and provide credentials. The app won't fully function until they add their Supabase URL and anon key to .env.local
- **Prisma Migration**: After adding DATABASE_URL, run `npx prisma db push` to create tables in Supabase
- **Default Categories**: The app should seed default categories (Idle Cash, Hot Cash, Emergency Fund) when a user first registers - this can be implemented in Phase 2
- **Tailwind v4**: Uses CSS-based configuration instead of JavaScript config files
- **Next.js 15.2.3+**: Ensure using version 15.2.3 or later to avoid CVE-2025-29927 vulnerability

