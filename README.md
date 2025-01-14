# Nuxtreez

A powerful full-stack Nuxt 3 boilerplate with TypeScript

## Description

Nuxtreez is a modern, full-featured boilerplate that combines the best tools and practices for building scalable web applications. Built on top of Nuxt 3, it provides a robust foundation with integrated authentication, state management, database ORM, and type-safe API communication.

## Features

- 🚀 **Nuxt 3** - The Intuitive Vue Framework
- 📝 **TypeScript** - Full type safety across your application
- 🎨 **Nuxt UI** - Beautiful and accessible components
- 📦 **Pinia** - State management with dev tools support
- 🔐 **Authentication** - Built-in auth system
- 🔄 **tRPC** - End-to-end type-safe APIs
- 📊 **Drizzle ORM** - Type-safe database queries
- 💾 **MySQL** - Reliable database system
- 🛠️ **Developer Experience**
  - Hot Module Replacement
  - TypeScript strict mode
  - ESLint & Prettier
  - Git hooks with Husky (❌ Not implemented yet)

## Installation

```bash
# Clone the repository
git clone https://github.com/wanrif/nuxtreez.git

# Navigate to project directory
cd nuxtreez

# Install dependencies
yarn install

# Configure environment variables
cp .env.example .env

# Setup database
yarn db:push

# Start development server
yarn dev
```

## Environment Setup

Create a `.env` file with the following variables:

```env
# Nuxt Security
NUXT_CSRF_SECRET_KEY="16-digit-hex"

# DATABASE
DATABASE_URL="mysql://root@localhost:3306/nuxtreez?schema=public"
MYSQL_HOST="localhost:3306"
MYSQL_USER="root"
MYSQL_PASSWORD=
MYSQL_DATABASE="nuxtreez"

# JWT
NUXT_JWT_SECRET_KEY="your-jwt-secret-key"
NUXT_JWT_REFRESH_SECRET_KEY="your-jwt-refresh"

# ENCRYPTION
NUXT_ENCRYPTION_ALGORITHM="aes-256-gcm"
NUXT_ENCRYPTION_PASSWORD="your-encryption-password"
```

## Usage

### Database Operations

```bash
# Generate migrations
yarn db:generate

# Push schema changes
yarn db:push

# Run migrations
yarn db:migrate

# If you need seed data
yarn db:seed
```

### API Routes

The API is built with tRPC, providing type-safe API routes. Example:

```typescript
// Access type-safe API routes
const { $client } = useNuxtApp()
const { data } = await $client.users.getAll.useQuery()
```

### Authentication

Authentication is implemented using Pinia store with HTTP-only cookies for secure token management:

```typescript
// In your components/pages
const auth = useAuthStore()

// Login
await auth.login({
  email: 'user@example.com',
  password: 'password'
})

// Register
await auth.register({
  name: 'John Doe',
  email: 'user@example.com',
  password: 'password',
  confirmPassword: 'password'
})

// Logout
await auth.logout()

// Check authentication status
const isAuthenticated = auth.isAuthenticated

// Get current user
const user = auth.user

// Change password
await auth.changePassword({
  oldPassword: 'oldPassword',
  newPassword: 'newPassword',
  confirmNewPassword: 'newPassword'
})

// Update profile
await auth.updateProfile({
  name: 'New Name',
  email: 'newemail@example.com'
})

// Password reset
await auth.forgotPassword('user@example.com')
await auth.resetPassword('token', 'newPassword')
```

Features:

- HTTP-only cookie-based authentication
- Automatic token refresh
- Session management
- Password reset flow
- Profile management

### State Management

```typescript
// Use Pinia stores
const store = useYourStore()
```

## Documentation

- [Nuxt 3](https://nuxt.com/)
- [Nuxt UI](https://ui.nuxt.com/)
- [Pinia](https://pinia.vuejs.org/)
- [tRPC](https://trpc.io/)
- [tRPC Nuxt](https://trpc-nuxt.vercel.app/)
- [Drizzle ORM](https://orm.drizzle.team/)

## License

MIT
