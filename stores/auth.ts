import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import { parse, stringify } from 'zipson'

import { decryptWithSessionKey, generateKeyPair } from '~/server/utils/cryptoHelper'
import type {
  ApiError,
  ChangePasswordCredentials,
  IUser,
  LoginCredentials,
  RegisterCredentials,
  UpdateProfileCredentials,
} from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as IUser | null,
    error: null as string | null,
    loading: false,
    keyPair: null as { publicKey: string; privateKey: string } | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async initialize() {
      const { $client } = useNuxtApp()
      try {
        const deviceId = `Device-${nanoid()}`
        const deviceEmail = `device-${nanoid()}@nuxtreez.local`
        const keyPair = await generateKeyPair(deviceId, deviceEmail)

        // Exchange public keys with server first
        await $client?.auth.exchangeKeys.mutate({ clientPublicKey: keyPair.publicKey })

        // Only set keyPair after successful exchange
        this.keyPair = {
          publicKey: keyPair.publicKey,
          privateKey: keyPair.privateKey,
        }
      } catch (error) {
        console.error('Failed to initialize keys:', error)
        // Clear keyPair if initialization fails
        this.keyPair = null
        throw error
      }
    },

    async login(credentials: LoginCredentials) {
      const { $client } = useNuxtApp()
      this.error = null
      this.loading = true

      try {
        await $client.auth.login.mutate(credentials)

        return this.fetchProfile()
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
        this.keyPair = null
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
        this.keyPair = null
        await this.initialize()

        const { $client } = useNuxtApp()
        const { data } = await $client.user.profile.query()

        if (data?.profile) {
          const decryptedData = await decryptWithSessionKey(data.profile, this.keyPair!.privateKey)
          this.user = JSON.parse(decryptedData) as IUser
          return true
        }
        return false
      } catch (error) {
        console.error('Session check failed:', error)
        this.user = null
        this.keyPair = null
        return false
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
      this.error = null
      try {
        if (!this.keyPair) {
          await this.initialize()
        }

        const { $client } = useNuxtApp()
        const { data } = await $client.user.profile.query()

        if (!data?.profile) {
          throw new Error('No profile data received')
        }

        // The profile is already a string, no need to parse it
        const decryptedData = await decryptWithSessionKey(data.profile, this.keyPair!.privateKey)
        this.user = JSON.parse(decryptedData) as IUser
      } catch (error: unknown) {
        console.error('Failed to fetch profile:', error)
        const err = error as ApiError
        this.error = err.message
        // Clear keys if decryption fails
        this.keyPair = null
        throw err
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
        const { data } = await $client.user.update.mutate(profile)
        if (!data?.user) {
          throw new Error('No user data in response')
        }

        const decryptedData = await decryptWithSessionKey(data.user, this.keyPair!.privateKey)
        this.user = JSON.parse(decryptedData) as IUser
        return this.user
      } catch (error: unknown) {
        const err = error as ApiError
        this.error = err.message
        throw err
      }
    },
  },

  persist: {
    pick: [],
    serializer: {
      deserialize: parse,
      serialize: stringify,
    },
  },
})
