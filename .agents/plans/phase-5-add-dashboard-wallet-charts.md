# Feature: Dashboard & Wallet Charts

## Feature Description

Add interactive charts to visualize balance history and distribution:

1. **Wallet Detail Page**: Line chart with weekly/monthly toggle tabs
2. **Home Dashboard**: Line chart (total balance) + Pie chart (wallet distribution)

## User Story

As a user
I want to see visual charts of my balance history and distribution
So that I can quickly understand my financial trends and allocation

## Problem Statement

Users currently only see numerical data in lists without visual trends. They need:

- Visual representation of balance changes over time
- Toggle between weekly and monthly aggregations
- Distribution overview across wallets

## Solution Statement

Implement line charts using Recharts with tab-based weekly/monthly switching. For aggregation:

- **Monthly**: x-axis = last day of month, y = closest record date <= month end
- **Weekly**: x-axis = Saturday, y = closest record date <= Saturday
- **Pie chart**: Current balance per wallet

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**:

- Dashboard page (`/src/app/(dashboard)/page.tsx`)
- Wallet detail page (`/src/app/(dashboard)/accounts/[id]/page.tsx`)
- tRPC routers (`/src/server/routers/`)
  **Dependencies**:
- recharts (already installed)
- shadcn/ui chart (needs install)
- shadcn/ui tabs (needs install)

---

## CONTEXT REFERENCES

### Relevant Codebase Files

- `src/app/(dashboard)/accounts/[id]/page.tsx` - Wallet detail page to modify
- `src/app/(dashboard)/page.tsx` - Dashboard page to modify
- `src/server/routers/records.ts` - Records router for data queries
- `src/server/routers/accounts.ts` - Accounts router patterns
- `src/lib/utils.ts` - Utility functions (formatCurrency, formatDate)
- `package.json` - Dependencies (recharts already installed)

### New Files to Create

- `src/components/ui/chart.tsx` - shadcn chart wrapper (via `npx shadcn@latest add chart`)
- `src/components/ui/tabs.tsx` - shadcn tabs (via `npx shadcn@latest add tabs`)
- `src/components/charts/line-chart.tsx` - Reusable line chart component using shadcn ChartContainer
- `src/components/charts/pie-chart.tsx` - Reusable pie chart component using shadcn ChartContainer
- `src/server/routers/charts.ts` - New router for chart data queries

### Patterns to Follow

**shadcn/ui Chart Pattern** (from docs):

```typescript
import { LineChart, Line, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  balance: {
    label: "Balance",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function MyChart({ data }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <Line dataKey="balance" stroke="var(--color-balance)" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </LineChart>
    </ChartContainer>
  )
}
```

**shadcn/ui Tabs Pattern**:

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="monthly">
  <TabsList>
    <TabsTrigger value="weekly">Weekly</TabsTrigger>
    <TabsTrigger value="monthly">Monthly</TabsTrigger>
  </TabsList>
  <TabsContent value="weekly">...</TabsContent>
  <TabsContent value="monthly">...</TabsContent>
</Tabs>
```

**tRPC Router Pattern** (from `src/server/routers/records.ts:43-78`):

```typescript
getByWalletId: protectedProcedure
  .input(z.object({ walletId: z.string() }))
  .query(async ({ ctx, input }) => {
    // Query logic
    return records.map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      // ...
    }))
  }),
