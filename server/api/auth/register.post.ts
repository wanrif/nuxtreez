import { hash } from '@node-rs/argon2'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate required fields
  if (!body.name || !body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Name, email and password are required',
    })
  }

  try {
    // Replace with your actual registration logic
    // Example: const user = await prisma.user.create({ data: body });
    const hashPassword = await hash(body.password)

    // For demo purposes, return mock user
    const user = {
      id: '123',
      name: body.name,
      email: body.email,
      password: hashPassword,
    }

    // Optional: Generate and return JWT token
    return {
      user,
      // token: generateToken(user),
    }
  } catch (error: unknown) {
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Registration failed',
    })
  }
})
