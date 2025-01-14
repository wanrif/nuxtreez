import { defineStore } from 'pinia'
import { parse, stringify } from 'zipson'

export const useMyAppStore = defineStore('app', {
  state: () => ({
    isSidebarExpanded: true,
  }),
  actions: {
    toggleSidebar() {
      this.isSidebarExpanded = !this.isSidebarExpanded
    },
  },
  persist: {
    pick: ['isSidebarExpanded'],
    serializer: {
      deserialize: parse,
      serialize: stringify,
    },
  },
})
