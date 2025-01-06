<script setup lang="ts">
const emit = defineEmits<{
  (_e: 'success'): void
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { fields, errors, isSubmitting, meta, error, submit } = useLoginForm(() => emit('success'))
</script>

<template>
  <form class="mt-8 flex flex-col gap-6" @submit.prevent="submit">
    <div class="flex flex-col gap-4">
      <template v-for="(field, key) in fields" :key="key">
        <UFormGroup v-slot="{ error: fieldError }" :label="t(`${key}_label`)" :error="errors[key]">
          <UInput
            v-model="field.value.value"
            color="primary"
            :type="key === 'password' ? 'password' : 'email'"
            :placeholder="t(`${key}_placeholder`)"
            :autocomplete="key === 'password' ? 'current-password' : 'email'"
            :trailing-icon="fieldError ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
          />
        </UFormGroup>
      </template>
    </div>

    <div v-if="error" class="text-center text-sm text-red-500">{{ error }}</div>

    <UButton type="submit" color="primary" block :loading="isSubmitting" :disabled="isSubmitting || !meta.valid">
      {{ t('login') }}
    </UButton>

    <div class="text-center text-sm">
      <NuxtLink
        :to="localePath('/forgot-password')"
        class="text-primary-600 hover:text-primary-500 dark:text-primary-400"
      >
        {{ t('forgot_password') }}
      </NuxtLink>
      <span class="px-2 text-gray-400">•</span>
      <NuxtLink :to="localePath('/register')" class="text-primary-600 hover:text-primary-500 dark:text-primary-400">
        {{ t('create_account') }}
      </NuxtLink>
    </div>
  </form>
</template>
