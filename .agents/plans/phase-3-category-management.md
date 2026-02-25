# Feature: Category Management

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Implement category management for the Yatra finance tracker. Categories organize wallets into groups. Each category has a **type** (Idle Cash, Hot Cash, Emergency Fund - these are default types) and a **name** (user-defined like "Bank", "E-Wallet", "Cash", etc.).

## User Story

As a user
I want to create and manage category names
So that I can organize my wallets with custom names while keeping the type classification

## Problem Statement

Users need to categorize their wallets:
- **Category Type** (enum): IDLE_CASH, HOT_CASH, EMERGENCY_FUND - these are fixed default types
- **Category Name**: User-defined values like "Bank BCA", "GoPay", "Cash on Hand", etc.
- Default category names are pre-seeded per type (e.g., "Bank", "E-Wallet", "Cash")
- Users can add custom category names

## Solution Statement

Implement category management with:
1. Category list page showing all categories grouped by type
2. Create category form with name and type selection
3. Edit category form
4. Delete category (only if no wallets assigned)
5. Default category names are pre-seeded (cannot edit/delete)

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Low
**Primary Systems Affected**: 
- `/src/features/categories/` (new feature folder)
- `/src/app/(dashboard)/categories/` (pages)
**Dependencies**: 
- @supabase/supabase-js
- react-hook-form
- zod
- shadcn/ui components

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ THESE BEFORE IMPLEMENTING!

- `prisma/schema.prisma` (lines 27-41) - Category model structure
- `src/features/auth/types.ts` - Pattern for types.ts
- `src/features/auth/validation.ts` - Pattern for Zod schemas
- `src/features/auth/api/auth-client.ts` - Pattern for client API
- `src/features/accounts/types.ts` - Pattern for accounts types (if exists)

### New Files to Create

```
src/features/categories/
├── api/
│   ├── categories-client.ts
│   ├── categories-server.ts
│   └── index.ts
├── components/
│   ├── category-card.tsx
│   ├── category-list.tsx
│   ├── category-form.tsx
│   ├── delete-category-dialog.tsx
│   └── index.ts
├── hooks/
│   ├── use-categories.ts
│   └── index.ts
├── types.ts
├── validation.ts
└── index.ts
```

### New Pages to Create

```
src/app/(dashboard)/categories/
├── page.tsx
├── new/page.tsx
└── [id]/
    ├── page.tsx
    └── edit/page.tsx
```

### Patterns to Follow

Same as auth and accounts features - see wallet-management.md for detailed patterns.

**Naming Conventions:**
- Components: PascalCase (`CategoryCard`, `CategoryForm`)
- Files: kebab-case (`category-card.tsx`)
- Hooks: camelCase (`useCategories`)

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

**Tasks:**
- Create `src/features/categories/` directory structure
- Create `types.ts` with Category types
- Create `validation.ts` with Zod schemas
- Create API functions (client & server)

### Phase 2: Components

**Tasks:**
- Create category-card.tsx
- Create category-list.tsx
- Create category-form.tsx
- Create delete-category-dialog.tsx

### Phase 3: Hooks

**Tasks:**
- Create use-categories.ts

### Phase 4: Pages

**Tasks:**
- Create categories page (list)
- Create new category page
- Create edit category page

---

## STEP-BY-STEP TASKS

### CREATE src/features/categories/types.ts

- **IMPLEMENT**: Category types
- **CONTENT**:
  ```typescript
  // CategoryType is the enum from Prisma - fixed types
  export type CategoryType = 'IDLE_CASH' | 'HOT_CASH' | 'EMERGENCY_FUND'
  
  export interface Category {
    id: string
    name: string           // User-defined: "Bank BCA", "GoPay", "Cash", etc.
    type: CategoryType     // Fixed: IDLE_CASH, HOT_CASH, or EMERGENCY_FUND
    isDefault: boolean     // true for pre-seeded categories
    userId: string
    _count?: { wallets: number }
  }
  
  export interface CreateCategoryInput {
    name: string           // User-defined category name
    type: CategoryType     // Select from enum
  }
  
  export interface UpdateCategoryInput {
    name?: string
    type?: CategoryType
  }
  ```

