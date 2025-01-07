<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | NuxTreez` : 'NuxTreez'
  },
  meta: [
    {
      name: 'description',
      content: 'This is NuxTreez, let me tell you all about it.',
    },
    {
      property: 'og:title',
      content: 'NuxTreez',
    },
    {
      property: 'og:description',
      content: 'This is NuxTreez, let me tell you all about it.',
    },
    {
      property: 'og:image',
      content: 'https://nuxtreez.com/image.png',
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UNotifications />
</template>
