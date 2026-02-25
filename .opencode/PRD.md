# Product Requirements Document (PRD)

## Yatra - Personal Finance Tracker

---

## 1. Executive Summary

**Yatra** is a personal finance tracker web application designed for individual users to manage their money across multiple wallets/accounts. The application allows users to periodically record their current balance for each wallet, providing a clear historical view of their financial status. With category-based organization (idle cash, hot cash, emergency fund) and visualization features including pie charts for distribution and line charts for history tracking, users gain insights into their financial health.

The MVP focuses on simplicity—users simply add balance records with dates, and the app displays the latest balance as the current balance. Built with Next.js 15, Prisma, tRPC, Supabase Auth, and shadcn/ui, the application ensures a modern, secure, and performant user experience with type-safe API communication and centralized authorization via tRPC middleware.

---

## 2. Mission

### Mission Statement
Enable individuals to effortlessly track their financial balance history across multiple wallets with simple periodic updates, providing clarity and insights into their money distribution.

### Core Principles
1. **Simplicity First** - Minimal friction in recording balances; just add the current amount and date
2. **Privacy by Default** - All data is private and protected by tRPC middleware authorization
3. **Clarity Over Complexity** - Current balance is always the latest recorded value
4. **Insightful Visualization** - Users can see distribution and trends at a glance
5. **Data Ownership** - Users can export their data anytime in standard formats
6. **Type-Safe API** - End-to-end type safety from database to frontend with tRPC

---

## 3. Target Users

### Primary User Persona
- **Name**: Individual Personal User
- **Age**: 25-45
- **Technical Comfort Level**: Intermediate (comfortable with web apps)
- **Use Case**: Tracks multiple wallet balances (cash, bank accounts, digital wallets)
- **Pain Points**:
  - Loses track of how much money is in each wallet
  - No clear history of balance changes over time
  - Wants simple way to see "current" money without complex transaction logging

### Key User Needs
- Quick balance recording (just current amount + date)
- Clear view of current balance per wallet
- Category organization (idle cash, hot cash, emergency fund)
- Visual distribution of money across categories
- Balance history tracking per wallet
- Export data for personal records

---

## 4. MVP Scope

### Core Functionality

| Feature | Status |
|---------|--------|
| User authentication (email/password via Supabase) | ✅ |
| Create, read, update, delete wallets | ✅ |
| Add balance records to wallets | ✅ |
| View latest balance as current balance | ✅ |
| Custom categories with types (idle cash, hot cash, emergency fund) | ✅ |
| Category management (CRUD) | ✅ |
| Dashboard with total balance overview | ✅ |
| Pie chart: money distribution by category | ✅ |
| Line chart: wallet balance history | ✅ |
| Wallet history list | ✅ |
| Export data to CSV | ✅ |
| Export data to JSON | ✅ |
| Dark/Light mode | ✅ |
| Mobile responsive | ✅ |

### Technical

| Feature | Status |
|---------|--------|
| Next.js 15 App Router | ✅ |
| Prisma ORM with PostgreSQL | ✅ |
| Supabase Auth | ✅ |
| Supabase Database | ✅ |
| tRPC for type-safe API | ✅ |
| tRPC middleware for authorization | ✅ |
| shadcn/ui components | ✅ |
| Feature-based folder structure | ✅ |
| Environment variable configuration | ✅ |

### Integration

| Feature | Status |
|---------|--------|
| Supabase project connection | ✅ |

### Deployment

| Feature | Status |
|---------|--------|
| Local development setup | ✅ |
| Production build configuration | ✅ |

---

## 5. User Stories

### Primary User Stories

**US-1: Account Creation**
> As a new user, I want to create a private account using email and password, so that I can securely access my finance data.
> - *Example*: User signs up with email "john@example.com" and password, receives confirmation, then can access the app

**US-2: Create Wallet**
> As a user, I want to create a new wallet with a name and assign a category, so that I can organize my accounts.
> - *Example*: User creates wallet "BNI Savings" and assigns category "Hot Cash"

**US-3: Record Balance**
> As a user, I want to add a balance record with an amount and date, so that I can track the current balance of a wallet.
> - *Example*: User adds record "IDR 5,000,000" dated "2026-02-25" to "BNI Savings" wallet

