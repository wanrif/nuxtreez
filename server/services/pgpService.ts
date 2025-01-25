import * as openpgp from 'openpgp'

import { generateId } from '~/server/utils/coreHelper'
import { decryptWithSessionKey, encryptWithSessionKey, generateKeyPair } from '~/server/utils/cryptoHelper'

export class PgpService {
  private static instance: PgpService
  private serverKeyPair: { publicKey: string; privateKey: string } | null = null
  private clientPublicKey: string | null = null
  private keyCreationTime: number = 0
  private readonly KEY_ROTATION_INTERVAL = 1000 * 60 * 60 * 24 * 30 // 30 days

  private constructor() {}

  static getInstance(): PgpService {
    if (!this.instance) {
      this.instance = new PgpService()
    }
    return this.instance
  }

  async initialize() {
    try {
      const now = Date.now()
      if (!this.serverKeyPair || now - this.keyCreationTime > this.KEY_ROTATION_INTERVAL) {
        const serverId = `Server-${generateId()}`
        const serverEmail = `server-${generateId()}@nuxtreez.local`

        let attempts = 0
        let keyPair = null
        let error = null

        while (attempts < 3 && !keyPair) {
          try {
            keyPair = await generateKeyPair(serverId, serverEmail)

            // Verify the key pair works
            const testMessage = 'test-' + Date.now()
            const encrypted = await encryptWithSessionKey(testMessage, keyPair.publicKey)
            const decrypted = await decryptWithSessionKey(encrypted, keyPair.privateKey)

            if (decrypted !== testMessage) {
              throw new Error('Key verification failed')
            }

            this.serverKeyPair = {
              publicKey: keyPair.publicKey,
              privateKey: keyPair.privateKey,
            }
            this.keyCreationTime = now

            return this.serverKeyPair.publicKey
          } catch (err) {
            error = err
            attempts++
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempts))
          }
        }

        throw error || new Error('Failed to generate valid key pair after multiple attempts')
      }

      return this.serverKeyPair.publicKey
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      logger.error('PGP initialization failed:', {
        error: error.message,
        stack: error.stack,
      })
      throw new Error(`PGP initialization failed: ${error.message}`)
    }
  }

  async setClientPublicKey(publicKey: string) {
    // Validate the public key before accepting it
    try {
      const key = await openpgp.readKey({ armoredKey: publicKey })
      if (key.isPrivate()) {
        throw new Error('Invalid public key provided')
      }
      this.clientPublicKey = publicKey
    } catch (error) {
      logger.error('Failed to set client public key:', { cause: error })
      throw new Error('Invalid PGP public key format')
    }
  }

  async encryptProfileData<T>(data: T): Promise<string> {
    if (!this.serverKeyPair || !this.clientPublicKey) {
      throw new Error('PGP Service not fully initialized')
    }
    const jsonString = JSON.stringify(data)
    return await encryptWithSessionKey(jsonString, this.clientPublicKey)
  }

  async decryptProfileData<T>(encryptedData: string): Promise<T> {
    if (!this.serverKeyPair) {
      throw new Error('PGP Service not initialized')
    }
    const decrypted = await decryptWithSessionKey(encryptedData, this.serverKeyPair.privateKey)
    return JSON.parse(decrypted) as T
  }

  async getPublicKey(): Promise<string> {
    if (!this.serverKeyPair) {
      await this.initialize()
    }
    return this.serverKeyPair!.publicKey
  }
}

export const pgpService = PgpService.getInstance()
