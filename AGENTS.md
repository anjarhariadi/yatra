# AGENTS.md

This file provides guidance to Agents when working with code in this repository.

---

## Project Overview

**Yatra** is a personal finance tracker web application for managing money across multiple wallets/accounts. Users periodically add balance records, and the app displays the latest balance as current. Features include category management (idle cash, hot cash, emergency fund), pie charts for distribution, and line charts for history.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with App Router |
| TypeScript | Type safety |
| Prisma | ORM for database |
| tRPC | Type-safe API layer |
| TanStack Query | Data fetching (via tRPC) |
| Superjson | JSON serialization for tRPC |
| Supabase Auth | User authentication |
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
│   ├── (dashboard)/       # Protected routes
│   │   ├── accounts/      # Wallet management
│   │   ├── categories/    # Category management
│   │   └── page.tsx       # Dashboard
│   └── api/trpc/          # tRPC API handler
├── components/             # Shared components
│   ├── ui/                # shadcn components
│   └── providers/         # tRPC provider
├── features/              # Feature-based organization
│   ├── accounts/          # Wallet feature
│   │   ├── components/    # UI components
│   │   ├── types.ts       # TypeScript types
│   │   └── validation.ts  # Zod schemas
│   ├── auth/              # Auth feature
│   └── categories/        # Category feature
├── lib/                   # Utilities
│   ├── supabase/          # Supabase client
│   ├── prisma/            # Prisma client
│   ├── trpc/              # tRPC client
│   └── utils.ts
├── server/                # tRPC server
│   ├── context.ts         # createTRPCContext
│   ├── trpc.ts            # tRPC initialization
│   ├── index.ts           # Root router
│   └── routers/           # Feature routers
└── prisma/
    └── schema.prisma       # Database schema
```

---

## Architecture

- **Feature-based**: All code (components, types, validation) grouped by feature in `/src/features`
- **tRPC API**: Type-safe API with routers in `/src/server/routers`
- **App Router**: Next.js 15 with route groups `(auth)` and `(dashboard)`
- **Protected Procedures**: All database operations require authenticated user via tRPC middleware

---

## Code Patterns

### Naming Conventions
- PascalCase for components and types: `WalletCard`, `WalletForm`
- camelCase for functions and variables: `getWallets`, `currentBalance`
- kebab-case for file names: `wallet-card.tsx`, `use-accounts.ts`

### File Organization
- Each feature has: `components/`, `types.ts`, `validation.ts`
- tRPC routers in `/src/server/routers/` organized by feature
- API client via tRPC hooks (not direct function calls)

### Error Handling
- Use Zod for form validation with descriptive error messages
- tRPC mutations use `onError` callback for user-friendly messages
- Use TRPCError with appropriate codes (NOT_FOUND, UNAUTHORIZED, etc.)

### tRPC Patterns
- Define routers in `/src/server/routers/` with CRUD procedures
- Use `protectedProcedure` for authenticated routes
- Input validation via Zod schemas
- Serialize dates/Decimal with superjson transformer

### Form Patterns (shadcn/ui)
- Use `<Controller>` instead of `register()` for controlled inputs
- Use `<Field>`, `<FieldLabel>`, `<FieldError>` components for layout
- Use shadcn `<Select>` instead of native `<select>`
- Use Dialog modals for create/edit forms instead of separate pages
- Add `aria-invalid` and `data-invalid` for accessibility
- Use Sonner toast for notifications instead of alert() or setError

### Currency Handling
- Currency: IDR (Indonesian Rupiah) - use Decimal type, never Float

---

## Notes

- All tRPC procedures use `protectedProcedure` - unauthenticated access throws UNAUTHORIZED
- Prisma queries filter by `ctx.user.id` for data isolation
- Supabase Auth provides JWT via cookies; tRPC context validates with `getUser()`
- Forms use React Hook Form + Zod resolver for validation