**US-4: View Current Balance**
> As a user, I want to see the current balance of each wallet, so that I know how much money I have.
> - *Example*: Dashboard shows "BNI Savings: IDR 5,000,000" as the current balance

**US-5: View Balance History**
> As a user, I want to see the history of balance records for a wallet, so that I can track how my balance changed over time.
> - *Example*: User clicks on "BNI Savings" and sees a list of all past records with dates

**US-6: Category Distribution**
> As a user, I want to see a pie chart of my money distribution by category, so that I understand where my money is allocated.
> - *Example*: Pie chart shows 60% Hot Cash, 30% Idle Cash, 10% Emergency Fund

**US-7: Wallet Balance Trend**
> As a user, I want to see a line chart of a wallet's balance history, so that I can visualize how the balance changed over time.
> - *Example*: Line chart shows "BNI Savings" balance trending up from Jan to Feb

**US-8: Export Data**
> As a user, I want to export my data to CSV or JSON, so that I have a backup or can analyze in other tools.
> - *Example*: User clicks "Export CSV" and downloads all wallet and record data

### Technical User Stories

**TUS-1: Data Isolation**
> As a system, I want to ensure users can only see their own data, so that privacy is maintained.
> - *Implementation*: tRPC middleware validates user session; all queries filtered by `userId` from authenticated context

**TUS-2: Input Validation**
> As a system, I want to validate all user inputs, so that data integrity is maintained.
> - *Implementation*: Zod schemas for all forms

---

## 6. Core Architecture & Patterns

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 15 App Router                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   (auth)    │  │ (dashboard) │  │      tRPC API       │  │
│  │  /login     │  │  /accounts  │  │  /api/trpc/[trpc]  │  │
│  │  /register  │  │  /records   │  │                     │  │
│  │             │  │  /categories│  │  - accounts.*       │  │
│  │             │  │  /export    │  │  - categories.*     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       tRPC Layer                              │
│  - Type-safe API with Zod validation                         │
│  - Middleware for Supabase auth verification                 │
│  - Feature-based routers (accounts, categories)              │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Prisma ORM Layer                          │
│         (Type-safe database queries)                        │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase PostgreSQL + Auth                    │
│         (Database hosting + Authentication)                  │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure
```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected routes group
│   │   ├── accounts/
│   │   │   ├── page.tsx          # Accounts list
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Account detail + history
│   │   ├── records/
│   │   │   └── page.tsx          # Add new record
│   │   ├── categories/
│   │   │   └── page.tsx          # Category management
│   │   ├── export/
│   │   │   └── page.tsx          # Export data
│   │   ├── layout.tsx            # Dashboard layout (sidebar)
│   │   └── page.tsx              # Dashboard home
│   ├── api/
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts      # tRPC API handler
│   ├── auth/callback/
│   │   └── route.ts              # Supabase auth callback
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── server/                       # tRPC server
│   ├── context.ts                # createTRPCContext (Supabase auth)
│   ├── trpc.ts                  # tRPC initialization & procedures
│   ├── index.ts                  # Root router
│   └── routers/                  # Feature routers
│       ├── accounts.ts           # Wallet CRUD
│       └── categories.ts        # Category CRUD
├── components/                   # Shared components
│   ├── ui/                       # shadcn components
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── charts/                   # Chart components
│   │   ├── pie-chart.tsx
│   │   └── line-chart.tsx
│   └── providers/
│       └── trpc-provider.tsx     # tRPC client provider
├── features/                     # Feature-based organization
│   ├── accounts/
│   │   ├── components/           # Feature components
│   │   │   ├── account-card.tsx
│   │   │   ├── account-form.tsx
│   │   │   └── account-list.tsx
│   │   ├── hooks/
│   │   │   └── use-accounts.ts
│   │   ├── types.ts              # TypeScript types
│   │   └── index.ts              # Exports
│   ├── records/
│   │   ├── components/
│   │   │   ├── record-form.tsx
│   │   │   └── record-history.tsx
│   │   ├── hooks/
│   │   │   └── use-records.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── categories/
│   │   ├── components/
│   │   │   ├── category-form.tsx
│   │   │   └── category-list.tsx
│   │   ├── hooks/
│   │   │   └── use-categories.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── export/
│       ├── components/
│       │   └── export-buttons.tsx
│       ├── types.ts
│       └── index.ts
├── lib/
│   ├── supabase/                 # Supabase client
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── types.ts              # Supabase types
│   ├── prisma/
│   │   └── client.ts             # Prisma client
│   └── utils.ts                  # Utility functions
├── hooks/                        # Global hooks
│   ├── use-auth.ts
│   └── use-current-user.ts
├── types/                        # Global types
└── prisma/
    └── schema.prisma              # Database schema
```

