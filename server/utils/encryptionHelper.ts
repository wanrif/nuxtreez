import { useRuntimeConfig } from '#imports'
import {
  type CipherCCM,
  type CipherCCMTypes,
  type CipherGCM,
  type CipherGCMTypes,
  type CipherKey,
  type DecipherCCM,
  type DecipherGCM,
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
} from 'crypto'

// ======================================================================
// Encryption Helper Class
// ======================================================================

/**
 * Advanced encryption helper using crypto module with multiple algorithms support.
 * Supports both GCM and CCM modes with different key lengths (128, 192, 256 bits)
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
 * const encryptedCCM = encryptHelperCCM.encrypt('data', 'base64');
 * const decryptedCCM = encryptHelperCCM.decrypt(encryptedCCM, 'base64');
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
  private readonly cipherCache: Map<string, CipherGCM | DecipherGCM | CipherCCM | DecipherCCM>

  constructor(password: string, algorithm?: string) {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }
    this.algorithm = this.validateAlgorithm(algorithm || config.encryptionAlgorithm || 'aes-256-gcm')
    const keyLength = this.getKeyLength(this.algorithm)

    const salt = createHash('sha256').update(config.encryptionSalt).digest().subarray(0, 16)
    this.key = scryptSync(password, salt, keyLength)
    this.ivLength = this.getIvLength(this.algorithm)
    this.cipherCache = new Map()
  }

  private validateAlgorithm(algorithm: string): string {
    const validAlgorithms = [
      'aes-128-gcm',
      'aes-192-gcm',
      'aes-256-gcm',
      'aes-128-ccm',
      'aes-192-ccm',
      'aes-256-ccm',
      'chacha20-poly1305',
    ]
    if (!validAlgorithms.includes(algorithm)) {
      throw new Error(`Unsupported algorithm: ${algorithm}`)
    }
    return algorithm
  }

  private getKeyLength(algorithm: string): number {
    switch (algorithm) {
      case 'aes-128-gcm':
      case 'aes-128-ccm':
        return 16 // 128 bits = 16 bytes
      case 'aes-192-gcm':
      case 'aes-192-ccm':
        return 24 // 192 bits = 24 bytes
      case 'aes-256-gcm':
      case 'aes-256-ccm':
      case 'chacha20-poly1305':
        return 32 // 256 bits = 32 bytes
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`)
    }
  }

  private getIvLength(algorithm: string): number {
    // IV length varies between AES modes (GCM/CCM = 12 bytes)
    switch (algorithm) {
      case 'aes-128-gcm':
      case 'aes-192-gcm':
      case 'aes-256-gcm':
      case 'aes-128-ccm':
      case 'aes-192-ccm':
      case 'aes-256-ccm':
        return 12 // Recommended IV length for GCM and CCM modes
      case 'chacha20-poly1305':
        return 12 // ChaCha20-Poly1305 requires 12-byte nonce
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`)
    }
  }

  private getAuthTagLength(_algorithm: string): number {
    // CCM and GCM modes support auth tag lengths of 4, 6, 8, 10, 12, 14, and 16 bytes
    return 16 // Maximum auth tag length for GCM and CCM modes
  }

  private validateEncryptedPayload(payload: string): boolean {
    const parts = payload.split(':')
    if (parts.length !== 3) return false

    // Check if IV is valid hex
    if (!/^[0-9a-fA-F]+$/.test(parts[0])) return false

    // IV length should match algorithm requirement (24 hex chars = 12 bytes)
    if (parts[0].length !== this.ivLength * 2) return false

    // For ChaCha20-Poly1305, additional validation
    if (this.algorithm === 'chacha20-poly1305') {
      // Auth tag must be 32 hex chars (16 bytes) for ChaCha20-Poly1305
      if (parts[1].length !== 32) return false
    }

    return true
  }

  encrypt(payload: string, outputFormat: 'hex' | 'base64' = 'hex'): string {
    try {
      if (!payload) throw new Error('Payload cannot be empty')

      const iv = randomBytes(this.ivLength)

      const cipher =
        this.algorithm === 'chacha20-poly1305'
          ? createCipheriv('chacha20-poly1305', this.key, iv)
          : this.algorithm.includes('ccm')
            ? createCipheriv(this.algorithm as CipherCCMTypes, this.key, iv, {
                authTagLength: this.getAuthTagLength(this.algorithm),
              })
            : createCipheriv(this.algorithm as CipherGCMTypes, this.key, iv)

      const encryptedBuffer = Buffer.concat([cipher.update(Buffer.from(payload, 'utf8')), cipher.final()])
      const authTag = (cipher as CipherGCM | CipherCCM).getAuthTag()

      const result = `${iv.toString('hex')}:${authTag.toString('hex')}:${encryptedBuffer.toString(outputFormat)}`

      // Clean up sensitive data
      encryptedBuffer.fill(0)
      return result
    } catch (error) {
      throw new Error(`Encryption failed: ${(error as Error).message}`)
    }
  }

  async decrypt(encryptedPayload: string, inputFormat: 'hex' | 'base64' = 'hex', maxRetries = 3): Promise<string> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (!encryptedPayload) throw new Error('Encrypted payload cannot be empty')
        if (!this.validateEncryptedPayload(encryptedPayload)) {
          throw new Error('Invalid encrypted payload format')
        }

        const [ivHex, authTagHex, encryptedData] = encryptedPayload.split(':')
        const iv = Buffer.from(ivHex, 'hex')
        const authTag = Buffer.from(authTagHex, 'hex')

        const decipher =
          this.algorithm === 'chacha20-poly1305'
            ? createDecipheriv('chacha20-poly1305', this.key, iv)
            : this.algorithm.includes('ccm')
              ? createDecipheriv(this.algorithm as CipherCCMTypes, this.key, iv, {
                  authTagLength: this.getAuthTagLength(this.algorithm),
                })
              : createDecipheriv(this.algorithm as CipherGCMTypes, this.key, iv)

        ;(decipher as DecipherGCM | DecipherCCM).setAuthTag(authTag)
        const encrypted = Buffer.from(encryptedData, inputFormat)
        const result = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')

        encrypted.fill(0)
        return result
      } catch (error) {
        lastError = error as Error
        // Only retry if it's an authentication error
        if (!(error instanceof Error) || !error.message.includes('auth')) {
          break
        }
        // Wait a small amount of time before retrying
        await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)))
      }
    }

    throw new Error(`Decryption failed after ${maxRetries} attempts: ${lastError?.message}`)
  }

  // Clean up sensitive data when instance is no longer needed
  destroy(): void {
    this.key = Buffer.alloc(0)
    this.cipherCache.clear()
  }
}

// ======================================================================
// Encryption Instances
// ======================================================================

/**
 * Default encryption helpers with different algorithms
 * Uses runtime config for encryption password
 */

const createSingletonHelper = (password: string, algorithm: string) => {
  let instance: CryptoHelper | null = null
  return () => {
    if (!instance) {
      instance = new CryptoHelper(password, algorithm)
    }
    return instance
  }
}

// Export singleton instances
export const encryptHelper = createSingletonHelper(password, 'aes-256-gcm')()
export const encryptHelperCCM = createSingletonHelper(password, 'aes-128-ccm')()
export const encryptHelper192 = createSingletonHelper(password, 'aes-192-gcm')()
export const encryptHelperChaCha = createSingletonHelper(password, 'chacha20-poly1305')()
