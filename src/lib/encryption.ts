import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync, createHash } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 16
const KEY_LENGTH = 32
const PBKDF2_ITERATIONS = 100000
const PBKDF2_DIGEST = 'sha256'

export interface DerivedKey {
  key: Buffer
  salt: Buffer
}

function deriveSaltFromUserId(userId: string): Buffer {
  const hash = createHash('sha256').update(userId).digest()
  return hash.subarray(0, SALT_LENGTH)
}

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

export function encrypt(text: string, key: Buffer): string {
  if (!text) {
    return ''
  }

  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  const combined = Buffer.concat([iv, authTag, encrypted])

  return combined.toString('base64')
}

export function decrypt(encryptedData: string, key: Buffer): string {
  if (!encryptedData) {
    return ''
  }

  try {
    const combined = Buffer.from(encryptedData, 'base64')

    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
      console.error('Encrypted data too short:', combined.length)
      return ''
    }

    const iv = combined.subarray(0, IV_LENGTH)
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

    const decipher = createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    })

    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  } catch (error) {
    console.error('Decryption failed:', error)
    return ''
  }
}

export function encryptNumber(value: number, key: Buffer): string {
  return encrypt(value.toString(), key)
}

export function decryptToNumber(encryptedData: string, key: Buffer): number {
  const decrypted = decrypt(encryptedData, key)
  const parsed = parseFloat(decrypted)
  return isNaN(parsed) ? 0 : parsed
}
