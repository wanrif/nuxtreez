import type { H3Event } from 'h3'

import type { inferAsyncReturnType } from '@trpc/server'

import { generateTransactionId } from '~/utils/commonHelper.ts'

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(event: H3Event) {
  const transactionId = generateTransactionId()
  setHeader(event, 'x-transaction-id', transactionId)

  return {
    event,
    transactionId,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
