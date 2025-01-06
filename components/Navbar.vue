<script lang="ts" setup>
const localePath = useLocalePath()
const isOpen = ref(false)
const mounted = ref(false)
const auth = useAuthStore()

const linkList = computed(() => [
  { to: localePath('/'), text: 'navbar_home', icon: 'ph:house' },
  auth.isAuthenticated
    ? { to: localePath('/dashboard'), text: 'navbar_dashboard', icon: 'ph:gauge' }
    : { to: localePath('/login'), text: 'navbar_login', icon: 'ph:sign-in' },
])

onMounted(() => {
  mounted.value = true
})

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <nav class="w-full">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo Section -->
        <NuxtLink :to="localePath('/')" class="flex items-center space-x-3">
          <div class="bg-primary-600 flex h-8 w-8 items-center justify-center rounded-lg">
            <span class="font-bungee text-xl text-white">N</span>
          </div>
          <span class="font-bungee text-xl tracking-wide text-gray-900 dark:text-white">NuxTreez</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden items-center space-x-8 md:flex">
          <ULink
            v-for="link in linkList"
            :key="link.to"
            :to="link.to"
            class="hover:bg-primary-50 flex items-center space-x-2 rounded-lg px-3 py-2 transition-all duration-300 dark:hover:bg-gray-800"
            :class="
              link.to === $route.path ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
            "
          >
            <Icon :name="link.icon" class="h-5 w-5" />
            <span class="font-medium">{{ $t(link.text) }}</span>
          </ULink>

          <div v-if="mounted" class="flex items-center space-x-4">
            <Theme />
            <Language />
          </div>

          <template v-else>
            <USkeleton class="h-8 w-8 bg-gray-200 dark:bg-gray-700" />
            <USkeleton class="h-8 w-8 bg-gray-200 dark:bg-gray-700" />
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <div class="flex items-center space-x-4 md:hidden">
          <template v-if="mounted">
            <Theme />
            <Language />
          </template>
          <button
            v-if="mounted"
            class="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="toggleMenu"
          >
            <Icon :name="isOpen ? 'ph:x-bold' : 'ph:list-bold'" class="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <template v-if="mounted">
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div v-if="isOpen" class="py-2 md:hidden">
            <div class="space-y-1">
              <ULink
                v-for="link in linkList"
                :key="link.to"
                :to="link.to"
                class="flex items-center space-x-2 rounded-lg px-4 py-3 transition-colors"
                :class="
                  link.to === $route.path
                    ? 'bg-primary-50 text-primary-600 dark:text-primary-400 dark:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                "
                @click="isOpen = false"
              >
                <Icon :name="link.icon" class="h-5 w-5" />
                <span class="font-medium">{{ $t(link.text) }}</span>
              </ULink>
            </div>
          </div>
        </transition>
      </template>
    </div>
  </nav>
</template>

<style></style>
