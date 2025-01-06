export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate required fields
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required',
    })
  }

  try {
    // Mock authentication logic
    // In production, replace this with actual database/auth service check
    if (body.email === 'admin@example.com' && body.password === 'password') {
      // Mock user data
      const user = {
        id: '1',
        name: 'Admin User',
        email: body.email,
      }

      return {
        user,
        // Optional: Generate and return JWT token
        // token: generateToken(user),
      }
    }

    throw createError({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Authentication failed',
    })
  }
})
