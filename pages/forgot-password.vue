<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
})

useHead({
  title: 'Forgot Password',
  meta: [
    {
      name: 'description',
      content: 'Forgot your password? No worries, we got you covered!',
    },
  ],
})

const { t } = useI18n()
const localePath = useLocalePath()
const { fields, errors, isSubmitting, error, meta, success, submit } = useForgotPasswordForm()
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="flex w-full max-w-md flex-col gap-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ t('forgot_password_title') }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">
          {{ t('forgot_password_description') }}
        </p>
      </div>

      <form v-if="mounted && !success" class="flex flex-col gap-6" @submit.prevent="submit">
        <UFormGroup :label="t('email_label')" :error="errors.email">
          <UInput
            v-model="fields.email.value.value"
            color="primary"
            type="email"
            :placeholder="t('email_placeholder')"
            autocomplete="email"
            :trailing-icon="errors.email ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
          />
        </UFormGroup>

        <div v-if="error" class="text-center text-sm text-red-500">{{ error }}</div>

        <UButton type="submit" color="primary" block :loading="isSubmitting" :disabled="isSubmitting || !meta.valid">
          {{ t('send_reset_link') }}
        </UButton>

        <div class="text-center text-sm">
          <NuxtLink :to="localePath('/login')" class="text-primary-600 hover:text-primary-500 dark:text-primary-400">
            {{ t('back_to_login') }}
          </NuxtLink>
        </div>
      </form>

      <div v-else-if="success" class="text-center">
        <div class="mb-4 text-green-500">
          <UIcon name="i-heroicons-check-circle" class="mx-auto h-16 w-16" />
        </div>
        <h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('check_your_email') }}
        </h2>
        <p class="mb-6 text-gray-600 dark:text-gray-300">
          {{ t('reset_link_sent') }}
        </p>
        <NuxtLink to="/login" class="text-primary-600 hover:text-primary-500 dark:text-primary-400">
          {{ t('back_to_login') }}
        </NuxtLink>
      </div>

      <div v-else class="mt-8 flex flex-col gap-6">
        <InputFieldSkeleton />
        <USkeleton class="h-8" />
        <div class="flex justify-center">
          <USkeleton class="h-4 w-28" />
        </div>
      </div>
    </div>
  </div>
</template>
