<script setup lang="ts">
import type { ProfileItem } from '~/types/menu'

const auth = useAuthStore()
const { t } = useI18n()
const localePath = useLocalePath()

const isProfileOpen = ref(false)
const profileDropdownRef = ref(null)
const profileButtonRef = ref<HTMLButtonElement | null>(null)

onClickOutside(
  profileDropdownRef,
  (event) => {
    if (!profileButtonRef.value?.contains(event.target as HTMLElement)) {
      isProfileOpen.value = false
    }
  },
  { ignore: [profileButtonRef] }
)

const closeDropdown = () => {
  isProfileOpen.value = false
}

const profileItems = computed<ProfileItem[]>(() => [
  {
    label: t('view_profile'),
    icon: 'tabler:user',
    to: localePath('/dashboard/profile'),
  },
  {
    label: t('settings'),
    icon: 'tabler:settings',
    to: localePath('/dashboard/settings'),
  },
  {
    label: t('logout'),
    icon: 'tabler:logout',
    action: () => auth.logout(),
  },
])
</script>

<template>
  <div class="relative">
    <button
      ref="profileButtonRef"
      class="flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
      @click="isProfileOpen = !isProfileOpen"
    >
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
        <span class="text-sm font-medium text-white">
          {{
            auth.user?.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase() || 'JD'
          }}
        </span>
      </div>
      <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
        {{ auth.user?.name || 'John Doe' }}
      </span>
      <Icon
        name="tabler:chevron-down"
        class="h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-gray-300"
        :class="{ 'rotate-180': isProfileOpen }"
      />
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-show="isProfileOpen"
        ref="profileDropdownRef"
        class="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="border-b border-gray-200 p-4 dark:border-gray-700">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ auth.user?.name || 'John Doe' }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ auth.user?.email || 'john@example.com' }}
          </p>
        </div>
        <div class="py-2">
          <template v-for="item in profileItems" :key="item.label">
            <NuxtLink
              v-if="item.to"
              :to="item.to"
              class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
              @click="closeDropdown"
            >
              <Icon :name="item.icon" class="h-4 w-4" />
              <span>{{ item.label }}</span>
            </NuxtLink>
            <button
              v-else
              class="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-gray-700/50"
              @click="item.action"
            >
              <Icon :name="item.icon" class="h-4 w-4" />
              <span>{{ item.label }}</span>
            </button>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
