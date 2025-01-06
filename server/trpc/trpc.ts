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

import { TRPCError, initTRPC } from '@trpc/server'

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
  const token = getCookie(event, COOK_ACCESS_TOKEN) || ''

  if (!token) {
    deleteCookie(event, COOK_ACCESS_TOKEN)
    deleteCookie(event, COOK_REFRESH_TOKEN)
  }

  try {
    const findToken = await useDrizzle()
      .select({
        id: usersTable.id,
      })
      .from(usersTable)
      .where(eq(usersTable.id, token))
      .limit(1)

    if (!findToken) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: INVALID_TOKEN })
    }

    const decoded = await verifyJWT(token)
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
      throw new TRPCError({ code: 'UNAUTHORIZED', message: TOKEN_EXPIRED })
    }

    throw new TRPCError({ code: 'UNAUTHORIZED', message: INVALID_TOKEN })
  }
}

const createAuthMiddleware = (requiredRole?: string) => {
  return middleware(async ({ ctx, next }) => {
    const user = await getUserFromHeader(ctx.event)

    if (!user || !user.role) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      })
    }

    if (requiredRole && user.role.name?.toUpperCase() !== requiredRole) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You must have ${requiredRole} role to access this resource`,
      })
    }

    return next({ ctx: { ...ctx, user } })
  })
}

export const protectedProcedure = t.procedure.meta({ authRequired: true }).use(createAuthMiddleware())

export const adminProcedure = t.procedure.meta({ authRequired: true }).use(createAuthMiddleware('ADMIN'))
