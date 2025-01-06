<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
})

useHead({
  title: 'Register',
  meta: [
    {
      name: 'description',
      content: 'Register for a new account',
    },
  ],
})

const { t } = useI18n()
const localePath = useLocalePath()
const { fields, errors, isSubmitting, meta, error, submit } = useRegisterForm()
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t('register') }}</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">{{ t('register_welcome') }}</p>
      </div>

      <form v-if="mounted" class="mt-8 flex flex-col gap-6" @submit.prevent="submit">
        <div class="flex flex-col gap-4">
          <template v-for="(field, key) in fields" :key="key">
            <UFormGroup v-slot="{ error: fieldError }" :label="t(`${key}_label`)" :error="errors[key]">
              <UInput
                v-model="field.value.value"
                color="primary"
                :type="key.toLowerCase().includes('password') ? 'password' : 'text'"
                :placeholder="t(`${key}_placeholder`)"
                :autocomplete="key === 'email' ? 'email' : key.includes('password') ? 'new-password' : key"
                :trailing-icon="fieldError ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
              />
            </UFormGroup>
          </template>
        </div>

        <div v-if="error" class="text-center text-sm text-red-500">{{ error }}</div>

        <UButton type="submit" color="primary" block :loading="isSubmitting" :disabled="isSubmitting || !meta.valid">
          {{ t('register') }}
        </UButton>

        <div class="text-center text-sm">
          <NuxtLink :to="localePath('/login')" class="text-primary-600 hover:text-primary-500 dark:text-primary-400">
            {{ t('already_have_account') }}
          </NuxtLink>
        </div>
      </form>

      <div v-else class="mt-8 flex flex-col gap-6">
        <div class="flex flex-col gap-4">
          <template v-for="i in 4" :key="i">
            <InputFieldSkeleton />
          </template>
        </div>
        <USkeleton class="h-8" />
        <div class="flex justify-center">
          <USkeleton class="h-4 w-36" />
        </div>
      </div>
    </div>
  </div>
</template>
