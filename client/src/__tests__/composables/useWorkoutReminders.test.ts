import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { useWorkoutReminders } from '@/composables/useWorkoutReminders'
import { i18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useReminderStore } from '@/stores/reminder.store'
import type { UserPublic } from '@/interfaces/auth.interface'
import type { WorkoutReminderSettings } from '@/interfaces/reminder.interface'
import * as reminderUtil from '@/utils/reminder.util'

vi.mock('@/utils/reminder.util', async () => {
  const actual = await vi.importActual<typeof reminderUtil>('@/utils/reminder.util')

  return {
    ...actual,
    shouldShowPushReminder: vi.fn(),
    shouldShowPlannedWorkoutPushReminder: vi.fn(),
    showWorkoutReminderNotification: vi.fn(),
    markPushReminderShownToday: vi.fn(),
    getLocalDateKey: vi.fn(() => '2026-06-03'),
  }
})

const mockUser: UserPublic = {
  id: 1,
  email: 'user@example.com',
  name: 'Test User',
  role: 'USER',
  locale: 'es',
  createdAt: '2026-01-01T00:00:00.000Z',
    heightCm: null,
    targetWeightKg: null,
    profileImageUrl: null,
  spotifyPlaylistUrl: null,
  allowAutoPlaylist: false,
  restTimerSoundEnabled: true,
  showPrToast: true,
  confirmIncompleteFinish: true,
  spotifyConnected: false,
  spotifyDisplayName: null,
  spotifyPlaylistName: null,
  latestWeightKg: null,
  bmi: null,
  bmiCategory: null,
}

const mockSettings: WorkoutReminderSettings = {
  pushReminderEnabled: true,
  emailReminderEnabled: false,
  plannedWorkoutReminderEnabled: false,
  reminderDays: [1],
  reminderTimeLocal: '09:00',
  reminderTimezone: 'UTC',
  workoutsLast7Days: 0,
  hasPlannedWorkoutToday: false,
}

function mountWorkoutReminders() {
  let reminders!: ReturnType<typeof useWorkoutReminders>

  const TestComponent = defineComponent({
    setup() {
      reminders = useWorkoutReminders()
      return { reminders }
    },
    template: '<div />',
  })

  const wrapper = mount(TestComponent, {
    global: {
      plugins: [setupTestPinia(), i18n],
    },
  })

  return { wrapper, reminders: () => reminders }
}

function authenticateUser(pinia: ReturnType<typeof setupTestPinia>, user: UserPublic = mockUser) {
  const authStore = useAuthStore(pinia)
  authStore.$patch({
    token: 'access-token',
    refreshToken: 'refresh-token',
    user,
  })
}

