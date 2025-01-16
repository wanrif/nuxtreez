/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @see https://trpc.io/docs/v10/router
 * @see https://trpc.io/docs/v10/procedures
 */
import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import jwt from 'jsonwebtoken'
import { LRUCache } from 'lru-cache'
import SuperJSON from 'superjson'
import { ZodError } from 'zod'

import { TRPCError, initTRPC } from '@trpc/server'

import {
  COOK_ACCESS_TOKEN,
  COOK_REFRESH_TOKEN,
  INVALID_REFRESH_TOKEN,
  INVALID_TOKEN,
  TOKEN_EXPIRED,
} from '~/constant/jwt'
import { rolesTable } from '~/server/database/schema/role'
import { usersTable } from '~/server/database/schema/user'
import type { IUser } from '~/types'

import type { Context } from './context'

interface Meta {
  authRequired: boolean
}

const t = initTRPC
  .context<Context>()
  .meta<Meta>()
  .create({
    defaultMeta: { authRequired: false },
    errorFormatter: (opts) => {
      const { shape, error, ctx } = opts

      if (error.cause instanceof ZodError) {
        logger.warn('Validation error:', {
          message: error.message,
          code: error.code,
          zodErrors: error.cause.flatten(),
          statusCode: shape.data.httpStatus,
          transactionId: ctx?.transactionId,
        })
      }

      return {
        ...shape,
        data: {
          ...shape.data,
          zodError: error.code === 'BAD_REQUEST' && error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
        transactionId: ctx?.transactionId,
      }
    },
    transformer: SuperJSON,
  })

export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware

// Replace simple Map with LRU Cache for better memory management
const userCache = new LRUCache<string, { user: IUser; timestamp: number }>({
  max: 500, // Maximum number of items
  ttl: 5 * 60 * 1000, // 5 minutes TTL
  updateAgeOnGet: true,
})

// Cache for JWT verification results
interface JWTPayload {
  id: string
  [key: string]: unknown
}

const tokenVerificationCache = new LRUCache<string, JWTPayload>({
  max: 1000,
  ttl: 60 * 1000, // 1 minute TTL
})

const getUserFromHeader = async (event: H3Event): Promise<IUser | null> => {
  const access_token = getCookie(event, COOK_ACCESS_TOKEN)
  const refresh_token = getCookie(event, COOK_REFRESH_TOKEN)

  if (access_token) {
    const cached = userCache.get(access_token)
    if (cached) return cached.user
  }

  // Rest of the token refresh logic
  if (!access_token && refresh_token) {
    try {
      const storedToken = await findRefreshToken(refresh_token)
      if (!storedToken) {
        throw new AuthError(INVALID_REFRESH_TOKEN)
      }

      const { accessToken, payload } = await refreshAccessToken(refresh_token)
      setCookie(event, COOK_ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      })

      const user = await getUserFromDB(payload.id)
      if (user) {
        userCache.set(accessToken, { user, timestamp: Date.now() })
      }
      return user
    } catch (error) {
      clearAuthCookies(event)
      throw handleError(error)
    }
  }

  if (!access_token) {
    clearAuthCookies(event)
    throw new AuthError(INVALID_TOKEN)
  }

  try {
    // Cache JWT verification results
    let decoded = tokenVerificationCache.get(access_token)
    if (!decoded) {
      decoded = await verifyJWT(access_token)
      tokenVerificationCache.set(access_token, decoded)
    }

    const user = await getUserFromDB(decoded.id)
    if (user) {
      userCache.set(access_token, { user, timestamp: Date.now() })
    }
    return user
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError(TOKEN_EXPIRED)
    }
    throw handleError(error)
  }
}

const getUserFromDB = async (userId: string): Promise<IUser | null> => {
  const prepare = useDrizzle()
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: {
        id: rolesTable.id,
        name: rolesTable.name,
      },
    })
    .from(usersTable)
    .innerJoin(rolesTable, eq(usersTable.role_id, rolesTable.id))
    .where(eq(usersTable.id, userId))
    .limit(1)
    .$dynamic()
    .prepare()

  const [user] = await prepare.execute()
  return user ?? null
}

// Helper function to clear auth cookies
const clearAuthCookies = (event: H3Event) => {
  deleteCookie(event, COOK_ACCESS_TOKEN)
  deleteCookie(event, COOK_REFRESH_TOKEN)
}

// Implement role checking with LRU cache
const roleCheckCache = new LRUCache<string, boolean>({
  max: 1000,
  ttl: 30 * 60 * 1000, // 30 minutes TTL
})

const createAuthMiddleware = (requiredRole?: string) => {
  return middleware(async ({ ctx, next }) => {
    const user = await getUserFromHeader(ctx.event)

    if (!user || !user.role) {
      throw new AuthError('You must be logged in to access this resource')
    }

    if (requiredRole) {
      const cacheKey = `${user.id}:${requiredRole}`
      let hasRole = roleCheckCache.get(cacheKey)

      if (hasRole === undefined) {
        hasRole = user.role.name?.toUpperCase() === requiredRole
        roleCheckCache.set(cacheKey, hasRole)
      }

      if (!hasRole) {
        throw new ForbiddenError(`You must have ${requiredRole} role to access this resource`)
      }
    }

    return next({ ctx: { ...ctx, user } })
  })
}

// Add rate limiting middleware
const rateLimiter = new LRUCache<string, number>({
  max: 10000,
  ttl: 60 * 1000, // 1 minute window
})

const rateLimit = middleware(async ({ ctx, next }) => {
  const ip = ctx.event.node.req.socket.remoteAddress || ''
  const current = rateLimiter.get(ip) || 0

  if (current > 100) {
    // 100 requests per minute
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded',
    })
  }

  rateLimiter.set(ip, current + 1)
  return next()
})

// Apply rate limiting to protected routes
export const protectedProcedure = t.procedure.meta({ authRequired: true }).use(rateLimit).use(createAuthMiddleware())

export const adminProcedure = t.procedure.meta({ authRequired: true }).use(rateLimit).use(createAuthMiddleware('ADMIN'))
