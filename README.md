# Yatra - Money Tracking for Lazy People

Stop tracking every transaction. Just periodically record your balance and see where you stand. Simple, effortless finance tracking.

## Features

- **Wallet Management** - Create, edit, and delete multiple wallets/accounts
- **Balance Tracking** - Periodically add balance records; latest record = current balance
- **Category Organization** - Organize wallets by category (Idle Cash, Hot Cash, Emergency Fund)
- **Visualizations** - Pie chart for category distribution, line chart for balance history
- **Data Export** - Export data to CSV or JSON
- **Field-Level Encryption** - Sensitive data (amounts, notes) encrypted at rest

## Tech Stack

| Technology    | Purpose                         |
| ------------- | ------------------------------- |
| Next.js 15    | React framework with App Router |
| TypeScript    | Type safety                     |
| Prisma        | ORM for database                |
| tRPC          | Type-safe API layer             |
| Supabase Auth | User authentication             |
| PostgreSQL    | Database                        |
| shadcn/ui     | Component library               |
| Tailwind CSS  | Styling                         |
| Recharts      | Charts                          |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd yatra
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
ENCRYPTION_SECRET=your_strong_random_secret
```

4. Generate Prisma client:

```bash
npm run db:generate
```

5. Push schema to database:

```bash
npm run db:migrate
```

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Push schema to database
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/       # Protected routes
│   │   ├── accounts/     # Wallet management
│   │   ├── categories/    # Category management
│   │   └── page.tsx      # Dashboard
│   └── api/trpc/         # tRPC API handler
├── components/            # Shared components
│   ├── ui/                # shadcn components
│   ├── charts/            # Chart components
│   └── landing/           # Landing page components
├── features/              # Feature-based organization
│   ├── accounts/          # Wallet feature
│   ├── auth/              # Auth feature
│   ├── categories/        # Category feature
│   └── records/           # Balance records feature
├── lib/                   # Utilities
│   ├── supabase/          # Supabase client
│   ├── trpc/              # tRPC client
│   └── encryption.ts      # Field encryption utilities
└── server/                # tRPC server
    ├── routers/           # Feature routers
    └── trpc.ts            # tRPC initialization
```

## Usage

1. **Sign Up** - Create an account with email and password
2. **Add Categories** - Use default categories or create custom ones
3. **Create Wallets** - Add wallets (bank accounts, cash, digital wallets)
4. **Record Balances** - Periodically add your current balance
5. **View Dashboard** - See total balance, category distribution charts
6. **Track History** - View wallet balance trends over time

## Security

- Row Level Security (RLS) for data isolation
- Field-level encryption for sensitive data (amounts, notes)
- Encryption key derived from user authentication (not stored in database)
- All API routes require authentication

## License

MIT
