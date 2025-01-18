import jwt from 'jsonwebtoken'

import { INVALID_REFRESH_TOKEN, INVALID_TOKEN } from '~/constant/jwt'

type JWTPayload = {
  id: string
  email: string
  role?: string
}

// Convert to seconds for consistency with cookie max-age
export const ACCESS_TOKEN_EXPIRATION = '15m'
export const ACCESS_TOKEN_EXPIRATION_SEC = 15 * 60 // 15 minutes in seconds
export const REFRESH_TOKEN_EXPIRATION = '7d'
export const REFRESH_TOKEN_EXPIRATION_SEC = 7 * 24 * 60 * 60 // 7 days in seconds

export const ACCESS_TOKEN_EXPIRATION_MS = 15 * 60 * 1000 // 15 minutes in milliseconds
export const REFRESH_TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export const generateJWT = async (payload: JWTPayload) => {
  const runtimeConfig = useRuntimeConfig()
  const encrypted = encryptHelper.encrypt(JSON.stringify(payload))
  return jwt.sign({ encrypted }, runtimeConfig.jwtSecretKey, { expiresIn: ACCESS_TOKEN_EXPIRATION })
}

export const verifyJWT = async (token: string): Promise<JWTPayload> => {
  const runtimeConfig = useRuntimeConfig()
  try {
    const { encrypted } = jwt.verify(token, runtimeConfig.jwtSecretKey) as { encrypted: string }
    const decrypted = await encryptHelper.decrypt(encrypted, 'hex', 3)
    return JSON.parse(decrypted)
  } catch (error) {
    logger.error('Error verifying JWT', {
      code: 'FAILED_TO_VERIFY',
      cause: error instanceof Error ? error.cause : error,
      message: error instanceof Error ? error.message : error,
    })
    throw new AuthError(INVALID_TOKEN)
  }
}

export const generateRefreshJWT = async (payload: JWTPayload) => {
  const runtimeConfig = useRuntimeConfig()
  const encrypted = encryptHelper.encrypt(JSON.stringify(payload))
  return jwt.sign({ encrypted }, runtimeConfig.jwtRefreshSecretKey, { expiresIn: REFRESH_TOKEN_EXPIRATION })
}

export const verifyRefreshJWT = async (token: string): Promise<JWTPayload> => {
  const runtimeConfig = useRuntimeConfig()
  try {
    const { encrypted } = jwt.verify(token, runtimeConfig.jwtRefreshSecretKey) as { encrypted: string }
    const decrypted = await encryptHelper.decrypt(encrypted, 'hex', 3)
    return JSON.parse(decrypted)
  } catch (error) {
    logger.error('Error verifying refresh JWT', {
      code: 'INVALID_REFRESH_TOKEN',
      cause: error instanceof Error ? error.cause : error,
      message: error instanceof Error ? error.message : error,
    })
    throw new AuthError(INVALID_REFRESH_TOKEN)
  }
}

export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; payload: JWTPayload }> => {
  try {
    const payload = await verifyRefreshJWT(refreshToken)
    const newAccessToken = await generateJWT({ id: payload.id, email: payload.email, role: payload.role })
    return { accessToken: newAccessToken, payload }
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError(INVALID_REFRESH_TOKEN)
    }
    throw handleError(error)
  }
}

export const getRefreshTokenExpiration = () => {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS)
}
