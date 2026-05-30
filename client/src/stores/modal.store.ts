import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  MODAL_DEFAULT_CANCEL_LABEL,
  MODAL_DEFAULT_CONFIRM_LABEL,
} from '@/constants/modal.constants'
import type { ConfirmModalOptions, ModalOptions } from '@/interfaces/modal.interface'

export const useModalStore = defineStore('modal', () => {
  const isOpen = ref(false)
  const title = ref<string | null>(null)
  const message = ref<string | null>(null)
  const confirmLabel = ref(MODAL_DEFAULT_CONFIRM_LABEL)
  const cancelLabel = ref(MODAL_DEFAULT_CANCEL_LABEL)
  const showDefaultFooter = ref(false)
  const confirmVariant = ref<'default' | 'danger'>('default')

  let resolveConfirm: ((value: boolean) => void) | null = null

  function resetState() {
    title.value = null
    message.value = null
    confirmLabel.value = MODAL_DEFAULT_CONFIRM_LABEL
    cancelLabel.value = MODAL_DEFAULT_CANCEL_LABEL
    showDefaultFooter.value = false
    confirmVariant.value = 'default'
  }

  function open(options?: ModalOptions) {
    resetState()
    title.value = options?.title ?? null
    isOpen.value = true
  }

  function close(confirmed = false) {
    isOpen.value = false
    resolveConfirm?.(confirmed)
    resolveConfirm = null
    resetState()
  }

  function confirm(options: ConfirmModalOptions): Promise<boolean> {
    resetState()
    title.value = options.title ?? null
    message.value = options.message
    confirmLabel.value = options.confirmLabel ?? MODAL_DEFAULT_CONFIRM_LABEL
    cancelLabel.value = options.cancelLabel ?? MODAL_DEFAULT_CANCEL_LABEL
    confirmVariant.value = options.variant ?? 'default'
    showDefaultFooter.value = true
    isOpen.value = true

    return new Promise((resolve) => {
      resolveConfirm = resolve
    })
  }

  return {
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel,
    showDefaultFooter,
    confirmVariant,
    open,
    close,
    confirm,
  }
})
