import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as profileApi from '@/api/profile.api'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import ProfileSettingsGeneral from '@/components/profile/ProfileSettingsGeneral.vue'
import { i18n } from '@/i18n'
import { useLocaleStore } from '@/stores/locale.store'
import { useThemeStore } from '@/stores/theme.store'
import { useWeightUnitStore } from '@/stores/weight-unit.store'
import { useToastStore } from '@/stores/toast.store'

vi.mock('@/api/profile.api', () => ({
  updatePreferences: vi.fn().mockResolvedValue({
    locale: 'en',
    themeMode: 'dark',
    weightUnit: 'lb',
  }),
  exportUserData: vi.fn(),
  changePassword: vi.fn().mockResolvedValue({ messageCode: 'PASSWORD_RESET_SUCCESS' }),
}))

vi.mock('@/stores/profile.store', () => ({
  useProfileStore: () => ({
    savePreferences: vi.fn().mockResolvedValue({
      locale: 'en',
      themeMode: 'dark',
      weightUnit: 'lb',
    }),
  }),
}))

describe('ProfileSettingsGeneral', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra selector de idioma y botón guardar', async () => {
    const { wrapper } = await mountWithPlugins(ProfileSettingsGeneral)

    expect(wrapper.find('#settings-locale').exists()).toBe(true)
    expect(wrapper.text()).toContain(i18n.global.t('common.saveChanges'))
  })

  it('guarda cambios de idioma, tema y unidad', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ProfileSettingsGeneral)
    const localeStore = useLocaleStore(pinia)
    const themeStore = useThemeStore(pinia)
    const weightUnitStore = useWeightUnitStore(pinia)
    const toastStore = useToastStore(pinia)

    localeStore.setLocale('es')
    themeStore.setMode('light')
    weightUnitStore.setUnit('kg')

    await wrapper.find('#settings-locale').setValue('en')
    await wrapper.find('#settings-theme').setValue('dark')
    await wrapper.find('#settings-weight-unit').setValue('lb')
    await wrapper.find('form').trigger('submit.prevent')

    expect(localeStore.locale).toBe('en')
    expect(themeStore.mode).toBe('dark')
    expect(weightUnitStore.unit).toBe('lb')
    expect(toastStore.toasts.some((toast) => toast.type === 'success')).toBe(true)
  })

  it('muestra error si no hay cambios', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ProfileSettingsGeneral)
    const toastStore = useToastStore(pinia)

    await wrapper.find('form').trigger('submit.prevent')

    expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
  })

  it('cambia la contraseña cuando coinciden', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ProfileSettingsGeneral)
    const toastStore = useToastStore(pinia)

    await wrapper.find('#change-password-current').setValue('oldpass1')
    await wrapper.find('#change-password-new').setValue('newpass1')
    await wrapper.find('#change-password-confirm').setValue('newpass1')

    const forms = wrapper.findAll('form')
    await forms[1]?.trigger('submit.prevent')

    expect(profileApi.changePassword).toHaveBeenCalledWith({
      currentPassword: 'oldpass1',
      newPassword: 'newpass1',
    })
    expect(toastStore.toasts.some((toast) => toast.type === 'success')).toBe(true)
  })

  it('muestra error si las contraseñas nuevas no coinciden', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ProfileSettingsGeneral)
    const toastStore = useToastStore(pinia)

    await wrapper.find('#change-password-new').setValue('newpass1')
    await wrapper.find('#change-password-confirm').setValue('otherpass')

    const forms = wrapper.findAll('form')
    await forms[1]?.trigger('submit.prevent')

    expect(profileApi.changePassword).not.toHaveBeenCalled()
    expect(toastStore.toasts.some((toast) => toast.type === 'error')).toBe(true)
  })
})
