export const useSidebar = () => {
  const store = useMyAppStore()
  const { isSidebarExpanded } = storeToRefs(store)
  const isMobileMenuOpen = ref(false)
  const isMobile = ref(false)
  const activeSubmenu = ref<string | null>(null)

  const toggleSidebar = () => {
    if (!isMobile.value) {
      store.toggleSidebar()
    }
  }

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  const toggleSubmenu = (label: string) => {
    activeSubmenu.value = activeSubmenu.value === label ? null : label
  }

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

  watch(
    () => isMobileMenuOpen.value,
    (newValue) => {
      if (newValue) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  )

  onBeforeUnmount(() => {
    document.body.style.overflow = ''
  })

  return {
    isSidebarExpanded,
    isMobileMenuOpen,
    isMobile,
    activeSubmenu,
    toggleSidebar,
    toggleMobileMenu,
    toggleSubmenu,
  }
}
