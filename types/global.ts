export interface ApiError extends Error {
  message: string
  statusCode?: number
}
