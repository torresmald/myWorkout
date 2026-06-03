import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createUserProfile } from '@/__tests__/fixtures/profile.fixture'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import * as profileApi from '@/api/profile.api'
import ProfileAvatarUpload from '@/components/profile/ProfileAvatarUpload.vue'
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

describe('ProfileAvatarUpload', () => {
  beforeEach(() => {
    vi.mocked(profileApi.getProfile).mockResolvedValue(createUserProfile())
    vi.mocked(profileApi.uploadAvatar).mockResolvedValue(
      createUserProfile({ profileImageUrl: 'https://example.com/new.jpg' }),
    )
    vi.mocked(profileApi.deleteAvatar).mockResolvedValue(createUserProfile())
  })

  it('muestra botón de subir cuando no hay avatar', async () => {
    const { wrapper } = await mountWithPlugins(ProfileAvatarUpload)
    const profileStore = useProfileStore()
    await profileStore.fetchProfile()
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('profile.avatar.upload'))
    expect(wrapper.find('button[aria-label]').exists()).toBe(false)
  })

  it('sube avatar válido y muestra éxito', async () => {
    const { pinia, wrapper } = await mountWithPlugins(ProfileAvatarUpload)
    const profileStore = useProfileStore()
    const toastStore = useToastStore()
    const successSpy = vi.spyOn(toastStore, 'success')

    await profileStore.fetchProfile()
    await flushPromises()

    const file = new File(['img'], 'avatar.jpg', { type: 'image/jpeg' })
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await flushPromises()

    expect(profileApi.uploadAvatar).toHaveBeenCalledWith(file)
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('profile.avatar.uploadSuccess'))
  })

  it('muestra error con archivo inválido', async () => {
    const { wrapper } = await mountWithPlugins(ProfileAvatarUpload)
    const profileStore = useProfileStore()
    const toastStore = useToastStore()
    const errorSpy = vi.spyOn(toastStore, 'error')

    await profileStore.fetchProfile()
    await flushPromises()

    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')

    expect(errorSpy).toHaveBeenCalled()
    expect(profileApi.uploadAvatar).not.toHaveBeenCalled()
  })

  it('elimina avatar tras confirmación', async () => {
    vi.mocked(profileApi.getProfile).mockResolvedValue(
      createUserProfile({ profileImageUrl: 'https://example.com/avatar.jpg' }),
    )

    const { pinia, wrapper } = await mountWithPlugins(ProfileAvatarUpload)
    const profileStore = useProfileStore()
    const modalStore = useModalStore(pinia)
    vi.spyOn(modalStore, 'confirm').mockResolvedValue(true)

    await profileStore.fetchProfile()
    await flushPromises()

    await wrapper.find('button[aria-label]').trigger('click')
    await flushPromises()

    expect(profileApi.deleteAvatar).toHaveBeenCalled()
  })

  it('no elimina avatar si el usuario cancela', async () => {
    vi.mocked(profileApi.getProfile).mockResolvedValue(
      createUserProfile({ profileImageUrl: 'https://example.com/avatar.jpg' }),
    )

    const { pinia, wrapper } = await mountWithPlugins(ProfileAvatarUpload)
    const profileStore = useProfileStore()
    const modalStore = useModalStore(pinia)
    vi.spyOn(modalStore, 'confirm').mockResolvedValue(false)

    await profileStore.fetchProfile()
    await flushPromises()

    await wrapper.find('button[aria-label]').trigger('click')
    await flushPromises()

    expect(profileApi.deleteAvatar).not.toHaveBeenCalled()
  })
})
