<script setup lang="ts">
import type { MenuItem } from '~/types/menu'

const { t } = useI18n()
const localePath = useLocalePath()
const auth = useAuthStore()
const route = useRoute()
const { isSidebarExpanded, isMobileMenuOpen, isMobile, activeSubmenu, toggleSidebar, toggleMobileMenu, toggleSubmenu } =
  useSidebar()

const showContent = ref(false)

watch(
  () => route.fullPath,
  () => (isMobileMenuOpen.value = false)
)

const MENU_ITEMS: MenuItem[] = [
  { label: 'dashboard', icon: 'tabler:layout-dashboard', to: '/dashboard' },
  { label: 'users', icon: 'tabler:users', to: '/dashboard/users' },
  {
    label: 'products',
    icon: 'tabler:package',
    subMenu: [
      { label: 'all_products', to: '/dashboard/products', icon: 'tabler:list' },
      { label: 'add_product', to: '/dashboard/products/add', icon: 'tabler:plus' },
      { label: 'categories', to: '/dashboard/products/categories', icon: 'tabler:category' },
    ],
  },
  { label: 'orders', icon: 'tabler:shopping-cart', to: '/dashboard/orders' },
]

const menuItems = computed(() =>
  MENU_ITEMS.map((item) => ({
    ...item,
    label: t(item.label),
    to: item.to ? localePath(item.to) : undefined,
    subMenu: item.subMenu?.map((sub) => ({ ...sub, label: t(sub.label), to: localePath(sub.to) })),
  }))
)

const loading = ref(true)

onMounted(async () => {
  if (!auth.user) {
    await auth.checkSession()
  }
  loading.value = false
  showContent.value = true
})
</script>

<template>
  <LoadingSpinner size="lg" :show="loading" />

  <div
    v-if="auth.isAuthenticated && showContent"
    class="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
  >
    <!-- Mobile Menu Overlay -->
    <Transition name="fade">
      <div
        v-show="isMobileMenuOpen"
        class="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden"
        @click="toggleMobileMenu"
      />
    </Transition>

    <!-- Sidebar Navigation -->
    <DashboardSidebar
      :is-sidebar-expanded="isSidebarExpanded"
      :is-mobile-menu-open="isMobileMenuOpen"
      :is-mobile="isMobile"
      :active-submenu="activeSubmenu"
      :menu-items="menuItems"
      @toggle-sidebar="toggleSidebar"
      @toggle-mobile-menu="toggleMobileMenu"
      @toggle-submenu="toggleSubmenu"
    />

    <!-- Main Content -->
    <div
      :class="['transition-all duration-300', !isMobile && 'md:ml-20', { 'md:ml-64': !isMobile && isSidebarExpanded }]"
    >
      <!-- Header -->
      <header
        class="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80"
      >
        <div class="px-4 py-4 md:px-6">
          <div class="flex items-center justify-between">
            <!-- Mobile Menu Button -->
            <button
              class="flex items-center justify-center rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 md:hidden"
              @click="toggleMobileMenu"
            >
              <Icon name="tabler:menu-2" class="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>

            <h2
              class="hidden bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-lg font-semibold text-transparent sm:block"
            >
              {{ t('welcome') }}
            </h2>

            <div class="flex items-center space-x-4">
              <Theme />
              <DashboardProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main class="p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply bg-gray-50 dark:bg-gray-700/50;
}

.router-link-active.router-link-exact-active {
  @apply bg-transparent text-blue-600 dark:text-blue-400;
}

/* Performance optimizations */
.transition-transform {
  will-change: transform;
  backface-visibility: hidden;
}

.menu-enter-active,
.menu-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
