<script lang="ts" setup>
useHead({
  title: 'Home',
  meta: [{ name: 'description', content: 'Home page description' }],
})

const mounted = ref(false)
const { t } = useI18n()

const features = [
  { icon: 'ph:lightning-bold', titleKey: 'feature_fast_title', descKey: 'feature_fast_desc' },
  { icon: 'ph:puzzle-piece-bold', titleKey: 'feature_modular_title', descKey: 'feature_modular_desc' },
  { icon: 'ph:rocket-bold', titleKey: 'feature_ready_title', descKey: 'feature_ready_desc' },
]

onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <div class="relative">
    <div
      v-if="mounted"
      class="from-primary-50 relative overflow-hidden bg-gradient-to-b to-white transition-opacity duration-500 dark:from-gray-900 dark:to-gray-900"
    >
      <!-- Hero Section -->
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="mb-6 text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            {{ t('hero_title') }} <span class="text-primary-600 dark:text-primary-400">NuxTreez</span>
          </h1>
          <p class="mx-auto mb-10 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            {{ t('hero_subtitle') }}
          </p>
          <div class="flex justify-center gap-4">
            <UButton color="primary" size="lg" to="#">{{ t('hero_get_started') }}</UButton>
            <UButton color="gray" variant="ghost" size="lg">{{ t('hero_learn_more') }}</UButton>
          </div>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div class="grid gap-8 md:grid-cols-3">
          <div
            v-for="(feature, index) in features"
            :key="feature.titleKey"
            class="feature-card card-hover rounded-xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-gray-800"
            :style="{ animationDelay: `${index * 0.2}s` }"
          >
            <div
              class="bg-primary-100 dark:bg-primary-900/50 mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
            >
              <Icon :name="feature.icon" class="text-primary-600 dark:text-primary-400 text-2xl" />
            </div>
            <h3 class="mb-2 text-xl font-semibold dark:text-white">{{ t(feature.titleKey) }}</h3>
            <p class="text-gray-600 dark:text-gray-300">{{ t(feature.descKey) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="from-primary-50 relative overflow-hidden bg-gradient-to-b to-white dark:from-gray-900 dark:to-gray-900"
    >
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div class="animate-pulse text-center">
          <div class="mx-auto mb-6 h-16 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div class="mx-auto mb-10 h-24 w-2/3 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div class="flex justify-center gap-4">
            <div class="h-12 w-32 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div class="h-12 w-32 rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>

      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div class="grid gap-8 md:grid-cols-3">
          <div v-for="i in 3" :key="i" class="animate-pulse rounded-xl bg-white p-6 dark:bg-gray-800">
            <div class="mb-4 h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div class="mb-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div class="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.feature-card {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-hover {
  position: relative;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
}

.card-hover::before {
  content: '';
  position: absolute;
  inset: -2px;
  z-index: -1;
  background: linear-gradient(45deg, #3b82f6, #10b981, #3b82f6);
  border-radius: 14px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-5px) scale(1.02) rotate(0.5deg);
  backdrop-filter: blur(5px);
}

.card-hover:hover::before {
  opacity: 1;
}

.card-hover:hover .icon {
  transform: scale(1.1) rotate(-5deg);
}

.feature-card .icon {
  transition: transform 0.3s ease;
}
</style>
