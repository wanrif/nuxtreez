import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './server/database/migrations',
  schema: './server/database/schema/index.ts',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.MYSQL_HOST?.split(':')[0] || 'localhost',
    port: parseInt(process.env.MYSQL_HOST?.split(':')[1] || '3306'),
    user: process.env.MYSQL_USER || 'root',
    database: process.env.MYSQL_DATABASE || 'nuxtreez',
    ...(process.env.MYSQL_PASSWORD ? { password: process.env.MYSQL_PASSWORD } : {}),
  },
})