---

### CREATE src/features/categories/validation.ts

- **IMPLEMENT**: Zod schemas
- **CONTENT**:
  ```typescript
  import { z } from 'zod'
  
  // CategoryType - fixed enum values
  const categoryTypes = ['IDLE_CASH', 'HOT_CASH', 'EMERGENCY_FUND'] as const
  
  export const categorySchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    type: z.enum(categoryTypes, {
      errorMap: () => ({ message: 'Please select a category type' }),
    }),
  })
  
  export type CategoryInput = z.infer<typeof categorySchema>
  ```

---

### CREATE src/features/categories/api/categories-client.ts

- **IMPLEMENT**: Client-side CRUD
- **FUNCTIONS**:
  - getCategories()
  - getCategory(id)
  - createCategory(data)
  - updateCategory(id, data)
  - deleteCategory(id)
- **GOTCHA**: Default categories (isDefault=true) cannot be deleted

---

### CREATE src/features/categories/api/categories-server.ts

- **IMPLEMENT**: Server-side operations
- **FUNCTIONS**: getCategories(), getCategory(id)

---

### CREATE src/features/categories/api/index.ts

- **IMPLEMENT**: Barrel exports

---

### CREATE src/features/categories/components/category-card.tsx

- **IMPLEMENT**: Card showing category with wallet count
- **CONTENT**: Name, type badge, wallet count, edit/delete buttons
- **GOTCHA**: Disable delete button if has wallets or is default

---

### CREATE src/features/categories/components/category-list.tsx

- **IMPLEMENT**: Grid of category cards

---

### CREATE src/features/categories/components/category-form.tsx

- **IMPLEMENT**: Form with name input and type select
- **PATTERN**: React Hook Form + Zod (like wallet-form)

---

### CREATE src/features/categories/components/delete-category-dialog.tsx

- **IMPLEMENT**: Confirmation dialog
- **VALIDATION**: Show error if category has wallets

---

### CREATE src/features/categories/components/index.ts

- **IMPLEMENT**: Barrel exports

---

### CREATE src/features/categories/hooks/use-categories.ts

- **IMPLEMENT**: Hook for category state

---

### CREATE src/features/categories/hooks/index.ts

- **IMPLEMENT**: Barrel exports

---

### CREATE src/features/categories/index.ts

- **IMPLEMENT**: Main barrel export

---

### CREATE src/app/(dashboard)/categories/page.tsx

- **IMPLEMENT**: Category list page
- **CONTENT**: List + Add button

---

### CREATE src/app/(dashboard)/categories/new/page.tsx

- **IMPLEMENT**: Create category page

---

### CREATE src/app/(dashboard)/categories/[id]/edit/page.tsx

- **IMPLEMENT**: Edit category page

---

## VALIDATION COMMANDS

```bash
npm run typecheck
npm run lint
npm run build
```

---

## ACCEPTANCE CRITERIA

- [ ] Users can view all categories grouped by type
- [ ] Users can create custom category with name and type
- [ ] Users can edit custom category name (type is fixed)
- [ ] Users can delete custom category (if no wallets)
- [ ] Cannot delete default categories (isDefault=true)
- [ ] Cannot delete category with wallets assigned
- [ ] Form validation works (name required, type required)
- [ ] All validation commands pass

---

## NOTES

1. **Category Type vs Name**:
   - **Type**: Fixed enum (IDLE_CASH, HOT_CASH, EMERGENCY_FUND) - cannot be changed by user
   - **Name**: User-defined (e.g., "Bank BCA", "GoPay", "Cash", "Tunai")
   
2. **Default Categories**: Pre-seeded on user registration:
   - IDLE_CASH: "Bank", "Tabungan"
   - HOT_CASH: "E-Wallet", "Cash"
   - EMERGENCY_FUND: "Emergency"
   
3. **Category Selection**: When creating a wallet, user selects:
   - Category Name (dropdown of user's categories)
   - This maps to categoryId in Wallet

4. **Protection**: 
   - Cannot delete default categories (isDefault=true)
   - Cannot delete category with wallets assigned
