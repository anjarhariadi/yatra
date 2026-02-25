# AGENTS.md

This file provides guidance to Agents when working with code in this repository.

---

## Project Overview

**Yatra** is a personal finance tracker web app for managing money across multiple wallets/accounts. Users periodically add balance records, and the app displays the latest balance as current. Features include category management (idle cash, hot cash, emergency fund), pie charts for distribution, line charts for history, and data export.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with App Router |
| TypeScript | Type safety |
| Prisma | ORM for database |
| Supabase | Auth + PostgreSQL database |
| shadcn/ui | Component library |
| Tailwind CSS | Styling |
| Recharts | Charts (pie, line) |
| React Hook Form | Form handling |
| Zod | Schema validation |

---

## Commands

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npm run typecheck

# Database
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to database
npx prisma studio      # Open Prisma Studio
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/      # Protected routes
│   │   ├── accounts/     # Wallet management
│   │   ├── records/      # Balance records
│   │   ├── categories/   # Category management
│   │   ├── export/       # Data export
│   │   └── page.tsx      # Dashboard
│   └── api/              # API routes
├── components/            # Shared components
│   ├── ui/               # shadcn components
│   ├── layout/           # Sidebar, header
│   └── charts/           # Pie, line charts
├── features/             # Feature-based organization
│   ├── accounts/         # Wallet feature
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types.ts
│   ├── records/         # Balance record feature
│   ├── categories/      # Category feature
│   └── export/           # Export feature
├── lib/                  # Utilities
│   ├── supabase/         # Supabase client
│   ├── prisma/           # Prisma client
│   └── utils.ts
├── hooks/                # Global hooks
└── prisma/
    └── schema.prisma     # Database schema
```

---

## Architecture

- **Feature-based**: All code (API, components, hooks, types) grouped by feature in `/src/features`
- **App Router**: Next.js 15 with route groups `(auth)` and `(dashboard)`
- **Server Actions**: Use for data mutations where appropriate
- **RLS**: Row Level Security on all Supabase tables for data isolation

---

## Code Patterns

### Naming Conventions
- PascalCase for components and types: `AccountCard`, `WalletForm`
- camelCase for functions and variables: `getAccounts`, `currentBalance`
- kebab-case for file names: `account-card.tsx`, `use-accounts.ts`

### File Organization
- Each feature has: `api/`, `components/`, `hooks/`, `types.ts`, `index.ts`
- Shared components in `/components`
- shadcn components in `/components/ui`

### Error Handling
- Use Zod for form validation with descriptive error messages
- Handle Supabase errors gracefully with user-friendly messages
- Log errors appropriately without exposing sensitive data

### Database
- Use `Decimal` type for money (never Float)
- All tables have `userId` for RLS
- Use Prisma transactions for atomic operations

---

## Validation

```bash
# Run lint
npm run lint

# Run type check
npm run typecheck

# Build (catches build errors)
npm run build
```

---

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `src/lib/supabase/client.ts` | Supabase browser client |
| `src/lib/supabase/server.ts` | Supabase server client |
| `PRD.md` | Product Requirements Document |

---

## Notes

- This is a new project - implementation hasn't started yet
- User will create their own Supabase project
- All data is private per user (RLS enforced)
- Currency: IDR (Indonesian Rupiah)
