<template>
  <div class="mt-8 space-y-6">
    <template v-for="i in 2" :key="i">
      <InputFieldSkeleton />
    </template>

    <USkeleton class="h-8" />

    <div class="flex items-center justify-center gap-2">
      <USkeleton class="h-4 w-28" />
      <USkeleton class="h-4 w-4 rounded-full" />
      <USkeleton class="h-4 w-24" />
    </div>
  </div>
</template>