describe('useWorkoutReminders', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    vi.mocked(reminderUtil.shouldShowPushReminder).mockReturnValue(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('no refresca ajustes si el usuario no está autenticado', async () => {
    const { reminders } = mountWorkoutReminders()
    const reminderStore = useReminderStore()
    const fetchSpy = vi.spyOn(reminderStore, 'fetchSettings')

    await reminders().refreshSettings()

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('refresca ajustes cuando el usuario está autenticado', async () => {
    const pinia = setupTestPinia()
    authenticateUser(pinia)

    let reminders!: ReturnType<typeof useWorkoutReminders>

    mount(
      defineComponent({
        setup() {
          reminders = useWorkoutReminders()
          return {}
        },
        template: '<div />',
      }),
      { global: { plugins: [pinia, i18n] } },
    )

    const reminderStore = useReminderStore(pinia)
    const fetchSpy = vi.spyOn(reminderStore, 'fetchSettings').mockResolvedValue(mockSettings)

    await reminders.refreshSettings()

    expect(fetchSpy).toHaveBeenCalled()
  })

  it('ignora errores al refrescar ajustes', async () => {
    const pinia = setupTestPinia()
    authenticateUser(pinia)

    let reminders!: ReturnType<typeof useWorkoutReminders>

    mount(
      defineComponent({
        setup() {
          reminders = useWorkoutReminders()
          return {}
        },
        template: '<div />',
      }),
      { global: { plugins: [pinia, i18n] } },
    )

    const reminderStore = useReminderStore(pinia)
    vi.spyOn(reminderStore, 'fetchSettings').mockRejectedValue(new Error('network'))

    await expect(reminders.refreshSettings()).resolves.toBeUndefined()
  })

  it('no evalúa recordatorio push sin ajustes o autenticación', () => {
    const { reminders } = mountWorkoutReminders()

    reminders().evaluatePushReminder()

    expect(reminderUtil.showWorkoutReminderNotification).not.toHaveBeenCalled()
  })

  it('muestra notificación push cuando corresponde', () => {
    const pinia = setupTestPinia()
    authenticateUser(pinia)

    const reminderStore = useReminderStore(pinia)
    reminderStore.settings = mockSettings

    let reminders!: ReturnType<typeof useWorkoutReminders>

    mount(
      defineComponent({
        setup() {
          reminders = useWorkoutReminders()
          return {}
        },
        template: '<div />',
      }),
      { global: { plugins: [pinia, i18n] } },
    )

    vi.mocked(reminderUtil.shouldShowPushReminder).mockReturnValue(true)

    reminders.evaluatePushReminder()

    expect(reminderUtil.showWorkoutReminderNotification).toHaveBeenCalledWith(
      i18n.global.t('reminders.notificationTitle'),
      i18n.global.t('reminders.notificationBody'),
      '/workouts',
    )
    expect(reminderUtil.markPushReminderShownToday).toHaveBeenCalledWith('2026-06-03')
  })

  it('no muestra notificación si shouldShowPushReminder devuelve false', () => {
    const pinia = setupTestPinia()
    authenticateUser(pinia)

    const reminderStore = useReminderStore(pinia)
    reminderStore.settings = mockSettings

    let reminders!: ReturnType<typeof useWorkoutReminders>

    mount(
      defineComponent({
        setup() {
          reminders = useWorkoutReminders()
          return {}
        },
        template: '<div />',
      }),
      { global: { plugins: [pinia, i18n] } },
    )

    reminders.evaluatePushReminder()

    expect(reminderUtil.showWorkoutReminderNotification).not.toHaveBeenCalled()
  })

  it('inicia el comprobador al montar con sesión activa', async () => {
    const pinia = setupTestPinia()
    authenticateUser(pinia)

    const reminderStore = useReminderStore(pinia)
    const fetchSpy = vi.spyOn(reminderStore, 'fetchSettings').mockImplementation(async () => {
      reminderStore.settings = mockSettings
      return mockSettings
    })

    mount(
      defineComponent({
        setup() {
          useWorkoutReminders()
          return {}
        },
        template: '<div />',
      }),
      { global: { plugins: [pinia, i18n] } },
    )
    await flushPromises()

    expect(fetchSpy).toHaveBeenCalled()

    vi.mocked(reminderUtil.shouldShowPushReminder).mockReturnValue(true)

    vi.advanceTimersByTime(60_000)

    expect(reminderUtil.showWorkoutReminderNotification).toHaveBeenCalled()
  })

  it('detiene el comprobador al cerrar sesión', async () => {
    const pinia = setupTestPinia()
    authenticateUser(pinia)

    const authStore = useAuthStore(pinia)
    const reminderStore = useReminderStore(pinia)
    vi.spyOn(reminderStore, 'fetchSettings').mockImplementation(async () => {
      reminderStore.settings = mockSettings
      return mockSettings
    })

    const wrapper = mount(
      defineComponent({
        setup() {
          useWorkoutReminders()
          return {}
        },
        template: '<div />',
      }),
      { global: { plugins: [pinia, i18n] } },
    )
    await flushPromises()

    vi.mocked(reminderUtil.showWorkoutReminderNotification).mockClear()
    authStore.$patch({ token: null, refreshToken: null, user: null })
    await flushPromises()

    vi.advanceTimersByTime(60_000)

    expect(reminderUtil.showWorkoutReminderNotification).not.toHaveBeenCalled()

    wrapper.unmount()
  })
})
