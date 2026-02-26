# Feature: Balance Records (Add Balance)

The following plan is complete. Validate documentation and codebase patterns before implementing.

## Feature Description

Allow users to add balance records to their wallets. Users periodically add their current balance with a date, and the system automatically shows the latest balance as the "current balance". This is a balance tracker (not an income/expense tracker).

## User Story

As a user, I want to add a balance record to a wallet with an amount and date, so that I can track the current balance of my wallet over time.

## Problem Statement

Currently, users can create wallets and categories, but there is no way to add balance records. The dashboard shows hardcoded zeros. The Record model exists in the database but has no API or UI to create records.

## Solution Statement

Implement a complete balance records feature:
1. Create tRPC router for Record CRUD operations
2. Add record validation schema
3. Create UI form to add new records via Dialog modal
4. Create wallet detail page (`/accounts/[id]`) for record management
5. Make wallet cards clickable to navigate to detail page
6. Update dashboard with real data (total balance, wallet count, record count)
7. Register new router in app router

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: tRPC router, UI components, Dashboard
**Dependencies**: None (all required packages already installed)

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ BEFORE IMPLEMENTING!

- `src/server/routers/accounts.ts` (lines 41-81) - Pattern: How records are fetched with wallet (include records, orderBy date desc, take 1 for currentBalance)
- `src/server/routers/categories.ts` (full file) - Pattern: Full CRUD router structure with Zod validation and TRPCError handling
- `src/features/accounts/validation.ts` (full file) - Pattern: Zod schema structure for input validation
- `src/features/categories/validation.ts` (full file) - Pattern: Zod schema with enum types and labels
- `src/features/accounts/components/wallet-list.tsx` (lines 1-50) - Pattern: Dialog modal with form, tRPC mutation, toast notifications
- `src/features/accounts/components/wallet-card.tsx` (full file) - Pattern: Card component for displaying wallet data
- `src/lib/utils.ts` (lines 8-16) - Pattern: formatCurrency function for IDR currency
- `src/app/(dashboard)/page.tsx` (full file) - Target: Dashboard that needs real data
- `prisma/schema.prisma` (lines 49-61) - Context: Record model definition

### New Files to Create

- `src/server/routers/records.ts` - tRPC router for Record CRUD
- `src/features/records/validation.ts` - Zod schema for record input
- `src/features/records/types.ts` - TypeScript types for records
- `src/features/records/components/record-form.tsx` - Dialog form to add record
- `src/features/records/components/index.ts` - Export barrel file
- `src/features/records/index.ts` - Feature exports
- `src/app/(dashboard)/accounts/[id]/page.tsx` - Wallet detail page

### Files to UPDATE

- `src/server/index.ts` - Register records router
- `src/features/accounts/components/wallet-card.tsx` - Make clickable with Link
- `src/features/accounts/components/wallet-list.tsx` - Remove edit/delete buttons from list
- `src/app/(dashboard)/page.tsx` - Fetch and display real data
- `src/server/routers/accounts.ts` - Add _count.records to getAll query

### Relevant Documentation

