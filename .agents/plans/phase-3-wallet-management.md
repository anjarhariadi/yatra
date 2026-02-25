# Feature: Wallet Management

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Implement wallet management for the Yatra finance tracker. Users can create, read, update, and delete wallets/accounts. Each wallet has a name, optional notes, and is assigned to a category. The system tracks balance records per wallet and displays the latest balance as current.

## User Story

As a user
I want to create, view, edit, and delete wallets
So that I can organize my money across different accounts (bank, cash, digital wallets)

## Problem Statement

Users need to manage multiple wallets/accounts to track their money. Each wallet should:
- Have a name and optional notes
- Be assigned to a category (idle cash, hot cash, emergency fund)
- Show current balance (latest record)
- Allow adding balance records

## Solution Statement

Implement full wallet CRUD with:
1. Wallet list page showing all wallets with current balance
2. Create wallet form with name, category selection, notes
3. Edit wallet form to modify wallet details
4. Delete wallet with confirmation dialog
5. Wallet detail page showing balance history

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: 
- `/src/features/accounts/` (new feature folder)
- `/src/app/(dashboard)/accounts/` (pages)
- Database via Supabase
**Dependencies**: 
- @supabase/supabase-js
- react-hook-form
- zod
- shadcn/ui components

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ THESE BEFORE IMPLEMENTING!

- `prisma/schema.prisma` (lines 43-58) - Wallet model structure
- `src/features/auth/types.ts` (lines 1-26) - Pattern for types.ts
- `src/features/auth/validation.ts` (lines 1-36) - Pattern for Zod schemas
- `src/features/auth/api/auth-client.ts` (lines 1-92) - Pattern for client API
- `src/features/auth/components/login-form.tsx` (lines 1-95) - Pattern for form components
- `src/app/(dashboard)/layout.tsx` (lines 1-72) - Dashboard structure

### New Files to Create

```
src/features/accounts/
├── api/
│   ├── accounts-client.ts   # Client-side wallet operations
│   ├── accounts-server.ts   # Server-side wallet operations  
│   └── index.ts
├── components/
│   ├── wallet-card.tsx      # Wallet display card
│   ├── wallet-list.tsx     # List of wallets
│   ├── wallet-form.tsx     # Create/Edit form (reusable)
│   ├── delete-wallet-dialog.tsx
│   └── index.ts
├── hooks/
│   ├── use-wallets.ts
│   └── index.ts
├── types.ts                 # Wallet types
├── validation.ts            # Zod schemas
└── index.ts
```

### New Pages to Create

```
src/app/(dashboard)/accounts/
├── page.tsx               # Wallet list page
├── new/page.tsx           # Create wallet page
└── [id]/
    ├── page.tsx           # Wallet detail page
    └── edit/page.tsx      # Edit wallet page
```

### Relevant Documentation

