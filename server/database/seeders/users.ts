/* eslint-disable no-console */
import { eq } from 'drizzle-orm'

import { faker } from '@faker-js/faker'
import { hash } from '@node-rs/argon2'

import { useDrizzle } from '~/server/utils/drizzle'

import { rolesTable } from '../schema/role'
import { usersTable } from '../schema/user'

const defaultUsers = [
  {
    name: 'Admin User',
    email: 'admin@nuxtreez.com',
    password: 'Pa$$w0rd!',
    role: 'admin',
  },
  {
    name: 'Regular User',
    email: 'user@nuxtreez.com',
    password: 'Pa$$w0rd!',
    role: 'user',
  },
  {
    name: 'Guest User',
    email: 'guest@nuxtreez.com',
    password: 'Pa$$w0rd!',
    role: 'guest',
  },
]

// Generate 100 random users
const randomUsers = Array.from({ length: 100 }, () => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: 'Pa$$w0rd!',
  role: faker.helpers.arrayElement(['user', 'guest']), // Only regular users and guests
}))

const users = [...defaultUsers, ...randomUsers]

export async function seedUsers() {
  const db = useDrizzle()

  try {
    console.log('🌱 Seeding users...')

    for (const user of users) {
      // Get role id
      const role = await db.query.rolesTable.findFirst({
        where: eq(rolesTable.name, user.role),
      })

      if (!role) {
        throw new Error(`Role ${user.role} not found`)
      }

      // Hash password
      const hashedPassword = await hash(user.password)

      // Insert user
      await db
        .insert(usersTable)
        .values({
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role_id: role.id,
        })
        .onDuplicateKeyUpdate({
          set: {
            name: user.name,
            password: hashedPassword,
            role_id: role.id,
          },
        })
    }

    console.log('✅ Users seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding users:', error)
    throw error
  }
}
