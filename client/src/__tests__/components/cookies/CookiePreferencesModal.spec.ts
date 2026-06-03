import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import type { VueWrapper } from '@vue/test-utils'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import CookiePreferencesModal from '@/components/cookies/CookiePreferencesModal.vue'
import { i18n } from '@/i18n'
import { useCookieConsentStore } from '@/stores/cookie-consent.store'

describe('CookiePreferencesModal', () => {
  let wrapper: VueWrapper | undefined

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.body.innerHTML = ''
  })

  async function mountOpenModal() {
    const result = await mountWithPlugins(CookiePreferencesModal, {
      attachTo: document.body,
    })
    wrapper = result.wrapper
    const store = useCookieConsentStore(result.pinia)
    store.openPreferences()
    await flushPromises()
    await nextTick()
    return { ...result, store }
  }

  it('muestra el modal con preferencias actuales', async () => {
    await mountOpenModal()

    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog!.textContent).toContain(i18n.global.t('cookies.preferences.title'))
    expect(dialog!.textContent).toContain(i18n.global.t('cookies.preferences.alwaysOn'))
  })

  it('guarda preferencias personalizadas al confirmar', async () => {
    const { store } = await mountOpenModal()

    const checkboxes = document.body.querySelectorAll('input[type="checkbox"]')
    const analyticsCheckbox = checkboxes[0] as HTMLInputElement
    analyticsCheckbox.checked = true
    analyticsCheckbox.dispatchEvent(new Event('change', { bubbles: true }))
    await nextTick()

    const saveLabel = i18n.global.t('cookies.preferences.save')
    const saveButton = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes(saveLabel),
    )
    saveButton!.click()
    await flushPromises()

    expect(store.preferences.analytics).toBe(true)
    expect(store.preferencesModalOpen).toBe(false)
  })

  it('cierra el modal al cancelar', async () => {
    const { store } = await mountOpenModal()

    const cancelLabel = i18n.global.t('common.cancel')
    const cancelButton = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes(cancelLabel),
    )
    cancelButton!.click()
    await flushPromises()

    expect(store.preferencesModalOpen).toBe(false)
  })

  it('cierra el modal al pulsar Escape', async () => {
    const { store } = await mountOpenModal()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()

    expect(store.preferencesModalOpen).toBe(false)
  })

  it('sincroniza checkboxes al reabrir el modal', async () => {
    const { store } = await mountOpenModal()

    store.savePreferences({ analytics: true, thirdParty: true })
    await flushPromises()

    store.openPreferences()
    await flushPromises()
    await wrapper.vm.$nextTick()

    const checkboxes = document.body.querySelectorAll('input[type="checkbox"]')
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true)
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true)
  })
})
