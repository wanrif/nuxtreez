import * as openpgp from 'openpgp'

import { generateRandomBytes } from '~/utils/crypto'

interface KeyPair {
  publicKey: string
  privateKey: string
  sessionKey?: Uint8Array
}

export async function generateKeyPair(name: string, email: string): Promise<KeyPair> {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: 'ecc', // More explicit than curve25519
    curve: 'curve25519Legacy', // Keep curve25519
    userIDs: [{ name, email }],
    format: 'armored',
    config: {
      preferredSymmetricAlgorithm: openpgp.enums.symmetric.aes256,
      preferredCompressionAlgorithm: openpgp.enums.compression.zlib,
      preferredHashAlgorithm: openpgp.enums.hash.sha512,
    },
    // Add RSA specific options for better security
    rsaBits: 4096, // In case fallback to RSA is needed
    keyExpirationTime: 365 * 2, // Key valid for 2 years
  })

  const sessionKey = await generateRandomBytes(32)

  return {
    publicKey,
    privateKey,
    sessionKey,
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
