<script lang="ts" setup>
import { useField, useForm } from 'vee-validate'
import * as zod from 'zod'

import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

useHead({
  title: 'Settings',
  meta: [{ name: 'description', content: 'Settings page description' }],
})

const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

const handleLanguageChange = async (langCode: 'en' | 'id') => {
  settings.value.account.language = langCode
  locale.value = langCode
  await navigateTo(switchLocalePath(langCode), {
    replace: true,
    external: true,
  })
}

const availableLocales = computed(() => {
  return (locales.value || []).map((locale) => ({
    label: new Intl.DisplayNames([locale.code], { type: 'language' }).of(locale.code) || locale.code,
    code: locale.code,
  }))
})

const settings = ref({
  account: {
    email: 'john@example.com',
    language: locale,
    timezone: 'UTC+7',
  },
  notifications: {
    email: true,
    push: false,
    marketing: false,
    updates: true,
  },
  appearance: {
    theme: 'system',
    compact: false,
    animations: true,
  },
  privacy: {
    profileVisibility: 'public',
    twoFactorAuth: false,
  },
})

const themes = computed(() => [
  { label: t('theme_system'), value: 'system' },
  { label: t('theme_light'), value: 'light' },
  { label: t('theme_dark'), value: 'dark' },
])

const visibilityOptions = computed(() => [
  { label: t('visibility_public'), value: 'public' },
  { label: t('visibility_private'), value: 'private' },
  { label: t('visibility_friends'), value: 'friends' },
])

const { currentTheme, updateTheme } = useThemeManager()

onMounted(() => {
  settings.value.appearance.theme = currentTheme.value
})

const handleThemeUpdate = (value: string) => {
  settings.value.appearance.theme = value
  updateTheme(value)
}

watch(
  currentTheme,
  (newTheme) => {
    settings.value.appearance.theme = newTheme
  },
  { immediate: true }
)

const passwordError = ref('')
const passwordSuccess = ref('')
const isChangingPassword = ref(false)

const authStore = useAuthStore()

const passwordSchema = toTypedSchema(
  zod
    .object({
      currentPassword: zod.string().min(8, t('validation_password_min')),
      newPassword: zod
        .string()
        .min(8, t('validation_password_min'))
        .regex(/[A-Z]/, t('validation_password_uppercase'))
        .regex(/[a-z]/, t('validation_password_lowercase'))
        .regex(/[0-9]/, t('validation_password_number')),
      confirmPassword: zod.string().min(1, t('validation_confirm_password_required')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('passwords_not_match'),
      path: ['confirmPassword'],
    })
)

const { handleSubmit, resetForm, errors } = useForm({
  validationSchema: passwordSchema,
})

const { value: currentPassword } = useField<string>('currentPassword')
const { value: newPassword } = useField<string>('newPassword')
const { value: confirmPassword } = useField<string>('confirmPassword')

const handlePasswordChange = handleSubmit(async (values) => {
  try {
    passwordError.value = ''
    passwordSuccess.value = ''
    isChangingPassword.value = true

    await authStore.changePassword({
      oldPassword: values.currentPassword,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmPassword,
    })

    passwordSuccess.value = t('password_changed')
    resetForm()
  } catch (error: unknown) {
    const err = error as Error & {
      data?: { zodError?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] } }
    }
    if (err.data?.zodError) {
      const fieldErrors = err.data?.zodError?.fieldErrors
      const formErrors = err.data?.zodError?.formErrors

      if (formErrors && formErrors.length > 0) {
        passwordError.value = formErrors[0]
      } else if (fieldErrors) {
        const firstField = Object.keys(fieldErrors)[0]
        if (firstField && fieldErrors[firstField].length > 0) {
          passwordError.value = fieldErrors[firstField][0]
        }
      }
    } else {
      passwordError.value = err.message || t('password_error')
    }
  } finally {
    isChangingPassword.value = false
  }
})

const showTwoFAModal = ref(false)
const twoFAAction = ref<'enable' | 'disable'>('enable')
const is2FAProcessing = ref(false)

