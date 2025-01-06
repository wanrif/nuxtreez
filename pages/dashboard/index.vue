<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

useHead({
  title: 'Dashboard',
  meta: [{ name: 'description', content: 'Dashboard page description' }],
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
    <div
      class="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/80"
    >
      <div class="flex items-center space-x-4">
        <div class="flex items-center justify-center rounded-lg bg-blue-500/10 p-3">
          <Icon name="tabler:users" class="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h3 class="font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
          <p class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
            6,789
          </p>
        </div>
      </div>
    </div>

    <div
      class="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/80"
    >
      <div class="flex items-center space-x-4">
        <div class="flex items-center justify-center rounded-lg bg-green-500/10 p-3">
          <Icon name="tabler:currency-dollar" class="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h3 class="font-medium text-gray-500 dark:text-gray-400">Total Revenue</h3>
          <p class="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-2xl font-bold text-transparent">
            $23,456
          </p>
        </div>
      </div>
    </div>

    <div
      class="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/80"
    >
      <div class="flex items-center space-x-4">
        <div class="flex items-center justify-center rounded-lg bg-purple-500/10 p-3">
          <Icon name="tabler:shopping-cart" class="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h3 class="font-medium text-gray-500 dark:text-gray-400">Total Orders</h3>
          <p class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
            1,234
          </p>
        </div>
      </div>
    </div>

    <div
      class="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/80"
    >
      <div class="flex items-center space-x-4">
        <div class="flex items-center justify-center rounded-lg bg-orange-500/10 p-3">
          <Icon name="tabler:user-check" class="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h3 class="font-medium text-gray-500 dark:text-gray-400">Active Users</h3>
          <p class="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-2xl font-bold text-transparent">
            892
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
