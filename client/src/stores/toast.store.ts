import { ref } from 'vue'
import { defineStore } from 'pinia'

import { TOAST_DURATION_MS } from '@/constants/toast.constants'
import type { Toast, ToastOptions, ToastType } from '@/interfaces/toast.interface'

let nextToastId = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function remove(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function show(message: string, type: ToastType, options?: ToastOptions) {
    const id = ++nextToastId
    const duration = options?.duration ?? TOAST_DURATION_MS

    toasts.value.push({ id, message, type })

    setTimeout(() => {
      remove(id)
    }, duration)

    return id
  }

  function success(message: string, options?: ToastOptions) {
    return show(message, 'success', options)
  }

  function error(message: string, options?: ToastOptions) {
    return show(message, 'error', options)
  }

  return {
    toasts,
    show,
    success,
    error,
    remove,
  }
})
