import { rolesRelations, rolesTable } from './role'
import { tokensRelations, tokensTable } from './token'
import { usersRelations, usersTable } from './user'

export * from './role'
export * from './token'
export * from './user'

export default {
  usersTable,
  rolesTable,
  tokensTable,
  usersRelations,
  rolesRelations,
  tokensRelations,
}
