# Feature: add-data-export

The following plan should be complete, but validate documentation and codebase patterns before implementing. Pay special attention to naming of existing utils, types and models. Import from the right files.

## Feature Description

Add data export so users can download all their wallets, categories, and balance records as CSV or JSON. Completes US-8 / Phase 3 of the PRD (the last unbuilt MVP feature). Sensitive fields (`Record.amount`, `Record.notes`, `Wallet.notes`) are AES-256-GCM encrypted at rest — export must decrypt them server-side using the user's derived key before serialization.

## User Story

As a Yatra user
I want to export all my data to CSV or JSON
So that I have a backup and can analyze my finances in other tools

## Problem Statement

Data lives only inside the app, encrypted at rest. Users have no way to back up or take ownership of their data outside the app.

## Solution Statement

Two authenticated GET endpoints (`/api/export/csv`, `/api/export/json`) implemented as one Next.js Route Handler that queries Prisma scoped to `user.id`, decrypts sensitive fields with `deriveKey(user.id).key`, serializes, and returns a file download via `Content-Disposition`. A new `/dashboard/export` page renders two download buttons. File downloads don't fit tRPC's superjson model — a native Route Handler + `<a href>` download is the platform-correct approach and matches the PRD's REST endpoint spec (§11).

## Feature Metadata

- **Type**: New Capability
- **Complexity**: Low-Medium
- **Systems affected**: New API route, new feature dir `src/features/export/`, new dashboard page. Sidebar needs NO changes (entry already exists at `src/components/app-sidebar.tsx:30`).
- **Dependencies**: All installed already (zod, Next.js route handlers, shadcn/ui, lucide). No new packages.

---

## CONTEXT REFERENCES

### Relevant Codebase Files — READ BEFORE IMPLEMENTING

- `.opencode/PRD.md` §7.7, §11 (lines 347–353, 570–588) — Why: spec for export formats/endpoints
- `src/app/api/auth/signout/route.ts` — Why: the only existing Route Handler; mirrors its `createClient()` auth pattern
- `src/lib/supabase/server.ts:6-29` — Why: `createClient()` cookie-based server client used for auth in route handlers
- `src/server/trpc.ts:7-16` — Why: shows canonical "get user" pattern (`supabase.auth.getUser()`)
- `src/server/db.ts:13` — Why: import `db` (Prisma) from here, not `@prisma/client` directly
- `src/lib/encryption.ts:30-42,66-99` — Why: `deriveKey(userId).key` + `decrypt(encryptedData, key)`; note `decrypt` returns `''` on failure
- `src/server/routers/accounts.ts:43-90` — Why: exact query shape (include category + latest record) and decrypt mapping to mirror
- `src/server/routers/records.ts:77-84` — Why: record field mapping pattern (amount→Number, dates→toISOString)
- `src/features/categories/validation.ts:20-23` — Why: `CATEGORY_TYPE_LABELS` exists (Indonesian labels); export uses raw enum values instead (machine-readable backup)
- `src/app/(dashboard)/dashboard/categories/page.tsx` — Why: page pattern to copy (import feature component, wrap in `space-y-6`)
- `src/components/app-sidebar.tsx:26-31` — Why: proves `/dashboard/export` nav already wired; do not touch

### New Files to Create

- `src/app/api/export/[format]/route.ts` — dynamic Route Handler (`csv` | `json`)
- `src/features/export/components/export-buttons.tsx` — client UI (two download cards/buttons)
- `src/features/export/index.ts` — barrel export (house convention)
- `src/app/(dashboard)/dashboard/export/page.tsx` — dashboard page

### Relevant Documentation

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
  - Section: Dynamic Route Segments + returning non-JSON responses
  - Why: `[format]` param handling and streaming a file response
- [MDN Content-Disposition](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition)
  - Why: `attachment; filename="..."` header triggers browser download

### Patterns to Follow

**Naming**: kebab-case files, PascalCase components, camelCase functions (AGENTS.md).

**Auth in route handler** (mirror `signout/route.ts` + `trpc.ts:10`):