### Key Design Patterns

1. **Feature-Based Architecture**: All related code (routers, components, hooks, types) grouped by feature
2. **tRPC for API**: Type-safe API layer with automatic type generation from server to client
3. **Supabase Auth in Context**: Auth validation in tRPC context via `@supabase/ssr`, user passed to procedures
4. **Prisma for Database**: All database queries use Prisma ORM, filtered by authenticated user's ID
5. **TanStack Query**: Powered by tRPC's React Query integration for data fetching and caching
6. **Zod Validation**: Schema validation for all tRPC inputs using existing Zod schemas

---

## 7. Tools/Features

### 7.1 Authentication
- **Supabase Auth** with email/password
- Protected routes via middleware
- Session persistence
- Logout functionality

### 7.2 Wallet Management
- **Create Wallet**: Name, category selection, optional notes
- **Edit Wallet**: Modify name, category, notes
- **Delete Wallet**: Soft delete with confirmation dialog
- **List Wallets**: Card-based grid display with current balance

### 7.3 Balance Recording
- **Add Record**: Wallet selection (if not from wallet page), amount (IDR), date picker, optional notes
- **Latest Balance**: Automatically set as current balance based on most recent record date
- **Record History**: Chronological list with date, amount, notes

### 7.4 Category Management
- **Default Categories**: Idle Cash, Hot Cash, Emergency Fund (pre-seeded)
- **Custom Categories**: User can add new categories with type assignment
- **Category Types**: idle_cash, hot_cash, emergency_fund
- **Category CRUD**: Create, read, update, delete custom categories

### 7.5 Dashboard
- **Total Balance Card**: Sum of all wallet current balances
- **Category Distribution**: Pie chart showing percentage by category
- **Recent Records**: Latest 5-10 balance additions
- **Quick Actions**: Add wallet, Add record buttons

### 7.6 Visualizations
- **Pie Chart**: Money distribution by category (using Recharts)
- **Line Chart**: Wallet balance over time (using Recharts)
- **Interactive**: Tooltips on hover, legend toggles

### 7.7 Export
- **CSV Export**: All wallets and records in CSV format
- **JSON Export**: Full data dump in JSON format
- **Date Range Filter**: Optional filter for export range

---

## 8. Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Prisma | 6.x | ORM for database |
| tRPC | 11.x | Type-safe API layer |
| TanStack Query | 5.x | Data fetching (via tRPC) |
| Superjson | latest | JSON serialization for tRPC |
| Supabase | Latest | Auth + Database |

### UI & Styling

| Technology | Purpose |
|------------|---------|
| shadcn/ui | Component library |
| Tailwind CSS | Styling |
| Radix UI | Primitive components |
| Recharts | Charts (pie, line) |
| Lucide React | Icons |

### Form & Validation

| Technology | Purpose |
|------------|---------|
| React Hook Form | Form handling |
| Zod | Schema validation |

### Optional Dependencies

| Technology | Purpose |
|------------|---------|
| Zustand | Client state management |
| date-fns | Date utilities |

### Third-Party Integrations
- **Supabase**: Authentication and PostgreSQL database

---

## 9. Security & Configuration

### Authentication Approach
- Supabase Auth with email/password
- JWT-based session management via cookies
- Protected routes via Next.js middleware
- tRPC middleware validates user session for all API calls

### Authorization Approach (tRPC)
- All tRPC procedures require authenticated user
- `protectedProcedure` middleware checks `ctx.user` exists
- All Prisma queries filtered by `ctx.user.id` for data isolation
- No reliance on database-level RLS (handled at application layer)

### Configuration Management
```env
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANONanon_key
DAT_KEY=your_ABASE_URL=postgresql://...
```

### Security Scope

**In Scope:**
- tRPC middleware authorization (user validation on every API call)
- Prisma queries filtered by authenticated user ID
- Password hashing (handled by Supabase)
- Input validation with Zod
- HTTPS in production

