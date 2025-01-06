<script lang="ts" setup>
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value)
})
</script>

<template>
  <div class="flex items-center gap-3 uppercase">
    <NuxtLink v-for="available in availableLocales" :key="available.code" :to="switchLocalePath(available.code)">
      {{ available.code }}
    </NuxtLink>
  </div>
</template>

<style></style>