```ts
const supabase = await createClient()
const { data } = await supabase.auth.getUser()
if (!data.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

**Decrypt mapping** (mirror `accounts.ts:65-89`):

```ts
const key = deriveKey(user.id).key
amount: Number(decrypt(r.amount, key))
notes: r.notes ? decrypt(r.notes, key) : null
```

**Query scoping**: every query filtered by `userId: user.id` (data isolation, TUS-1).

**Error handling**: user-friendly messages via Sonner toast on client; plain status codes on server.

---

## IMPLEMENTATION PLAN

### Phase 1: API Route

Dynamic route `src/app/api/export/[format]/route.ts`: validate `format` against `z.enum(['csv','json'])` (404 otherwise), authenticate via Supabase cookies (401 otherwise), fetch categories + wallets (+records) scoped to user, decrypt, serialize, respond with `Content-Type: text/csv` or `application/json` plus `Content-Disposition: attachment; filename="yatra-export-YYYY-MM-DD.ext"` and `Cache-Control: no-store`.

### Phase 2: Serialization

CSV: single flat table, columns `date,wallet_name,category_name,category_type,amount,notes` — rows sorted date desc. Proper RFC 4180 escaping (wrap in quotes, double inner quotes) since notes may contain commas/newlines. Header row always present even when empty.

JSON: `{ exportedAt, categories[], wallets[], records[] }` with decrypted plaintext, IDs included (enables future import).

### Phase 3: UI

`ExportButtons` client component: two cards/buttons ("Export CSV", "Export JSON") implemented as `<a href="/api/export/{format}" download>` with lucide icons — native browser download, no fetch/blob JS needed. Page mirrors `categories/page.tsx` shape.

### Phase 4: Validation

Project has NO test framework (no jest/vitest in package.json) — verification is lint + typecheck + build + manual curl/browser check. Do not introduce a test framework.

---

## STEP-BY-STEP TASKS

### TASK 1: CREATE `src/app/api/export/[format]/route.ts`

- **IMPLEMENT**: `export async function GET(request: Request, { params }: { params: Promise<{ format: string }> })` — Next.js 15+/16 params are async, must `await params`.
- **IMPLEMENT** flow: `const { format } = await params` → `z.enum(['csv','json']).safeParse(format)` → 404 if invalid → auth via `createClient().auth.getUser()` → 401 if no user → `deriveKey(user.id)` → three `db.category/wallet.findMany({ where: { userId } })`, wallets `include: { category: true, records: { orderBy: [{date:'desc'},{createdAt:'desc'}] } }` → map decrypted → serialize csv|json → return `new Response(body, { headers })`.
- **IMPLEMENT** `csvEscape(value: string): string` helper inline: `'"' + value.replace(/"/g, '""') + '"'`; apply to every cell except numbers/dates.
- **PATTERN**: auth — `src/app/api/auth/signout/route.ts:4-5`; query+decrypt — `src/server/routers/accounts.ts:44-89`.
- **IMPORTS**: `createClient` from `@/lib/supabase/server`; `db` from `@/server/db`; `deriveKey, decrypt` from `@/lib/encryption`; `z` from `zod`; `NextResponse` from `next/server`.
- **GOTCHA**: `Record` model name collides with TS `Record` type — alias Prisma type or avoid importing it. Amounts are stored as Text (encrypted base64), NOT Decimal — always `Number(decrypt(...))`. Do not use `decryptToNumber` (silently returns 0 on failure).
- **GOTCHA**: filename date via `new Date().toISOString().slice(0,10)`; set `Cache-Control: no-store` (plaintext financial data must not be cached).
- **VALIDATE**: `npx tsc --noEmit`

### TASK 2: CREATE `src/features/export/components/export-buttons.tsx`

- **IMPLEMENT**: `"use client"` component rendering two `<a href="/api/export/csv" download>` / `<a href="/api/export/json" download>` styled with shadcn `Button` (`asChild` + `variant="outline"`), lucide `FileSpreadsheet`/`FileJson` icons, short description text under each label.
- **PATTERN**: Button usage — `src/components/app-sidebar.tsx:73-85`.
- **IMPORTS**: `Button` from `@/components/ui/button`; icons from `lucide-react`.
- **GOTCHA**: anchor download inherits auth cookies automatically — no client-side fetch logic needed.
- **VALIDATE**: `npx tsc --noEmit`

### TASK 3: CREATE `src/features/export/index.ts`

- **IMPLEMENT**: `export { ExportButtons } from './components/export-buttons'`
- **PATTERN**: `src/features/categories/index.ts`
- **VALIDATE**: `npx tsc --noEmit`

### TASK 4: CREATE `src/app/(dashboard)/dashboard/export/page.tsx`

- **IMPLEMENT**: default export rendering `<div className="space-y-6"><h1 className="text-2xl font-semibold">Export Data</h1><p className="text-muted-foreground text-sm">...</p><ExportButtons /></div>`
- **PATTERN**: `src/app/(dashboard)/dashboard/categories/page.tsx` (identical structure)
- **VALIDATE**: `npm run check && npm run build`

---

## TESTING STRATEGY

No test framework in project — matching project standards means **no unit tests**; rely on compile-time safety + manual validation. The only pure logic worth eyeballing is `csvEscape` (commas, quotes, newlines in notes).

### Edge Cases to verify manually

- Notes containing commas, double quotes, newlines → open CSV in spreadsheet, columns intact
- Wallet with zero records → appears in JSON `wallets`, absent from CSV rows (acceptable)
- User with zero data → CSV = header row only; JSON = empty arrays; both download successfully
- Unauthenticated `curl http://localhost:3000/api/export/json` → 401
- Bad format `/api/export/xml` → 404

---

## VALIDATION COMMANDS

```bash
npm run check     # next lint && tsc --noEmit   (Level 1)
npm run build     # production build            (Level 2)
# Level 3: manual — logged-in browser: click both buttons, verify downloads open correctly
curl -i http://localhost:3000/api/export/json   # expect 401 unauthenticated
```

## ACCEPTANCE CRITERIA

- [ ] `/api/export/csv` and `/api/export/json` download files when authenticated; 401 otherwise
- [ ] CSV opens cleanly in a spreadsheet app (proper escaping of notes)
- [ ] JSON contains all categories, wallets, records with decrypted amounts/notes
- [ ] Only the requesting user's data is included (userId-scoped queries)
- [ ] Sidebar "Export" link resolves to working page
- [ ] `npm run check` and `npm run build` pass with zero errors
- [ ] No new dependencies added

## NOTES

- **Route Handler vs tRPC**: deliberate deviation from "API via tRPC hooks" — file downloads need `Content-Disposition`, which tRPC/superjson can't express; PRD §11 itself specifies these as GET endpoints. This is the project's second route handler (first: signout).
- **Skipped (YAGNI)**: date-range filter (PRD marks "optional"), export feature hooks/tRPC integration, CSV multi-section format. Add when requested.
- **Security note**: exports contain decrypted plaintext financial data — hence `Cache-Control: no-store`. Consider a confirm hint in UI copy later.
- Category types exported as raw enums (`HOT_CASH`), not Indonesian labels — backups should be machine-readable.
