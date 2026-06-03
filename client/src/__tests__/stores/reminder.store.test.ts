import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as reminderApi from '@/api/reminder.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import type { WorkoutReminderSettings } from '@/interfaces/reminder.interface'
import { useReminderStore } from '@/stores/reminder.store'

vi.mock('@/api/reminder.api', () => ({
  getReminderSettings: vi.fn(),
  updateReminderSettings: vi.fn(),
}))

const mockSettings: WorkoutReminderSettings = {
  pushReminderEnabled: true,
  emailReminderEnabled: false,
  reminderDays: [1, 3, 5],
  reminderTimeLocal: '08:30',
  reminderTimezone: 'Europe/Madrid',
  workoutsLast7Days: 3,
}

describe('reminder store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(reminderApi.getReminderSettings).mockResolvedValue(mockSettings)
    vi.mocked(reminderApi.updateReminderSettings).mockResolvedValue(mockSettings)
  })

  it('carga la configuración de recordatorios', async () => {
    const store = useReminderStore()

    const settings = await store.fetchSettings()

    expect(settings).toEqual(mockSettings)
    expect(store.settings).toEqual(mockSettings)
    expect(store.loading).toBe(false)
  })

  it('guarda la configuración de recordatorios', async () => {
    const store = useReminderStore()
    const body = {
      pushReminderEnabled: false,
      reminderDays: [2, 4],
      reminderTimeLocal: '09:00',
    }

    const settings = await store.saveSettings(body)

    expect(reminderApi.updateReminderSettings).toHaveBeenCalledWith(body)
    expect(settings).toEqual(mockSettings)
    expect(store.saving).toBe(false)
  })
})
