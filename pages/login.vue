<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
})

useHead({
  title: 'Login',
  meta: [
    {
      name: 'description',
      content: 'Login to your account',
    },
  ],
})

const localePath = useLocalePath()
const route = useRoute()
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

const handleLoginSuccess = async () => {
  const redirect = route.query.redirect as string
  await navigateTo(redirect || localePath('/dashboard'), { replace: true })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <LoginHeader />

      <LoginForm v-if="mounted" @success="handleLoginSuccess" />
      <LoginSkeleton v-else />
    </div>
  </div>
</template>
