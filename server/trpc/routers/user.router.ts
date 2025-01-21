import { z } from 'zod'

import { rolesTable, usersTable } from '~/server/database/schema'
import { pgpService } from '~/server/services/pgpService'
import type { IUser } from '~/types'

import { protectedProcedure, router } from '../trpc'

export const userRouter = router({
  profile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const prepared = useDrizzle()
        .select({
          users: {
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            phone: usersTable.phone,
            location: usersTable.location,
            website: usersTable.website,
            bio: usersTable.bio,
            role_id: usersTable.role_id,
          },
          roles: {
            id: rolesTable.id,
            name: rolesTable.name,
          },
        })
        .from(usersTable)
        .leftJoin(rolesTable, eq(usersTable.role_id, rolesTable.id))
        .where(eq(usersTable.id, ctx.user.id))
        .limit(1)
        .prepare()

      const findUser = await prepared.execute().then((rows) => rows[0])

      if (!findUser) throw new NotFoundError('User not found')

      const user: IUser = {
        id: findUser.users.id,
        name: findUser.users.name,
        email: findUser.users.email,
        phone: findUser.users.phone ?? undefined,
        location: findUser.users.location ?? undefined,
        website: findUser.users.website ?? undefined,
        bio: findUser.users.bio ?? undefined,
        role: findUser.roles
          ? {
              id: findUser.roles.id,
              name: findUser.roles.name,
            }
          : null,
      }

      const encryptedData = await pgpService.encryptProfileData(user)

      return createSuccessResponse<{ profile: string }>(
        'Profile fetched successfully',
        { profile: encryptedData }, // encryptedData is already a string
        200,
        ctx.transactionId
      )
    } catch (error) {
      throw handleError(error)
    }
  }),

  update: protectedProcedure
    .input(
      z
        .object({
          id: z.string().min(1).optional(),
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
          phone: z.string().min(10).max(15).nullish().or(z.literal('')),
          location: z.string().nullish().or(z.literal('')),
          website: z.string().url().nullish().or(z.literal('')),
          bio: z.string().max(250).nullish().or(z.literal('')),
        })
        .strict()
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!input.name && !input.email) {
          throw new ValidationError('No updates provided')
        }

        const decryptedId = await encryptHelper.decrypt(input.id!, 'base64')
        if (decryptedId !== ctx.user.id) {
          throw new ForbiddenError('You do not have permission to update this user')
        }

        await useDrizzle()
          .update(usersTable)
          .set({
            name: input.name,
            email: input.email,
            updated_at: sql`NOW()`,
            phone: input.phone,
            location: input.location,
            website: input.website,
            bio: input.bio,
          })
          .where(eq(usersTable.id, ctx.user.id))

        const updatedUser = await useDrizzle()
          .select({
            users: {
              id: usersTable.id,
              name: usersTable.name,
              email: usersTable.email,
              phone: usersTable.phone,
              location: usersTable.location,
              website: usersTable.website,
              bio: usersTable.bio,
              role_id: usersTable.role_id,
            },
            roles: {
              id: rolesTable.id,
              name: rolesTable.name,
            },
          })
          .from(usersTable)
          .leftJoin(rolesTable, eq(usersTable.role_id, rolesTable.id))
          .where(eq(usersTable.id, ctx.user.id))
          .then((rows) => rows[0])

        if (!updatedUser) throw new NotFoundError('Updated user not found')

        const user: IUser = {
          id: updatedUser.users.id,
          name: updatedUser.users.name,
          email: updatedUser.users.email,
          phone: updatedUser.users.phone ?? undefined,
          location: updatedUser.users.location ?? undefined,
          website: updatedUser.users.website ?? undefined,
          bio: updatedUser.users.bio ?? undefined,
          role: updatedUser.roles
            ? {
                id: updatedUser.roles.id,
                name: updatedUser.roles.name,
              }
            : null,
        }

        const encryptedData = await pgpService.encryptProfileData(user)

        return createSuccessResponse<{ user: string }>(
          'Profile updated successfully',
          { user: encryptedData },
          200,
          ctx.transactionId
        )
      } catch (error) {
        console.error(error)
        throw handleError(error)
      }
    }),
})
