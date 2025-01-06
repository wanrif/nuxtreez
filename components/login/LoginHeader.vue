<template>
  <div class="text-center">
    <NuxtLink :to="localePath('/')" class="inline-block">
      <Icon
        class="text-primary-600 dark:text-primary-400 h-12 w-12 sm:h-20 sm:w-20"
        name="tabler:topology-star-ring-3"
      />
    </NuxtLink>
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t('login') }}</h1>
    <p class="mt-2 text-gray-600 dark:text-gray-300">{{ t('login_welcome') }}</p>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
</script>
