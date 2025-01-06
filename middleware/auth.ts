export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  // Wait for auth check to complete
  while (auth.loading) {
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  if (import.meta.server) {
    // Skip redirect on server
    return
  }

  // Only redirect if not authenticated after loading is complete
  if (!auth.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
