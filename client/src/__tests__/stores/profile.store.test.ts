import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as profileApi from '@/api/profile.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { createUserPublic } from '@/__tests__/fixtures/profile.fixture'
import type { UserPublic } from '@/interfaces/auth.interface'
import type { UserProfile } from '@/interfaces/profile.interface'
import { useAuthStore } from '@/stores/auth.store'
import { useProfileStore } from '@/stores/profile.store'

vi.mock('@/api/profile.api', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  addWeight: vi.fn(),
  updateWeight: vi.fn(),
  deleteWeight: vi.fn(),
  uploadAvatar: vi.fn(),
  deleteAvatar: vi.fn(),
}))

const mockUser: UserPublic = createUserPublic()

const mockProfile: UserProfile = {
  ...mockUser,
  weightEntries: [{ id: 1, weightKg: 75, recordedAt: '2026-01-01T00:00:00.000Z' }],
}

describe('profile store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(profileApi.getProfile).mockResolvedValue(mockProfile)
    vi.mocked(profileApi.updateProfile).mockResolvedValue(mockProfile)
    vi.mocked(profileApi.addWeight).mockResolvedValue({
      entry: mockProfile.weightEntries[0]!,
      profile: mockProfile,
      weightEntries: mockProfile.weightEntries,
    })
    vi.mocked(profileApi.updateWeight).mockResolvedValue({
      entry: mockProfile.weightEntries[0]!,
      profile: mockProfile,
      weightEntries: mockProfile.weightEntries,
    })
    vi.mocked(profileApi.deleteWeight).mockResolvedValue({
      profile: mockProfile,
      weightEntries: [],
    })
    vi.mocked(profileApi.uploadAvatar).mockResolvedValue(mockProfile)
    vi.mocked(profileApi.deleteAvatar).mockResolvedValue(mockProfile)
  })

  it('carga el perfil y sincroniza el usuario de auth', async () => {
    const store = useProfileStore()
    const authStore = useAuthStore()

    const profile = await store.fetchProfile()

    expect(profile).toEqual(mockProfile)
    expect(store.profile).toEqual(mockProfile)
    expect(authStore.user).toEqual(mockProfile)
    expect(store.loading).toBe(false)
  })

  it('guarda el perfil y sincroniza el usuario de auth', async () => {
    const store = useProfileStore()
    const authStore = useAuthStore()
    const body = { name: 'Nuevo nombre' }

    await store.saveProfile(body)

    expect(profileApi.updateProfile).toHaveBeenCalledWith(body)
    expect(authStore.user).toEqual(mockProfile)
    expect(store.saving).toBe(false)
  })

  it('registra un peso y actualiza el perfil', async () => {
    const store = useProfileStore()

    await store.registerWeight(76)

    expect(profileApi.addWeight).toHaveBeenCalledWith(76)
    expect(store.addingWeight).toBe(false)
  })

  it('actualiza una entrada de peso existente', async () => {
    const store = useProfileStore()
    store.profile = mockProfile

    await store.updateWeightEntry(1, { weightKg: 77 })

    expect(profileApi.updateWeight).toHaveBeenCalledWith(1, { weightKg: 77 })
    expect(store.updatingWeightId).toBeNull()
  })

  it('elimina una entrada de peso', async () => {
    const store = useProfileStore()
    store.profile = mockProfile

    await store.removeWeightEntry(1)

    expect(profileApi.deleteWeight).toHaveBeenCalledWith(1)
    expect(store.deletingWeightId).toBeNull()
  })

  it('sube un avatar e inicializa el perfil cuando no existía', async () => {
    const store = useProfileStore()
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    await store.uploadAvatar(file)

    expect(store.profile?.weightEntries).toEqual([])
    expect(store.uploadingAvatar).toBe(false)
  })

  it('sube un avatar y actualiza el perfil existente', async () => {
    const store = useProfileStore()
    store.profile = mockProfile
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    await store.uploadAvatar(file)

    expect(profileApi.uploadAvatar).toHaveBeenCalledWith(file)
    expect(store.uploadingAvatar).toBe(false)
  })

  it('elimina el avatar y actualiza el perfil existente', async () => {
    const store = useProfileStore()
    store.profile = mockProfile

    await store.removeAvatar()

    expect(profileApi.deleteAvatar).toHaveBeenCalled()
    expect(store.deletingAvatar).toBe(false)
  })

  it('inicializa el perfil cuando applyProfile se ejecuta sin perfil previo', async () => {
    const store = useProfileStore()

    await store.registerWeight(76)

    expect(store.profile).toEqual({
      ...mockProfile,
      weightEntries: mockProfile.weightEntries,
    })
  })

  it('actualiza el perfil sin sobrescribir weightEntries si no se proporcionan', async () => {
    const store = useProfileStore()
    store.profile = mockProfile
    vi.mocked(profileApi.uploadAvatar).mockResolvedValue({
      ...mockProfile,
      name: 'Actualizado',
    })

    await store.uploadAvatar(new File(['avatar'], 'avatar.png', { type: 'image/png' }))

    expect(store.profile?.name).toBe('Actualizado')
    expect(store.profile?.weightEntries).toEqual(mockProfile.weightEntries)
  })
})
