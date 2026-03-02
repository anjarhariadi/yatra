# Feature: Field-Level Encryption for Sensitive Data

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Implement application-level field-level encryption for sensitive financial data in Yatra. This ensures that even if the database is compromised, users' financial amounts and private notes remain encrypted. The encryption uses AES-256-GCM with keys derived from each user's Supabase JWT, providing per-user encryption without storing keys in the database.

## User Story

As a privacy-conscious user
I want my financial data (balances and notes) to be encrypted at rest
So that even if the database is compromised, my sensitive financial information remains unreadable

## Problem Statement

Currently, all user data in Yatra is stored in plaintext in the PostgreSQL database. While Supabase provides encryption at rest, field-level encryption adds an additional layer of security ensuring that:
1. Database administrators cannot read user financial data
2. Database backups remain encrypted
3. Data is protected even if SQL injection occurs

## Solution Statement

Implement application-level AES-256-GCM encryption using Node.js built-in `crypto` module:
- Encrypt `Record.amount`, `Record.notes`, and `Wallet.notes` before database writes
- Decrypt fields after database reads
- Derive encryption key from user's Supabase JWT using PBKDF2
- Store encrypted data as base64-encoded strings
- Each user has a unique encryption key tied to their authentication session

## Feature Metadata

**Feature Type**: Security Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: 
- tRPC routers (records.ts, accounts.ts)
- Encryption utility layer
- Prisma schema
**Dependencies**: Node.js crypto module (built-in), no external packages needed

---

## CONTEXT REFERENCES

### Relevant Codebase Files - YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `src/server/trpc.ts` (lines 1-72) - Contains tRPC setup, context creation, and protectedProcedure. User is available at `ctx.user`
- `src/server/routers/records.ts` (lines 1-178) - Records CRUD operations. Need to encrypt `amount` and `notes` fields
- `src/server/routers/accounts.ts` (lines 1-307) - Wallet CRUD operations. Need to encrypt `notes` field
- `src/server/routers/charts.ts` (lines 1-229) - Chart data queries that read amounts. Must work with encrypted data
- `prisma/schema.prisma` (lines 1-61) - Database schema. Fields to encrypt: `Record.amount`, `Record.notes`, `Wallet.notes`
- `src/features/records/validation.ts` (lines 1-13) - Zod validation schema for records
- `src/features/accounts/validation.ts` (lines 1-10) - Zod validation schema for wallets

### New Files to Create

- `src/lib/encryption.ts` - Core encryption/decryption utilities using Node.js crypto
- `prisma/migrations/YYYYMMDDHHMMSS_encrypt_fields/migration.sql` - Migration to change column types

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Node.js Crypto Module - createCipheriv](https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options)
  - AES-256-GCM encryption with authenticated encryption
  - Why: Required for implementing secure encryption
