import { relations } from 'drizzle-orm'
import { mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core'

import { generateId } from '../../utils/coreHelper'
import { rolesTable } from './role'
import { tokensTable } from './token'

export const usersTable = mysqlTable('users', {
  id: varchar('id', { length: 32 })
    .primaryKey()
    .$defaultFn(() => generateId()),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  phone: varchar({ length: 15 }).unique(),
  location: varchar({ length: 255 }),
  website: varchar({ length: 255 }),
  bio: varchar({ length: 255 }),
  password: varchar({ length: 255 }).notNull(),
  role_id: varchar('role_id', { length: 32 }).notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  role: one(rolesTable, {
    fields: [usersTable.role_id],
    references: [rolesTable.id],
  }),
  tokens: many(tokensTable),
}))
