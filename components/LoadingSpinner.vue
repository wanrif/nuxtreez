<script setup lang="ts">
const props = defineProps<{
  size?: 'sm' | 'md' | 'lg'
  show?: boolean
}>()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-16 h-16'
    case 'lg':
      return 'w-32 h-32'
    default:
      return 'w-24 h-24'
  }
})
</script>

<template>
  <Transition name="fade">
    <div
      v-show="show"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80"
    >
      <div class="relative flex flex-col items-center gap-8">
        <!-- Spinner -->
        <div class="relative" :class="sizeClass">
          <!-- Outer rotating gradient ring -->
          <div class="animate-spin-slow absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
          <!-- Inner white/dark circle -->
          <div class="absolute inset-[3px] flex items-center justify-center rounded-full bg-white dark:bg-gray-900">
            <!-- Pulsing logo or icon -->
            <div class="h-1/2 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
          </div>
        </div>
        <!-- Loading text with gradient -->
        <div class="flex flex-col items-center gap-2">
          <span
            class="animate-pulse bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-medium text-transparent"
          >
            Loading
          </span>
          <div class="flex gap-1">
            <div class="h-1 w-1 animate-bounce rounded-full bg-blue-600" style="animation-delay: 0ms" />
            <div class="h-1 w-1 animate-bounce rounded-full bg-blue-500" style="animation-delay: 100ms" />
            <div class="h-1 w-1 animate-bounce rounded-full bg-purple-500" style="animation-delay: 200ms" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin-slow {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
</style>