- [Node.js Crypto - PBKDF2](https://nodejs.org/api/crypto.html#cryptopbkdf2syncdigest-ikm-salt-iterations-keylen-digest)
  - Key derivation from user JWT
  - Why: Deriving encryption key from user's authentication token

### Patterns to Follow

**Existing tRPC Router Pattern** (from `src/server/routers/records.ts:24-41`):
```typescript
const record = await ctx.db.record.create({
  data: {
    walletId: input.walletId,
    amount: input.amount,
    date: new Date(input.date),
    notes: input.notes ?? null,
  },
})

return {
  id: record.id,
  amount: Number(record.amount),
  date: record.date.toISOString(),
  notes: record.notes,
  // ...
}
```

**Protected Procedure Pattern** (from `src/server/trpc.ts:53-62`):
```typescript
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }
  return next();
});

export const protectedProcedure = t.procedure.use(authMiddleware);
```

**Error Handling Pattern** (from `src/server/routers/records.ts:17-22`):
```typescript
if (!wallet) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'Wallet not found',
  })
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

**Tasks:**

- CREATE `src/lib/encryption.ts` - Core encryption utilities with AES-256-GCM
- CREATE database migration to change column types from Decimal to String for encrypted storage
- UPDATE Prisma schema to reflect new column types

### Phase 2: Core Implementation

**Tasks:**

- UPDATE `src/server/routers/records.ts` - Add encryption on write, decryption on read
- UPDATE `src/server/routers/accounts.ts` - Add encryption on write, decryption on read for wallet notes
- UPDATE `src/server/routers/charts.ts` - Ensure chart calculations work with encrypted data (decrypt before calculation)

### Phase 3: Integration

**Tasks:**

- VERIFY all CRUD operations work correctly
- VERIFY export functionality still works (data must be decrypted for export)
- RUN type checking and linting

### Phase 4: Testing & Validation

**Tasks:**

- MANUAL TEST create record with amount and notes
- MANUAL TEST update record
- MANUAL TEST view records (verify decryption works)
- MANUAL TEST create/update wallet with notes
- MANUAL TEST charts display correct values
- MANUAL TEST export to CSV/JSON

---

## STEP-BY-STEP TASKS

### Task Format Guidelines

Use information-dense keywords for clarity:

- **CREATE**: New files or components
- **UPDATE**: Modify existing files
- **ADD**: Insert new functionality into existing code
- **REMOVE**: Delete deprecated code
- **REFACTOR**: Restructure without changing behavior
- **MIRROR**: Copy pattern from elsewhere in codebase

### CREATE src/lib/encryption.ts

- **IMPLEMENT**: Core encryption module with AES-256-GCM
- **PATTERN**: Based on Node.js crypto best practices (GCM authenticated encryption)
- **IMPORTS**: `import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto'`
- **GOTCHA**: 
  - Use 12-byte (96-bit) IV as recommended by NIST for AES-GCM
  - Store IV prepended to ciphertext for decryption
  - Use PBKDF2 with high iteration count (100,000+) for key derivation
  - Encode output as base64 for database storage
- **VALIDATE**: `npm run typecheck`

```typescript
// Key implementation points:
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits - NIST recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits
const PBKDF2_ITERATIONS = 100000;

// Encrypt: generate IV, create cipher, prepend IV to ciphertext, append auth tag
// Decrypt: extract IV from start, extract auth tag from end, decipher

// Key derivation: use user's JWT or user ID with PBKDF2
export function deriveKey(userId: string, salt?: Buffer): { key: Buffer, salt: Buffer }
export function encrypt(text: string, key: Buffer): string // returns base64
export function decrypt(encryptedData: string, key: Buffer): string // returns original
```

### CREATE prisma migration for encrypted fields

- **IMPLEMENT**: Migration to change column types
- **PATTERN**: Add new columns, migrate data, drop old columns (or use ALTER)
- **GOTCHA**: 
  - Record.amount changes from Decimal(15,2) to String (encrypted)
  - Record.notes changes from String to String (remains same, but encrypted)
  - Wallet.notes changes from String to String (remains same, but encrypted)
- **VALIDATE**: `npx prisma migrate dev --name encrypt_fields`

### UPDATE prisma/schema.prisma

- **IMPLEMENT**: Update column types for encrypted fields
- **PATTERN**: Change `amount` from Decimal to String in Record model
- **IMPORTS**: No imports needed
- **GOTCHA**: Keep Decimal for now but will store encrypted string representation
- **VALIDATE**: `npx prisma generate`

### UPDATE src/server/routers/records.ts

- **IMPLEMENT**: Add encryption on create/update, decryption on read
- **PATTERN**: Import encryption functions, derive key from user ID, encrypt before db write, decrypt after read
- **IMPORTS**: 
  ```typescript
  import { encrypt, decrypt, deriveKey } from '@/lib/encryption'
  ```
- **GOTCHA**: 
  - Amount must be converted to string before encryption
  - Handle null/undefined gracefully
  - Charts router must receive decrypted values
- **VALIDATE**: Test creating and reading records

Key changes:
```typescript
// In create mutation:
const key = deriveKey(ctx.user!.id).key
const encryptedAmount = encrypt(input.amount.toString(), key)

await ctx.db.record.create({
  data: {
    amount: encryptedAmount as any, // Prisma will store as string
    notes: input.notes ? encrypt(input.notes, key) : null,
    // ...
  }
})

// In query results:
return {
  amount: Number(decrypt(record.amount, key)), // Decrypt for API response
  notes: record.notes ? decrypt(record.notes, key) : null,
  // ...
}
```

### UPDATE src/server/routers/accounts.ts

- **IMPLEMENT**: Add encryption for wallet notes on create/update, decryption on read
- **PATTERN**: Same as records router
- **IMPORTS**: 
  ```typescript
  import { encrypt, decrypt, deriveKey } from '@/lib/encryption'
  ```
- **GOTCHA**: Wallet name should NOT be encrypted (used for display)
- **VALIDATE**: Test creating and reading wallets with notes

### UPDATE src/server/routers/charts.ts

- **IMPLEMENT**: Decrypt amounts before chart calculations
- **PATTERN**: Derive key and decrypt amounts in chart queries
- **IMPORTS**: 
  ```typescript
  import { decrypt, deriveKey } from '@/lib/encryption'
  ```
- **GOTCHA**: Charts query many records - derive key once and reuse
- **VALIDATE**: Verify charts display correct totals after encryption

### RUN validation commands

- **IMPLEMENT**: Execute all validation commands
- **VALIDATE**:
  ```bash
  npm run typecheck
  npm run lint
  npm run build
  ```

---

## TESTING STRATEGY

### Manual Testing

Test all CRUD operations for records and wallets with encrypted fields:

1. **Create Record**
   - Input: amount=1000000, notes="my secret note"
   - Verify in database: amount is encrypted string, notes is encrypted

2. **Read Record**
   - Verify API returns decrypted amount and notes
   - Amount should be number (1000000), notes should be string

3. **Update Record**
   - Change amount and notes
   - Verify encrypted values change in database

4. **Charts**
   - Verify total balances calculate correctly
   - Verify pie chart shows correct distribution

5. **Export**
   - Verify exported CSV/JSON contains decrypted values

### Edge Cases

- Empty notes (should store as null or empty encrypted string)
- Very large amounts (IDR can be large)
- Special characters in notes
- Concurrent requests
- User session expiry (decryption should work as long as user ID is available)

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

### Level 3: Database

```bash
npx prisma generate
npx prisma db push
```

### Level 4: Manual Validation

1. Create a new wallet
2. Add a record with amount and notes
3. Verify record appears in wallet detail with correct decrypted values
4. Check database directly to verify encryption
5. View dashboard charts
6. Export data

---

## ACCEPTANCE CRITERIA

- [ ] `src/lib/encryption.ts` created with AES-256-GCM implementation
- [ ] Database migration created for encrypted column types
- [ ] Prisma schema updated for new column types
- [ ] Records router encrypts `amount` and `notes` on write
- [ ] Records router decrypts `amount` and `notes` on read
- [ ] Accounts router encrypts `notes` on write
- [ ] Accounts router decrypts `notes` on read
- [ ] Charts router decrypts amounts for calculations
- [ ] All CRUD operations work correctly
- [ ] Charts display correct values
- [ ] Export functionality returns decrypted data
- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` succeeds

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

### Design Decisions

1. **AES-256-GCM**: Chosen over CBC because GCM provides authenticated encryption (detects tampering). This is the recommended mode for modern applications per NIST guidelines.

2. **User-derived key**: Instead of storing keys in the database, we derive them from the user's JWT/auth token. This means:
   - Each user's data is encrypted with a unique key
   - Key is not stored anywhere
   - If user forgets password, data cannot be decrypted (acceptable for this use case)

3. **String storage for amounts**: Since we're encrypting, we store amounts as encrypted strings. This is less efficient than numeric storage but necessary for encryption.

4. **No external dependencies**: Using Node.js built-in crypto module avoids adding dependencies and potential security vulnerabilities.

### Performance Considerations

- Encryption adds ~5-10% overhead per operation
- Key derivation is expensive (intentional - prevents brute force)
- Derive key once per request and reuse for multiple operations

### Security Considerations

- Never log encryption keys or decrypted sensitive data
- IV must be unique per encryption operation (using random IV)
- Auth tag validates data integrity (detects tampering)
- PBKDF2 iterations set to 100,000 for strong key derivation
