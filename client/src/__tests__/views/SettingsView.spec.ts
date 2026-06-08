import { describe, expect, it, vi } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import SettingsView from '@/views/SettingsView.vue'
import { i18n } from '@/i18n'

vi.mock('@/api/reminder.api', () => ({
  getReminderSettings: vi.fn().mockResolvedValue({
    pushReminderEnabled: false,
  emailReminderEnabled: false,
  plannedWorkoutReminderEnabled: false,
  reminderDays: [],
  reminderTimeLocal: '18:00',
  reminderTimezone: 'Europe/Madrid',
  workoutsLast7Days: 0,
  hasPlannedWorkoutToday: false,
  }),
  updateReminderSettings: vi.fn(),
}))

vi.mock('@/api/spotify.api', () => ({
  getConnection: vi.fn().mockResolvedValue({
    connected: false,
    displayName: null,
    workoutPlaylistId: null,
    workoutPlaylistUrl: null,
    workoutPlaylistName: null,
  }),
  getPlaylists: vi.fn().mockResolvedValue([]),
  getConnectUrl: vi.fn(),
  setWorkoutPlaylist: vi.fn(),
  disconnect: vi.fn(),
}))

describe('SettingsView', () => {
  it('renderiza el panel de ajustes', async () => {
    const { wrapper } = await mountWithPlugins(SettingsView)

    expect(wrapper.text()).toContain(i18n.global.t('profile.settings.title'))
    expect(wrapper.find('#settings-locale').exists()).toBe(true)
  })
})
