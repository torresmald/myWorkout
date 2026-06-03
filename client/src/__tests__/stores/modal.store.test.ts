import { beforeEach, describe, expect, it } from 'vitest'

import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { useModalStore } from '@/stores/modal.store'

describe('modal store', () => {
  beforeEach(() => {
    setupTestPinia()
  })

  it('abre el modal sin opciones', () => {
    const store = useModalStore()

    store.open()

    expect(store.isOpen).toBe(true)
    expect(store.title).toBeNull()
  })

  it('abre el modal con título opcional', () => {
    const store = useModalStore()

    store.open({ title: 'Título del modal' })

    expect(store.isOpen).toBe(true)
    expect(store.title).toBe('Título del modal')
    expect(store.showDefaultFooter).toBe(false)
  })

  it('cierra el modal sin confirmación', () => {
    const store = useModalStore()
    store.open({ title: 'Modal' })

    store.close()

    expect(store.isOpen).toBe(false)
    expect(store.title).toBeNull()
  })

  it('resuelve la promesa de confirmación como true al confirmar', async () => {
    const store = useModalStore()
    const confirmPromise = store.confirm({
      title: 'Confirmar',
      message: '¿Deseas continuar?',
      variant: 'danger',
    })

    expect(store.isOpen).toBe(true)
    expect(store.showDefaultFooter).toBe(true)
    expect(store.confirmVariant).toBe('danger')

    store.close(true)

    await expect(confirmPromise).resolves.toBe(true)
    expect(store.isOpen).toBe(false)
  })

  it('resuelve la promesa de confirmación como false al cancelar', async () => {
    const store = useModalStore()
    const confirmPromise = store.confirm({
      message: '¿Deseas continuar?',
      confirmLabel: 'Sí',
      cancelLabel: 'No',
    })

    store.close(false)

    await expect(confirmPromise).resolves.toBe(false)
    expect(store.confirmLabel).toBe('Confirm')
  })
})
