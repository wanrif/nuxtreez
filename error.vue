<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: {
    type: Object as () => NuxtError,
    default: () => ({
      statusCode: 500,
      message: '',
    }),
  },
})

const { t } = useI18n()
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

const handleClearError = () => {
  clearError()
  navigateTo('/')
}

const errorMessage = computed(() => {
  switch (props.error?.statusCode) {
    case 404:
      return t('error_404')
    case 500:
      return t('error_500')
    default:
      return t('error_unknown')
  }
})

const shapes = [
  { type: 'circle', size: 'w-24 h-24', position: '-top-12 -left-12', color: 'bg-blue-500/10' },
  { type: 'square', size: 'w-32 h-32', position: '-bottom-16 -right-16', color: 'bg-purple-500/10' },
  { type: 'triangle', size: 'w-20 h-20', position: 'top-1/2 -right-10', color: 'bg-emerald-500/10' },
]
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 dark:bg-gray-900">
    <!-- Animated Background Shapes -->
    <div v-for="(shape, index) in shapes" :key="index" :class="[shape.position, 'animate-float absolute']">
      <div :class="[shape.size, shape.color, 'rounded-full blur-2xl']" />
    </div>

    <div class="relative w-full max-w-md">
      <div v-if="mounted" class="space-y-8 text-center">
        <div class="relative mx-auto h-64 w-64">
          <div class="absolute inset-0">
            <div class="h-full w-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div class="space-y-4">
          <div class="mx-auto h-8 w-3/4 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div class="mx-auto h-4 w-1/2 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <div class="h-12 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div class="h-12 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      <div v-else class="space-y-8 text-center">
        <!-- Animated Error Illustration -->
        <div class="relative mx-auto h-64 w-64">
          <div class="animate-pulse-slow absolute inset-0">
            <div class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl" />
          </div>
          <div class="relative z-10 flex h-full items-center justify-center">
            <h1
              class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-[8rem] font-black text-transparent"
            >
              {{ props.error?.statusCode || '?' }}
            </h1>
          </div>
        </div>

        <!-- Error Message -->
        <div class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ props.error?.message || errorMessage }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('error_help') }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            class="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-purple-500/25"
            @click="handleClearError"
          >
            <Icon name="tabler:home" class="h-5 w-5 group-hover:animate-bounce" />
            {{ t('return_home') }}
          </button>
          <button
            class="group flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg dark:border-gray-700 dark:hover:border-purple-500/50"
            @click="() => refreshNuxtData()"
          >
            <Icon
              name="tabler:reload"
              class="h-5 w-5 text-gray-600 transition-transform duration-500 group-hover:rotate-180 dark:text-gray-400"
            />
            {{ t('try_again') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Enhanced animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0);
  }
  50% {
    transform: translateY(-20px) rotate(6deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

/* Improve button interactions */
.group:hover .group-hover\:animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-25%);
  }
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
