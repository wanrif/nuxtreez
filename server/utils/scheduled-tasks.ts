import { usersTable } from '../database/schema'
import { useDrizzle } from './drizzle'

export const scheduleTokenCleanup = () => {
  // Run cleanup every day at midnight
  setInterval(
    async () => {
      try {
        const users = await useDrizzle().select({ id: usersTable.id }).from(usersTable)
        for (const user of users) {
          await cleanupUnusedTokens(user.id, 30) // Clean tokens older than 30 days
        }
        // eslint-disable-next-line no-console
        console.log('Token cleanup completed successfully')
      } catch (error) {
        console.error('Token cleanup failed:', error)
      }
    },
    24 * 60 * 60 * 1000
  ) // 24 hours
}
