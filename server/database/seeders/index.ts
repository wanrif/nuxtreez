import { seedRoles } from './roles'
import { seedUsers } from './users'

async function main() {
  try {
    await seedRoles()
    await seedUsers()
    // eslint-disable-next-line no-console
    console.log('✨ All seeds completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Failed to seed database:', error)
    process.exit(1)
  }
}

main()
