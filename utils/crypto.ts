export const getCrypto = async (): Promise<Crypto> => {
  if (import.meta.server) {
    return (await import('node:crypto')).webcrypto as Crypto
  }
  return window.crypto
}

export const generateRandomBytes = async (length: number): Promise<Uint8Array> => {
  const crypto = await getCrypto()
  return crypto.getRandomValues(new Uint8Array(length))
}
