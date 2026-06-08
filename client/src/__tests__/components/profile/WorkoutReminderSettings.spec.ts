import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mountWithPlugins, setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import * as reminderApi from '@/api/reminder.api'
import WorkoutReminderSettings from '@/components/profile/WorkoutReminderSettings.vue'
import { i18n } from '@/i18n'
import { useToastStore } from '@/stores/toast.store'
import * as reminderUtil from '@/utils/reminder.util'

vi.mock('@/api/reminder.api', () => ({
  getReminderSettings: vi.fn(),
  updateReminderSettings: vi.fn(),
}))

vi.mock('@/utils/reminder.util', async (importOriginal) => {
  const actual = await importOriginal<typeof reminderUtil>()
  return {
    ...actual,
    isNotificationSupported: vi.fn(),
    requestNotificationPermission: vi.fn(),
  }
})

const mockSettings = {
  pushReminderEnabled: false,
  emailReminderEnabled: true,
  plannedWorkoutReminderEnabled: false,
  reminderDays: [1, 3, 5],
  reminderTimeLocal: '18:00',
  reminderTimezone: 'Europe/Madrid',
  workoutsLast7Days: 2,
  hasPlannedWorkoutToday: false,
}

describe('WorkoutReminderSettings', () => {
  beforeEach(() => {
    vi.mocked(reminderApi.getReminderSettings).mockResolvedValue(mockSettings)
    vi.mocked(reminderApi.updateReminderSettings).mockResolvedValue(mockSettings)
    vi.mocked(reminderUtil.isNotificationSupported).mockReturnValue(true)
    vi.mocked(reminderUtil.requestNotificationPermission).mockResolvedValue('granted')
  })

  it('carga y muestra ajustes de recordatorios', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutReminderSettings)
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('reminders.title'))
    expect(wrapper.text()).toContain('2')
  })

  it('alterna días de recordatorio', async () => {
    const { wrapper } = await mountWithPlugins(WorkoutReminderSettings)
    await flushPromises()

    const dayButton = wrapper.findAll('button[type="button"]').find((b) => b.text().length > 0)
    await dayButton!.trigger('click')

    expect(wrapper.find('button.border-blue-600').exists()).toBe(true)
  })

  it('habilita push tras conceder permiso', async () => {
    const { pinia, wrapper } = await mountWithPlugins(WorkoutReminderSettings)
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await flushPromises()

    const pushCheckbox = wrapper.findAll('input[type="checkbox"]')[0]!
    await pushCheckbox.setValue(true)

    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('reminders.permissionGranted'))
  })

  it('muestra error si push no está soportado', async () => {
    vi.mocked(reminderUtil.isNotificationSupported).mockReturnValue(false)

    const { pinia, wrapper } = await mountWithPlugins(WorkoutReminderSettings)
    const toastStore = useToastStore(pinia)
    const errorSpy = vi.spyOn(toastStore, 'error')

    await flushPromises()

    const pushCheckbox = wrapper.findAll('input[type="checkbox"]')[0]!
    await pushCheckbox.setValue(true)

    expect(errorSpy).toHaveBeenCalledWith(i18n.global.t('reminders.pushHint'))
  })

  it('muestra error si se deniega permiso de notificaciones', async () => {
    vi.mocked(reminderUtil.requestNotificationPermission).mockResolvedValue('denied')

    const { pinia, wrapper } = await mountWithPlugins(WorkoutReminderSettings)
    const toastStore = useToastStore(pinia)
    const errorSpy = vi.spyOn(toastStore, 'error')

    await flushPromises()

    const pushCheckbox = wrapper.findAll('input[type="checkbox"]')[0]!
    await pushCheckbox.setValue(true)

    expect(errorSpy).toHaveBeenCalledWith(i18n.global.t('reminders.permissionDenied'))
  })

  it('guarda ajustes correctamente', async () => {
    const { pinia, wrapper } = await mountWithPlugins(WorkoutReminderSettings)
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await flushPromises()
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(reminderApi.updateReminderSettings).toHaveBeenCalled()
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('reminders.saveSuccess'))
  })

  it('muestra error al fallar la carga', async () => {
    vi.mocked(reminderApi.getReminderSettings).mockRejectedValue(new Error('fail'))

    const pinia = setupTestPinia()
    const toastStore = useToastStore(pinia)
    const errorSpy = vi.spyOn(toastStore, 'error')

    await mountWithPlugins(WorkoutReminderSettings, { pinia })
    await flushPromises()

    expect(errorSpy).toHaveBeenCalled()
  })
})
