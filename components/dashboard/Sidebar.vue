<script setup lang="ts">
import type { MenuItem } from '~/types/menu'

defineProps<{
  isSidebarExpanded: boolean
  isMobileMenuOpen: boolean
  isMobile: boolean
  activeSubmenu: string | null
  menuItems: MenuItem[]
}>()

defineEmits(['toggle-sidebar', 'toggle-mobile-menu', 'toggle-submenu'])
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <nav
    :class="[
      'fixed z-50 h-full border-r border-gray-200 shadow-lg backdrop-blur-md dark:border-gray-700',
      'bg-white/80 dark:bg-gray-800/80',
      'md:translate-x-0',
      isSidebarExpanded ? 'w-64' : 'w-20',
      isMobileMenuOpen && isMobile ? 'w-64 translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0',
      'transition-all duration-300 ease-in-out',
    ]"
  >
    <div class="flex items-center overflow-hidden p-6">
      <div class="min-w-0 flex-1">
        <h1
          class="transform-gpu whitespace-nowrap bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bungee text-2xl font-bold text-transparent"
          :class="[
            isSidebarExpanded || isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0',
            'transition-all duration-300 ease-in-out',
          ]"
        >
          Dashboard
        </h1>
      </div>
      <button
        v-show="!isMobile"
        class="flex flex-shrink-0 items-center justify-center rounded-lg p-2 transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700/50"
        :class="{ 'rotate-180': !isSidebarExpanded }"
        @click="$emit('toggle-sidebar')"
      >
        <Icon name="tabler:chevron-left" class="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
    </div>

    <div v-if="mounted" class="mt-6 flex flex-col gap-2">
      <DashboardMenuItem
        v-for="item in menuItems"
        :key="item.label"
        :item="item"
        :is-expanded="isSidebarExpanded"
        :is-mobile="isMobile"
        :is-active="activeSubmenu === item.label"
        @toggle="$emit('toggle-submenu', item.label)"
      />
    </div>
  </nav>
</template>

<style scoped>
.transform-gpu {
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>
