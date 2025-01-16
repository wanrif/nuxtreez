import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './server/database/migrations',
  schema: './server/database/schema/index.ts',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.NUXT_MYSQL_HOST || 'localhost',
    port: Number(process.env.NUXT_MYSQL_PORT) || 3306,
    user: process.env.NUXT_MYSQL_USER || 'root',
    database: process.env.NUXT_MYSQL_DATABASE || 'nuxtreez',
    ...(process.env.NUXT_MYSQL_PASSWORD ? { password: process.env.NUXT_MYSQL_PASSWORD } : {}),
  },
})
