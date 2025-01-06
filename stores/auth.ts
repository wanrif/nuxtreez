import { defineStore } from 'pinia'
import { parse, stringify } from 'zipson'

import type {
  ApiError,
  ChangePasswordCredentials,
  IUser,
  LoginCredentials,
  RegisterCredentials,
  UpdateProfileCredentials,
} from '~/types'

type User = IUser

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    error: null as string | null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async login(credentials: LoginCredentials) {
      const { $client } = useNuxtApp()
      this.error = null
      this.loading = true

      try {
        const response = await $client.auth.login.mutate(credentials)

        if (!response.data?.token) throw new Error('No token received')
        await this.fetchProfile()
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        this.user = null
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(credentials: RegisterCredentials) {
      const { $client } = useNuxtApp()
      this.error = null

      try {
        await $client.auth.register.mutate(credentials)
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        throw err
      }
    },

    async logout() {
      const { $client } = useNuxtApp()

      try {
        await $client.auth.logout.mutate()

        this.user = null
        navigateTo('/login')
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        throw err
      }
    },

    async checkSession() {
      this.loading = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        // In a real app, validate token/session here
        const savedUser = this.$state.user
        if (savedUser) {
          this.user = JSON.parse(JSON.stringify(savedUser))
        }
      } finally {
        this.loading = false
      }
    },

    async forgotPassword(email: string) {
      const { $client } = useNuxtApp()
      this.error = null
      try {
        await $client.auth.forgotPassword.mutate({ email })
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        throw err
      }
    },

    async resetPassword(token: string, newPassword: string) {
      const { $client } = useNuxtApp()
      this.error = null
      try {
        await $client.auth.resetPassword.mutate({
          token,
          password: newPassword,
        })
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        throw err
      }
    },

    async fetchProfile() {
      const { $client } = useNuxtApp()
      this.error = null

      try {
        const response = await $client.user.profile.query()

        if (!response.data?.user) throw new Error('No user received')

        this.user = response.data.user
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
      }
    },

    async changePassword(credentials: ChangePasswordCredentials) {
      const { $client } = useNuxtApp()
      this.error = null

      try {
        const response = await $client.auth.changePassword.mutate(credentials)
        return response
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        throw err
      }
    },

    async updateProfile(profile: UpdateProfileCredentials) {
      const { $client } = useNuxtApp()
      this.error = null

      try {
        profile.id = this.user?.id
        const response = await $client.user.update.mutate(profile)
        if (!response.data?.user) {
          throw new Error('No user data in response')
        }
        this.user = response.data.user as User
        return response
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        throw err
      }
    },
  },

  persist: {
    pick: ['user', 'token'],
    serializer: {
      deserialize: parse,
      serialize: stringify,
    },
  },
})
