import { useRuntimeConfig } from '#imports'
import {
  type CipherGCM,
  type CipherGCMTypes,
  type CipherKey,
  type DecipherGCM,
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto'

// ======================================================================
// Encryption Helper Class
// ======================================================================

/**
 * Advanced encryption helper using crypto module with multiple algorithms support.
 * Supports both GCM and CBC modes with different key lengths (128, 192, 256 bits)
 *
 * @features
 * - Secure key derivation using scrypt
 * - Initialization Vector (IV) for each encryption
 * - Authentication tags for GCM mode
 * - Configurable output formats (hex/base64)
 *
 * @environment
 * - ENCRYPTION_PASSWORD: Strong password for key derivation
 * - ENCRYPTION_ALGORITHM: (Optional) Default is 'aes-256-gcm'
 *
 * @example
 * ```typescript
 * * Basic usage with default helper (aes-256-gcm)
 * const encrypted = encryptHelper.encrypt('sensitive data');
 * const decrypted = encryptHelper.decrypt(encrypted);
 *
 * * Using different algorithms
 * const encrypted128 = encryptHelper128.encrypt('data', 'base64');
 * const decrypted128 = encryptHelper128.decrypt(encrypted128, 'base64');
 *
 * * Using different output formats
 * const encryptedBase64 = encryptHelper.encrypt('data', 'base64');
 * const encryptedHex = encryptHelper.encrypt('data', 'hex');
 * ```
 */

const config = useRuntimeConfig()
const password = config.encryptionPassword

class CryptoHelper {
  private algorithm: string
  private key: CipherKey
  private ivLength: number

  constructor(password: string, algorithm?: string) {
    this.algorithm = algorithm || config.encryptionAlgorithm || 'aes-256-gcm'
    const keyLength = this.getKeyLength(this.algorithm)
    this.key = Uint8Array.from(scryptSync(password, 'salt', keyLength)) // Derive key based on algorithm
    this.ivLength = this.getIvLength(this.algorithm)
  }

  private getKeyLength(algorithm: string): number {
    switch (algorithm) {
      case 'aes-128-gcm':
      case 'aes-128-cbc':
        return 16 // 128 bits = 16 bytes
      case 'aes-192-gcm':
      case 'aes-192-cbc':
        return 24 // 192 bits = 24 bytes
      case 'aes-256-gcm':
      case 'aes-256-cbc':
        return 32 // 256 bits = 32 bytes
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`)
    }
  }

  private getIvLength(algorithm: string): number {
    // IV length varies between AES modes (GCM = 12 bytes, CBC = 16 bytes)
    switch (algorithm) {
      case 'aes-128-gcm':
      case 'aes-192-gcm':
      case 'aes-256-gcm':
        return 12 // Recommended IV length for GCM mode
      case 'aes-128-cbc':
      case 'aes-192-cbc':
      case 'aes-256-cbc':
        return 16 // Standard IV length for CBC mode
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`)
    }
  }

  encrypt(payload: string, outputFormat: 'hex' | 'base64' = 'hex'): string {
    const iv = randomBytes(this.ivLength) // Generate IV based on algorithm's required length
    const cipher = createCipheriv(this.algorithm as CipherGCMTypes, this.key, Uint8Array.from(iv))

    let encrypted = cipher.update(payload, 'utf8', outputFormat)
    encrypted += cipher.final(outputFormat)

    if (this.algorithm.includes('gcm')) {
      const authTag = (cipher as CipherGCM).getAuthTag().toString(outputFormat) // Get GCM authentication tag
      return `${iv.toString('hex')}:${authTag}:${encrypted}`
    }

    return `${iv.toString('hex')}:${encrypted}`
  }

  decrypt(encryptedPayload: string, inputFormat: 'hex' | 'base64' = 'hex'): string {
    const [ivHex, authTagOrEncrypted, encrypted] = encryptedPayload.split(':')
    const iv = Buffer.from(ivHex, 'hex')

    const decipher = createDecipheriv(
      this.algorithm.includes('gcm') ? (this.algorithm as CipherGCMTypes) : this.algorithm,
      this.key,
      Uint8Array.from(iv)
    )

    if (this.algorithm.includes('gcm')) {
      const authTag = Buffer.from(authTagOrEncrypted, inputFormat) // Auth tag for GCM
      ;(decipher as DecipherGCM).setAuthTag(Uint8Array.from(authTag))
    }

    let decrypted: string
    if (this.algorithm.includes('gcm')) {
      decrypted = decipher.update(encrypted, inputFormat, 'utf8')
    } else {
      decrypted = decipher.update(authTagOrEncrypted, inputFormat, 'utf8')
    }

    decrypted += decipher.final('utf8')
    return decrypted
  }
}

// ======================================================================
// Encryption Instances
// ======================================================================

/**
 * Default encryption helpers with different algorithms
 * Uses runtime config for encryption password
 */

export const encryptHelper = new CryptoHelper(password, 'aes-256-gcm')
export const encryptHelper128 = new CryptoHelper(password, 'aes-128-cbc')
export const encryptHelper192 = new CryptoHelper(password, 'aes-192-gcm')
