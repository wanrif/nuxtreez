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
import SuperJSON from 'superjson'
import { ZodError } from 'zod'

import { initTRPC } from '@trpc/server'

import { COOK_ACCESS_TOKEN, COOK_REFRESH_TOKEN, INVALID_TOKEN, TOKEN_EXPIRED } from '~/constant/jwt'
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
      const { shape, error } = opts
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError: error.code === 'BAD_REQUEST' && error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      }
    },
    transformer: SuperJSON,
  })

export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware

const getUserFromHeader = async (event: H3Event): Promise<IUser | null> => {
  const access_token = getCookie(event, COOK_ACCESS_TOKEN)
  const refresh_token = getCookie(event, COOK_REFRESH_TOKEN)

  // If no access token but refresh token exists, try to refresh
  if (!access_token && refresh_token) {
    try {
      const { accessToken, payload } = await refreshAccessToken(refresh_token)
      // Set new access token cookie
      setCookie(event, COOK_ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      })

      // Continue with the new access token
      const [user] = await useDrizzle()
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
        .where(eq(usersTable.id, payload.id))
        .limit(1)

      return user ?? null
    } catch (error) {
      // If refresh fails, clear both tokens
      deleteCookie(event, COOK_ACCESS_TOKEN)
      deleteCookie(event, COOK_REFRESH_TOKEN)
      throw handleError(error)
    }
  }

  if (!access_token) {
    deleteCookie(event, COOK_ACCESS_TOKEN)
    deleteCookie(event, COOK_REFRESH_TOKEN)
    throw new AuthError(INVALID_TOKEN)
  }

  try {
    const decoded = await verifyJWT(access_token)
    const [user] = await useDrizzle()
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
      .where(eq(usersTable.id, decoded.id))
      .limit(1)

    return user ?? null
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError(TOKEN_EXPIRED)
    }

    throw handleError(error)
  }
}

const createAuthMiddleware = (requiredRole?: string) => {
  return middleware(async ({ ctx, next }) => {
    const user = await getUserFromHeader(ctx.event)

    if (!user || !user.role) {
      throw new AuthError('You must be logged in to access this resource')
    }

    if (requiredRole && user.role.name?.toUpperCase() !== requiredRole) {
      throw new ForbiddenError(`You must have ${requiredRole} role to access this resource`)
    }

    return next({ ctx: { ...ctx, user } })
  })
}

export const protectedProcedure = t.procedure.meta({ authRequired: true }).use(createAuthMiddleware())

export const adminProcedure = t.procedure.meta({ authRequired: true }).use(createAuthMiddleware('ADMIN'))
