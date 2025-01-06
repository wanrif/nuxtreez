import { tokensTable } from '../database/schema'
import type { DeviceInfo } from '../database/schema/token'
import { useDrizzle } from './drizzle'

export const storeRefreshToken = async (userId: string, token: string, expiresAt: Date, deviceInfo: DeviceInfo) => {
  await useDrizzle().insert(tokensTable).values({
    token,
    user_id: userId,
    device_info: deviceInfo,
    expires_at: expiresAt,
  })
}

export const deleteRefreshToken = async (token: string) => {
  await useDrizzle().delete(tokensTable).where(eq(tokensTable.token, token))
}

export const findRefreshToken = async (token: string) => {
  const [result] = await useDrizzle().select().from(tokensTable).where(eq(tokensTable.token, token)).limit(1)
  return result
}

export const updateTokenLastUsed = async (token: string) => {
  await useDrizzle().update(tokensTable).set({ last_used: new Date() }).where(eq(tokensTable.token, token))
}

export const deactivateUserTokens = async (userId: string, exceptToken?: string) => {
  const conditions = exceptToken
    ? and(eq(tokensTable.user_id, userId), ne(tokensTable.token, exceptToken))
    : eq(tokensTable.user_id, userId)

  await useDrizzle().update(tokensTable).set({ is_active: false }).where(conditions)
}

export const getUserActiveTokens = async (userId: string) => {
  return useDrizzle()
    .select()
    .from(tokensTable)
    .where(
      and(eq(tokensTable.user_id, userId), eq(tokensTable.is_active, true), gt(tokensTable.expires_at, new Date()))
    )
}

export const cleanupUnusedTokens = async (userId: string, unusedDays: number = 30) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - unusedDays)

  await useDrizzle()
    .delete(tokensTable)
    .where(and(eq(tokensTable.user_id, userId), lt(tokensTable.last_used, cutoffDate)))
}
