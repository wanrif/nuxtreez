export default defineNuxtRouteMiddleware((_to, _from) => {
  const user = useAuthStore()

  if (user.isAuthenticated) {
    return navigateTo('/dashboard')
  }
})