const handle2FAToggle = () => {
  twoFAAction.value = settings.value.privacy.twoFactorAuth ? 'disable' : 'enable'
  showTwoFAModal.value = true
}

const confirm2FAChange = async () => {
  try {
    is2FAProcessing.value = true
    await new Promise((resolve) => setTimeout(resolve, 1500))

    settings.value.privacy.twoFactorAuth = !settings.value.privacy.twoFactorAuth
    showTwoFAModal.value = false

    alert(t(settings.value.privacy.twoFactorAuth ? 'two_fa_enabled' : 'two_fa_disabled'))
  } catch (error) {
    console.error('2FA toggle failed:', error)
    alert(t('two_fa_error'))
  } finally {
    is2FAProcessing.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6 px-4 sm:px-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <template v-if="mounted">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ t('settings') }}</h1>
      </template>
      <template v-else>
        <div class="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </template>
    </div>

    <!-- Settings Content -->
    <template v-if="mounted">
      <div class="grid gap-6">
        <!-- Account Settings -->
        <div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">{{ t('account_settings') }}</h2>
          <div class="block">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="col-span-2">
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('account_email_address') }}
                </label>
                <input
                  v-model="settings.account.email"
                  type="email"
                  :placeholder="t('enter_email_address')"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  disabled
                />
              </div>
              <div class="block">
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ $t('account_language') }}
                </label>
                <select
                  v-model="settings.account.language"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  @change="(e) => handleLanguageChange((e.target as HTMLSelectElement).value as 'en' | 'id')"
                >
                  <option
                    v-for="available in availableLocales"
                    :key="available.code"
                    :value="available.code"
                    :selected="available.code === settings.account.language"
                  >
                    {{ available.label }}
                  </option>
                </select>
              </div>
              <div class="block">
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ $t('account_timezone') }}
                </label>
                <select
                  v-model="settings.account.timezone"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option>UTC+7</option>
                  <option>UTC+0</option>
                  <option>UTC+1</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">{{ t('notifications') }}</h2>
          <div class="space-y-4">
            <div v-for="(value, key) in settings.notifications" :key="key" class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium capitalize text-gray-900 dark:text-white">
                  {{ t(`${key}_notifications`) }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ t('receive_notifications', { type: key }) }}
                </p>
              </div>
              <button
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none"
                :class="value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'"
                @click="settings.notifications[key] = !value"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                  :class="value ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Appearance -->
        <div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">{{ t('appearance') }}</h2>
          <div class="space-y-6">
            <div>
              <label class="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('theme') }}
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="theme in themes"
                  :key="theme.value"
                  class="flex items-center justify-center rounded-lg border px-4 py-2 transition-all duration-200"
                  :class="[
                    settings.appearance.theme === theme.value
                      ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-gray-300 hover:border-blue-600/50 dark:border-gray-600',
                  ]"
                  @click="handleThemeUpdate(theme.value)"
                >
                  {{ theme.label }}
                </button>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">Compact Mode</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Reduce spacing and padding</p>
                </div>
                <button
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="settings.appearance.compact ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'"
                  @click="settings.appearance.compact = !settings.appearance.compact"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="settings.appearance.compact ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">Enable Animations</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Show animations and transitions</p>
                </div>
                <button
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="settings.appearance.animations ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'"
                  @click="settings.appearance.animations = !settings.appearance.animations"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="settings.appearance.animations ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Change Password Section before Privacy section -->
        <div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">{{ t('change_password') }}</h2>
          <form class="max-w-md space-y-4" @submit.prevent="handlePasswordChange">
            <!-- Error/Success Messages -->
            <div
              v-if="passwordError"
              class="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
            >
              {{ passwordError }}
            </div>
            <div
              v-if="passwordSuccess"
              class="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400"
            >
              {{ passwordSuccess }}
            </div>

            <!-- Password Fields -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('current_password') }}
              </label>
              <input
                v-model="currentPassword"
                type="password"
                :placeholder="t('enter_current_password')"
                :class="[
                  'w-full rounded-lg border bg-white px-4 py-2 text-gray-900 dark:bg-gray-700 dark:text-white',
                  'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400',
                  'transition duration-200',
                  errors.currentPassword
                    ? 'border-red-600 focus:ring-red-600 dark:border-red-400 dark:focus:ring-red-400'
                    : 'border-gray-300 dark:border-gray-600',
                ]"
              />
              <span v-if="errors.currentPassword" class="text-sm text-red-600 dark:text-red-400">
                {{ errors.currentPassword }}
              </span>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('new_password') }}
              </label>
              <input
                v-model="newPassword"
                type="password"
                :placeholder="t('enter_new_password')"
                :class="[
                  'w-full rounded-lg border bg-white px-4 py-2 text-gray-900 dark:bg-gray-700 dark:text-white',
                  'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400',
                  'transition duration-200',
                  errors.newPassword
                    ? 'border-red-600 focus:ring-red-600 dark:border-red-400 dark:focus:ring-red-400'
                    : 'border-gray-300 dark:border-gray-600',
                ]"
              />
              <span v-if="errors.newPassword" class="text-sm text-red-600 dark:text-red-400">
                {{ errors.newPassword }}
              </span>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('confirm_password') }}
              </label>
              <input
                v-model="confirmPassword"
                type="password"
                :placeholder="t('confirm_new_password')"
                :class="[
                  'w-full rounded-lg border bg-white px-4 py-2 text-gray-900 dark:bg-gray-700 dark:text-white',
                  'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400',
                  'transition duration-200',
                  errors.confirmPassword
                    ? 'border-red-600 focus:ring-red-600 dark:border-red-400 dark:focus:ring-red-400'
                    : 'border-gray-300 dark:border-gray-600',
                ]"
              />
              <span v-if="errors.confirmPassword" class="text-sm text-red-600 dark:text-red-400">
                {{ errors.confirmPassword }}
              </span>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="isChangingPassword || !currentPassword || !newPassword || !confirmPassword"
                class="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Icon v-if="isChangingPassword" name="tabler:loader-2" class="h-4 w-4 animate-spin" />
                <span>{{ isChangingPassword ? t('changing_password') : t('change_password') }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Privacy -->
        <div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">{{ t('privacy_security') }}</h2>
          <div class="space-y-6">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('profile_visibility') }}
              </label>
              <select
                v-model="settings.privacy.profileVisibility"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option v-for="option in visibilityOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ t('two_factor_auth') }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ t('two_factor_auth_description') }}
                  </p>
                </div>
                <button
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                  :class="settings.privacy.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'"
                  @click="handle2FAToggle"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                    :class="settings.privacy.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="grid gap-6">
        <div v-for="i in 4" :key="i" class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div class="mb-6 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div class="space-y-4">
            <div v-for="j in 3" :key="j" class="flex items-center justify-between">
              <div class="space-y-2">
                <div class="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div class="h-3 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div class="h-6 w-11 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add 2FA Confirmation Modal -->
    <template v-if="mounted">
      <Modal
        :is-open="showTwoFAModal"
        :title="t(twoFAAction === 'enable' ? 'enable_2fa' : 'disable_2fa')"
        transition="slide"
        @close="showTwoFAModal = false"
      >
        <div class="flex flex-col gap-4">
          <p class="text-gray-600 dark:text-gray-300">
            {{ t(twoFAAction === 'enable' ? 'enable_2fa_confirm' : 'disable_2fa_confirm') }}
          </p>
          <div class="flex justify-end space-x-3">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              @click="showTwoFAModal = false"
            >
              {{ t('cancel') }}
            </button>
            <button
              :disabled="is2FAProcessing"
              class="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              @click="confirm2FAChange"
            >
              <Icon v-if="is2FAProcessing" name="tabler:loader-2" class="h-4 w-4 animate-spin" />
              <span>{{ t(twoFAAction === 'enable' ? 'enable' : 'disable') }}</span>
            </button>
          </div>
        </div>
      </Modal>
    </template>
  </div>
</template>

<style scoped>
.transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
