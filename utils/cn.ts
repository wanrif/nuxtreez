import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names and resolves Tailwind CSS conflicts
 * @param inputs - Class names to merge
 * @returns Merged and de-duplicated class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Creates a computed class binding for Vue components
 * @param getValue - Function that returns dynamic classes
 * @param staticClasses - Optional static classes to always include
 * @returns Computed property that returns merged classes
 */
export function useClasses(getValue: () => ClassValue, staticClasses?: ClassValue): ComputedRef<string> {
  return computed(() => {
    const dynamicClasses = getValue()
    return cn(staticClasses, dynamicClasses)
  })
}

// Type for conditional classes object
export type ConditionalClasses = Record<string, boolean | undefined>

/**
 * Merges conditional classes based on boolean conditions
 * @param classes - Object with class names as keys and conditions as values
 * @returns Merged class string containing only truthy conditions
 */
export function conditionalClasses(classes: ConditionalClasses): string {
  return Object.entries(classes)
    .filter(([_, condition]) => condition)
    .map(([className]) => className)
    .join(' ')
}

// *Example usage in a Vue component:
/*
<script setup lang="ts">
import { cn, useClasses, conditionalClasses } from '@/utils/cn'
import { ref } from 'vue'

const isActive = ref(false)
const isDisabled = ref(false)

*Basic usage
const className = cn(
  'base-class',
  isActive.value && 'active',
  isDisabled.value && 'disabled'
)

*Using computed classes
const buttonClasses = useClasses(
  () => ({
    'bg-blue-500 hover:bg-blue-600': !isDisabled.value,
    'bg-gray-300 cursor-not-allowed': isDisabled.value,
    'ring-2 ring-offset-2': isActive.value
  }),
  'px-4 py-2 rounded-md' // Static classes
)

*Using conditional classes
const menuClasses = computed(() => 
  conditionalClasses({
    'hidden': !isOpen.value,
    'flex flex-col': true,
    'opacity-50': isDisabled.value
  })
)
</script>

<template>
  <button :class="buttonClasses">
    Click me
  </button>
  
  <nav :class="menuClasses">
    <!-- Menu items -->
  </nav>
</template>
*/
