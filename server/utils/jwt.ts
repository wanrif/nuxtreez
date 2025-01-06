import jwt from 'jsonwebtoken'

type JWTPayload = {
  id: string
  email: string
  role?: string
}

export const generateJWT = async (payload: JWTPayload) => {
  const runtimeConfig = useRuntimeConfig()
  // expired in 10s just for testing
  // return jwt.sign(payload, runtimeConfig.jwtSecretKey, { expiresIn: '10s' })
  return jwt.sign(payload, runtimeConfig.jwtSecretKey, { expiresIn: '15m' })
}

export const verifyJWT = async (token: string): Promise<JWTPayload> => {
  const runtimeConfig = useRuntimeConfig()
  return jwt.verify(token, runtimeConfig.jwtSecretKey) as JWTPayload
}

export const generateRefreshJWT = async (payload: JWTPayload) => {
  const runtimeConfig = useRuntimeConfig()
  return jwt.sign(payload, runtimeConfig.jwtRefreshSecretKey, { expiresIn: '7d' })
}

export const verifyRefreshJWT = async (token: string): Promise<JWTPayload> => {
  const runtimeConfig = useRuntimeConfig()
  return jwt.verify(token, runtimeConfig.jwtRefreshSecretKey) as JWTPayload
}

export const getRefreshTokenExpiration = () => {
  const expiresIn = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  return new Date(Date.now() + expiresIn)
}
