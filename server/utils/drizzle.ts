import 'dotenv/config'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

import schema from '~/server/database/schema'

export { sql, eq, ne, and, or, gt, lt } from 'drizzle-orm'

let connection: mysql.Pool | null = null

function createConnection() {
  try {
    const config: mysql.PoolOptions = {
      host: process.env.MYSQL_HOST?.split(':')[0],
      port: parseInt(process.env.MYSQL_HOST?.split(':')[1] || '3306'),
      user: process.env.MYSQL_USER,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    }

    if (process.env.MYSQL_PASSWORD) {
      config.password = process.env.MYSQL_PASSWORD
    }

    return mysql.createPool(config)
  } catch (error) {
    console.error('Failed to create MySQL connection:', error)
    throw error
  }
}

export function useDrizzle() {
  if (!connection) {
    connection = createConnection()
  }
  return drizzle(connection, { schema, mode: 'default' })
}
