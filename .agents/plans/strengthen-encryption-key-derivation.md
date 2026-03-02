# Feature: Strengthen Encryption Key Derivation

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Enhance the encryption key derivation to use a secret key from environment variables combined with user ID, instead of using user ID alone. This prevents key recovery attacks if the database is compromised and user IDs are exposed.

## User Story

As a security-conscious developer
I want the encryption keys to be derived from a secret that is not stored in the database
So that even if an attacker obtains the database, they cannot decrypt user data without the secret key

## Problem Statement

Current implementation uses only user ID to derive encryption key:
```typescript
const key = pbkdf2Sync(userId, salt, ...)
```

Issues:
1. User IDs are stored in plaintext in database (Category, Wallet tables)
2. User IDs have low entropy (predictable, often email-based)
3. If database is compromised, attacker can derive all encryption keys

## Solution Statement

Add a secret key from environment variable (`ENCRYPTION_SECRET`) combined with user ID:
```typescript
const keyMaterial = `${process.env.ENCRYPTION_SECRET}:${userId}`
const key = pbkdf2Sync(keyMaterial, salt, ...)
```

This ensures:
- Secret key is never stored in database
- Attacker needs both database dump AND secret key to decrypt
- Keys have higher entropy due to secret component

## Feature Metadata

**Feature Type**: Security Enhancement / Refactor
**Estimated Complexity**: Low
**Primary Systems Affected**: 
- `src/lib/encryption.ts` - Encryption utilities
- `.env.example` - Environment variable documentation
**Dependencies**: None (uses built-in crypto module)

---

## CONTEXT REFERENCES

### Relevant Codebase Files - YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `src/lib/encryption.ts` (lines 1-98) - Current encryption implementation to modify
- `.env.example` (lines 1-10) - Environment variables template to update
- `src/server/routers/records.ts` (lines 22-27) - Shows how encryption is called
- `src/server/routers/accounts.ts` (lines 44-45) - Shows how encryption is called

### New Files to Create

