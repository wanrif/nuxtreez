import { TRPCError } from '@trpc/server'

interface SuccessResponse<T = unknown> {
  status: 'success'
  statusCode: number
  message: string
  data?: T
}

export function createSuccessResponse<T>(message: string, data?: T, statusCode: number = 200): SuccessResponse<T> {
  return {
    status: 'success',
    statusCode,
    message,
    ...(data && { data }),
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

export function handleError(error: unknown): never {
  if (error instanceof ValidationError) {
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
      INTERNAL_SERVER_ERROR: 500,
      NOT_IMPLEMENTED: 501,
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
    }

    const statusCode = statusCodeMap[error.code]

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
  console.error('Unexpected error:', error)

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
