import type { H3Event } from 'h3'

import { logger } from '~/server/utils/response'

export default defineEventHandler((event: H3Event) => {
  const transactionId = getRequestHeader(event, 'x-transaction-id')
  logger.log({ level: 'info', message: `request ${event.node.req.method}, ${event.node.req.url}`, transactionId })
})
