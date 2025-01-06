<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: 'bg-gray-50 dark:bg-gray-900',
  },
})
</script>

<template>
  <div class="min-h-screen">
    <header class="fixed right-0 top-0 flex gap-4 p-4">
      <Theme />
      <Language />
    </header>
    <slot />
  </div>
</template>
