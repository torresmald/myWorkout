import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TOAST_DURATION_MS } from '@/constants/toast.constants'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { useToastStore } from '@/stores/toast.store'

describe('toast store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra un toast de éxito', () => {
    const store = useToastStore()

    const id = store.success('Operación completada')

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0]).toEqual({
      id,
      message: 'Operación completada',
      type: 'success',
    })
  })

  it('muestra un toast de error', () => {
    const store = useToastStore()

    store.error('Ha ocurrido un error')

    expect(store.toasts[0]?.type).toBe('error')
  })

  it('elimina el toast automáticamente tras la duración por defecto', () => {
    const store = useToastStore()

    store.success('Mensaje temporal')

    vi.advanceTimersByTime(TOAST_DURATION_MS)

    expect(store.toasts).toHaveLength(0)
  })

  it('respeta una duración personalizada', () => {
    const store = useToastStore()

    store.show('Mensaje corto', 'success', { duration: 1000 })

    vi.advanceTimersByTime(999)
    expect(store.toasts).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(store.toasts).toHaveLength(0)
  })

  it('elimina un toast manualmente', () => {
    const store = useToastStore()
    const id = store.success('Mensaje')

    store.remove(id)

    expect(store.toasts).toHaveLength(0)
  })
})
