import type { H3Event } from 'h3'

import type { inferAsyncReturnType } from '@trpc/server'

export async function createContext(event: H3Event) {
  return {
    event,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
