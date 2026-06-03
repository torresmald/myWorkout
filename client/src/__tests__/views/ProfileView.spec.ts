import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createUserProfile,
  createWeightEntry,
} from '@/__tests__/fixtures/profile.fixture'
import { adminRoutes } from '@/__tests__/helpers/test-routes'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import * as profileApi from '@/api/profile.api'
import ProfileView from '@/views/ProfileView.vue'
import { i18n } from '@/i18n'
import { useModalStore } from '@/stores/modal.store'
import { useProfileStore } from '@/stores/profile.store'
import { useToastStore } from '@/stores/toast.store'

vi.mock('@/api/profile.api', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  addWeight: vi.fn(),
  updateWeight: vi.fn(),
  deleteWeight: vi.fn(),
  uploadAvatar: vi.fn(),
  deleteAvatar: vi.fn(),
}))

vi.mock('@/api/reminder.api', () => ({
  getReminderSettings: vi.fn().mockResolvedValue({
    pushReminderEnabled: false,
    emailReminderEnabled: false,
    reminderDays: [],
    reminderTimeLocal: '18:00',
    reminderTimezone: 'Europe/Madrid',
    workoutsLast7Days: 0,
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

describe('ProfileView', () => {
  beforeEach(() => {
    vi.mocked(profileApi.getProfile).mockResolvedValue(
      createUserProfile({
        role: 'ADMIN',
        bmi: 23.1,
        bmiCategory: 'NORMAL',
        weightEntries: [
          createWeightEntry({ id: 1, weightKg: 74 }),
          createWeightEntry({ id: 2, weightKg: 75, recordedAt: '2026-01-08T00:00:00.000Z' }),
        ],
      }),
    )
    vi.mocked(profileApi.updateProfile).mockImplementation(async (body) => {
      const current = createUserProfile()
      return { ...current, ...body, name: body.name ?? current.name }
    })
    vi.mocked(profileApi.addWeight).mockResolvedValue({
      profile: createUserProfile(),
      weightEntries: [createWeightEntry()],
    })
    vi.mocked(profileApi.updateWeight).mockResolvedValue({
      profile: createUserProfile(),
      weightEntries: [createWeightEntry({ weightKg: 76 })],
    })
    vi.mocked(profileApi.deleteWeight).mockResolvedValue({
      profile: createUserProfile({ weightEntries: [] }),
      weightEntries: [],
    })
  })

  it('carga perfil y muestra secciones principales', async () => {
    const { wrapper } = await mountWithPlugins(ProfileView, {
      stubs: { SpotifyWorkoutSettings: true, WorkoutReminderSettings: true },
    })
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('profile.sections.personalData'))
    expect(wrapper.text()).toContain(i18n.global.t('profile.sections.bmi'))
    expect(wrapper.text()).toContain(i18n.global.t('profile.sections.weightEvolution'))
  })

  it('guarda cambios del perfil', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ProfileView, {
      stubs: { SpotifyWorkoutSettings: true, WorkoutReminderSettings: true },
    })
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await flushPromises()
    await wrapper.find('#profile-name').setValue('Nuevo nombre')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(profileApi.updateProfile).toHaveBeenCalled()
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('profile.saveSuccess'))
  })

  it('muestra error con altura inválida', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ProfileView, {
      stubs: { SpotifyWorkoutSettings: true, WorkoutReminderSettings: true },
    })
    const toastStore = useToastStore(pinia)
    const errorSpy = vi.spyOn(toastStore, 'error')

    await flushPromises()
    await wrapper.find('#profile-height').setValue('300')
    await wrapper.find('form').trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith(i18n.global.t('profile.heightInvalid'))
  })

  it('muestra error sin cambios', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ProfileView, {
      stubs: { SpotifyWorkoutSettings: true, WorkoutReminderSettings: true },
    })
    const toastStore = useToastStore(pinia)
    const errorSpy = vi.spyOn(toastStore, 'error')

    await flushPromises()
    await wrapper.find('form').trigger('submit.prevent')

    expect(errorSpy).toHaveBeenCalledWith(i18n.global.t('profile.noChanges'))
  })

  it('añade peso desde el modal', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ProfileView, {
      stubs: { SpotifyWorkoutSettings: true, WorkoutReminderSettings: true },
      attachTo: document.body,
    })
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await flushPromises()

    const addButton = wrapper.find('button[aria-label]')
    await addButton.trigger('click')
    await flushPromises()

    const modal = wrapper.findComponent({ name: 'AddWeightModal' })
    modal.vm.$emit('submit', 76)
    await flushPromises()

    expect(profileApi.addWeight).toHaveBeenCalledWith(76)
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('profile.weightAddSuccess'))
  })

  it('edita y elimina entrada de peso', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ProfileView, {
      routes: adminRoutes,
      stubs: { SpotifyWorkoutSettings: true, WorkoutReminderSettings: true },
    })
    const modalStore = useModalStore(pinia)
    vi.spyOn(modalStore, 'confirm').mockResolvedValue(true)

    await flushPromises()

    const weightHistoryActions = wrapper.findAllComponents({ name: 'ListItemIconActions' })[0]!
    weightHistoryActions.vm.$emit('edit')
    await flushPromises()

    const editForm = wrapper.findAll('form').find((form) => form.find('#edit-weight-1').exists())!
    await wrapper.find('#edit-weight-1').setValue('76')
    await wrapper.find('#edit-date-1').setValue('2026-01-10')
    await editForm.trigger('submit.prevent')
    await flushPromises()

    expect(profileApi.updateWeight).toHaveBeenCalled()

    await flushPromises()

    const deleteActions = wrapper.findAllComponents({ name: 'ListItemIconActions' })[0]!
    deleteActions.vm.$emit('delete')
    await flushPromises()

    expect(profileApi.deleteWeight).toHaveBeenCalled()
  })

  it('muestra BMI vacío sin datos suficientes', async () => {
    vi.mocked(profileApi.getProfile).mockResolvedValue(
      createUserProfile({ bmi: null, bmiCategory: null, weightEntries: [] }),
    )

    const { wrapper } = await mountWithPlugins(ProfileView, {
      stubs: { SpotifyWorkoutSettings: true, WorkoutReminderSettings: true },
    })
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('profile.bmi.empty'))
  })
})
