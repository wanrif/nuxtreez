import { COOK_ACCESS_TOKEN, COOK_REFRESH_TOKEN } from '~/constant/jwt'
import type { Token } from '~/types'

export const useTokens = () => {
  const setTokens = (token: Token) => {
    const accessToken = useCookie(COOK_ACCESS_TOKEN, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      secure: process.env.NODE_ENV === 'production',
    })

    const refreshToken = useCookie(COOK_REFRESH_TOKEN, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      secure: process.env.NODE_ENV === 'production',
    })

    accessToken.value = token.accessToken
    refreshToken.value = token.refreshToken
  }

  const getTokens = (): Token | null => {
    const accessToken = useCookie(COOK_ACCESS_TOKEN).value
    const refreshToken = useCookie(COOK_REFRESH_TOKEN).value

    if (!accessToken || !refreshToken) return null

    return {
      accessToken,
      refreshToken,
    }
  }

  const clearTokens = () => {
    const accessToken = useCookie(COOK_ACCESS_TOKEN)
    const refreshToken = useCookie(COOK_REFRESH_TOKEN)

    accessToken.value = null
    refreshToken.value = null
  }

  return {
    setTokens,
    getTokens,
    clearTokens,
  }
}
