<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

import { CARD_CLASS } from '@/constants/ui.constants'

const props = defineProps<{
  open: boolean
  title?: string | null
}>()

const emit = defineEmits<{
  close: []
}>()

function handleBackdropClick() {
  emit('close')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        role="presentation"
      >
        <div class="absolute inset-0 bg-black/50" @click="handleBackdropClick" />

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
          enter-to-class="translate-y-0 opacity-100 sm:scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100 sm:scale-100"
          leave-to-class="translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
        >
          <div
            v-if="open"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? 'app-modal-title' : undefined"
            :class="`${CARD_CLASS} relative z-10 max-h-[85dvh] w-full overflow-y-auto p-4 shadow-xl sm:max-w-md sm:rounded-xl sm:p-6`"
            @click.stop
          >
            <h2
              v-if="title"
              id="app-modal-title"
              class="mb-4 text-base font-semibold text-text-primary sm:text-lg"
            >
              {{ title }}
            </h2>

            <slot />

            <slot name="footer" />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
