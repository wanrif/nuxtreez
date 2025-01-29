import 'dotenv/config'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

import schema from '~/server/database/schema'

import { handleError, logger } from './response'

export { sql, eq, ne, and, or, gt, lt } from 'drizzle-orm'

let connection: mysql.Pool | null = null

function createConnection(): mysql.Pool | null {
  try {
    const runtimeConfig = useRuntimeConfig()

    const config: mysql.PoolOptions = {
      host: runtimeConfig.mysqlHost,
      port: Number(runtimeConfig.mysqlPort),
      user: runtimeConfig.mysqlUser,
      database: runtimeConfig.mysqlDatabase,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    }

    if (process.env.NUXT_MYSQL_PASSWORD) {
      config.password = process.env.NUXT_MYSQL_PASSWORD
    }

    const pool = mysql.createPool(config)

    // Test the connection
    pool.getConnection().catch((error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('MySQL Connection Test Failed', {
        code: 'MYSQL_CONNECTION_TEST_FAILED',
        cause: {
          host: config.host,
          database: config.database,
          error: {
            message: errorMessage,
            code: error.code,
            errno: error.errno,
            syscall: error.syscall,
            address: error.address,
            port: error.port,
          },
        },
      })
      throw error
    })

    return pool
  } catch (error) {
    handleError(error)
    return null
  }
}

export function useDrizzle() {
  if (!connection) {
    connection = createConnection()
  }
  if (!connection) {
    throw new Error('Failed to create MySQL connection')
  }
  return drizzle(connection, { schema, mode: 'default' })
}
