<script lang="ts" setup>
interface Props {
  isOpen: boolean
  title?: string
  transition?: 'fade' | 'slide' | 'scale' | 'none'
}

const { isOpen = false, title, transition = 'fade' } = defineProps<Props>()

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}

const handleBackdropClick = (e: Event) => {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}

watch(
  () => isOpen,
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
</script>

<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click="handleBackdropClick"
      >
        <div
          :class="
            cn(
              'relative max-h-[90vh] w-[90%] max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800',
              transition !== 'none' && `modal-${transition}`
            )
          "
          @click.stop
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
            <button
              class="px-2 text-2xl leading-none text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              @click="handleClose"
            >
              &times;
            </button>
          </div>
          <div class="text-gray-600 dark:text-gray-300">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Backdrop transition */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Base modal transitions */
.modal-fade,
.modal-slide,
.modal-scale {
  will-change: transform, opacity;
}

/* Fade variant */
.modal-fade {
  animation: fadeIn 0.3s ease forwards;
}
.backdrop-leave-active .modal-fade {
  animation: fadeOut 0.3s ease forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Slide variant */
.modal-slide {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.backdrop-leave-active .modal-slide {
  animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(100px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-100px);
  }
}

/* Scale variant */
.modal-scale {
  animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.backdrop-leave-active .modal-scale {
  animation: scaleOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes scaleOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(1.1);
  }
}
</style>