**Out of Scope:**
- Two-factor authentication (future)
- Audit logging (future)
- API rate limiting (future)

### Deployment Considerations
- Vercel or similar platform for Next.js
- Supabase handles database hosting
- Environment variables for all secrets

---

## 10. Database Schema

### Prisma Schema Overview

```prisma
// Enums
enum CategoryType {
  IDLE_CASH
  HOT_CASH
  EMERGENCY_FUND
}

// Models
model User {
  id           String     @id @default(cuid())
  email        String     @unique
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  wallets      Wallet[]
  categories   Category[]
  records      Record[]
}

model Category {
  id          String       @id @default(cuid())
  name        String
  type        CategoryType
  isDefault   Boolean      @default(false)
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  wallets     Wallet[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  @@unique([name, userId])
  @@index([userId])
}

model Wallet {
  id          String     @id @default(cuid())
  name        String
  notes       String?
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId  String
  category    Category   @relation(fields: [categoryId], references: [id])
  
  records     Record[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  @@index([userId])
  @@index([categoryId])
}

model Record {
  id          String   @id @default(cuid())
  amount      Decimal  @db.Decimal(15, 2)
  date        DateTime
  notes       String?
  walletId    String
  wallet      Wallet   @relation(fields: [walletId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([walletId])
  @@index([date])
}
```

> **Note**: Row Level Security (RLS) is not required as data isolation is handled at the application layer via tRPC middleware and Prisma queries filtered by `userId`.

### RLS Policies (to be applied in Supabase)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
-- ... similar for all tables
```

---

## 11. API Specification

### tRPC Router Overview

All API endpoints are exposed via tRPC with the following structure:

| Procedure | Type | Description |
|-----------|------|-------------|
| `accounts.getAll` | query | List all wallets for authenticated user |
| `accounts.getById` | query | Get single wallet by ID |
| `accounts.create` | mutation | Create new wallet |
| `accounts.update` | mutation | Update wallet |
| `accounts.delete` | mutation | Delete wallet |
| `accounts.getRecords` | query | Get balance records for a wallet |
| `accounts.getLatestRecord` | query | Get latest balance record for a wallet |
| `categories.getAll` | query | List all categories |
| `categories.getById` | query | Get single category by ID |
| `categories.create` | mutation | Create new category |
| `categories.update` | mutation | Update category |
| `categories.delete` | mutation | Delete category |

### API Handler

```
POST /api/trpc/[trpc]
```

All requests go to the tRPC handler which:
1. Validates authentication via Supabase session
2. Creates context with `user` object
3. Routes to appropriate procedure
4. Returns type-safe response

### tRPC Context Structure

```typescript
interface Context {
  db: PrismaClient
  user: {
    id: string
    email: string
  } | null
}
```

### Protected Procedure Middleware

```typescript
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { user: ctx.user } })
})

const protectedProcedure = t.procedure.use(isAuthed)
```

### Request/Response Examples

**Create Wallet**
```typescript
// Mutation: accounts.create
const input = {
  name: "BNI Savings",
  categoryId: "cat_abc123",
  notes: "Primary savings account"
}

// Returns: Wallet object with relations
```

**List Wallets**
```typescript
// Query: accounts.getAll

