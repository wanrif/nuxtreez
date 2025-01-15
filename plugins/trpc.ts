/**
 * TRPC Client Plugin for Nuxt
 * Handles:
 * - API communication setup with backend
 * - Automatic token refresh on expiration
 * - CSRF protection
 * - Authentication state management
 */
import SuperJSON from 'superjson'
import { createTRPCNuxtClient, httpBatchLink, httpLink } from 'trpc-nuxt/client'

import { INVALID_REFRESH_TOKEN, INVALID_TOKEN, TOKEN_EXPIRED } from '~/constant/jwt'
import type { AppRouter } from '~/server/trpc/router'

export default defineNuxtPlugin(() => {
  const headers = useRequestHeaders()
  const { csrf } = useCsrf()
  const authStore = useAuthStore()
  const transactionId = generateTransactionId()

  // Helper function to handle token refresh
  const handleTokenRefresh = async (isBatch: boolean): Promise<string | null> => {
    try {
      const { $client, $clientBatch } = useNuxtApp()
      let result

      if (isBatch) {
        result = await $clientBatch.auth.refreshToken.mutate()
      } else {
        result = await $client.auth.refreshToken.mutate()
      }

      if (!result.data) throw new Error('Token refresh failed: No data received')

      return result.data.token.accessToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      authStore.$reset()
      return null
    }
  }

  async function handleFetch(
    url: URL | RequestInfo,
    options?: RequestInit,
    isBatch: boolean = false
  ): Promise<Response> {
    try {
      const response = await fetch(url, options)

      if (response.status === 401) {
        const clonedResponse = response.clone()
        const data = await clonedResponse.json()
        let errorMessage

        if (isBatch) {
          errorMessage = data[0].error.json?.message
        } else {
          errorMessage = data.error.json?.message
        }

        // Handle expired token
        if (errorMessage === TOKEN_EXPIRED) {
          const newAccessToken: string | null = await handleTokenRefresh(isBatch)
          if (newAccessToken) {
            // Retry original request with new token
            return fetch(url, {
              ...options,
              headers: {
                ...options?.headers,
                // authorization: `Bearer ${newAccessToken}`,
              },
            })
          }
        }

        // Handle invalid token or failed refresh
        if (errorMessage === INVALID_TOKEN || errorMessage === INVALID_REFRESH_TOKEN) {
          authStore.$reset()
          navigateTo('/login')
        }
      }

      return response
    } catch (error) {
      console.error('API request failed:', error instanceof Error ? error.message : 'Unknown error')
      throw createError({
        message: 'API request failed',
      })
    }
  }

  const client: ReturnType<typeof createTRPCNuxtClient<AppRouter>> = createTRPCNuxtClient<AppRouter>({
    links: [
      httpLink({
        url: '/api/treez',
        headers() {
          return {
            ...headers,
            'x-csrf-token': csrf,
            'x-transaction-id': transactionId,
            // authorization: accessToken ? `Bearer ${accessToken}` : '',
          }
        },
        async fetch(url: URL | RequestInfo, options?: RequestInit): Promise<Response> {
          const isBatch = false
          return handleFetch(url, options, isBatch)
        },
      }),
    ],
    transformer: SuperJSON,
  })

  const clientBatch: ReturnType<typeof createTRPCNuxtClient<AppRouter>> = createTRPCNuxtClient<AppRouter>({
    links: [
      httpBatchLink({
        url: '/api/treez',
        headers() {
          return {
            ...headers,
            'x-csrf-token': csrf,
            // authorization: accessToken ? `Bearer ${accessToken}` : '',
          }
        },
        async fetch(url: URL | RequestInfo, options?: RequestInit): Promise<Response> {
          const isBatch = true
          return handleFetch(url, options, isBatch)
        },
      }),
    ],
    transformer: SuperJSON,
  })

  return {
    provide: {
      client,
      clientBatch,
    },
  }
})