- [tRPC v11 Docs](https://trpc.io/docs/server/routers)
  - Router creation pattern
  - Why: Required for implementing the records router
- [Zod Docs](https://zod.dev)
  - Schema validation for forms
  - Why: Required for input validation

---

## IMPLEMENTATION PLAN

### Phase 1: Backend - Records Router

**Tasks:**

- Create validation schema for record input
- Create tRPC router with CRUD procedures
- Register router in app router

### Phase 2: Frontend - Record Form

**Tasks:**

- Create record form component with Dialog
- Integrate with tRPC mutation
- Add toast notifications

### Phase 3: Integration

**Tasks:**

- Make WalletCard clickable to navigate to detail page
- Create wallet detail page with record management
- Update dashboard with real data
- Update accounts router to include _count.records

---

## STEP-BY-STEP TASKS

### Task Format Guidelines

- **CREATE**: New files or components
- **UPDATE**: Modify existing files
- **ADD**: Insert new functionality into existing code

---

### CREATE src/features/records/validation.ts

- **IMPLEMENT**: Zod schema for record input validation
- **PATTERN**: Follow `src/features/accounts/validation.ts`
- **IMPORTS**: `import { z } from 'zod'`
- **GOTCHA**: Amount must be positive number, date required, walletId required
- **VALIDATE**: `npm run typecheck`

```typescript
import { z } from 'zod'

export const recordSchema = z.object({
  walletId: z.string().min(1, 'Wallet is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).optional(),
})

export type RecordInput = z.infer<typeof recordSchema>
```

---

### CREATE src/features/records/types.ts

- **IMPLEMENT**: TypeScript types for record data
- **PATTERN**: Mirror types from accounts router response
- **VALIDATE**: `npm run typecheck`

```typescript
export interface RecordData {
  id: string
  amount: number
  date: string
  notes: string | null
  walletId: string
  createdAt: string
}
```

---

### CREATE src/server/routers/records.ts

- **IMPLEMENT**: tRPC router with CRUD operations
- **PATTERN**: Follow `src/server/routers/categories.ts` for structure
- **PATTERN**: Follow `src/server/routers/accounts.ts` lines 41-81 for records inclusion
- **IMPORTS**: `z`, `createTRPCRouter`, `protectedProcedure` from `../trpc`, `TRPCError` from `@trpc/server`, `recordSchema` from `@/features/records/validation`
- **GOTCHA**: 
  - Decimal type in Prisma - convert to number with `Number()` for JSON response
  - Need to verify wallet belongs to user before creating record
- **PROCEDURES NEEDED**:
  - `create`: Add new record to wallet
  - `getByWalletId`: Get all records for a specific wallet (ordered by date desc)
  - `delete`: Remove a record
- **VALIDATE**: `npm run typecheck`

Key implementation details:
- Create: Verify wallet ownership via `ctx.db.wallet.findFirst({ where: { id: input.walletId, userId: ctx.user!.id }})`
- Get by wallet: Return records ordered by date desc, then createdAt desc
- Delete: Verify record exists and user owns the wallet

---

### UPDATE src/server/index.ts

- **IMPLEMENT**: Register records router
- **PATTERN**: Add import and include in router
- **IMPORTS**: `import { recordsRouter } from './routers/records'`
- **VALIDATE**: `npm run typecheck`

---

### CREATE src/features/records/components/record-form.tsx

- **IMPLEMENT**: Dialog form for adding balance records
- **PATTERN**: Follow `src/features/accounts/components/wallet-form.tsx` for form structure
- **IMPORTS**: React Hook Form, Zod resolver, shadcn/ui components (Dialog, Field, Input, Button)
- **GOTCHA**: 
  - Use shadcn `<Controller>` not `register()`
  - Amount should be input type="number"
  - Date should use native date input or shadcn equivalent
  - If walletId is provided as prop, don't show selector
- **VALIDATE**: `npm run typecheck`

Required fields (when walletId NOT provided as prop):
- Wallet selector (Select component)
- Amount (number input)
- Date (date picker)
- Notes (textarea, optional)

When walletId IS provided as prop:
- Hide wallet selector
- Only show amount, date, notes fields

---

### CREATE src/features/records/components/index.ts

- **IMPLEMENT**: Export barrel file
- **VALIDATE**: `npm run typecheck`

---

### CREATE src/features/records/index.ts

- **IMPLEMENT**: Feature exports
- **VALIDATE**: `npm run typecheck`

---

### UPDATE src/features/accounts/components/wallet-card.tsx

- **IMPLEMENT**: Make card clickable and remove inline action buttons
- **PATTERN**: Use Next.js Link component for navigation
- **IMPORTS**: Add `Link` from 'next/link'
- **GOTCHA**: 
  - Entire card should be clickable
  - Remove onEdit/onDelete props (move to detail page)
  - Show wallet name, category, and current balance only
- **VALIDATE**: `npm run typecheck`

The card should navigate to `/accounts/{wallet.id}` on click.

```typescript
// Instead of buttons, just make the card clickable
<Link href={`/accounts/${wallet.id}`}>
  <Card className="cursor-pointer hover:shadow-md transition-shadow">
    ...
  </Card>
</Link>
```

---

### CREATE src/app/(dashboard)/accounts/[id]/page.tsx

- **IMPLEMENT**: Wallet detail page with record management
- **PATTERN**: Create new route `src/app/(dashboard)/accounts/[id]/page.tsx`
- **GOTCHA**: 
  - Fetch wallet data using accounts.getById
  - Display wallet info (name, category, current balance)
  - Show record form (Dialog)
  - Show record history list (table or list)
  - Show line chart for balance history using Recharts
- **VALIDATE**: `npm run typecheck`

This page will have:
1. Header with wallet name, category badge, edit button
2. Current balance display (large, prominent)
3. "Add Record" button to open Dialog form
4. Line chart showing balance over time
5. Record history table (date, amount, notes, delete action)

---

### UPDATE src/app/(dashboard)/page.tsx

- **IMPLEMENT**: Fetch and display real data instead of hardcoded zeros
- **PATTERN**: Use server-side tRPC caller or client-side with trpc hook
- **IMPORTS**: Use tRPC for data fetching
- **GOTCHA**: Total balance = sum of all current balances from wallets
- **VALIDATE**: `npm run typecheck`

Since this is a server component, use tRPC caller:
```typescript
import { appRouter } from '@/server'
import { createTRPCContext } from '@/server/trpc'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return // or redirect
  
  const ctx = await createTRPCContext({ headers: new Headers() })
  const caller = createCallerFactory()(appRouter)
  
  // Fetch wallets with current balance
  const wallets = await caller.accounts.getAll()
  
  const totalBalance = wallets.reduce((sum, w) => sum + (w.currentBalance || 0), 0)
  const walletCount = wallets.length
  const recordCount = wallets.reduce((sum, w) => sum + (w._count?.records || 0), 0) // Need to add _count in router
  
  // OR simpler: call records.getAll and count
  
  return (
    // Display totalBalance, walletCount, recordCount
  )
}
```

**NOTE**: You may need to add `_count: { records: true }` to the accounts.getAll query. Or create a separate records.getAll query.

Alternative - make page a client component and use tRPC hooks like WalletList does.

### UPDATE src/server/routers/accounts.ts

- **IMPLEMENT**: Add _count.records to getAll query for record count in dashboard
- **PATTERN**: Similar to how categories router includes _count
- **GOTCHA**: Need total record count for dashboard stats
- **VALIDATE**: `npm run typecheck`

In the `getAll` query, add:
```prisma
include: {
  category: true,
  records: {
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 1,
  },
  _count: {
    select: { records: true },
  },
}
```

Then update the return mapping to include `_count.records`.

---

### UPDATE src/features/accounts/components/wallet-list.tsx

- **IMPLEMENT**: Remove edit/delete buttons (moved to detail page)
- **PATTERN**: Pass empty props or remove handlers
- **VALIDATE**: `npm run typecheck`

Since WalletCard now navigates on click, we no longer need the edit/delete buttons in the list view.

### Unit Tests

- Validation schema tests (amount positive, date required, etc.)

### Integration Tests

- Create record via UI and verify it appears in wallet
- Verify current balance updates after adding record
- Delete record and verify balance recalculates

### Edge Cases

- Add record to wallet with no previous records
- Add multiple records to same wallet (verify latest is current)
- Add record with future date
- Add record with very large amount (IDR currency)
- Delete wallet with records (should cascade delete)

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions:

### Level 1: Syntax & Style

```bash
npm run lint
npm run typecheck
```

### Level 2: Build

```bash
npm run build
```

### Level 3: Manual Testing

1. Run `npm run dev`
2. Login with existing account
3. Go to Accounts page
4. Click on a wallet card to open detail page
5. Click "Add Record" button
6. Enter amount and date
7. Verify record appears in history and current balance updates
8. Check dashboard shows correct totals
9. Test line chart displays balance history

---

## ACCEPTANCE CRITERIA

- [ ] User can click wallet card to open detail page
- [ ] Wallet detail page shows wallet info and current balance
- [ ] User can add a balance record to any wallet
- [ ] Current balance displays the most recent record amount
- [ ] Records are ordered by date (most recent first)
- [ ] Line chart shows balance history over time
- [ ] Dashboard shows real total balance, wallet count, record count
- [ ] Record form validates input (positive amount, date required)
- [ ] Toast notifications appear on success/error
- [ ] UI follows shadcn/ui patterns
- [ ] No TypeScript errors
- [ ] No lint errors

---

## NOTES

- The Record model already exists - we're adding the API and UI layers
- Current balance is derived from the most recent record (by date, then createdAt)
- Currency is IDR - use Decimal in Prisma, convert to number for JSON response
- Records cascade delete when wallet is deleted (defined in schema)
- UX flow: Wallet list page → Click card → Detail page with record management
- Edit/delete wallet moved to detail page instead of list page
