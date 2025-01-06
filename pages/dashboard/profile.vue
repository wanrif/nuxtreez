<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

useHead({
  title: 'Profile',
  meta: [{ name: 'description', content: 'User profile page description' }],
})

const authStore = useAuthStore()
const mounted = ref(false)

const user = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  avatar: '',
  bio: authStore.user?.bio || '',
  location: authStore.user?.location || '',
  phone: authStore.user?.phone || '',
  website: authStore.user?.website || '',
})

const isEditing = ref(false)

const { fields, errors, isSubmitting, meta, submit, resetForm } = useProfileForm(
  {
    name: user.value.name,
    email: user.value.email,
    phone: user.value.phone,
    location: user.value.location,
    website: user.value.website,
    bio: user.value.bio,
  },
  async (values) => {
    try {
      user.value = { ...values, avatar: user.value.avatar }
      await authStore.updateProfile(values)
      isEditing.value = false
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }
)

const cancelEdit = () => {
  resetForm()
  isEditing.value = false
}

const isMobile = ref(false)

onMounted(() => {
  mounted.value = true
})

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
  }

  checkMobile()
  window.addEventListener('resize', checkMobile)

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
})

const patterns = [
  'radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
  'radial-gradient(circle at 0% 0%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
]
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 sm:px-6">
    <template v-if="mounted">
      <!-- Profile Header -->
      <div
        class="relative mb-6 overflow-hidden rounded-xl bg-white p-6 shadow-md dark:bg-gray-800 sm:p-8"
        :style="{ background: `${patterns.join(', ')}, var(--tw-bg-opacity)` }"
      >
        <!-- Decorative Elements -->
        <div class="absolute right-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 transform">
          <div class="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl" />
        </div>

        <div class="relative z-10">
          <div class="flex flex-col items-center space-y-6 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <!-- Profile Info Section -->
            <div class="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
              <!-- Avatar Section -->
              <div class="group relative">
                <div class="h-24 w-24 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-1 sm:h-28 sm:w-28">
                  <div
                    class="flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-gray-800"
                  >
                    <span
                      class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl"
                    >
                      {{
                        user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                      }}
                    </span>
                  </div>
                </div>
                <div
                  class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600/50 to-purple-600/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <Icon name="tabler:camera" class="h-6 w-6 text-white" />
                </div>
              </div>

              <!-- User Info -->
              <div class="space-y-2 text-center sm:text-left">
                <h1
                  class="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-300 sm:text-3xl"
                >
                  {{ user.name }}
                </h1>
                <div
                  class="flex flex-col items-center space-y-2 text-sm sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0"
                >
                  <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Icon name="tabler:mail" class="h-4 w-4" />
                    <span>{{ user.email }}</span>
                  </div>
                  <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Icon name="tabler:map-pin" class="h-4 w-4" />
                    <span>{{ user.location ? user.location : '-' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <button
              v-if="!isEditing"
              class="transform rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 font-medium text-white transition duration-200 hover:scale-[1.02] hover:from-blue-700 hover:to-purple-700"
              @click="isEditing = true"
            >
              {{ $t('edit_profile') }}
            </button>
          </div>

          <!-- Bio Section -->
          <div class="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {{ user.bio }}
            </p>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div class="rounded-xl bg-white p-4 shadow dark:bg-gray-800 sm:p-6">
        <form @submit.prevent="submit">
          <div class="space-y-6">
            <!-- Personal Information -->
            <div>
              <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                {{ $t('personal_info') }}
              </h2>
              <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <template v-for="(field, key) in fields" :key="key">
                  <UFormGroup
                    v-slot="{ error: fieldError }"
                    :label="$t(`profile_${key}_label`)"
                    :error="errors[key]"
                    :class="{ 'md:col-span-2': ['website', 'bio'].includes(key) }"
                  >
                    <template v-if="key === 'bio'">
                      <UTextarea
                        v-model="field.value.value"
                        :disabled="!isEditing"
                        :rows="4"
                        color="blue"
                        variant="outline"
                        size="lg"
                        :ui="{
                          strategy: 'merge',
                          base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-50 border-0',
                          rounded: 'rounded-lg',
                          color: {
                            blue: {
                              outline:
                                'shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
                            },
                          },
                        }"
                      />
                    </template>
                    <template v-else>
                      <UInput
                        v-model="field.value.value"
                        :type="key === 'email' ? 'email' : 'text'"
                        :disabled="!isEditing"
                        color="blue"
                        variant="outline"
                        size="lg"
                        :trailing-icon="fieldError ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
                        :ui="{
                          strategy: 'merge',
                          base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-50 border-0',
                          rounded: 'rounded-lg',
                          color: {
                            blue: {
                              outline:
                                'shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
                            },
                          },
                        }"
                      />
                    </template>
                  </UFormGroup>
                </template>
              </div>
            </div>

            <!-- Action Buttons -->
            <div v-if="isEditing" class="flex flex-col space-y-3 sm:flex-row sm:justify-end sm:space-x-4 sm:space-y-0">
              <button
                type="button"
                class="order-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition duration-200 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:order-1 sm:w-auto"
                @click="cancelEdit"
              >
                {{ $t('cancel') }}
              </button>
              <button
                :disabled="isSubmitting || !meta.valid"
                type="submit"
                class="order-1 w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-medium text-white transition duration-200 hover:from-blue-700 hover:to-purple-700 sm:order-2 sm:w-auto"
              >
                {{ $t('save_changes') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </template>

    <template v-else>
      <!-- Profile Header Skeleton -->
      <div class="mb-6 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800 sm:p-8">
        <div class="flex flex-col items-center space-y-6 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div class="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
            <div class="h-24 w-24 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700 sm:h-28 sm:w-28" />
            <div class="space-y-2 text-center sm:text-left">
              <div class="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div class="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Content Skeleton -->
      <div class="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
        <div class="mb-6 h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          <div v-for="i in 6" :key="i" class="space-y-2">
            <div class="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div class="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Add smooth transitions for responsive changes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Improve form input touch targets on mobile */
@media (max-width: 640px) {
  input,
  textarea {
    font-size: 16px; /* Prevent zoom on iOS */
    min-height: 44px; /* Better touch targets */
  }
}

/* Add smooth transform transitions */
.transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Add gradient animation */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-gradient-animate {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}
</style>
