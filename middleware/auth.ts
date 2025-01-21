export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  if (import.meta.server) {
    return
  }

  if (auth.loading) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  if (!auth.user) {
    await auth.checkSession()
  }

  if (!auth.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
