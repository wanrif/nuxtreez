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

export class AuthError extends TRPCError {
  constructor(message: string) {
    super({
      code: 'UNAUTHORIZED',
      message,
    })
  }
}
