import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import OnboardingModal from '@/components/onboarding/OnboardingModal.vue'
import { ONBOARDING_STORAGE_KEY } from '@/constants/onboarding.constants'
import { i18n } from '@/i18n'

function clickDialogButton(label: string) {
  const button = Array.from(document.body.querySelectorAll('button')).find((btn) =>
    btn.textContent?.includes(label),
  )
  button!.click()
}

async function clickPrimaryDialogAction() {
  const dialog = document.body.querySelector('[role="dialog"]')
  const buttons = dialog!.querySelectorAll('button')
  buttons[buttons.length - 1]!.click()
  await flushPromises()
}

describe('OnboardingModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    localStorage.clear()
  })

  it('muestra el modal cuando el onboarding no está completado', async () => {
    await mountWithPlugins(OnboardingModal, { attachTo: document.body })

    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog?.textContent).toContain(i18n.global.t('onboarding.steps.welcome.title'))
  })

  it('no muestra el modal si el onboarding ya fue completado', async () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, '1')
    await mountWithPlugins(OnboardingModal, { attachTo: document.body })

    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  })

  it('avanza entre pasos y finaliza redirigiendo a entrenamientos', async () => {
    const { router } = await mountWithPlugins(OnboardingModal, { attachTo: document.body })
    const pushSpy = vi.spyOn(router, 'push')

    await clickPrimaryDialogAction()
    await clickPrimaryDialogAction()
    await clickPrimaryDialogAction()

    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('1')
    expect(pushSpy).toHaveBeenCalledWith('/workouts')
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  })

  it('cierra el onboarding al omitir', async () => {
    await mountWithPlugins(OnboardingModal, { attachTo: document.body })

    clickDialogButton(i18n.global.t('onboarding.skip'))
    await flushPromises()

    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('1')
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  })
})