```

**Component Pattern** (from `src/features/accounts/components/wallet-card.tsx`):

- Use Card, CardHeader, CardTitle, CardContent
- Use trpc hooks for data fetching

**Import Pattern**:

```typescript
import { trpc } from "@/lib/trpc/client";
import { formatCurrency } from "@/lib/utils";
```

---

## Relevant Documentation

- [shadcn/ui Chart](https://ui.shadcn.com/docs/components/radix/chart)
  - Installation: `npx shadcn@latest add chart`
  - ChartContainer, ChartConfig, ChartTooltip, ChartLegend patterns
  - Why: Official chart component using Recharts with theming support

- [shadcn/ui Tabs](https://ui.shadcn.com/docs/components/radix/tabs)
  - Installation: `npx shadcn@latest add tabs`
  - TabsList, TabsTrigger, TabsContent usage
  - Why: For weekly/monthly toggle

- [Recharts Documentation](https://recharts.org/)
  - LineChart, PieChart, XAxis, YAxis, Tooltip components
  - Why: Underlying chart library used by shadcn

---

## IMPLEMENTATION PLAN

### Phase 1: Setup & Dependencies

**Tasks:**

- Install shadcn/ui chart and tabs components
- Command: `npx shadcn@latest add chart tabs`
- Verify recharts is working (already in package.json)

### Phase 2: Create Chart Components

**Tasks:**

- Create reusable LineChart component with Recharts
- Create reusable PieChart component with Recharts

### Phase 3: Backend - Chart Data Procedures

**Tasks:**

- Create new tRPC router `/src/server/routers/charts.ts`
- Add procedure for wallet balance history (weekly/monthly aggregation)
- Add procedure for global balance history (total of all wallets)
- Add procedure for wallet distribution (pie chart data)
- Register router in `/src/server/index.ts`

### Phase 4: Wallet Detail Page

**Tasks:**

- Add tabs component for weekly/monthly toggle
- Add line chart showing balance over time
- Fetch data using new chart procedures

### Phase 5: Dashboard Page

**Tasks:**

- Add pie chart for wallet distribution
- Add line chart for total balance history
- Integrate with existing stats cards

---

## STEP-BY-STEP TASKS

### {ACTION} {target_file}

---

### INSTALL shadcn/ui chart and tabs

- **IMPLEMENT**: Install chart and tabs components using shadcn CLI
- **COMMAND**:
  ```bash
  npx shadcn@latest add chart
  npx shadcn@latest add tabs
  ```
- **PATTERN**: Check existing shadcn components in `/src/components/ui/`
- **GOTCHA**: Chart component uses Recharts under the hood - already installed
- **VALIDATE**: `ls src/components/ui/chart.tsx src/components/ui/tabs.tsx`

---

### CREATE src/components/charts/line-chart.tsx

- **IMPLEMENT**: Create reusable line chart component using shadcn ChartContainer
- **PATTERN**: Use shadcn/ui chart pattern with ChartContainer, ChartConfig
- **IMPORTS**:
  ```typescript
  import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
  } from "recharts";
  import {
    ChartContainer,
    ChartTooltipContent,
    type ChartConfig,
  } from "@/components/ui/chart";
  import { formatCurrency } from "@/lib/utils";
  ```
- **GOTCHA**: Handle empty data gracefully, use IDR formatting in tooltip
- **VALIDATE**: `npm run typecheck`

---

### CREATE src/components/charts/pie-chart.tsx

- **IMPLEMENT**: Create reusable pie chart component using shadcn ChartContainer
- **PATTERN**: Use shadcn/ui chart pattern with PieChart, Pie, Cell
- **IMPORTS**:
  ```typescript
  import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
  import {
    ChartContainer,
    ChartTooltipContent,
    ChartLegendContent,
    type ChartConfig,
  } from "@/components/ui/chart";
  import { formatCurrency } from "@/lib/utils";
  ```
- **GOTCHA**: Use distinct colors for each pie slice, handle empty data

---

### CREATE src/server/routers/charts.ts

- **IMPLEMENT**: Create new router with chart data procedures
- **PATTERN**: Follow existing router pattern from records.ts
- **IMPORTS**: `zod`, `createTRPCRouter`, `protectedProcedure`, `TRPCError`

**Key Procedures:**

1. `getWalletChartData` - Get aggregated balance history for a wallet
   - Input: `{ walletId: string, period: 'weekly' | 'monthly' }`
   - Output: `{ date: string, balance: number }[]`

2. `getGlobalChartData` - Get aggregated total balance history
   - Input: `{ period: 'weekly' | 'monthly' }`
   - Output: `{ date: string, balance: number }[]`

3. `getWalletDistribution` - Get current balance per wallet for pie chart
   - Input: None
   - Output: `{ name: string, value: number, color: string }[]`

**Aggregation Logic:**

For **monthly**:

- Generate all month-end dates from first record to now
- For each month-end, find the record with closest date <= month-end

For **weekly**:

- Generate all Saturday dates from first record to now
- For each Saturday, find the record with closest date <= Saturday

**VALIDATE**: `npm run typecheck`

---

### UPDATE src/server/index.ts

- **IMPLEMENT**: Register charts router
- **PATTERN**: Import and merge router like other routers
- **IMPORTS**:
  ```typescript
  import { chartsRouter } from "./routers/charts";
  // Add to root router: charts: chartsRouter,
  ```

---

### UPDATE src/app/(dashboard)/accounts/[id]/page.tsx

- **IMPLEMENT**: Add tabs and line chart to wallet detail
- **PATTERN**: Use shadcn/ui Tabs component with TabsList, TabsTrigger, TabsContent
- **IMPORTS**:

  ```typescript
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs";
  import { LineChart } from "@/components/charts/line-chart";
  // Add trpc.charts.getWalletChartData.useQuery
  ```

- **GOTCHA**: The page already has wallet data - reuse existing queries where possible
- **VALIDATE**: `npm run typecheck` then manual test

---

### UPDATE src/app/(dashboard)/page.tsx

- **IMPLEMENT**: Add pie chart (wallet distribution) and line chart (total balance)
- **PATTERN**: Add charts below existing stat cards
- **IMPORTS**:

  ```typescript
  import { PieChart } from "@/components/charts/pie-chart";
  import { LineChart } from "@/components/charts/line-chart";
  // Add trpc.charts.getGlobalChartData.useQuery
  // Add trpc.charts.getWalletDistribution.useQuery
  ```

- **VALIDATE**: `npm run typecheck` then manual test

---

## TESTING STRATEGY

### Manual Validation

1. **Empty State**: Verify charts show appropriate message when no data
2. **Single Record**: Test with one record - should show single point
3. **Multiple Records**: Test with records spanning weeks/months
4. **Weekly Toggle**: Switch tabs, verify data updates correctly
5. **Monthly Toggle**: Switch tabs, verify data updates correctly
6. **Pie Chart**: Verify wallet names and values match current balances
7. **Responsive**: Test on mobile view

### Edge Cases

- Records with same date
- Records with future dates (should be ignored or handled)
- No records for a wallet
- Very large numbers (IDR currency formatting)
- Records exactly on Saturday/month-end boundaries

---

## VALIDATION COMMANDS

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

1. Create a wallet
2. Add multiple records with different dates
3. View wallet detail - check line chart
4. Toggle weekly/monthly tabs
5. View dashboard - check pie chart and line chart

---

## ACCEPTANCE CRITERIA

- [ ] Line chart displays on wallet detail page
- [ ] Weekly/Monthly tabs toggle works correctly
- [ ] Aggregation logic correctly finds closest record <= period end
- [ ] Pie chart shows wallet distribution on dashboard
- [ ] Global line chart shows total balance over time on dashboard
- [ ] Charts handle empty data gracefully
- [ ] Currency formatting is correct (IDR)
- [ ] No TypeScript errors
- [ ] No lint errors

---

## NOTES

### Aggregation Algorithm

For the weekly/monthly aggregation, the key algorithm:

```typescript
// For monthly: find closest record to month-end
const monthEnd = new Date(year, month + 1, 0); // Last day of month
const closestRecord = records
  .filter((r) => r.date <= monthEnd)
  .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

// For weekly: find closest record to Saturday
const saturday = getPreviousSaturday(date);
const closestRecord = records
  .filter((r) => r.date <= saturday)
  .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
```

### Color Palette for Pie Chart

Consider using a fixed palette:

- Slate, Rose, Sky, Emerald, Amber, Violet (from Tailwind/sladcn)

### Chart Responsiveness

Use Recharts `ResponsiveContainer` with fixed aspect ratios for mobile compatibility.
