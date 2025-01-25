import * as openpgp from 'openpgp'

import { generateRandomBytes } from '~/utils/crypto'

interface KeyPair {
  publicKey: string
  privateKey: string
  sessionKey?: Uint8Array
}

export async function generateKeyPair(name: string, email: string): Promise<KeyPair> {
  // Create timestamp 5 minutes in the past to avoid any clock sync issues
  const currentDate = new Date(Date.now() - 5 * 60 * 1000)

  try {
    const { privateKey, publicKey } = await openpgp.generateKey({
      type: 'ecc',
      curve: 'curve25519Legacy', // in openpgp v6 curve25519 becomes curve25519Legacy
      userIDs: [{ name, email }],
      format: 'armored',
      date: currentDate,
      config: {
        preferredSymmetricAlgorithm: openpgp.enums.symmetric.aes256,
        preferredHashAlgorithm: openpgp.enums.hash.sha512,
      },
    })

    // Verify the keys before returning
    const pubKey = await openpgp.readKey({ armoredKey: publicKey })

    // Verify key validity period
    const validity = await pubKey.getExpirationTime()
    if (validity && validity < currentDate) {
      throw new Error('Generated key is already expired')
    }

    const sessionKey = await generateRandomBytes(32)
    return { publicKey, privateKey, sessionKey }
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error')
    console.error('Key generation error:', error)
    throw new Error(`Failed to generate valid key pair: ${error.message}`)
  }
}

export async function encryptWithSessionKey(data: string, publicKey: string): Promise<string> {
  // Create message
  const dataMessage = await openpgp.createMessage({ text: data })

  // Read recipient's public key
  const pubKey = await openpgp.readKey({ armoredKey: publicKey })

  // Encrypt the data
  const encrypted = await openpgp.encrypt({
    message: dataMessage,
    encryptionKeys: pubKey,
    format: 'armored',
    config: {
      preferredSymmetricAlgorithm: openpgp.enums.symmetric.aes256,
      preferredCompressionAlgorithm: openpgp.enums.compression.zlib,
      preferredHashAlgorithm: openpgp.enums.hash.sha512,
    },
  })

  return encrypted.toString()
}

export async function decryptWithSessionKey(encryptedData: string, privateKey: string): Promise<string> {
  const privKey = await openpgp.readPrivateKey({ armoredKey: privateKey })

  const message = await openpgp.readMessage({
    armoredMessage: encryptedData,
  })
  const decrypted = await openpgp.decrypt({
    message,
    decryptionKeys: privKey,
  })

  return decrypted.data as string
}