// Returns: Wallet[] with category relations
```

---

## 12. Success Criteria

### Functional Requirements

- [ ] User can register with email/password
- [ ] User can log in and log out
- [ ] User can create, edit, and delete wallets
- [ ] User can assign categories to wallets
- [ ] User can add balance records to wallets
- [ ] Dashboard shows total balance
- [ ] Dashboard shows pie chart by category
- [ ] Wallet detail shows line chart of history
- [ ] Wallet detail shows record history list
- [ ] User can create custom categories
- [ ] User can export data to CSV
- [ ] User can export data to JSON
- [ ] App is responsive on mobile

### Quality Indicators

- [ ] Page load time < 2 seconds
- [ ] All forms have proper validation
- [ ] Error messages are user-friendly
- [ ] Dark mode works correctly
- [ ] No console errors in production

### User Experience Goals

- Users can add a balance record in under 30 seconds
- Dashboard provides immediate insight into financial status
- Export functionality completes within 5 seconds for typical data

---

## 13. Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Set up project structure and authentication

- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Set up shadcn/ui and Tailwind CSS
- [ ] Configure Prisma with schema
- [ ] Set up Supabase project and connection
- [ ] Implement authentication (login/register)
- [ ] Set up protected routes with middleware
- [ ] Create base layout with sidebar

**Validation**: User can sign up, log in, and log out

### Phase 2: Core Features (Week 2)
**Goal**: Implement wallet and record management

- [ ] Implement category CRUD
- [ ] Implement wallet CRUD
- [ ] Implement record CRUD
- [ ] Create dashboard with total balance
- [ ] Create accounts list page
- [ ] Create add record functionality

**Validation**: User can fully manage wallets and records

### Phase 3: Visualization & Export (Week 3)
**Goal**: Add charts and export functionality

- [ ] Implement pie chart for category distribution
- [ ] Implement line chart for wallet history
- [ ] Implement wallet detail page with history
- [ ] Implement CSV export
- [ ] Implement JSON export
- [ ] Add dark/light mode toggle

**Validation**: All visualizations render correctly, exports work

### Phase 4: Polish & Deploy (Week 4)
**Goal**: Final polish and production deployment

- [ ] Mobile responsive testing and fixes
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] Production build verification
- [ ] Environment configuration for production
- [ ] Deploy to Vercel (or preferred platform)

**Validation**: App runs smoothly in production

---

## 14. Future Considerations

### Post-MVP Enhancements
- **Budget Tracking**: Set budgets per category with alerts
- **Goals**: Financial goals with progress tracking
- **Recurring Records**: Auto-add records periodically
- **Multi-Currency Support**: For users with foreign accounts
- **Data Import**: Import from CSV/spreadsheets
- **Print-Ready Reports**: Generate PDF reports
- **Two-Factor Authentication**: Enhanced security
- **Dark Mode Default**: Follow system preference

### Integration Opportunities
- Bank API integrations (if available in Indonesia)
- Cloud storage backup
- Print/fax integration for reports

### Advanced Features (Future Phases)
- Transaction-based tracking (income/expenses)
- Split transactions
- Receipt photo attachments
- Multiple currencies with conversion
- Shared household accounts

---

## 15. Risks & Mitigations

### Risk 1: Database Performance with Large Datasets
**Impact**: High
**Mitigation**: 
- Add proper indexes on frequently queried columns
- Implement pagination for record lists
- Use Prisma's `$transaction` for atomic operations
- Consider materialized views for aggregations

### Risk 2: Supabase RLS Misconfiguration
**Impact**: High
**Mitigation**:
- Test RLS policies thoroughly
- Write integration tests to verify data isolation
- Use service role only in server-side code

### Risk 3: Decimal Precision Issues
**Impact**: High
**Mitigation**:
- Always use Decimal type in Prisma (not Float)
- Validate amount inputs with Zod
- Use integer storage (cents) if needed for perfect precision

### Risk 4: User Data Loss
**Impact**: Medium
**Mitigation**:
- Implement soft deletes initially
- Add confirmation dialogs for deletions
- Provide easy export functionality
- Consider backup strategies

### Risk 5: Time Zone Handling
**Impact**: Medium
**Mitigation**:
- Store all dates in UTC
- Display dates in user's local time zone
- Use date-fns for consistent date handling

---

## 16. Appendix

### Key Dependencies

| Package | Link |
|---------|------|
| Next.js | https://nextjs.org |
| Prisma | https://prisma.io |
| tRPC | https://trpc.io |
| Supabase | https://supabase.com |
| shadcn/ui | https://ui.shadcn.com |
| Recharts | https://recharts.org |
| React Hook Form | https://react-hook-form.com |
| Zod | https://zod.dev |
| Superjson | https://superjson.pl |

### Environment Variables Template

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Database (for Prisma)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Assumptions Made

1. **Single User**: The app is designed for single-user personal use, not multi-tenant
2. **IDR Currency**: All amounts are in Indonesian Rupiah (no currency conversion needed)
3. **Web-First**: Primary usage is on desktop browser; mobile is secondary
4. **Simple Balance Tracking**: Users manually add balance records, not transaction-based
5. **Supabase Project**: User will create their own Supabase project and provide credentials
6. **No Real-Time Sync**: Balance updates don't need real-time synchronization

### Notes

- This PRD serves as the primary reference for development
- All implementation decisions should align with this document
- Deviations from the PRD should be documented and approved
- The PRD should be updated if requirements change during development
