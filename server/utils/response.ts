import chalk from 'chalk'
import * as winston from 'winston'

import { TRPCError } from '@trpc/server'

import { generateTransactionId } from '~/utils/commonHelper.ts'

const format = winston.format

const myFormat = format.printf(({ level, message, transactionId, label, code, statusCode, cause, timestamp }) => {
  let coloredLevel = chalk.white(level.toUpperCase())
  switch (level) {
    case 'error':
      coloredLevel = chalk.red(level.toUpperCase())
      break
    case 'warn':
      coloredLevel = chalk.yellow(level.toUpperCase())
      break
    case 'info':
      coloredLevel = chalk.blueBright(level.toUpperCase())
      break
  }
  return `${chalk.gray(timestamp)} [${chalk.magentaBright(label)}] ${transactionId ?? generateTransactionId()} ${coloredLevel}: ${code ? `(${chalk.cyan(code)})` : ''} ${message} ${statusCode ? `(${chalk.green(statusCode)})` : ''} ${cause ? `Cause: ${chalk.red(JSON.stringify(cause))}` : ''}`
})

export const logger = winston.createLogger({
  format: format.combine(
    format.label({ label: 'Nuxtreez log' }),
    format.timestamp({
      format: 'DD-MM-YYYY HH:mm:ss',
    }),
    myFormat
  ),
  transports: [new winston.transports.Console()],
})

interface SuccessResponse<T = unknown> {
  status: 'success'
  statusCode: number
  message: string
  data?: T
  transactionId: string
}

export function createSuccessResponse<T>(
  message: string,
  data?: T,
  statusCode: number = 200,
  transactionId?: string
): SuccessResponse<T> {
  logger.info(message, { data, transactionId })

  return {
    status: 'success',
    statusCode,
    message,
    ...(data && { data }),
    transactionId: transactionId ?? generateTransactionId(),
  }
}

export class ValidationError extends TRPCError {
  constructor(message: string, errors?: Record<string, string[]>) {
    super({
      code: 'BAD_REQUEST',
      message,
      cause: errors,
    })
  }
}

export class AuthError extends TRPCError {
  constructor(message: string) {
    super({
      code: 'UNAUTHORIZED',
      message,
    })
  }
}

export class ForbiddenError extends TRPCError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super({
      code: 'FORBIDDEN',
      message,
    })
  }
}

export class NotFoundError extends TRPCError {
  constructor(message: string) {
    super({
      code: 'NOT_FOUND',
      message,
    })
  }
}

export class BusinessError extends TRPCError {
  constructor(message: string) {
    super({
      code: 'BAD_REQUEST',
      message,
    })
  }
}

export function handleError(error: unknown, ctx?: { transactionId: string }) {
  // MySQL specific error handling
  if (error instanceof Error && 'code' in error && typeof error.code === 'string') {
    const mysqlError = error as Error & { code: string; errno?: number }
    if (mysqlError.code === 'ECONNREFUSED') {
      logger.error('MySQL Connection Error', {
        code: 'MYSQL_CONNECTION_REFUSED',
        statusCode: 500,
        cause: {
          error: mysqlError.message,
          errno: mysqlError.errno,
          details: 'Database connection refused. Please check if MySQL is running and credentials are correct.',
        },
      })

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
      })
    }
  }

  if (error instanceof ValidationError) {
    logger.warn('Validation error:', { message: error.message, errors: error.cause, transactionId: ctx?.transactionId })

    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: error.message,
      cause: {
        status: 'error',
        statusCode: 400,
        message: error.message,
        errors: error.cause as unknown as Record<string, string[]>,
      },
    })
  }

  if (error instanceof TRPCError) {
    const statusCodeMap: Record<TRPCError['code'], number> = {
      PARSE_ERROR: 400,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      METHOD_NOT_SUPPORTED: 405,
      TIMEOUT: 408,
      CONFLICT: 409,
      PRECONDITION_FAILED: 412,
      PAYLOAD_TOO_LARGE: 413,
      UNPROCESSABLE_CONTENT: 422,
      TOO_MANY_REQUESTS: 429,
      CLIENT_CLOSED_REQUEST: 499,
      INTERNAL_SERVER_ERROR: 500,
      NOT_IMPLEMENTED: 501,
    }

    const statusCode = statusCodeMap[error.code]

    logger.error('TRPC error:', {
      message: error.message,
      code: error.code,
      statusCode,
      transactionId: ctx?.transactionId,
    })

    throw new TRPCError({
      ...error,
      cause: {
        status: 'error',
        statusCode,
        message: error.message,
      },
    })
  }

  // Handle database unique constraint errors
  if (error && typeof error === 'object' && 'code' in error) {
    if (error.code === '23505') {
      throw new ValidationError('Record already exists')
    }
  }

  // Log unexpected errors
  logger.error('Unexpected error:', error)

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
    cause: {
      status: 'error',
      statusCode: 500,
      message: 'An unexpected error occurred. Please try again later.',
    },
  })
}
