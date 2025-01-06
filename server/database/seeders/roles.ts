/* eslint-disable no-console */
import { useDrizzle } from '~/server/utils/drizzle'

import { rolesTable } from '../schema/role'

const roles = [{ name: 'admin' }, { name: 'user' }, { name: 'guest' }]

export async function seedRoles() {
  const db = useDrizzle()

  try {
    console.log('🌱 Seeding roles...')

    for (const role of roles) {
      await db
        .insert(rolesTable)
        .values(role)
        .onDuplicateKeyUpdate({ set: { name: role.name } })
    }

    console.log('✅ Roles seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding roles:', error)
    throw error
  }
}
