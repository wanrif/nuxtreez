import type { Token } from '~/types'

export const useTokens = () => {
  const setTokens = (token: Token) => {
    const accessToken = useCookie('access_token', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      secure: process.env.NODE_ENV === 'production',
    })

    const refreshToken = useCookie('refresh_token', {
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
    const accessToken = useCookie('access_token').value
    const refreshToken = useCookie('refresh_token').value

    if (!accessToken || !refreshToken) return null

    return {
      accessToken,
      refreshToken,
    }
  }

  const clearTokens = () => {
    const accessToken = useCookie('access_token')
    const refreshToken = useCookie('refresh_token')

    accessToken.value = null
    refreshToken.value = null
  }

  return {
    setTokens,
    getTokens,
    clearTokens,
  }
}
