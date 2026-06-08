import { describe, expect, it, vi } from 'vitest'

import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import ProfileSettingsPanel from '@/components/profile/ProfileSettingsPanel.vue'
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

describe('ProfileSettingsPanel', () => {
  it('renders settings sections', async () => {
    const { wrapper } = await mountWithPlugins(ProfileSettingsPanel)

    expect(wrapper.text()).toContain(i18n.global.t('profile.settings.title'))
    expect(wrapper.text()).toContain(i18n.global.t('profile.settings.general.title'))
    expect(wrapper.text()).toContain(i18n.global.t('profile.settings.workout.title'))
    expect(wrapper.text()).toContain(i18n.global.t('reminders.title'))
    expect(wrapper.text()).toContain(i18n.global.t('profile.spotify.title'))
  })
})
