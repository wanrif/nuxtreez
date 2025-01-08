import jwt from 'jsonwebtoken'

import { INVALID_REFRESH_TOKEN } from '~/constant/jwt'

type JWTPayload = {
  id: string
  email: string
  role?: string
}

const ACCESS_TOKEN_EXPIRATION = '15m'
const REFRESH_TOKEN_EXPIRATION = '7d'
const REFRESH_TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export const generateJWT = async (payload: JWTPayload) => {
  const runtimeConfig = useRuntimeConfig()
  return jwt.sign(payload, runtimeConfig.jwtSecretKey, { expiresIn: ACCESS_TOKEN_EXPIRATION })
}

export const verifyJWT = async (token: string): Promise<JWTPayload> => {
  const runtimeConfig = useRuntimeConfig()
  return jwt.verify(token, runtimeConfig.jwtSecretKey) as JWTPayload
}

export const generateRefreshJWT = async (payload: JWTPayload) => {
  const runtimeConfig = useRuntimeConfig()
  return jwt.sign(payload, runtimeConfig.jwtRefreshSecretKey, { expiresIn: REFRESH_TOKEN_EXPIRATION })
}

export const verifyRefreshJWT = async (token: string): Promise<JWTPayload> => {
  const runtimeConfig = useRuntimeConfig()
  return jwt.verify(token, runtimeConfig.jwtRefreshSecretKey) as JWTPayload
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
