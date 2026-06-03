import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/api/client'
import * as reminderApi from '@/api/reminder.api'

vi.mock('@/api/client', () => ({
  api: vi.fn(),
}))

describe('reminder.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getReminderSettings obtiene ajustes de recordatorio', async () => {
    vi.mocked(api).mockResolvedValue({ pushReminderEnabled: true })

    await reminderApi.getReminderSettings()

    expect(api).toHaveBeenCalledWith('/profile/reminders')
  })

  it('updateReminderSettings actualiza ajustes', async () => {
    const body = { pushReminderEnabled: false }
    vi.mocked(api).mockResolvedValue(body)

    await reminderApi.updateReminderSettings(body)

    expect(api).toHaveBeenCalledWith('/profile/reminders', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  })
})
