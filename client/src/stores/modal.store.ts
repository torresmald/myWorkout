import { ref } from 'vue'
import { defineStore } from 'pinia'

import { i18n } from '@/i18n'
import type { ConfirmModalOptions, ModalOptions } from '@/interfaces/modal.interface'

export const useModalStore = defineStore('modal', () => {
  const isOpen = ref(false)
  const title = ref<string | null>(null)
  const message = ref<string | null>(null)
  const confirmLabel = ref('')
  const cancelLabel = ref('')
  const showDefaultFooter = ref(false)
  const confirmVariant = ref<'default' | 'danger'>('default')

  let resolveConfirm: ((value: boolean) => void) | null = null

  function resetState() {
    title.value = null
    message.value = null
    confirmLabel.value = i18n.global.t('common.confirm')
    cancelLabel.value = i18n.global.t('common.cancel')
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
    confirmLabel.value = options.confirmLabel ?? i18n.global.t('common.confirm')
    cancelLabel.value = options.cancelLabel ?? i18n.global.t('common.cancel')
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
