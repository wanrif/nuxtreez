export const useThemeManager = () => {
  const colorMode = useColorMode()

  const isDark = computed(() => colorMode.value === 'dark')
  const currentTheme = computed(() => colorMode.preference || 'system')

  const updateTheme = (value: string) => {
    colorMode.preference = value
    if (value === 'system') {
      colorMode.value = prefersColorScheme()
    } else {
      colorMode.value = value
    }
  }

  const prefersColorScheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  onMounted(() => {
    if (currentTheme.value === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const updateSystemTheme = (e: MediaQueryListEvent) => {
        if (currentTheme.value === 'system') {
          colorMode.value = e.matches ? 'dark' : 'light'
        }
      }
      mediaQuery.addEventListener('change', updateSystemTheme)
      onUnmounted(() => {
        mediaQuery.removeEventListener('change', updateSystemTheme)
      })
    }
  })

  return {
    isDark,
    currentTheme,
    colorMode,
    updateTheme,
  }
}
