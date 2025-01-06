import { relations } from 'drizzle-orm'
import { mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core'

import { generateId } from '../../utils/coreHelper'
import { usersTable } from './user'

export const rolesTable = mysqlTable('roles', {
  id: varchar('id', { length: 32 })
    .primaryKey()
    .$defaultFn(() => generateId()),
  name: varchar({ length: 50 }).notNull().unique(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const rolesRelations = relations(rolesTable, ({ many }) => ({
  users: many(usersTable),
}))
