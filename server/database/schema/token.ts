import { relations } from 'drizzle-orm'
import { boolean, index, json, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core'

import { usersTable } from './user'

export type DeviceInfo = {
  deviceId: string
  deviceName?: string
  browser?: string
  os?: string
  ip?: string
}

export const tokensTable = mysqlTable(
  'tokens',
  {
    id: varchar('id', { length: 32 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    token: varchar('token', { length: 512 }).notNull(),
    user_id: varchar('user_id', { length: 32 }).notNull(),
    device_info: json('device_info').$type<DeviceInfo>().notNull(),
    is_active: boolean('is_active').notNull().default(true),
    last_used: timestamp('last_used').notNull().defaultNow(),
    expires_at: timestamp('expires_at').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('token_idx').on(table.token).using('btree'), index('user_id_idx').on(table.user_id)]
)

export const tokensRelations = relations(tokensTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [tokensTable.user_id],
    references: [usersTable.id],
  }),
}))
