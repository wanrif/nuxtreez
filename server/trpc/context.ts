import type { H3Event } from 'h3'

import type { inferAsyncReturnType } from '@trpc/server'

import { generateTransactionId } from '~/utils/commonHelper.ts'

export async function createContext(event: H3Event) {
  const transactionId = generateTransactionId()
  setHeader(event, 'x-transaction-id', transactionId)

  return {
    event,
    transactionId,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
