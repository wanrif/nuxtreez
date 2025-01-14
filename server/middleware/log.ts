import type { H3Event } from 'h3'

export default defineEventHandler((event: H3Event) => {
  const transactionId = getRequestHeader(event, 'x-transaction-id')
  logger.log({
    level: 'info',
    code: 'REQUEST',
    statusCode: 200,
    message: `request ${event.node.req.method}, ${event.node.req.url}`,
    transactionId,
  })
})