- [Supabase JS Client](https://supabase.com/docs/reference/javascript/inserting-data)
  - Database operations
  - Why: CRUD operations for wallets
  
- [React Hook Form](https://react-hook-form.com/docs/useform)
  - Form handling
  - Why: Form validation and handling

- [Zod Validation](https://zod.dev)
  - Schema validation
  - Why: Input validation

### Patterns to Follow

**Feature Structure:** (from auth feature)
```
src/features/{feature-name}/
├── api/           # API functions (client & server)
├── components/     # React components
├── hooks/         # Custom hooks
├── types.ts       # TypeScript interfaces
├── validation.ts  # Zod schemas
└── index.ts      # Barrel exports
```

**Client API Pattern:** (from auth-client.ts)
```typescript
import { createClient } from '@/lib/supabase/client'
import type { Wallet } from '../types'

export async function getWallets() {
  const supabase = createClient()
  const { data, error } = await supabase.from('wallets').select('*, category:categories(*)')
  if (error) throw new Error(error.message)
  return data
}

export async function createWallet(wallet: CreateWalletInput) {
  const supabase = createClient()
  const { data, error } = await supabase.from('wallets').insert(wallet).select().single()
  if (error) throw new Error(error.message)
  return data
}
```

**Form Component Pattern:** (from login-form.tsx)
```typescript
"use client"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createWallet } from '../api'
import { walletSchema, type WalletInput } from '../validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export function WalletForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<WalletInput>({
    resolver: zodResolver(walletSchema),
  })

  const onSubmit = async (data: WalletInput) => {
    // implementation
  }
  
  // ... JSX
}
```

**Naming Conventions:**
- Components: PascalCase (`WalletCard`, `WalletForm`)
- Files: kebab-case (`wallet-card.tsx`, `use-wallets.ts`)
- Hooks: camelCase with `use` prefix (`useWallets`)
- Types: PascalCase from types.ts imports

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

**Purpose:** Set up feature structure with types, validation, and API

**Tasks:**
- Create `src/features/accounts/` directory structure
- Create `types.ts` with Wallet, CreateWalletInput, UpdateWalletInput types
- Create `validation.ts` with Zod schemas for wallet operations
- Create `api/accounts-client.ts` with CRUD operations
- Create `api/accounts-server.ts` with server-side operations
- Create `api/index.ts` with exports

### Phase 2: Components

**Purpose:** Create reusable UI components

**Tasks:**
- Create `wallet-card.tsx` displaying wallet info and current balance
- Create `wallet-list.tsx` displaying grid of wallets
- Create `wallet-form.tsx` reusable form for create/edit
- Create `delete-wallet-dialog.tsx` confirmation dialog
- Create `components/index.ts` with exports

### Phase 3: Hooks

**Purpose:** Client-side data management

**Tasks:**
- Create `hooks/use-wallets.ts` for wallet state management
- Create `hooks/index.ts` with exports

### Phase 4: Pages

**Purpose:** Create route pages

**Tasks:**
- Create `src/app/(dashboard)/accounts/page.tsx` - wallet list
- Create `src/app/(dashboard)/accounts/new/page.tsx` - create wallet
- Create `src/app/(dashboard)/accounts/[id]/page.tsx` - wallet detail
- Create `src/app/(dashboard)/accounts/[id]/edit/page.tsx` - edit wallet

### Phase 5: Integration

**Purpose:** Connect to existing dashboard

**Tasks:**
- Update dashboard to show actual wallet count
- Update navigation if needed

---

## STEP-BY-STEP TASKS

### Task Format Guidelines

Use information-dense keywords for clarity:
- **CREATE**: New files or components
- **UPDATE**: Modify existing files
- **ADD**: Insert new functionality into existing code

---

### CREATE src/features/accounts/types.ts

- **IMPLEMENT**: Define wallet-related types
- **PATTERN**: Follow `src/features/auth/types.ts` structure
- **CONTENT**:
  ```typescript
  export interface Wallet {
    id: string
    name: string
    notes: string | null
    userId: string
    categoryId: string
    category: Category
    records?: Record[]
    createdAt: string
    updatedAt: string
  }

  export interface Category {
    id: string
    name: string
    type: CategoryType
    isDefault: boolean
    userId: string
  }

  export type CategoryType = 'IDLE_CASH' | 'HOT_CASH' | 'EMERGENCY_FUND'

  export interface CreateWalletInput {
    name: string
    categoryId: string
    notes?: string
  }

  export interface UpdateWalletInput {
    name?: string
    categoryId?: string
    notes?: string
  }
  ```

---

### CREATE src/features/accounts/validation.ts

- **IMPLEMENT**: Zod schemas for wallet validation
- **PATTERN**: Follow `src/features/auth/validation.ts`
- **CONTENT**:
  ```typescript
  import { z } from 'zod'

  export const walletSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    categoryId: z.string().min(1, 'Category is required'),
    notes: z.string().max(500, 'Notes too long').optional(),
  })

  export type WalletInput = z.infer<typeof walletSchema>
  ```

---

### CREATE src/features/accounts/api/accounts-client.ts

- **IMPLEMENT**: Client-side wallet CRUD operations
- **PATTERN**: Follow `src/features/auth/api/auth-client.ts`
- **FUNCTIONS**:
  - `getWallets()` - List all wallets with category
  - `getWallet(id)` - Get single wallet with records
  - `createWallet(data)` - Create new wallet
  - `updateWallet(id, data)` - Update wallet
  - `deleteWallet(id)` - Delete wallet
- **IMPORTS**: `createClient` from `@/lib/supabase/client"

---

### CREATE src/features/accounts/api/accounts-server.ts

- **IMPLEMENT**: Server-side wallet operations
- **PATTERN**: Follow `src/features/auth/api/auth-server.ts`
- **FUNCTIONS**:
  - `getWallets()` - Server component wallet fetching
  - `getWallet(id)` - Get single wallet server-side

---

### CREATE src/features/accounts/api/index.ts

- **IMPLEMENT**: Barrel exports
- **CONTENT**:
  ```typescript
  export * from './accounts-client'
  export * from './accounts-server'
  ```

---

### CREATE src/features/accounts/components/wallet-card.tsx

- **IMPLEMENT**: Card component showing wallet info
- **PATTERN**: Use shadcn Card components
- **PROPS**: wallet, onEdit, onDelete callbacks
- **CONTENT**: Display name, category, current balance, action buttons

---

### CREATE src/features/accounts/components/wallet-list.tsx

- **IMPLEMENT**: Grid of wallet cards
- **PROPS**: wallets array, loading state, onEdit, onDelete

---

### CREATE src/features/accounts/components/wallet-form.tsx

- **IMPLEMENT**: Reusable form for create/edit
- **PATTERN**: Use React Hook Form + Zod (like login-form.tsx)
- **PROPS**: initialData?, onSuccess, onError
- **FIELDS**: name input, category select, notes textarea

---

### CREATE src/features/accounts/components/delete-wallet-dialog.tsx

- **IMPLEMENT**: Confirmation dialog using shadcn AlertDialog
- **PATTERN**: Follow shadcn AlertDialog pattern

---

### CREATE src/features/accounts/components/index.ts

- **IMPLEMENT**: Barrel exports for all components

---

### CREATE src/features/accounts/hooks/use-wallets.ts

- **IMPLEMENT**: Custom hook for wallet state
- **PATTERN**: Use useState + useEffect or TanStack Query pattern
- **FUNCTIONS**: fetchWallets, createWallet, updateWallet, deleteWallet

---

### CREATE src/features/accounts/hooks/index.ts

- **IMPLEMENT**: Barrel exports

---

### CREATE src/features/accounts/index.ts

- **IMPLEMENT**: Main barrel export
- **CONTENT**: Export all from api, components, hooks, types, validation

---

### CREATE src/app/(dashboard)/accounts/page.tsx

- **IMPLEMENT**: Wallet list page (Server Component)
- **PATTERN**: Follow dashboard page structure
- **CONTENT**: 
  - Fetch wallets server-side
  - Display WalletList component
  - Add "Add Wallet" button linking to /accounts/new

---

### CREATE src/app/(dashboard)/accounts/new/page.tsx

- **IMPLEMENT**: Create wallet page
- **CONTENT**: 
  - Fetch categories for selection
  - Display WalletForm component

---

### CREATE src/app/(dashboard)/accounts/[id]/page.tsx

- **IMPLEMENT**: Wallet detail page
- **CONTENT**:
  - Fetch wallet with records
  - Display wallet info
  - Display records history
  - Add record button

---

### CREATE src/app/(dashboard)/accounts/[id]/edit/page.tsx

- **IMPLEMENT**: Edit wallet page
- **CONTENT**:
  - Fetch wallet data
  - Fetch categories
  - Display WalletForm with initialData

---

### UPDATE src/app/(dashboard)/page.tsx

- **IMPLEMENT**: Show actual wallet count
- **PATTERN**: Fetch wallets and display count

---

## TESTING STRATEGY

### Manual Testing

1. **Create Wallet:**
   - Navigate to /accounts/new
   - Fill form with name, select category
   - Submit and verify redirect to accounts list
   - Verify wallet appears in list

2. **View Wallets:**
   - Navigate to /accounts
   - Verify all wallets displayed with correct info
   - Verify current balance shown

3. **Edit Wallet:**
   - Click edit on wallet card
   - Modify details
   - Save and verify changes

4. **Delete Wallet:**
   - Click delete on wallet card
   - Confirm in dialog
   - Verify wallet removed from list

5. **Wallet Detail:**
   - Click wallet card
   - View balance history
   - Add new record

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

---

## ACCEPTANCE CRITERIA

- [ ] Users can view list of all wallets
- [ ] Users can create new wallet with name, category, notes
- [ ] Users can edit existing wallet
- [ ] Users can delete wallet with confirmation
- [ ] Wallet detail page shows balance history
- [ ] Wallet cards show current balance (latest record)
- [ ] Form validation works (name required, category required)
- [ ] All validation commands pass
- [ ] Code follows feature-based architecture
- [ ] Uses Zod + React Hook Form

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] No linting or type checking errors
- [ ] Manual testing confirms feature works
- [ ] Acceptance criteria all met

---

## NOTES

1. **Categories Dependency**: Wallet creation requires categories to exist. May need to create default categories on first user login or ensure categories page is implemented first.

2. **Balance Calculation**: Current balance = latest record's amount for that wallet. If no records, balance = 0.

3. **Decimal Handling**: Amounts are stored as Decimal in database - need to handle conversion in JS.

4. **RLS Policies**: Ensure RLS policies are applied for wallets table (already in migration).

5. **Navigation**: Wallet detail accessible via clicking wallet card or name.
