export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  // Check session on app start
  await auth.checkSession()

  // Add mock user for testing - REMOVE IN PRODUCTION
  if (import.meta.client) {
    // Uncomment to auto-login in development
    // auth.user = { id: '1', email: 'admin@example.com', name: 'Admin User' };
  }

  return {
    provide: {},
  }
})
