import { customAlphabet } from 'nanoid'
import { nolookalikesSafe } from 'nanoid-dictionary'

// ======================================================================
// Transaction ID Generator
// ======================================================================

/**
 * Generates a unique transaction ID with the following format:
 * TRPC + 10 random alphanumeric characters + current timestamp
 *
 * @example
 * const transactionId = generateTransactionId();
 * * Returns: TRPCAB12CD3EFG1234567890
 *
 * @returns {string} Unique transaction ID in format TRPC[random][timestamp]
 */
export function generateTransactionId(): string {
  const prefix = 'TRPC'
  const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)
  const random = nanoid()
  const timestamp = Date.now()

  return `${prefix}${random}${timestamp}`
}

export const generateId = customAlphabet(nolookalikesSafe, 32)
