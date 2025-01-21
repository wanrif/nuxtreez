import { pgpService } from '~/server/services/pgpService'
import { logger } from '~/server/utils/response'

export default defineNuxtPlugin(async () => {
  try {
    await pgpService.initialize()
    logger.info('PGP Service initialized successfully', { code: 'PGP_INITIALIZED', statusCode: 200 })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Failed to initialize PGP service:', {
      code: 'PGP_INITIALIZATION_FAILED',
      statusCode: 500,
      cause: {
        message: error.message,
        stack: error.stack,
      },
    })
    createError({
      data: error,
      stack: error.stack,
      cause: error,
      message: 'Failed to initialize PGP service',
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
