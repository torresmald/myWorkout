import { api } from '@/api/client'
import type { ApiResponse } from '@/interfaces/api-response.interface'
import type { UserPublic } from '@/interfaces/auth.interface'
import type { UserProfile, WeightEntryPublic } from '@/interfaces/profile.interface'
import type { UpdateUserPreferencesBody, UserPreferencesPublic } from '@/interfaces/user-preferences.interface'
import { throwIfApiError } from '@/utils/api-error.util'
import { getAccessToken } from '@/utils/storage.util'

export function getProfile() {
  return api<UserProfile>('/profile')
}

export function updateProfile(body: {
  name?: string
  heightCm?: number | null
  weightKg?: number
  targetWeightKg?: number | null
}) {
  return api<UserProfile>('/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function updatePreferences(body: UpdateUserPreferencesBody) {
  return api<UserPreferencesPublic>('/profile/preferences', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function exportUserData() {
  return api<Record<string, unknown>>('/profile/export')
}

export function deleteAccount(body: { password?: string } = {}) {
  return api<{ messageCode: string }>('/profile', {
    method: 'DELETE',
    body: JSON.stringify(body),
  })
}

export function changePassword(body: { currentPassword?: string; newPassword: string }) {
  return api<{ messageCode: string }>('/profile/password', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function addWeight(weightKg: number) {
  return api<{ entry: WeightEntryPublic; profile: UserPublic; weightEntries: WeightEntryPublic[] }>(
    '/profile/weight',
    {
      method: 'POST',
      body: JSON.stringify({ weightKg }),
    },
  )
}

export function updateWeight(entryId: number, body: { weightKg?: number; recordedAt?: string }) {
  return api<{ entry: WeightEntryPublic; profile: UserPublic; weightEntries: WeightEntryPublic[] }>(
    `/profile/weight/${entryId}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  )
}

export function deleteWeight(entryId: number) {
  return api<{ profile: UserPublic; weightEntries: WeightEntryPublic[] }>(
    `/profile/weight/${entryId}`,
    {
      method: 'DELETE',
    },
  )
}

export async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatar', file)

  const token = getAccessToken()
  const response = await fetch('/api/profile/avatar', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  const body = (await response.json()) as ApiResponse<UserPublic>

  throwIfApiError(body, response.status)

  return body.data as UserPublic
}

export function deleteAvatar() {
  return api<UserPublic>('/profile/avatar', {
    method: 'DELETE',
  })
}