- None (modifying existing files only)

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Node.js Crypto - pbkdf2Sync](https://nodejs.org/api/crypto.html#cryptopbkdf2syncdigest-ikm-salt-iterations-keylen-digest)
  - Key derivation function used
- [Node.js Crypto - timingSafeEqual](https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b)
  - For timing-safe error handling

### Patterns to Follow

**Current Encryption Pattern** (from `src/lib/encryption.ts:21-31`):
```typescript
export function deriveKey(userId: string, existingSalt?: Buffer): DerivedKey {
  const salt = existingSalt ?? deriveSaltFromUserId(userId)
  const key = pbkdf2Sync(
    userId,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    PBKDF2_DIGEST
  )
  return { key, salt }
}
```

**Environment Variable Access Pattern** (check existing patterns in codebase):
```typescript
const secret = process.env.ENCRYPTION_SECRET
if (!secret) {
  throw new Error('ENCRYPTION_SECRET is required')
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

**Tasks:**

- Add ENCRYPTION_SECRET to .env.example with documentation
- Add validation for ENCRYPTION_SECRET in encryption module

### Phase 2: Core Implementation

**Tasks:**

- Modify deriveKey to combine secret + userId
- Update decrypt to handle errors with timing-safe pattern

### Phase 3: Validation

**Tasks:**

- Run typecheck and lint
- Verify build succeeds

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

### UPDATE .env.example

- **IMPLEMENT**: Add ENCRYPTION_SECRET environment variable documentation
- **PATTERN**: Add after existing Supabase variables
- **GOTCHA**: Must be set in actual .env file for encryption to work
- **VALIDATE**: `npm run typecheck`

```bash
# Add to .env.example:
# Encryption secret for field-level encryption
# Generate a strong random string: openssl rand -base64 32
ENCRYPTION_SECRET=your_strong_random_secret_min_32_chars
```

### UPDATE src/lib/encryption.ts

- **IMPLEMENT**: Modify deriveKey function to use secret + userId
- **PATTERN**: Current implementation at lines 21-31
- **IMPORTS**: No new imports needed
- **GOTCHA**: 
  - Must validate secret exists on module load
  - Must handle case where secret is not set
  - Old encrypted data cannot be re-encrypted (same limitation as before)
- **VALIDATE**: `npm run typecheck`

Key changes:
```typescript
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET

function getEncryptionSecret(): string {
  if (!ENCRYPTION_SECRET) {
    throw new Error('ENCRYPTION_SECRET environment variable is required')
  }
  return ENCRYPTION_SECRET
}

export function deriveKey(userId: string, existingSalt?: Buffer): DerivedKey {
  const salt = existingSalt ?? deriveSaltFromUserId(userId)
  const secret = getEncryptionSecret()
  const keyMaterial = `${secret}:${userId}`
  const key = pbkdf2Sync(
    keyMaterial,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    PBKDF2_DIGEST
  )
  return { key, salt }
}
```

### ADD validation at module load

- **IMPLEMENT**: Add immediate validation when module is imported
- **PATTERN**: Check environment variable exists on first import
- **GOTCHA**: This will cause app to fail fast if secret is not set
- **VALIDATE**: `npm run typecheck`

```typescript
// At top of encryption.ts, after imports:
if (process.env.NODE_ENV !== 'test' && !process.env.ENCRYPTION_SECRET) {
  console.warn('WARNING: ENCRYPTION_SECRET is not set. Encryption will not work.')
}
```

### RUN validation commands

- **IMPLEMENT**: Execute validation commands
- **VALIDATE**:
  ```bash
  npm run typecheck
  npm run lint
  npm run build
  ```

---

## TESTING STRATEGY

### Manual Testing

1. **With Secret Set**
   - Create wallet with notes
   - Add record with amount
   - Verify data is encrypted in database
   - Verify data is decrypted correctly on read

2. **Without Secret (Error Case)**
   - Temporarily remove secret from .env
   - Verify app shows error/fails gracefully

### Edge Cases

- Empty userId (should still work with secret)
- Very long secret (should work, truncated internally)
- Special characters in secret (should work with proper escaping)
- Multiple users with same secret (should work - userId provides uniqueness)

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

### Level 3: Manual Validation

1. Set ENCRYPTION_SECRET in .env
2. Restart dev server
3. Create wallet and add record
4. Verify data is encrypted in database
5. Verify data decrypts correctly

---

## ACCEPTANCE CRITERIA

- [ ] ENCRYPTION_SECRET added to .env.example
- [ ] deriveKey uses combination of secret + userId
- [ ] Module validates secret exists at load time
- [ ] Encryption still works correctly with new key derivation
- [ ] Decryption still works correctly with new key derivation
- [ ] npm run typecheck passes
- [ ] npm run lint passes
- [ ] npm run build succeeds

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

### Design Decisions

1. **Secret + UserId combination**: Uses format `${secret}:${userId}` to create key material. The colon separator prevents ambiguity if secret contains special characters.

2. **Validation at module load**: Instead of checking every encryption call, we validate once at module load for performance.

3. **Warning instead of error in dev**: In development, we log a warning rather than throwing, to avoid blocking local development.

### Security Considerations

- Secret must be at least 32 characters for adequate entropy
- Secret should be generated using cryptographically secure random: `openssl rand -base64 32`
- Secret should be rotated periodically (future enhancement)
- In production, secret should be injected via environment, not committed to repo

### Backward Compatibility

- This change will make existing encrypted data unreadable because the key derivation changed
- Users will need to re-enter their data OR we need a migration strategy
- For MVP, acceptable to require re-entry of data
- Future: Could support key rotation with versioned key derivation

### Future Enhancements

- Key rotation mechanism (store key version with each user's data)
- Use user's authentication token instead of static secret
- Hardware Security Module (HSM) integration for enterprise
